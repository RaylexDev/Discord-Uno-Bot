import { UnoGame, GameError } from './UnoGame.js';
import { describe } from '../ui/text.js';
import { payload } from '../ui/v2.js';
import * as views from '../ui/views.js';
import stats from '../utils/stats.js';

/** Discord kullanicisindan oyuncu bilgisi cikarir */
export function identify(user, member) {
  return {
    id: user.id,
    name: member?.displayName ?? user.globalName ?? user.username,
    avatarUrl: (member ?? user).displayAvatarURL?.({ extension: 'png', size: 128 }) ?? null
  };
}

const safe = async (fn, label) => {
  try {
    return await fn();
  } catch (e) {
    console.error(`${label}:`, e.message);
    return null;
  }
};

/** Bir kanaldaki tek oyun: motor + Discord mesajlari + zamanlayici */
export class Session {
  constructor(manager, channel, game) {
    this.manager = manager;
    this.channel = channel;
    this.game = game;
    this.lobbyMsg = null;
    this.boardMsg = null;
    this.timer = null;
    this.turnEndsAt = null;
    this.queue = Promise.resolve();
  }

  /** Islemleri sirayla calistirir (ayni anda gelen butonlar yarisamasin) */
  run(fn) {
    const r = this.queue.then(fn);
    this.queue = r.catch(() => {});
    return r;
  }

  // ----------------------------------------------------------- mesajlar

  async postLobby(opts) {
    const view = await views.lobbyView(this, opts);
    const data = payload(view.components, { files: view.files });
    if (this.lobbyMsg) {
      const ok = await safe(() => this.lobbyMsg.edit({ ...data, attachments: [] }), 'Lobi düzenlenemedi');
      if (ok) return;
      this.lobbyMsg = null;
    }
    this.lobbyMsg = await safe(() => this.channel.send(data), 'Lobi gönderilemedi');
  }

  async postBoard() {
    const view = await views.boardView(this);
    const cur = this.game.currentPlayer?.id;
    const data = payload(view.components, { files: view.files, mentions: { users: cur ? [cur] : [] } });
    const old = this.boardMsg;
    this.boardMsg = await safe(() => this.channel.send(data), 'Masa gönderilemedi');
    if (old) safe(() => old.delete(), 'Eski masa silinemedi');
  }

  // -------------------------------------------------------- zamanlayici

  stopTimer() {
    clearTimeout(this.timer);
    this.timer = null;
    this.turnEndsAt = null;
  }

  startTimer() {
    this.stopTimer();
    if (this.game.status !== 'playing') return;
    const ms = this.game.options.turnSeconds * 1000;
    const token = `${this.game.turn}:${this.game.currentPlayer.id}:${this.game.drawnCardId ?? ''}`;
    this.turnEndsAt = Date.now() + ms;
    this.timer = setTimeout(() => {
      this.run(async () => {
        const g = this.game;
        if (g.status !== 'playing') return;
        const now = `${g.turn}:${g.currentPlayer.id}:${g.drawnCardId ?? ''}`;
        if (now !== token) return;
        const name = g.currentPlayer.name;
        const mv = g.autoMove();
        let events = mv.events;
        let pre = `${name} süresinde oynamadı.`;
        if (mv.afk >= 2 && g.status === 'playing') {
          const lv = g.leave(mv.playerId);
          this.manager.byUser.delete(mv.playerId);
          events = [...events, ...lv.events];
          pre = `${name} üst üste 2 kez süresinde oynamadı ve oyundan çıkarıldı.`;
        }
        await this.afterMove(events, pre);
      }).catch((e) => console.error('Zaman aşımı hatası:', e));
    }, ms);
  }

  // ------------------------------------------------------------- akis

  /** Her hamleden sonra: metin, masa, zamanlayici, bitis kontrolu */
  async afterMove(events, pre = '') {
    const g = this.game;
    g.lastAction = describe(g, events, { pre });
    if (g.status === 'ended') return this.finish();
    await this.postBoard();
    this.startTimer();
  }

  async finish() {
    this.stopTimer();
    const g = this.game;
    stats.record(g);
    const old = this.boardMsg;
    const view = await views.winnerView(this);
    await safe(() => this.channel.send(payload(view.components, { files: view.files, mentions: { users: [] } })), 'Kazanan mesajı gönderilemedi');
    if (old) safe(() => old.delete(), 'Masa silinemedi');
    this.manager.remove(this);
  }

  // --------------------------------------------------------- eylemler

