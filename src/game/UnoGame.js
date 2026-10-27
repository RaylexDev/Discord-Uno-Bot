import { Deck } from './Deck.js';
import { Player } from './Player.js';
import { COLORS, POWERS, cardPoints } from './cards.js';

/** Kullaniciya gosterilebilecek oyun kurali hatasi */
export class GameError extends Error {}

const DEFAULTS = {
  minPlayers: 2,
  maxPlayers: 10,
  startingCards: 7,
  powers: true,
  stacking: true,
  challenge: true,
  jumpIn: true,
  turnSeconds: 45
};

/**
 * Saf oyun motoru: Discord'dan habersizdir, sadece kurallari uygular.
 * Her islem "events" dizisi dondurur; arayuz bu olaylari metne ve gorsele cevirir.
 */
export class UnoGame {
  constructor(channelId, hostId, options = {}) {
    this.channelId = channelId;
    this.hostId = hostId;
    this.options = { ...DEFAULTS, ...options };
    this.players = [];
    this.deck = null;
    this.status = 'waiting'; // waiting | playing | ended
    this.direction = 1;
    this.current = 0;
    this.activeColor = null;
    this.stack = 0;
    this.stackKind = null; // draw2 | wild4
    this.challenge = null; // { byId, bluff }
    this.drawnCardId = null;
    this.unoVulnerable = null;
    this.turn = 0;
    this.createdAt = Date.now();
    this.startedAt = null;
    this.endedAt = null;
    this.winner = null;
    this.result = null;
    this.lastAction = null;
  }

  // ---------------------------------------------------------------- lobi

  get currentPlayer() {
    return this.players[this.current] ?? null;
  }

  get top() {
    return this.deck?.top ?? null;
  }

  getPlayer(id) {
    return this.players.find((p) => p.id === id) ?? null;
  }

  indexOf(id) {
    return this.players.findIndex((p) => p.id === id);
  }

  addPlayer({ id, name, avatarUrl = null }) {
    if (this.status !== 'waiting') throw new GameError('Oyun zaten başladı.');
    if (this.getPlayer(id)) throw new GameError('Zaten lobidesin.');
    if (this.players.length >= this.options.maxPlayers) throw new GameError('Lobi dolu.');
    const p = new Player({ id, name, avatarUrl });
    this.players.push(p);
    return p;
  }

  toggleOption(key) {
    if (this.status !== 'waiting') throw new GameError('Ayarlar oyun başladıktan sonra değişmez.');
    if (!['powers', 'stacking', 'challenge', 'jumpIn'].includes(key)) throw new GameError('Bilinmeyen ayar.');
    this.options[key] = !this.options[key];
    return this.options[key];
  }

