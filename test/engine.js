// Oyun motoru simulasyonu: rastgele oyunlar oynatip degismezleri kontrol eder.
import { UnoGame, GameError } from '../src/game/UnoGame.js';
import { COLORS } from '../src/game/cards.js';

let games = 0, finished = 0, errors = 0;
const stats = { plays: 0, draws: 0, jump: 0, challenge: 0, caught: 0, power: {} };

function fail(msg) { console.error('FAIL:', msg); errors++; }

function total(g) {
  return g.deck.count + g.deck.discard.length + g.players.reduce((s, p) => s + p.hand.length, 0);
}

for (let n = 0; n < 600; n++) {
  const np = 2 + (n % 9);
  const g = new UnoGame('ch', 'p0', { powers: n % 5 !== 0, stacking: n % 3 !== 0, jumpIn: n % 4 === 0 });
  for (let i = 0; i < np; i++) g.addPlayer({ id: `p${i}`, name: `Oyuncu${i}` });
  g.start();
  const expect = g.deck.total;
  games++;
  let steps = 0;
  while (g.status === 'playing' && steps++ < 3000) {
    const p = g.currentPlayer;
    if (total(g) !== expect) { fail(`kart sayisi bozuldu (${total(g)} != ${expect})`); break; }
    // rastgele UNO / itiraz / jump-in denemeleri
    try { if (Math.random() < 0.3) { const r = g.callUno(g.players[Math.floor(Math.random()*g.players.length)].id); if (r.events[0].type==='caught') stats.caught++; } } catch (e) { if (!(e instanceof GameError)) throw e; }
    if (g.status !== 'playing') break;
    if (g.challenge && Math.random() < 0.5) { g.challengeWild4(p.id); stats.challenge++; continue; }
    if (g.options.jumpIn) {
      const other = g.players.find((q) => q.id !== p.id && g.playableCards(q).length);
      if (other && Math.random() < 0.5) {
        const c = g.playableCards(other)[0];
        g.play(other.id, c.id); stats.jump++; stats.plays++; continue;
      }
    }
    const cur = g.currentPlayer;
    const options = g.playableCards(cur);
    if (options.length && Math.random() < 0.9) {
      const c = options[Math.floor(Math.random() * options.length)];
      const others = g.players.filter((q) => q.id !== cur.id);
      const r = g.play(cur.id, c.id, { color: COLORS[Math.floor(Math.random() * 4)], targetId: others[Math.floor(Math.random()*others.length)].id });
      stats.plays++;
      if (c.kind === 'power') stats.power[c.value] = (stats.power[c.value] || 0) + 1;
    } else if (g.drawnCardId && Math.random() < 0.5) {
      g.pass(cur.id);
    } else if (g.drawnCardId) {
      g.pass(cur.id);
    } else {
      g.draw(cur.id); stats.draws++;
    }
    if (g.status === 'playing' && (g.current < 0 || g.current >= g.players.length)) fail('current disi');
    if (g.status === 'playing' && Math.random() < 0.002 && g.players.length > 2) g.leave(g.players[Math.floor(Math.random()*g.players.length)].id);
  }
  if (g.status === 'ended') {
    finished++;
    if (g.winner.hand.length !== 0 && g.result.reason === 'normal') fail('kazanan elinde kart var');
  } else fail(`oyun bitmedi (np=${np}, steps=${steps})`);
}
console.log(`oyun: ${games}, biten: ${finished}, hata: ${errors}`);
console.log(JSON.stringify(stats));
if (errors) process.exit(1);

// ---- hedefli senaryolar
{
  const g = new UnoGame('c', 'a');
  g.addPlayer({ id: 'a', name: 'A' }); g.addPlayer({ id: 'b', name: 'B' }); g.addPlayer({ id: 'c', name: 'C' });
  g.start();
  // skip dogru calisiyor mu
  const first = g.currentPlayer;
  const skipper = g.players.indexOf(first);
  const { Card } = await import('../src/game/Card.js');
  const sk = new Card(g.activeColor, 'skip');
  first.hand.push(sk);
  g.play(first.id, sk.id);
  const expectedIdx = (skipper + 2) % 3;
  if (g.current !== expectedIdx) { console.error('FAIL skip: beklenen', expectedIdx, 'gercek', g.current); process.exit(1); }
  console.log('skip dogru');
  // 2 kisilik reverse = ayni oyuncu tekrar
  const g2 = new UnoGame('c', 'a'); g2.addPlayer({ id: 'a', name: 'A' }); g2.addPlayer({ id: 'b', name: 'B' }); g2.start();
  const p0 = g2.currentPlayer; const rv = new Card(g2.activeColor, 'reverse'); p0.hand.push(rv); g2.play(p0.id, rv.id);
  if (g2.currentPlayer.id !== p0.id) { console.error('FAIL 2p reverse'); process.exit(1); }
  console.log('2 kisilik reverse dogru');
  // +2 istif ve ceza
  const g3 = new UnoGame('c', 'a', { stacking: true }); ['a','b','c'].forEach((i)=>g3.addPlayer({id:i,name:i})); g3.start();
  const a = g3.currentPlayer; const d1 = new Card(g3.activeColor, 'draw2'); a.hand.push(d1); g3.play(a.id, d1.id);
  const b = g3.currentPlayer; const d2 = new Card('red', 'draw2'); b.hand.push(d2); g3.play(b.id, d2.id);
  if (g3.stack !== 4) { console.error('FAIL istif', g3.stack); process.exit(1); }
  const c = g3.currentPlayer; const before = c.hand.length; g3.draw(c.id);
  if (c.hand.length !== before + 4) { console.error('FAIL ceza'); process.exit(1); }
  console.log('istif dogru');
}
console.log('tum testler gecti');