  join(info) {
    return this.run(async () => {
      this.manager.claim(info.id, this.channel.id);
      try {
        this.game.addPlayer(info);
      } catch (e) {
        this.manager.byUser.delete(info.id);
        throw e;
      }
      await this.postLobby();
    });
  }

  leave(userId) {
    return this.run(async () => {
      const g = this.game;
      const res = g.leave(userId);
      this.manager.byUser.delete(userId);
      if (g.status === 'waiting') {
        if (!g.players.length) {
          await safe(() => this.lobbyMsg?.delete(), 'Lobi silinemedi');
          this.manager.remove(this);
          return res;
        }
        await this.postLobby();
        return res;
      }
      await this.afterMove(res.events);
      return res;
    });
  }

  setOption(userId, key) {
    return this.run(async () => {
      if (userId !== this.game.hostId) throw new GameError('Ayarları sadece lobi kurucusu değiştirebilir.');
      this.game.toggleOption(key);
      await this.postLobby();
    });
  }

  start(userId) {
    return this.run(async () => {
      const g = this.game;
      if (userId !== g.hostId) throw new GameError('Oyunu sadece lobi kurucusu başlatabilir.');
      g.start();
      await this.postLobby({ starting: true });
      g.lastAction = { text: `Oyun başladı! İlk sıra ${g.currentPlayer.name} oyuncusunda.`, icon: 'play', color: null };
      await this.postBoard();
      this.startTimer();
    });
  }

  cancel(userId, force = false) {
    return this.run(async () => {
      if (!force && userId !== this.game.hostId) throw new GameError('Sadece kurucu ya da yönetici oyunu iptal edebilir.');
      this.stopTimer();
      for (const p of this.game.players) this.manager.byUser.delete(p.id);
      await safe(() => this.boardMsg?.delete(), 'Masa silinemedi');
      await safe(() => this.lobbyMsg?.delete(), 'Lobi silinemedi');
      this.manager.remove(this);
    });
  }

  play(userId, cardId, opts) {
    return this.run(async () => {
      const res = this.game.play(userId, cardId, opts);
      await this.afterMove(res.events);
      return res;
    });
  }

  draw(userId) {
    return this.run(async () => {
      const res = this.game.draw(userId);
      await this.afterMove(res.events);
      return res;
    });
  }

  pass(userId) {
    return this.run(async () => {
      const res = this.game.pass(userId);
      await this.afterMove(res.events);
      return res;
    });
  }

  uno(userId) {
    return this.run(async () => {
      const res = this.game.callUno(userId);
      await this.afterMove(res.events);
      return res;
    });
  }

  challenge(userId) {
    return this.run(async () => {
      const res = this.game.challengeWild4(userId);
      await this.afterMove(res.events);
      return res;
    });
  }

  /** Masayi yeniden gonder (mesaj kaybolduysa) */
  resend() {
    return this.run(async () => {
      if (this.game.status === 'playing') await this.postBoard();
      else {
        this.lobbyMsg = null;
        await this.postLobby();
      }
    });
  }
}

export class GameManager {
  constructor() {
    this.sessions = new Map(); // channelId -> Session
    this.byUser = new Map(); // userId -> channelId
  }

  get(channelId) {
    return this.sessions.get(channelId) ?? null;
  }

  ofUser(userId) {
    const ch = this.byUser.get(userId);
    return ch ? this.sessions.get(ch) ?? null : null;
  }

  /** Kullaniciyi bir kanala baglar; baska oyundaysa hata verir */
  claim(userId, channelId) {
    const cur = this.byUser.get(userId);
    if (cur && cur !== channelId && this.sessions.has(cur)) throw new GameError(`Zaten başka bir oyundasın (<#${cur}>).`);
    this.byUser.set(userId, channelId);
  }

  create(channel, hostInfo) {
    if (this.sessions.has(channel.id)) throw new GameError('Bu kanalda zaten bir oyun var.');
    this.claim(hostInfo.id, channel.id);
    const game = new UnoGame(channel.id, hostInfo.id);
    game.addPlayer(hostInfo);
    const s = new Session(this, channel, game);
    this.sessions.set(channel.id, s);
    return s;
  }

  remove(session) {
    session.stopTimer();
    this.sessions.delete(session.channel.id);
    for (const [u, ch] of this.byUser) if (ch === session.channel.id) this.byUser.delete(u);
  }

  shutdown() {
    for (const s of this.sessions.values()) s.stopTimer();
  }
}

export { GameError };
export default GameManager;
