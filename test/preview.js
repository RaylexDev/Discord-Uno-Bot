import fs from 'node:fs';
import { renderHTML, closeRenderer } from '../src/render/renderer.js';
import { cardSVG, backSVG } from '../src/render/cardArt.js';
import { background } from '../src/render/theme.js';
import { Card } from '../src/game/Card.js';
import { COLORS, POWER_IDS } from '../src/game/cards.js';
import { ICONS, iconSVG } from '../src/emoji/icons.js';

fs.mkdirSync('test/out', { recursive: true });
const cards = [];
for (const c of COLORS) { cards.push(new Card(c, 'number', 5), new Card(c, 'number', 9), new Card(c, 'skip'), new Card(c, 'reverse'), new Card(c, 'draw2')); }
cards.push(new Card('wild', 'wild'), new Card('wild', 'wild4'));
for (const p of POWER_IDS) cards.push(new Card('wild', 'power', p));
const W = 1500;
const html = `<div style="width:${W}px;padding:30px;position:relative;display:flex;flex-wrap:wrap;gap:22px">${background({ width: W, height: 1000 })}
${cards.map((c) => `<div style="position:relative">${cardSVG(c, { width: 150 })}</div>`).join('')}
<div style="position:relative">${backSVG({ width: 150 })}</div></div>`;
const buf = await renderHTML(html, { width: W, height: 1000, scale: 1 });
fs.writeFileSync('test/out/cards.png', buf);
const ih = `<div style="width:1200px;padding:20px;background:#12163a;display:flex;flex-wrap:wrap;gap:18px;color:#fff">${Object.keys(ICONS).map((k) => `<div style="width:100px;text-align:center;font:11px sans-serif">${iconSVG(k, { size: 56, color: '#fff' })}<br>${k}</div>`).join('')}</div>`;
fs.writeFileSync('test/out/icons.png', await renderHTML(ih, { width: 1240, height: 420, scale: 1 }));
await closeRenderer();
console.log('ok');
