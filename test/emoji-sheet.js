import fs from 'node:fs';
import { renderEmoji } from '../src/emoji/emojiRenderer.js';
import { emojiDefs } from '../src/emoji/emojiDefs.js';
import { renderHTML, closeRenderer } from '../src/render/renderer.js';
const imgs = [];
for (const [k, d] of Object.entries(emojiDefs)) { const b = await renderEmoji(d); if (b.length > 256000) console.log('BÜYÜK', k, b.length); imgs.push(`<div style="width:84px;text-align:center;font:10px sans-serif;color:#fff"><img src="data:image/png;base64,${b.toString('base64')}" width="64" height="64"><br>${k}</div>`); }
fs.writeFileSync('test/out/emojis.png', await renderHTML(`<div style="width:900px;padding:10px;background:#2b2d31;display:flex;flex-wrap:wrap;gap:8px">${imgs.join('')}</div>`, { width: 920, height: 520, scale: 1 }));
await closeRenderer();
