import { compareCards } from './cards.js';

export class Player {
  constructor({ id, name, avatarUrl = null }) {
    this.id = id;
    this.name = name;
    this.avatarUrl = avatarUrl;
    this.hand = [];
    this.unoCalled = false;
    this.shield = false;
    this.afk = 0;
    // Oyun ici istatistikler
    this.played = 0;
    this.powersUsed = 0;
    this.drawn = 0;
    this.unoCount = 0;
    this.caught = 0;
  }

  get cardCount() {
    return this.hand.length;
  }

  add(cards) {
    this.hand.push(...cards);
    this.drawn += cards.length;
    if (this.hand.length > 1) this.unoCalled = false;
  }

  /** Kartlari istatistik saymadan ekle (takas, hasat gibi) */
  receive(cards) {
    this.hand.push(...cards);
    if (this.hand.length > 1) this.unoCalled = false;
  }

  take(cardId) {
    const i = this.hand.findIndex((c) => c.id === cardId);
    if (i === -1) return null;
    return this.hand.splice(i, 1)[0];
  }

  find(cardId) {
    return this.hand.find((c) => c.id === cardId) ?? null;
  }

  clearHand() {
    const h = this.hand;
    this.hand = [];
    return h;
  }

  sorted() {
    return [...this.hand].sort(compareCards);
  }
}

export default Player;
