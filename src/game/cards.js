/**
 * Kart tanimlari: renkler, kart turleri, guc kartlari ve puanlar.
 * Tum metinler Turkce, hicbir yerde Unicode emoji kullanilmaz.
 */

export const COLORS = ['red', 'yellow', 'green', 'blue'];

export const COLOR_TR = {
  red: 'Kırmızı',
  yellow: 'Sarı',
  green: 'Yeşil',
  blue: 'Mavi',
  wild: 'Joker'
};

export const COLOR_HEX = {
  red: '#ff3d55',
  yellow: '#ffc61a',
  green: '#1fcf7c',
  blue: '#3d7bff',
  wild: '#8b5cff'
};

/** Renk icin metin takma adlari (komutlarda kullanilir) */
export const COLOR_ALIASES = {
  red: ['kirmizi', 'kirmızı', 'k', 'red', 'r'],
  yellow: ['sari', 'sarı', 's', 'yellow', 'y'],
  green: ['yesil', 'yeşil', 'ye', 'g', 'green'],
  blue: ['mavi', 'm', 'blue', 'b']
};

/** Guc kartlari: joker gibi her zaman oynanir, renk secilir */
export const POWERS = {
  storm: {
    name: 'Kasırga',
    short: 'Herkes çeker',
    desc: 'Sen hariç herkes 1 kart çeker.',
    color: '#8b5cff',
    needsTarget: false,
    aliases: ['kasirga', 'storm']
  },
  revenge: {
    name: 'Rövanş',
    short: 'Öncekine ceza',
    desc: 'Senden hemen önce oynayan oyuncu 2 kart çeker.',
    color: '#ff5d3d',
    needsTarget: false,
    aliases: ['rovans', 'revenge']
  },
  shield: {
    name: 'Kalkan',
    short: 'Cezadan korun',
    desc: 'Sana gelecek ilk ceza (+2, +4, Kasırga, Rövanş) işlemez.',
    color: '#19c3b1',
    needsTarget: false,
    aliases: ['kalkan', 'shield']
  },
  peek: {
    name: 'Röntgen',
    short: 'Eli gör',
    desc: 'Seçtiğin oyuncunun elini sadece sen görürsün.',
    color: '#4dabff',
    needsTarget: true,
    aliases: ['rontgen', 'peek']
  },
  swap: {
    name: 'Büyük Takas',
    short: 'Eller kayar',
    desc: 'Herkesin eli oyun yönünde bir sonraki oyuncuya geçer.',
    color: '#ff4fa3',
    needsTarget: false,
    aliases: ['takas', 'swap']
  },
  duel: {
    name: 'Düello',
    short: 'El değiştir',
    desc: 'Seçtiğin oyuncuyla elini değiştirirsin.',
    color: '#ff9b2f',
    needsTarget: true,
    aliases: ['duello', 'duel']
  },
  harvest: {
    name: 'Hasat',
    short: 'Herkesten kart',
    desc: 'En az 2 kartı olan her oyuncu sana rastgele 1 kart verir.',
    color: '#9be04a',
    needsTarget: false,
    aliases: ['hasat', 'harvest']
  },
  double: {
    name: 'Çifte Hamle',
    short: 'Sıra sende',
    desc: 'Sıra yine sende kalır, bir kart daha oynarsın.',
    color: '#ffd23f',
    needsTarget: false,
    aliases: ['cifte', 'double']
  }
};

export const POWER_IDS = Object.keys(POWERS);

export const KIND_TR = {
  number: 'Sayı',
  skip: 'Atla',
  reverse: 'Yön Değiştir',
  draw2: '+2',
  wild: 'Joker',
  wild4: 'Joker +4',
  power: 'Güç'
};

export const COLOR_ORDER = { red: 0, yellow: 1, green: 2, blue: 3, wild: 4 };
const KIND_ORDER = { number: 0, skip: 1, reverse: 2, draw2: 3, wild: 4, wild4: 5, power: 6 };

export function isWildLike(card) {
  return card.kind === 'wild' || card.kind === 'wild4' || card.kind === 'power';
}

/** Kartin ekranda gorunen kisa degeri */
export function cardValueLabel(card) {
  switch (card.kind) {
    case 'number': return String(card.value);
    case 'skip': return 'Atla';
    case 'reverse': return 'Ters';
    case 'draw2': return '+2';
    case 'wild': return 'Joker';
    case 'wild4': return '+4';
    case 'power': return POWERS[card.value]?.name ?? 'Güç';
    default: return '?';
  }
}

/** Kartin tam adi (ornek: "Kırmızı 5", "Joker +4", "Kasırga") */
export function cardName(card) {
  if (card.kind === 'wild') return 'Joker';
  if (card.kind === 'wild4') return 'Joker +4';
  if (card.kind === 'power') return POWERS[card.value]?.name ?? 'Güç Kartı';
  const color = COLOR_TR[card.color];
  if (card.kind === 'number') return `${color} ${card.value}`;
  if (card.kind === 'skip') return `${color} Atla`;
  if (card.kind === 'reverse') return `${color} Yön Değiştir`;
  return `${color} +2`;
}

/** Bitis puani icin kart degeri */
export function cardPoints(card) {
  if (card.kind === 'number') return card.value;
  if (card.kind === 'skip' || card.kind === 'reverse' || card.kind === 'draw2') return 20;
  return 50;
}

/** El siralamasi: renk, tur, deger */
export function compareCards(a, b) {
  const c = COLOR_ORDER[a.color] - COLOR_ORDER[b.color];
  if (c) return c;
  const k = KIND_ORDER[a.kind] - KIND_ORDER[b.kind];
  if (k) return k;
  if (a.kind === 'number') return a.value - b.value;
  if (a.kind === 'power') return POWER_IDS.indexOf(a.value) - POWER_IDS.indexOf(b.value);
  return 0;
}
