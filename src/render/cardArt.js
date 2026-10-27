/**
 * Kart tasarimlari: tamamen kendi cizimimiz, SVG olarak uretilir.
 * Her kart 200x300 birimlik bir tuval uzerindedir.
 */
import { ICONS } from '../emoji/icons.js';
import { COLOR_HEX, POWERS, cardValueLabel } from '../game/cards.js';
import { esc } from './theme.js';

let uid = 0;

const PALETTE = {
  red: { a: '#ff7d8a', b: '#f0254a', c: '#9c1230', ink: '#d11a3d' },
  yellow: { a: '#ffe87a', b: '#ffbd0a', c: '#cf8a00', ink: '#d99200' },
  green: { a: '#6df5ad', b: '#14c26f', c: '#0a7d44', ink: '#0d9a55' },
  blue: { a: '#78aeff', b: '#3470f5', c: '#1a43b0', ink: '#2556da' }
};

const QUAD = ['#ff3d55', '#3d7bff', '#ffc61a', '#1fcf7c'];

function quadrants(cx, cy, r, extra = '') {
  // Dort renkli daire: ust-sol kirmizi, ust-sag mavi, alt-sag sari, alt-sol yesil
  const q = (a0, a1, col) => {
    const p = (a) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
    const [x0, y0] = p(a0);
    const [x1, y1] = p(a1);
    return `<path d="M${cx} ${cy}L${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}Z" fill="${col}"/>`;
  };
  return `<g ${extra}>${q(180, 270, QUAD[0])}${q(270, 360, QUAD[1])}${q(0, 90, QUAD[2])}${q(90, 180, QUAD[3])}</g>`;
}

function iconAt(name, x, y, size, color, sw = 2.4) {
  const body = ICONS[name] ?? ICONS.card;
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" style="color:${color};overflow:visible">${body}</svg>`;
}

const FONT = `font-family="Poppins,Inter,sans-serif"`;

function wrap(id, inner, { dim = false, width = 200 } = {}) {
  const dimRect = dim ? `<rect x="1" y="1" width="198" height="298" rx="26" fill="#04050d" opacity=".46"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" width="${width}" height="${width * 1.5}" style="display:block;overflow:visible">${inner}${dimRect}</svg>`;
}

function colored(card, o) {
  const u = ++uid;
  const p = PALETTE[card.color];
  const defs = `<defs>
    <linearGradient id="g${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.a}"/><stop offset=".5" stop-color="${p.b}"/><stop offset="1" stop-color="${p.c}"/></linearGradient>
    <radialGradient id="m${u}" cx=".32" cy=".26" r=".95"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dfe6ff"/></radialGradient>
    <linearGradient id="s${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <clipPath id="c${u}"><rect x="8" y="8" width="184" height="284" rx="20"/></clipPath>
  </defs>`;
  const val = cardValueLabel(card);
  let glyph = '';
  let corner = '';
  const ink = p.ink;
  if (card.kind === 'number') {
    glyph = `<text x="100" y="${card.value === 6 || card.value === 9 ? 180 : 186}" text-anchor="middle" ${FONT} font-weight="900" font-style="italic" font-size="108" fill="${ink}">${card.value}</text>`;
    if (card.value === 6 || card.value === 9) glyph += `<rect x="80" y="192" width="40" height="7" rx="3.5" fill="${ink}"/>`;
    corner = (x, y) => `<text x="${x}" y="${y}" text-anchor="middle" ${FONT} font-weight="800" font-style="italic" font-size="30" fill="#fff" stroke="rgba(0,0,0,.28)" stroke-width="3" paint-order="stroke">${card.value}</text>`;
  } else if (card.kind === 'skip') {
    glyph = iconAt('skip', 52, 102, 96, ink, 2.9);
    corner = (x, y) => iconAt('skip', x - 14, y - 24, 28, '#fff', 3);
  } else if (card.kind === 'reverse') {
    glyph = iconAt('reverse', 52, 102, 96, ink, 2.7);
    corner = (x, y) => iconAt('reverse', x - 14, y - 24, 28, '#fff', 3);
  } else {
    // +2: iki ust uste kart
    glyph = `<g transform="translate(100 150)">
      <rect x="-40" y="-34" width="44" height="62" rx="9" fill="${ink}" opacity=".55" transform="rotate(-14)"/>
      <rect x="-14" y="-30" width="48" height="66" rx="9" fill="${ink}" transform="rotate(8)"/>
      <text x="${10}" y="14" text-anchor="middle" ${FONT} font-weight="900" font-style="italic" font-size="34" fill="#fff" transform="rotate(8)">+2</text></g>`;
    corner = (x, y) => `<text x="${x}" y="${y}" text-anchor="middle" ${FONT} font-weight="800" font-style="italic" font-size="26" fill="#fff" stroke="rgba(0,0,0,.28)" stroke-width="3" paint-order="stroke">+2</text>`;
  }
  const inner = `${defs}
    <rect x="1" y="1" width="198" height="298" rx="26" fill="#f7f8ff"/>
    <rect x="8" y="8" width="184" height="284" rx="20" fill="url(#g${u})"/>
    <g clip-path="url(#c${u})">
      <circle cx="-6" cy="14" r="140" fill="url(#s${u})" opacity=".55"/>
      <circle cx="196" cy="304" r="118" fill="none" stroke="#fff" stroke-opacity=".13" stroke-width="26"/>
      <circle cx="196" cy="304" r="72" fill="none" stroke="#fff" stroke-opacity=".10" stroke-width="10"/>
      <circle cx="10" cy="20" r="46" fill="none" stroke="#fff" stroke-opacity=".09" stroke-width="8"/>
      <path d="M-20 238L220 112V138L-20 264Z" fill="#fff" opacity=".07"/>
    </g>
    <circle cx="100" cy="156" r="75" fill="#000" opacity=".22"/>
    <circle cx="100" cy="150" r="73" fill="url(#m${u})"/>
    <circle cx="100" cy="150" r="64" fill="none" stroke="${ink}" stroke-width="4.5" opacity=".85"/>
    ${glyph}
    ${corner(34, 46)}
    <g transform="rotate(180 100 150)">${corner(34, 46)}</g>`;
  return wrap(u, inner, o);
}

