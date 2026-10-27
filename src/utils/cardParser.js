import { COLORS, COLOR_ALIASES, POWERS, compareCards } from '../game/cards.js';
import { GameError } from '../game/UnoGame.js';

const fold = (s) =>
  String(s).toLocaleLowerCase('tr').replace(/ç/g, 'c').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u');

const colorOf = (t) => COLORS.find((c) => COLOR_ALIASES[c].map(fold).includes(t)) ?? null;

function valueOf(t) {
  if (/^[0-9]$/.test(t)) return { kind: 'number', value: Number(t) };
  if (['atla', 'skip', 'a'].includes(t)) return { kind: 'skip' };
  if (['ters', 'yon', 'reverse', 'tr'].includes(t)) return { kind: 'reverse' };
  if (['+2', 'c2', 'draw2', 'cek2', 'p2'].includes(t)) return { kind: 'draw2' };
  if (['+4', 'c4', 'draw4', 'wild4', 'joker4', 'cek4', 'p4'].includes(t)) return { kind: 'wild4' };
  if (['joker', 'wild', 'j'].includes(t)) return { kind: 'wild' };
  for (const [id, p] of Object.entries(POWERS)) if (p.aliases.includes(t) || fold(p.name) === t) return { kind: 'power', value: id };
  return null;
}

/**
 * "!at" argumanlarini kart secimine cevirir.
 * Ornekler: "kirmizi 5", "k5", "mavi atla", "joker sari", "+4 yesil", "kasirga mavi", "3" (sira no)
 */
export function parseCardArgs(rawArgs, player, game, mentionId = null) {
  const tokens = rawArgs.filter((a) => !/^<@!?\d+>$/.test(a)).map(fold).filter(Boolean);
  if (!tokens.length) throw new GameError('Hangi kartı atacağını yaz. Örnek: `!at kirmizi 5`, `!at joker mavi` ya da `!at 3`.');
  const sorted = [...player.hand].sort(compareCards);
  const playable = new Set(game.playableCards(player).map((c) => c.id));

  // Sira numarasi: "!at 3" ya da "!at 7 mavi" (joker icin renkle). "!at 5 kirmizi" elinde kirmizi 5 varsa kart tanimidir.
  if (/^\d+$/.test(tokens[0]) && tokens.length <= 2) {
    const idx = Number(tokens[0]);
    const asCard = tokens.length === 2 && colorOf(tokens[1]) && idx <= 9 && player.hand.some((c) => c.kind === 'number' && c.value === idx && c.color === colorOf(tokens[1]));
    if (!asCard && idx >= 1 && idx <= sorted.length && (tokens.length === 1 || colorOf(tokens[1]))) {
      return { card: sorted[idx - 1], color: tokens[1] ? colorOf(tokens[1]) : null, targetId: mentionId };
    }
  }

  let color = null;
  let val = null;
  const rest = [];
  for (const t of tokens) {
    const c = colorOf(t);
    if (c && !color) { color = c; continue; }
    const v = valueOf(t);
    if (v && !val) { val = v; continue; }
    // k5, m+2, ks gibi birlesik yazim
    if (t.length > 1) {
      const c2 = colorOf(t[0]);
      const v2 = valueOf(t.slice(1));
      if (c2 && v2 && !color && !val) { color = c2; val = v2; continue; }
    }
    rest.push(t);
  }
  if (rest.length || !val) throw new GameError(`Kartı anlayamadım: \`${tokens.join(' ')}\`. Örnek: \`!at kirmizi 5\`, \`!at mavi atla\`, \`!at joker sari\`.`);

  const wildLike = ['wild', 'wild4', 'power'].includes(val.kind);
  const matches = player.hand.filter(
    (c) => c.kind === val.kind && (val.value === undefined || c.value === val.value) && (wildLike || !color || c.color === color)
  );
  if (!matches.length) throw new GameError('Elinde böyle bir kart yok.');
  if (!wildLike && !color && new Set(matches.map((c) => c.color)).size > 1 && matches.filter((c) => playable.has(c.id)).length !== 1 && new Set(matches.filter((c) => playable.has(c.id)).map((c) => c.color)).size !== 1) {
    throw new GameError('Birden fazla renkte bu karttan var, rengi de yaz. Örnek: `!at kirmizi 5`.');
  }
  const card = matches.find((c) => playable.has(c.id)) ?? matches[0];
  return { card, color: wildLike ? color : card.color, targetId: mentionId };
}
