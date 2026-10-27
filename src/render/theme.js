/**
 * Ortak tasarim dili: koyu gece mavisi zemin, dort UNO rengi ve mor-pembe vurgu.
 */
import { COLOR_HEX } from '../game/cards.js';

export const THEME = {
  bg0: '#060818',
  bg1: '#0d1233',
  panel: 'rgba(255,255,255,0.06)',
  stroke: 'rgba(255,255,255,0.13)',
  text: '#eef1ff',
  muted: '#9aa3c7',
  gold: '#ffd166',
  violet: '#8b5cff',
  pink: '#ff4fa3',
  cyan: '#3dd9ff',
  ...COLOR_HEX
};

export const BASE_CSS = `
*{margin:0;padding:0;box-sizing:border-box}
html,body{background:#05070f}
body{font-family:'Inter','Poppins',sans-serif;color:${THEME.text};-webkit-font-smoothing:antialiased}
#root{position:relative;overflow:hidden}
.pop{font-family:'Poppins','Inter',sans-serif}
.abs{position:absolute}
.fill{position:absolute;inset:0}
.ell{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
`;

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < String(str).length; i++) {
    h ^= String(str).charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const AVATAR_GRADS = [
  ['#ff6a7a', '#8b5cff'], ['#3dd9ff', '#3d7bff'], ['#5df0a4', '#12a5b8'], ['#ffd166', '#ff5d3d'],
  ['#ff4fa3', '#8b5cff'], ['#9be04a', '#1fcf7c'], ['#ff9b2f', '#ff3d55'], ['#6aa4ff', '#a05cff']
];

/** Avatar: resim varsa onu, yoksa isim bas harfli gradyan daire */
export function avatar({ url, name = '?', size = 64, ring = null, ringWidth = 4, glow = null, style = '' }) {
  const [a, b] = AVATAR_GRADS[hash(name) % AVATAR_GRADS.length];
  const letter = esc((String(name).trim()[0] ?? '?').toLocaleUpperCase('tr'));
  const inner = url
    ? `<img src="${url}" style="width:100%;height:100%;object-fit:cover;display:block"/>`
    : `<div class="pop" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,${a},${b});font-weight:800;font-size:${Math.round(size * 0.46)}px;color:#fff;text-shadow:0 2px 6px rgba(0,0,0,.35)">${letter}</div>`;
  const ringCss = ring ? `box-shadow:0 0 0 ${ringWidth}px ${ring}${glow ? `,0 0 ${size * 0.5}px ${glow}` : ''};` : glow ? `box-shadow:0 0 ${size * 0.5}px ${glow};` : '';
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;position:relative;flex:none;${ringCss}${style}">${inner}</div>`;
}

/** Tam ekran arka plan: gradyan + dort renkli isik halesi (blur yerine radyal gradyan: cok daha hizli) */
export function background({ width, height, tint = null, dim = 1 }) {
  const t = tint ?? THEME.violet;
  const halo = (x, y, w, h, color, o) =>
    `<div class="abs" style="left:${x};top:${y};width:${w};height:${h};background:radial-gradient(closest-side,${color},transparent);opacity:${o * dim}"></div>`;
  return `
  <div class="fill" style="background:radial-gradient(120% 90% at 50% 0%,#1a2060 0%,${THEME.bg1} 38%,${THEME.bg0} 100%)"></div>
  ${halo('-14%', '-30%', '64%', '80%', THEME.red, 0.34)}
  ${halo('52%', '-30%', '64%', '80%', THEME.blue, 0.40)}
  ${halo('-14%', '50%', '64%', '80%', THEME.green, 0.26)}
  ${halo('52%', '50%', '64%', '80%', THEME.yellow, 0.24)}
  ${halo('20%', '15%', '60%', '70%', t, 0.26)}
  <div class="fill" style="background-image:radial-gradient(rgba(255,255,255,.07) 1.2px,transparent 1.4px);background-size:28px 28px;opacity:.55"></div>
  <div class="fill" style="background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.45) 100%)"></div>`;
}

/** UNO yazi logosu (kendi tipografik tasarimimiz) */
export function wordmark({ size = 64 }) {
  return `<div class="pop" style="font-weight:900;font-style:italic;font-size:${size}px;line-height:1;letter-spacing:${size * 0.02}px;display:inline-block;
    background:linear-gradient(100deg,${THEME.red} 0%,${THEME.yellow} 33%,${THEME.green} 62%,${THEME.blue} 100%);-webkit-background-clip:text;background-clip:text;color:transparent;
    filter:drop-shadow(0 ${size * 0.06}px ${size * 0.12}px rgba(0,0,0,.55))">UNO</div>`;
}

export function pill({ text, color = '#fff', bg = 'rgba(255,255,255,.1)', border = 'rgba(255,255,255,.18)', size = 16, icon = '' }) {
  return `<div class="pop" style="display:inline-flex;align-items:center;gap:${size * 0.5}px;padding:${size * 0.42}px ${size * 0.9}px;border-radius:999px;background:${bg};border:1.5px solid ${border};color:${color};font-weight:700;font-size:${size}px;letter-spacing:${size * 0.08}px;text-transform:uppercase;white-space:nowrap">${icon}${esc(text)}</div>`;
}

export function glass({ extra = '' } = {}) {
  return `background:linear-gradient(160deg,rgba(255,255,255,.10),rgba(255,255,255,.035));border:1.5px solid ${THEME.stroke};border-radius:22px;box-shadow:0 18px 40px -14px rgba(0,0,0,.65),inset 0 1px 0 rgba(255,255,255,.14);backdrop-filter:blur(6px);${extra}`;
}