function wildCard(card, o) {
  const u = ++uid;
  const four = card.kind === 'wild4';
  const inner = `<defs>
    <linearGradient id="g${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a2f63"/><stop offset=".5" stop-color="#12163a"/><stop offset="1" stop-color="#05061a"/></linearGradient>
    <radialGradient id="h${u}" cx=".3" cy=".2" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <clipPath id="c${u}"><rect x="8" y="8" width="184" height="284" rx="20"/></clipPath>
    <clipPath id="q${u}"><circle cx="100" cy="150" r="66"/></clipPath>
  </defs>
  <rect x="1" y="1" width="198" height="298" rx="26" fill="#f7f8ff"/>
  <rect x="8" y="8" width="184" height="284" rx="20" fill="url(#g${u})"/>
  <g clip-path="url(#c${u})">
    <rect x="8" y="8" width="184" height="284" fill="url(#h${u})"/>
    <g opacity=".5">${quadrants(100, 150, 230)}</g>
    <rect x="8" y="8" width="184" height="284" fill="#070920" opacity=".86"/>
    <circle cx="196" cy="304" r="118" fill="none" stroke="#fff" stroke-opacity=".07" stroke-width="26"/>
  </g>
  <circle cx="100" cy="156" r="75" fill="#000" opacity=".4"/>
  <circle cx="100" cy="150" r="73" fill="#fff"/>
  <g clip-path="url(#q${u})">${quadrants(100, 150, 70)}<circle cx="100" cy="150" r="70" fill="url(#h${u})"/></g>
  ${four
    ? `<text x="100" y="176" text-anchor="middle" ${FONT} font-weight="900" font-style="italic" font-size="70" fill="#fff" stroke="rgba(5,6,26,.75)" stroke-width="10" paint-order="stroke" stroke-linejoin="round">+4</text>`
    : `<circle cx="100" cy="150" r="17" fill="#fff"/><circle cx="100" cy="150" r="11" fill="#12163a"/>`}
  ${[[34, 40], [166, 260]].map(([x, y]) => (four
    ? `<text x="${x}" y="${y + 6}" text-anchor="middle" ${FONT} font-weight="800" font-style="italic" font-size="26" fill="#fff">+4</text>`
    : `<g clip-path="none">${quadrants(x, y, 13)}<circle cx="${x}" cy="${y}" r="13" fill="none" stroke="#fff" stroke-width="2.4"/></g>`)).join('')}`;
  return wrap(u, inner, o);
}

