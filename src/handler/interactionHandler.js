import { GameError } from '../game/UnoGame.js';
import { identify } from '../game/GameManager.js';
import { POWERS, COLORS, cardName } from '../game/cards.js';
import { FLAG_V2, FLAG_EPHEMERAL, notice, payload, E } from '../ui/v2.js';
import * as views from '../ui/views.js';

const EPH = 64;
const asEdit = (view) => ({ components: view.components, files: view.files, attachments: [], flags: FLAG_V2 });
const asReply = (view) => ({ components: view.components, files: view.files, flags: FLAG_V2 });

export function createInteractionHandler(ctx) {
  const { manager, config } = ctx;

  /** Hatayi sadece tiklayan kisiye gizli mesaj olarak soyler */
  async function fail(i, err) {
    const msg = err instanceof GameError ? err.message : 'Beklenmeyen bir hata oldu. Biraz sonra tekrar dene.';
    if (!(err instanceof GameError)) console.error('Etkileşim hatası:', err);
    const data = payload([notice('İşlem yapılamadı', msg, { kind: 'error' })], { ephemeral: true });
    try {
      if (i.replied || i.deferred) await i.followUp(data);
      else await i.reply(data);
    } catch (e) {
      console.error('Hata mesajı gönderilemedi:', e.message);
    }
  }

  const inEphemeral = (i) => !!i.message?.flags?.has?.(EPH);

  /** Elin yeniden cizilmis halini kullaniciya gizli gosterir (var olan gizli mesaji gunceller ya da yeni acar) */
  async function showHand(i, session, opts) {
    const view = await views.handView(session, i.user.id, opts);
    if (inEphemeral(i)) return i.editReply(asEdit(view));
    return i.followUp({ flags: FLAG_V2 | FLAG_EPHEMERAL, components: view.components, files: view.files });
  }

  async function afterPlay(i, session, res, card) {
    if (res.peek) {
      const pv = await views.peekView(session, res.peek.targetId);
      if (pv) await i.followUp({ flags: FLAG_V2 | FLAG_EPHEMERAL, components: pv.components, files: pv.files });
    }
    if (inEphemeral(i)) {
      const view = await views.handView(session, i.user.id, { note: res.finished ? `${E('trophy')} Son kartını attın!` : `${E('check')} **${cardName(card)}** oynadın.` });
      await i.editReply(asEdit(view));
    }
  }

  async function playFlow(i, session, cardId, opts) {
    const card = session.game.getPlayer(i.user.id)?.find(cardId);
    if (!card) throw new GameError('Bu kart artık elinde yok.');
    await i.deferUpdate();
    const res = await session.play(i.user.id, cardId, opts);
    await afterPlay(i, session, res, card);
  }

  return async function handle(i) {
    if (!(i.isButton() || i.isStringSelectMenu()) || !i.customId.startsWith('uno:')) return;
    const [, action, a, b] = i.customId.split(':');
    const uid = i.user.id;

    try {
      // ---- oturum gerektirmeyenler
      if (action === 'help') {
        const v = await views.helpView(i.values[0], config.prefix);
        return i.update(asEdit(v));
      }
      if (action === 'lb' || action === 'me') {
        await i.deferReply({ flags: FLAG_V2 | (action === 'me' ? FLAG_EPHEMERAL : 0) });
        const v = action === 'lb' ? await views.leaderboardView() : await views.profileView(i.user, i.member);
        return i.editReply(asReply(v));
      }
      if (action === 'again') {
        if (manager.get(i.channelId)) throw new GameError('Bu kanalda zaten bir oyun var.');
        await i.deferUpdate();
        const s = manager.create(i.channel, identify(i.user, i.member));
        return s.postLobby();
      }

      const session = manager.get(i.channelId);
      if (!session) throw new GameError('Bu oyun artık yok. `!uno` ile yeni bir lobi açabilirsin.');
      const g = session.game;

      switch (action) {
        // ---- lobi
        case 'join':
          await i.deferUpdate();
          return void (await session.join(identify(i.user, i.member)));
        case 'leave':
          await i.deferUpdate();
          return void (await session.leave(uid));
        case 'start':
          await i.deferUpdate();
          return void (await session.start(uid));
        case 'cancel': {
          await i.deferUpdate();
          const admin = i.memberPermissions?.has('ManageGuild') ?? false;
          return void (await session.cancel(uid, admin));
        }
        case 'opt':
          await i.deferUpdate();
          return void (await session.setOption(uid, a));

        // ---- el
        case 'hand': {
          if (!g.getPlayer(uid)) throw new GameError('Bu oyunda değilsin.');
          if (g.status !== 'playing') throw new GameError('Oyun henüz başlamadı.');
          if (inEphemeral(i)) {
            await i.deferUpdate();
            return void (await showHand(i, session, {}));
          }
          await i.deferReply({ flags: FLAG_V2 | FLAG_EPHEMERAL });
          const v = await views.handView(session, uid);
          return void (await i.editReply(asReply(v)));
        }

        // ---- hamleler
        case 'draw': {
          await i.deferUpdate();
          const before = g.getPlayer(uid)?.hand.length ?? 0;
          const res = await session.draw(uid);
          const p = g.getPlayer(uid);
          let note;
          if (res.drawn.length === 1) {
            const c = res.drawn[0];
            note = `${E('deck')} Çektiğin kart: **${cardName(c)}**. ${res.canPlay ? 'Uyuyor, istersen hemen oynayabilir ya da pas geçebilirsin.' : 'Uymadığı için sıra geçti.'}`;
          } else {
            note = `${E('draw2')} ${Math.max(0, (p?.hand.length ?? 0) - before)} kart çektin.`;
          }
          return void (await showHand(i, session, { note, newCardId: res.drawn[0]?.id }));
        }
        case 'pass': {
          await i.deferUpdate();
          await session.pass(uid);
          if (inEphemeral(i)) await showHand(i, session, { note: `${E('arrow_right')} Pas geçtin.` });
          return;
        }
        case 'uno': {
          await i.deferUpdate();
          const res = await session.uno(uid);
          if (inEphemeral(i)) await showHand(i, session, { note: `${E('uno')} ${res.events[0]?.type === 'caught' ? 'Rakibi yakaladın!' : 'UNO çağrın kaydedildi.'}` });
          return;
        }
        case 'challenge': {
          await i.deferUpdate();
          await session.challenge(uid);
          return;
        }

        // ---- kart secimi akisi
        case 'play': {
          const cardId = i.values[0];
          const card = g.getPlayer(uid)?.find(cardId);
          if (!card) throw new GameError('Bu kart artık elinde yok.');
          if (card.isWild) return void (await i.update(asEdit(views.colorPickView(card))));
          return void (await playFlow(i, session, cardId, {}));
        }
        case 'color': {
          const card = g.getPlayer(uid)?.find(a);
          if (!card) throw new GameError('Bu kart artık elinde yok.');
          if (!COLORS.includes(b)) throw new GameError('Geçersiz renk.');
          if (card.isPower && POWERS[card.value].needsTarget && g.players.length > 2) {
            return void (await i.update(asEdit(views.targetPickView(session, uid, card, b))));
          }
          return void (await playFlow(i, session, a, { color: b }));
        }
        case 'target':
          return void (await playFlow(i, session, a, { color: b, targetId: i.values[0] }));
        default:
          return;
      }
    } catch (e) {
      await fail(i, e);
    }
  };
}