  start() {
    if (this.status !== 'waiting') throw new GameError('Oyun zaten başladı.');
    if (this.players.length < this.options.minPlayers) {
      throw new GameError(`Başlamak için en az ${this.options.minPlayers} oyuncu gerekli.`);
    }
    this.deck = new Deck(this.options.powers);
    // Oturma / oynama sirasi rastgele
    for (let i = this.players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.players[i], this.players[j]] = [this.players[j], this.players[i]];
    }
    for (const p of this.players) p.receive(this.deck.draw(this.options.startingCards));
    const starter = this.deck.drawStarter();
    this.deck.pushDiscard(starter);
    this.activeColor = starter.color;
    this.status = 'playing';
    this.startedAt = Date.now();
    this.current = 0;
    this.turn = 1;
    return { starter };
  }

  // ------------------------------------------------------------ yardimcilar

  assertPlaying() {
    if (this.status !== 'playing') throw new GameError('Şu anda aktif bir oyun yok.');
  }

  /** Sira yonunde `steps` kisi ilerideki oyuncunun dizin numarasi */
  indexFrom(from, steps) {
    const n = this.players.length;
    return (((from + this.direction * steps) % n) + n) % n;
  }

  advance(steps = 1) {
    this.current = this.indexFrom(this.current, steps);
    this.drawnCardId = null;
  }

  /** Kart su anki masaya oynanabilir mi? */
  canPlayCard(card) {
    if (this.stack > 0) {
      if (!this.options.stacking) return false;
      if (this.stackKind === 'draw2') return card.kind === 'draw2' || card.kind === 'wild4';
      return card.kind === 'wild4';
    }
    if (card.isWild) return true;
    const top = this.top;
    if (card.color === this.activeColor) return true;
    if (!top.isWild && card.kind === top.kind && card.value === top.value) return true;
    return false;
  }

  canJumpIn(player, card) {
    const top = this.top;
    return (
      this.options.jumpIn &&
      this.stack === 0 &&
      this.status === 'playing' &&
      !card.isWild &&
      top &&
      !top.isWild &&
      card.sameFace(top) &&
      this.currentPlayer.id !== player.id
    );
  }

  /** Oyuncunun su an atabilecegi kartlar */
  playableCards(player) {
    if (this.status !== 'playing') return [];
    if (this.currentPlayer.id !== player.id) {
      return player.hand.filter((c) => this.canJumpIn(player, c));
    }
    if (this.drawnCardId) {
      const c = player.find(this.drawnCardId);
      return c && this.canPlayCard(c) ? [c] : [];
    }
    return player.hand.filter((c) => this.canPlayCard(c));
  }

  penalize(player, count, events, cause) {
    if (player.shield) {
      player.shield = false;
      events.push({ type: 'shield_block', playerId: player.id, cause });
      return 0;
    }
    const cards = this.deck.draw(count);
    player.add(cards);
    events.push({ type: 'penalty', playerId: player.id, count: cards.length, cause });
    return cards.length;
  }

  // ----------------------------------------------------------------- hamleler

  play(userId, cardId, { color = null, targetId = null } = {}) {
    this.assertPlaying();
    const player = this.getPlayer(userId);
    if (!player) throw new GameError('Bu oyunda değilsin.');
    const card = player.find(cardId);
    if (!card) throw new GameError('Bu kart elinde yok.');

    const isTurn = this.currentPlayer.id === userId;
    let jump = false;
    if (!isTurn) {
      if (!this.canJumpIn(player, card)) throw new GameError('Sıra sende değil.');
      jump = true;
    } else {
      if (this.drawnCardId && this.drawnCardId !== card.id) {
        throw new GameError('Az önce çektiğin kartı oynayabilir ya da pas geçebilirsin.');
      }
      if (!this.canPlayCard(card)) {
        if (this.stack > 0) {
          throw new GameError(
            this.options.stacking
              ? `Üzerinde ${this.stack} kart cezası var. Uygun bir ceza kartı at ya da ${this.stack} kart çek.`
              : `Üzerinde ${this.stack} kart cezası var, kart çekmelisin.`
          );
        }
        throw new GameError('Bu kart masadaki karta uymuyor.');
      }
    }

    if (card.isWild && !COLORS.includes(color)) throw new GameError('Önce bir renk seçmelisin.');

    let target = null;
    if (card.isPower && POWERS[card.value].needsTarget) {
      const others = this.players.filter((p) => p.id !== userId);
      target = others.length === 1 && !targetId ? others[0] : others.find((p) => p.id === targetId);
      if (!target) throw new GameError('Bir hedef oyuncu seçmelisin.');
    }

    // ---- hamle gecerli, durumu degistir
    const events = [];
    this.unoVulnerable = null;
    if (jump) {
      this.current = this.indexOf(userId);
      events.push({ type: 'jump', playerId: userId });
    }
    const prevColor = this.activeColor;
    const bluff =
      card.kind === 'wild4' && player.hand.some((c) => c.id !== card.id && !c.isWild && c.color === prevColor);

    player.take(card.id);
    player.played++;
    if (card.isPower) player.powersUsed++;
    player.afk = 0;
    this.deck.pushDiscard(card);
    this.activeColor = card.isWild ? color : card.color;
    this.drawnCardId = null;
    this.challenge = null;
    events.push({ type: 'play', playerId: userId, card: card.toJSON(), color: this.activeColor });

    if (player.hand.length === 0) {
      this.finish(player, 'normal');
      events.push({ type: 'win', playerId: userId });
      return { events, finished: true, card, peek: null };
    }

    if (player.hand.length === 1) {
      if (player.unoCalled) {
        events.push({ type: 'uno_safe', playerId: userId });
      } else {
        this.unoVulnerable = userId;
        events.push({ type: 'uno_open', playerId: userId });
      }
    }

    let peek = null;
    const n = this.players.length;

    switch (card.kind) {
      case 'skip': {
        const victim = this.players[this.indexFrom(this.current, 1)];
        events.push({ type: 'skip', playerId: victim.id });
        this.advance(2);
        break;
      }
      case 'reverse': {
        this.direction *= -1;
        events.push({ type: 'reverse', direction: this.direction });
        if (n === 2) {
          const victim = this.players[this.indexFrom(this.current, 1)];
          events.push({ type: 'skip', playerId: victim.id });
          this.advance(2);
        } else {
          this.advance(1);
        }
        break;
      }
      case 'draw2':
        this.stack += 2;
        this.stackKind = 'draw2';
        events.push({ type: 'stack', stack: this.stack, kind: 'draw2' });
        this.advance(1);
        break;
      case 'wild4':
        this.stack += 4;
        this.stackKind = 'wild4';
        if (this.stack === 4 && this.options.challenge) this.challenge = { byId: userId, bluff };
        events.push({ type: 'stack', stack: this.stack, kind: 'wild4' });
        this.advance(1);
        break;
      case 'wild':
        this.advance(1);
        break;
      case 'power': {
        const res = this.applyPower(card.value, player, target, events);
        peek = res?.peek ?? null;
        if (card.value !== 'double') this.advance(1);
        else this.drawnCardId = null;
        break;
      }
      default:
        this.advance(1);
    }

    this.turn++;
    return { events, finished: false, card, peek };
  }

  applyPower(id, player, target, events) {
    const others = this.players.filter((p) => p.id !== player.id);
    switch (id) {
      case 'storm':
        for (const o of others) this.penalize(o, 1, events, 'storm');
        return null;
      case 'revenge': {
        const prev = this.players[this.indexFrom(this.current, -1)];
        if (prev && prev.id !== player.id) this.penalize(prev, 2, events, 'revenge');
        return null;
      }
      case 'shield':
        player.shield = true;
        events.push({ type: 'shield_on', playerId: player.id });
        return null;
      case 'peek':
        events.push({ type: 'peek', playerId: player.id, targetId: target.id });
        return { peek: { viewerId: player.id, targetId: target.id } };
      case 'swap': {
        const hands = this.players.map((p) => p.clearHand());
        const n = this.players.length;
        this.players.forEach((p, i) => p.receive(hands[(((i - this.direction) % n) + n) % n]));
        for (const p of this.players) p.unoCalled = false;
        events.push({ type: 'swap' });
        return null;
      }
      case 'duel': {
        const a = player.clearHand();
        const b = target.clearHand();
        player.receive(b);
        target.receive(a);
        player.unoCalled = false;
        target.unoCalled = false;
        events.push({ type: 'duel', playerId: player.id, targetId: target.id });
        return null;
      }
      case 'harvest': {
        let total = 0;
        for (const o of others) {
          if (o.hand.length >= 2) {
            const i = Math.floor(Math.random() * o.hand.length);
            player.receive(o.hand.splice(i, 1));
            total++;
          }
        }
        events.push({ type: 'harvest', playerId: player.id, total });
        return null;
      }
      case 'double':
        events.push({ type: 'double', playerId: player.id });
        return null;
      default:
        return null;
    }
  }

  draw(userId) {
    this.assertPlaying();
    const player = this.getPlayer(userId);
    if (!player) throw new GameError('Bu oyunda değilsin.');
    if (this.currentPlayer.id !== userId) throw new GameError('Sıra sende değil.');
    if (this.drawnCardId) throw new GameError('Zaten kart çektin. Kartı oynayabilir ya da pas geçebilirsin.');

    const events = [];
    this.unoVulnerable = null;
    player.afk = 0;

    if (this.stack > 0) {
      const count = this.stack;
      this.stack = 0;
      this.stackKind = null;
      this.challenge = null;
      this.penalize(player, count, events, 'stack');
      this.advance(1);
      this.turn++;
      return { events, drawn: [], canPlay: false, passed: true };
    }

    const [card] = this.deck.draw(1);
    if (!card) {
      events.push({ type: 'empty_deck', playerId: userId });
      this.advance(1);
      this.turn++;
      return { events, drawn: [], canPlay: false, passed: true };
    }
    player.add([card]);
    events.push({ type: 'draw', playerId: userId, count: 1 });
    if (this.canPlayCard(card)) {
      this.drawnCardId = card.id;
      return { events, drawn: [card], canPlay: true, passed: false };
    }
    this.advance(1);
    this.turn++;
    return { events, drawn: [card], canPlay: false, passed: true };
  }

  pass(userId) {
    this.assertPlaying();
    if (this.currentPlayer.id !== userId) throw new GameError('Sıra sende değil.');
    if (!this.drawnCardId) throw new GameError('Pas geçmek için önce kart çekmelisin.');
    this.unoVulnerable = null;
    this.getPlayer(userId).afk = 0;
    this.advance(1);
    this.turn++;
    return { events: [{ type: 'pass', playerId: userId }] };
  }

  /** Sirada +4 varsa ve itiraz acikken sira sendeyse itiraz et */
  challengeWild4(userId) {
    this.assertPlaying();
    if (this.currentPlayer.id !== userId) throw new GameError('Sıra sende değil.');
    if (!this.challenge || this.stack !== 4 || this.stackKind !== 'wild4') {
      throw new GameError('İtiraz edilecek bir +4 yok.');
    }
    const challenger = this.getPlayer(userId);
    const offender = this.getPlayer(this.challenge.byId);
    const bluff = this.challenge.bluff;
    const events = [];
    this.challenge = null;
    this.unoVulnerable = null;
    this.stack = 0;
    this.stackKind = null;
    challenger.afk = 0;
    if (bluff && offender) {
      const cards = this.deck.draw(4);
      offender.add(cards);
      events.push({ type: 'challenge', success: true, challengerId: userId, offenderId: offender.id, count: cards.length });
    } else {
      const cards = this.deck.draw(6);
      challenger.add(cards);
      events.push({ type: 'challenge', success: false, challengerId: userId, offenderId: offender?.id, count: cards.length });
      this.advance(1);
      this.turn++;
    }
    return { events };
  }

  /** UNO cagrisi: kendi cagrin, rakibi yakalama ya da onceden hazirlanma */
  callUno(userId) {
    this.assertPlaying();
    const player = this.getPlayer(userId);
    if (!player) throw new GameError('Bu oyunda değilsin.');
    const events = [];

    if (this.unoVulnerable === userId) {
      player.unoCalled = true;
      player.unoCount++;
      this.unoVulnerable = null;
      events.push({ type: 'uno', playerId: userId });
      return { events };
    }
    if (this.unoVulnerable) {
      const victim = this.getPlayer(this.unoVulnerable);
      this.unoVulnerable = null;
      if (victim) {
        const cards = this.deck.draw(2);
        victim.add(cards);
        victim.caught++;
        events.push({ type: 'caught', playerId: victim.id, byId: userId, count: cards.length });
        return { events };
      }
    }
    if (player.hand.length <= 2 && !player.unoCalled) {
      player.unoCalled = true;
      player.unoCount++;
      events.push({ type: 'uno_ready', playerId: userId });
      return { events };
    }
    throw new GameError('Şu an UNO çağıracak ya da yakalayacak bir durum yok.');
  }

  /** Zaman asimi: kart cek ya da pas gec. */
  autoMove() {
    this.assertPlaying();
    const p = this.currentPlayer;
    const id = p.id;
    const res = this.drawnCardId ? this.pass(id) : this.draw(id);
    p.afk++;
    return { playerId: id, afk: p.afk, ...res, auto: true };
  }

  /** Oyundan ayril / at */
  leave(userId) {
    const idx = this.indexOf(userId);
    if (idx === -1) throw new GameError('Bu oyunda değilsin.');
    const p = this.players[idx];

    if (this.status === 'waiting') {
      this.players.splice(idx, 1);
      if (this.hostId === userId && this.players.length) this.hostId = this.players[0].id;
      return { events: [{ type: 'left', playerId: userId }], finished: false, wasCurrent: false };
    }
    this.assertPlaying();

    this.deck.putBack(p.clearHand());
    const wasCurrent = idx === this.current;
    this.players.splice(idx, 1);
    if (this.unoVulnerable === userId) this.unoVulnerable = null;
    if (this.challenge?.byId === userId) this.challenge = null;
    const events = [{ type: 'forfeit', playerId: userId, name: p.name }];

    if (this.players.length === 1) {
      this.finish(this.players[0], 'forfeit');
      events.push({ type: 'win', playerId: this.players[0].id });
      return { events, finished: true, wasCurrent };
    }
    if (idx < this.current) {
      this.current--;
    } else if (wasCurrent) {
      this.current = this.direction === 1 ? idx % this.players.length : (idx - 1 + this.players.length) % this.players.length;
      this.drawnCardId = null;
    }
    if (this.hostId === userId) this.hostId = this.players[0].id;
    return { events, finished: false, wasCurrent };
  }

  finish(winner, reason) {
    this.status = 'ended';
    this.winner = winner;
    this.endedAt = Date.now();
    this.drawnCardId = null;
    const points = this.players.filter((p) => p.id !== winner.id).reduce((s, p) => s + p.hand.reduce((a, c) => a + cardPoints(c), 0), 0);
    this.result = {
      winnerId: winner.id,
      reason,
      points,
      duration: Math.max(1, Math.round((this.endedAt - (this.startedAt ?? this.endedAt)) / 1000)),
      turns: this.turn,
      ranking: [...this.players].sort((a, b) => a.hand.length - b.hand.length).map((p) => ({
        id: p.id,
        name: p.name,
        avatarUrl: p.avatarUrl,
        cards: p.hand.length,
        played: p.played,
        drawn: p.drawn
      }))
    };
  }

  // -------------------------------------------------------------- gorunum

  snapshot() {
    return {
      status: this.status,
      players: this.players.map((p, i) => ({
        id: p.id,
        name: p.name,
        avatarUrl: p.avatarUrl,
        count: p.hand.length,
        uno: p.hand.length === 1,
        shield: p.shield,
        isCurrent: i === this.current,
        vulnerable: this.unoVulnerable === p.id
      })),
      top: this.top ? this.top.toJSON() : null,
      activeColor: this.activeColor,
      direction: this.direction,
      stack: this.stack,
      stackKind: this.stackKind,
      deckCount: this.deck?.count ?? 0,
      discardCount: this.deck?.discard.length ?? 0,
      turn: this.turn,
      hostId: this.hostId,
      lastAction: this.lastAction,
      options: { ...this.options }
    };
  }
}

export default UnoGame;