function powerCard(card, o) {
  const u = ++uid;
  const pw = POWERS[card.value];
  const col = pw.color;
  const name = pw.name.toLocaleUpperCase('tr');
  const fs = name.length > 10 ? 19 : name.length > 8 ? 22 : 26;
  const inner = `<defs>
    <linearGradient id="g${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#241a54"/><stop offset=".55" stop-color="#110c30"/><stop offset="1" stop-color="#060416"/></linearGradient>
    <linearGradient id="b${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".35" stop-color="${col}"/><stop offset="1" stop-color="${col}" stop-opacity=".55"/></linearGradient>
    <radialGradient id="r${u}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${col}" stop-opacity=".55"/><stop offset=".7" stop-color="${col}" stop-opacity=".12"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient>
    <filter id="f${u}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <clipPath id="c${u}"><rect x="8" y="8" width="184" height="284" rx="20"/></clipPath>
  </defs>
  <rect x="1" y="1" width="198" height="298" rx="26" fill="url(#b${u})"/>
  <rect x="7" y="7" width="186" height="286" rx="21" fill="url(#g${u})"/>
  <g clip-path="url(#c${u})">
    <circle cx="100" cy="146" r="120" fill="url(#r${u})"/>
    <g stroke="${col}" stroke-opacity=".14" stroke-width="1.4" fill="none">
      ${Array.from({ length: 9 }, (_, i) => `<path d="M${-20 + i * 32} 300L${60 + i * 32} 0"/>`).join('')}
    </g>
    ${Array.from({ length: 14 }, (_, i) => {
      const x = 14 + ((i * 53) % 172);
      const y = 18 + ((i * 97) % 262);
      return `<circle cx="${x}" cy="${y}" r="${i % 3 ? 1.2 : 2}" fill="#fff" opacity="${0.25 + (i % 4) * 0.12}"/>`;
    }).join('')}
  </g>
  <rect x="62" y="20" width="76" height="22" rx="11" fill="${col}" opacity=".22" stroke="${col}" stroke-opacity=".8" stroke-width="1.4"/>
  <text x="100" y="35.500" text-anchor="middle" ${FONT} font-weight="800" font-size="11.500" letter-spacing="2.400" fill="#fff">GÜÇ KARTI</text>
  <circle cx="100" cy="138" r="64" fill="#0a0724" stroke="${col}" stroke-width="3.500" filter="url(#f${u})"/>
  <circle cx="100" cy="138" r="55" fill="none" stroke="${col}" stroke-opacity=".45" stroke-width="1.500" stroke-dasharray="3 6"/>
  ${iconAt(card.value, 56, 94, 88, '#ffffff', 2.1)}
  <text x="100" y="${232 + (fs < 22 ? 2 : 0)}" text-anchor="middle" ${FONT} font-weight="800" font-size="${fs}" fill="#fff" letter-spacing=".8">${esc(name)}</text>
  <text x="100" y="256" text-anchor="middle" ${FONT} font-weight="600" font-size="12.500" fill="${col}">${esc(pw.short)}</text>
  <rect x="78" y="268" width="44" height="3" rx="1.500" fill="${col}" opacity=".8"/>
  ${iconAt(card.value, 17, 17, 20, col, 2.6)}
  <g transform="rotate(180 100 150)">${iconAt(card.value, 17, 17, 20, col, 2.6)}</g>`;
  return wrap(u, inner, o);
}

/** Kartin arka yuzu */
export function backSVG(o = {}) {
  const u = ++uid;
  const inner = `<defs>
    <linearGradient id="g${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#262b66"/><stop offset=".5" stop-color="#121642"/><stop offset="1" stop-color="#06081f"/></linearGradient>
    <clipPath id="c${u}"><rect x="8" y="8" width="184" height="284" rx="20"/></clipPath>
  </defs>
  <rect x="1" y="1" width="198" height="298" rx="26" fill="#f7f8ff"/>
  <rect x="8" y="8" width="184" height="284" rx="20" fill="url(#g${u})"/>
  <g clip-path="url(#c${u})">
    ${Array.from({ length: 10 }, (_, i) => `<rect x="${-30 + i * 28}" y="-20" width="12" height="340" fill="${QUAD[i % 4]}" opacity=".16" transform="rotate(24 100 150)"/>`).join('')}
    <circle cx="100" cy="150" r="96" fill="#05061a" opacity=".55"/>
  </g>
  <circle cx="100" cy="150" r="70" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2.500"/>
  <circle cx="100" cy="150" r="62" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="1.500" stroke-dasharray="2 7"/>
  <g ${FONT} font-weight="900" font-style="italic" font-size="58" text-anchor="middle">
    <text x="96" y="171" fill="${QUAD[0]}">UNO</text>
    <text x="104" y="171" fill="${QUAD[1]}">UNO</text>
    <text x="100" y="171" fill="#fff">UNO</text>
  </g>
  ${QUAD.map((c, i) => `<circle cx="${70 + i * 20}" cy="196" r="5" fill="${c}"/>`).join('')}`;
  return wrap(u, inner, o);
}

/** Herhangi bir kartin SVG'si */
export function cardSVG(card, o = {}) {
  if (!card) return backSVG(o);
  if (card.kind === 'power') return powerCard(card, o);
  if (card.kind === 'wild' || card.kind === 'wild4') return wildCard(card, o);
  return colored(card, o);
}

export function colorGem(color, size = 40) {
  const hex = COLOR_HEX[color];
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:radial-gradient(circle at 32% 28%,#fff 0%,${hex} 38%,${hex} 100%);box-shadow:0 0 ${size * 0.6}px ${hex}aa,inset 0 -${size * 0.12}px ${size * 0.2}px rgba(0,0,0,.25)"></div>`;
}

export { quadrants, iconAt, PALETTE };
