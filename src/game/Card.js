import { isWildLike } from './cards.js';

let counter = 0;

/**
 * Tek bir UNO karti.
 * kind: number | skip | reverse | draw2 | wild | wild4 | power
 * value: sayi kartlarinda 0-9, guc kartlarinda guc kimligi, digerlerinde null
 */
export class Card {
  constructor(color, kind, value = null) {
    this.id = `c${++counter}`;
    this.color = color;
    this.kind = kind;
    this.value = value;
  }

  get isWild() {
    return isWildLike(this);
  }

  get isPower() {
    return this.kind === 'power';
  }

  /** Iki kart gorsel olarak ayni mi (atlama / jump-in icin) */
  sameFace(other) {
    return this.color === other.color && this.kind === other.kind && this.value === other.value;
  }

  toJSON() {
    return { id: this.id, color: this.color, kind: this.kind, value: this.value };
  }
}

export default Card;
