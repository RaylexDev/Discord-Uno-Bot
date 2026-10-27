import { Card } from './Card.js';
import { COLORS, POWER_IDS } from './cards.js';

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Deste. Bosalinca atilan kartlar (ustteki hariç) karistirilip yeniden kullanilir.
 * Kartlar hicbir zaman yoktan var edilmez, boylece toplam kart sayisi sabit kalir.
 */
export class Deck {
  constructor(includePowers = true) {
    this.cards = [];
    this.discard = [];
    for (const color of COLORS) {
      this.cards.push(new Card(color, 'number', 0));
      for (let n = 1; n <= 9; n++) {
        this.cards.push(new Card(color, 'number', n), new Card(color, 'number', n));
      }
      for (let i = 0; i < 2; i++) {
        this.cards.push(new Card(color, 'skip'), new Card(color, 'reverse'), new Card(color, 'draw2'));
      }
    }
    for (let i = 0; i < 4; i++) {
      this.cards.push(new Card('wild', 'wild'), new Card('wild', 'wild4'));
    }
    if (includePowers) {
      for (const id of POWER_IDS) {
        this.cards.push(new Card('wild', 'power', id), new Card('wild', 'power', id));
      }
    }
    this.total = this.cards.length;
    shuffleInPlace(this.cards);
  }

  get count() {
    return this.cards.length;
  }

  /** Atilan yigini (en ustteki kart disinda) desteye katar */
  recycle() {
    if (this.discard.length <= 1) return false;
    const top = this.discard.pop();
    const rest = this.discard;
    this.discard = [top];
    shuffleInPlace(rest);
    this.cards.unshift(...rest);
    return true;
  }

  /** n kart ceker (her zaman dizi dondurur, deste tamamen bittiyse eksik olabilir) */
  draw(n = 1) {
    const out = [];
    for (let i = 0; i < n; i++) {
      if (this.cards.length === 0 && !this.recycle()) break;
      out.push(this.cards.pop());
    }
    return out;
  }

  /** Cikan oyuncunun kartlarini destenin icine rastgele geri koyar */
  putBack(cards) {
    for (const c of cards) {
      const pos = Math.floor(Math.random() * (this.cards.length + 1));
      this.cards.splice(pos, 0, c);
    }
  }

  /** Atilan karti yigina ekler */
  pushDiscard(card) {
    this.discard.push(card);
  }

  get top() {
    return this.discard[this.discard.length - 1] ?? null;
  }

  /** Baslangic karti: sayi karti olana kadar dener */
  drawStarter() {
    for (let i = 0; i < 200; i++) {
      const [c] = this.draw(1);
      if (!c) return null;
      if (c.kind === 'number') return c;
      this.putBack([c]);
    }
    return null;
  }
}

export default Deck;
