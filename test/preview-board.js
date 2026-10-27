import fs from 'node:fs';
import { renderBoard } from '../src/render/board.js';
import { closeRenderer } from '../src/render/renderer.js';
import { makeGame } from './mock.js';
for (const n of [2, 5, 10]) {
  const g = makeGame(n);
  g.players[1].shield = true;
  g.stack = n === 5 ? 4 : 0; g.stackKind = 'wild4';
  g.lastAction = { text: `${g.players[0].name} Kırmızı +2 oynadı. Sıra ${g.players[1].name} adlı oyuncuda, 2 kart cezası var.`, icon: 'draw2', color: '#ff3d55' };
  const t = Date.now();
  const buf = await renderBoard(g.snapshot());
  fs.writeFileSync(`test/out/board_${n}.webp`, buf);
  console.log(n, buf.length, Date.now() - t, 'ms');
}
await closeRenderer();
