/**
 * Lobi, el, kazanan, profil, liderlik, rehber ve baslik gorselleri.
 */
import { renderHTML } from './renderer.js';
import { cardSVG, backSVG, colorGem } from './cardArt.js';
import { iconSVG } from '../emoji/icons.js';
import { background, avatar, esc, hash, wordmark, pill, glass, THEME } from './theme.js';
import { COLOR_HEX, COLOR_TR, POWERS, POWER_IDS, compareCards } from '../game/cards.js';
import { Card } from '../game/Card.js';

export function fmtDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m} dk ${String(s).padStart(2, '0')} sn` : `${s} sn`;
}

const chip = (icon, label, value, color = THEME.muted) =>
  `<div class="pop" style="display:flex;align-items:center;gap:10px;padding:10px 18px;border-radius:16px;background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.13);font-weight:600;font-size:17px;white-space:nowrap">${iconSVG(icon, { size: 22, color })}<span style="color:${THEME.muted}">${esc(label)}</span><span style="font-weight:800">${esc(value)}</span></div>`;

// ------------------------------------------------------------------ LOBI

export function lobbyHTML({ players, maxPlayers, hostId, options, starting = false }) {
  const W = 1280;
  const H = 720;
  const seats = [];
  for (let i = 0; i < maxPlayers; i++) {
    const p = players[i];
    if (p) {
      const host = p.id === hostId;
      seats.push(`<div style="${glass()};height:196px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;position:relative;${host ? `border-color:${THEME.gold}aa;box-shadow:0 0 34px ${THEME.gold}33,0 18px 40px -14px rgba(0,0,0,.65),inset 0 1px 0 rgba(255,255,255,.14);` : ''}">
        ${avatar({ url: p.avatarUrl, name: p.name, size: 96, ring: host ? THEME.gold : 'rgba(255,255,255,.28)', ringWidth: 4, glow: host ? THEME.gold + '66' : null })}
        <div class="pop ell" style="font-weight:700;font-size:20px;max-width:180px">${esc(p.name)}</div>
        ${host ? `<div class="pop" style="position:absolute;top:12px;right:12px;display:flex;align-items:center;gap:6px;padding:4px 11px;border-radius:999px;background:${THEME.gold};color:#2a1d00;font-weight:800;font-size:12px;letter-spacing:1px">${iconSVG('crown', { size: 14, color: '#2a1d00' })}KURUCU</div>` : `<div class="pop" style="position:absolute;top:12px;right:12px;width:12px;height:12px;border-radius:50%;background:#1fcf7c;box-shadow:0 0 12px #1fcf7c"></div>`}
      </div>`);
    } else {
      seats.push(`<div style="height:196px;border-radius:22px;border:2px dashed rgba(255,255,255,.16);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:rgba(255,255,255,.025)">
        <div style="width:86px;height:86px;border-radius:50%;border:2px dashed rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center">${iconSVG('plus', { size: 34, color: 'rgba(255,255,255,.3)' })}</div>
        <div class="pop" style="font-weight:600;font-size:16px;color:rgba(255,255,255,.34);letter-spacing:1px">BOŞ KOLTUK</div></div>`);
    }
  }
  const on = (v) => (v ? { c: '#1fcf7c', t: 'AÇIK' } : { c: '#6b7299', t: 'KAPALI' });
  const opt = (icon, label, v) => {
    const s = on(v);
    return `<div class="pop" style="display:flex;align-items:center;gap:10px;padding:10px 18px 10px 14px;border-radius:999px;background:rgba(255,255,255,.06);border:1.5px solid ${v ? '#1fcf7c66' : 'rgba(255,255,255,.12)'};font-weight:700;font-size:16px;white-space:nowrap">${iconSVG(icon, { size: 22, color: s.c })}${label}<span style="font-size:12px;letter-spacing:1.4px;color:${s.c}">${s.t}</span></div>`;
  };
  const rows = Math.ceil(maxPlayers / 5);
  return `<div style="position:relative;width:${W}px;height:${H}px;overflow:hidden">
    ${background({ width: W, height: H })}
    <div class="abs" style="left:56px;top:40px;right:56px;display:flex;align-items:center;justify-content:space-between">
      <div style="display:flex;align-items:center;gap:26px">${wordmark({ size: 92 })}
        <div style="width:2px;height:62px;background:rgba(255,255,255,.18)"></div>
        <div><div class="pop" style="font-weight:800;font-size:34px;letter-spacing:5px">LOBİ</div>
        <div style="font-size:17px;color:${THEME.muted};margin-top:4px">Oyuncular toplanıyor, kurucu başlatınca oyun başlar</div></div></div>
      <div style="display:flex;align-items:center;gap:22px">
        ${pill({ text: starting ? 'Başlıyor' : 'Bekleniyor', color: starting ? '#2a1d00' : '#bff5d9', bg: starting ? THEME.gold : 'rgba(31,207,124,.14)', border: starting ? THEME.gold : 'rgba(31,207,124,.5)', size: 17, icon: `<div style="width:12px;height:12px;border-radius:50%;background:${starting ? '#2a1d00' : '#1fcf7c'};box-shadow:0 0 12px ${starting ? '#fff' : '#1fcf7c'}"></div>` })}
        <div class="pop" style="display:flex;align-items:baseline;gap:6px"><span style="font-weight:900;font-size:64px;line-height:1">${players.length}</span><span style="font-weight:700;font-size:28px;color:${THEME.muted}">/ ${maxPlayers}</span></div>
      </div>
    </div>
    <div class="abs" style="left:56px;right:56px;top:168px;display:grid;grid-template-columns:repeat(5,1fr);gap:22px;grid-auto-rows:196px">${seats.join('')}</div>
    <div class="abs" style="left:56px;right:56px;top:${176 + rows * 196 + (rows - 1) * 22 + 38}px;display:flex;gap:14px;flex-wrap:wrap">
      ${opt('sparkles', 'Güç Kartları', options.powers)}${opt('draw2', 'İstifleme', options.stacking)}${opt('bolt', 'Atlama', options.jumpIn)}${opt('target', '+4 İtirazı', options.challenge)}
      <div class="pop" style="display:flex;align-items:center;gap:10px;padding:10px 18px;border-radius:999px;background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.12);font-weight:700;font-size:16px">${iconSVG('clock', { size: 22, color: THEME.muted })}Tur süresi <span style="color:${THEME.gold}">${options.turnSeconds} sn</span></div>
    </div>
  </div>`;
}
export const renderLobby = (d) => renderHTML(lobbyHTML(d), { width: 1280, height: 720, scale: 1.5, type: 'webp', quality: 90 });

// --------------------------------------------------------------------- EL

export function handHTML({ cards, top, activeColor, isTurn, stack = 0, newCardId = null, jumpIn = false, title = 'ELİN', plain = false }) {
  const W = 1200;
  const CW = 132;
  const CH = CW * 1.5;
  const perRow = 9;
  const n = cards.length;
  const rowsCount = Math.max(1, Math.ceil(n / perRow));
  const base = Math.ceil(n / rowsCount);
  const rows = [];
  let k = 0;
  for (let r = 0; r < rowsCount; r++) {
    const take = Math.min(base, n - k);
    rows.push(cards.slice(k, k + take));
    k += take;
  }
  const step = CW * 0.8;
  const rowH = CH + 56;
  const headH = 118;
  const H = headH + rows.length * rowH + 34;
  const col = COLOR_HEX[activeColor] ?? THEME.violet;
  let idx = 0;
  const rowHTML = rows
    .map((row, ri) => {
      const total = (row.length - 1) * step + CW;
      const left = (W - total) / 2;
      const mid = (row.length - 1) / 2;
      const items = row
        .map((c, i) => {
          idx++;
          const off = i - mid;
          const rotate = off * 2.2;
          const dy = Math.abs(off) ** 2 * 2.4 - (c.playable ? 22 : 0);
          const isNew = c.card.id === newCardId;
          return `<div class="abs" style="left:${left + i * step}px;top:${headH + ri * rowH + 14 + dy}px;transform:rotate(${rotate}deg);transform-origin:50% 120%;z-index:${i};
            filter:${c.playable && !plain ? `drop-shadow(0 0 16px ${COLOR_HEX[c.card.color] ?? '#a78bff'}cc)` : 'none'} drop-shadow(0 10px 14px rgba(0,0,0,.5))">
            ${cardSVG(c.card, { width: CW, dim: !c.playable && !plain })}
            ${plain ? '' : `<div class="pop" style="position:absolute;left:50%;bottom:-18px;transform:translateX(-50%);min-width:34px;height:34px;padding:0 8px;border-radius:17px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:17px;background:${c.playable ? THEME.gold : '#1c2150'};color:${c.playable ? '#2a1d00' : '#8b93c0'};border:2px solid ${c.playable ? '#fff' : 'rgba(255,255,255,.2)'}">${idx}</div>`}
            ${isNew ? `<div class="pop" style="position:absolute;left:50%;top:-14px;transform:translateX(-50%);padding:3px 12px;border-radius:999px;background:linear-gradient(135deg,#ff4fa3,#8b5cff);font-weight:800;font-size:12px;letter-spacing:1.5px;white-space:nowrap;box-shadow:0 0 18px #ff4fa3aa">YENİ</div>` : ''}
          </div>`;
        })
        .join('');
      return items;
    })
    .join('');

  const status = plain ? '' : stack > 0
    ? pill({ text: `${stack} kart cezası var`, color: '#fff', bg: THEME.red, border: '#fff', size: 15, icon: iconSVG('draw2', { size: 20, color: '#fff' }) })
    : isTurn
      ? pill({ text: 'Sıra sende', color: '#2a1d00', bg: THEME.gold, border: THEME.gold, size: 15, icon: iconSVG('play', { size: 18, color: '#2a1d00' }) })
      : jumpIn
        ? pill({ text: 'Atlama fırsatı', color: '#fff', bg: 'rgba(61,217,255,.2)', border: THEME.cyan, size: 15, icon: iconSVG('bolt', { size: 18, color: THEME.cyan }) })
        : pill({ text: 'Sırayı bekle', color: THEME.muted, size: 15, icon: iconSVG('hourglass', { size: 18, color: THEME.muted }) });

  return `<div style="position:relative;width:${W}px;height:${H}px;overflow:hidden">
    ${background({ width: W, height: H, tint: col, dim: 0.9 })}
    <div class="abs" style="left:44px;right:44px;top:26px;height:76px;display:flex;align-items:center;justify-content:space-between">
      <div style="display:flex;align-items:center;gap:18px">
        <div class="pop" style="font-weight:900;font-style:italic;font-size:34px;line-height:1">${esc(title)}</div>
        <div class="pop" style="padding:6px 16px;border-radius:999px;background:rgba(255,255,255,.09);border:1.5px solid rgba(255,255,255,.16);font-weight:700;font-size:16px;letter-spacing:1px">${n} KART</div>
        ${status}
      </div>
      <div style="display:flex;align-items:center;gap:14px">
        <div class="pop" style="display:flex;align-items:center;gap:12px;padding:8px 20px 8px 10px;border-radius:999px;background:rgba(6,8,24,.7);border:2px solid ${col};box-shadow:0 0 22px ${col}55;font-weight:800;font-size:15px;letter-spacing:1.4px">${colorGem(activeColor ?? 'wild', 26)}${esc((COLOR_TR[activeColor] ?? '').toLocaleUpperCase('tr'))}</div>
        <div style="transform:rotate(6deg);filter:drop-shadow(0 8px 12px rgba(0,0,0,.5))">${cardSVG(top, { width: 52 })}</div>
      </div>
    </div>
    ${rowHTML}
  </div>`;
}

export function renderHand(d) {
  const cards = [...d.cards].sort((a, b) => compareCards(a.card, b.card));
  const html = handHTML({ ...d, cards });
  const n = cards.length;
  const rows = Math.max(1, Math.ceil(n / 9));
  const H = 118 + rows * (132 * 1.5 + 56) + 34;
  return renderHTML(html, { width: 1200, height: H, scale: 1.5, type: 'webp', quality: 90 });
}

// --------------------------------------------------------------- KAZANAN

function confetti(W, H, seed) {
  const cols = [THEME.red, THEME.yellow, THEME.green, THEME.blue, THEME.pink, '#fff'];
  const out = [];
  let h = hash(seed);
  const rnd = () => ((h = Math.imul(h ^ (h >>> 15), 2246822519) >>> 0) % 10000) / 10000;
  for (let i = 0; i < 90; i++) {
    const x = rnd() * W;
    const y = rnd() * H;
    const c = cols[Math.floor(rnd() * cols.length)];
    const r = rnd() * 360;
    const s = 8 + rnd() * 16;
    out.push(
      rnd() > 0.45
        ? `<rect x="${x}" y="${y}" width="${s}" height="${s * 0.45}" rx="2" fill="${c}" opacity="${0.35 + rnd() * 0.5}" transform="rotate(${r} ${x} ${y})"/>`
        : `<circle cx="${x}" cy="${y}" r="${s * 0.3}" fill="${c}" opacity="${0.3 + rnd() * 0.5}"/>`
    );
  }
  return `<svg class="abs" style="left:0;top:0" width="${W}" height="${H}">${out.join('')}</svg>`;
}

export function winnerHTML({ winner, ranking, duration, turns, points, reason }) {
  const W = 1280;
  const H = 720;
  const others = ranking.filter((r) => r.id !== winner.id).slice(0, 9);
  const rowsHTML = ranking
    .slice(0, 10)
    .map((r, i) => {
      const win = r.id === winner.id;
      return `<div style="display:flex;align-items:center;gap:14px;height:50px;padding:0 14px;border-radius:14px;background:${win ? 'linear-gradient(90deg,rgba(255,209,102,.22),rgba(255,209,102,.04))' : 'rgba(255,255,255,.04)'};border:1.5px solid ${win ? THEME.gold + '88' : 'rgba(255,255,255,.08)'}">
        <div class="pop" style="width:28px;font-weight:900;font-size:20px;color:${win ? THEME.gold : THEME.muted}">${i + 1}</div>
        ${avatar({ url: r.avatarUrl, name: r.name, size: 34 })}
        <div class="pop ell" style="flex:1;font-weight:700;font-size:18px">${esc(r.name)}</div>
        <div class="pop" style="font-weight:800;font-size:16px;color:${win ? THEME.gold : THEME.muted}">${win ? 'KAZANDI' : r.cards + ' kart'}</div></div>`;
    })
    .join('');
  const sub = reason === 'forfeit' ? 'Rakipler oyundan ayrıldı' : `Son kartını oynadı ve ${points} puan topladı`;
  return `<div style="position:relative;width:${W}px;height:${H}px;overflow:hidden">
    ${background({ width: W, height: H, tint: THEME.gold })}
    ${confetti(W, H, winner.id)}
    <div class="abs" style="left:60px;top:40px;width:${W - 120 - 440}px;height:640px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
      <div class="abs" style="left:50%;top:50%;width:520px;height:520px;transform:translate(-50%,-56%);background:radial-gradient(closest-side,${THEME.gold}66,transparent)"></div>
      <div style="position:relative;filter:drop-shadow(0 0 24px ${THEME.gold}aa)">${iconSVG('crown', { size: 96, color: THEME.gold })}</div>
      <div style="margin-top:6px;position:relative">${avatar({ url: winner.avatarUrl, name: winner.name, size: 190, ring: THEME.gold, ringWidth: 7, glow: THEME.gold + 'aa' })}</div>
      <div class="pop" style="margin-top:22px;font-weight:700;font-size:20px;letter-spacing:8px;color:${THEME.gold}">KAZANAN</div>
      <div class="pop ell" style="margin-top:4px;max-width:700px;font-weight:900;font-style:italic;font-size:72px;line-height:1.1;background:linear-gradient(180deg,#fff,${THEME.gold});-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 6px 14px rgba(0,0,0,.5))">${esc(winner.name)}</div>
      <div style="margin-top:8px;font-size:20px;color:${THEME.muted}">${esc(sub)}</div>
      <div style="margin-top:26px;display:flex;gap:14px">${chip('clock', 'Süre', fmtDuration(duration))}${chip('refresh', 'Tur', String(turns))}${chip('star', 'Puan', String(points), THEME.gold)}</div>
    </div>
    <div class="abs" style="right:56px;top:56px;width:380px;${glass()};padding:22px 20px;height:608px">
      <div class="pop" style="display:flex;align-items:center;gap:10px;font-weight:800;font-size:18px;letter-spacing:3px;margin:2px 6px 16px">${iconSVG('trophy', { size: 24, color: THEME.gold })}SIRALAMA</div>
      <div style="display:flex;flex-direction:column;gap:8px">${rowsHTML}</div>
    </div>
  </div>`;
}
export const renderWinner = (d) => renderHTML(winnerHTML(d), { width: 1280, height: 720, scale: 1.5, type: 'webp', quality: 90 });

// ---------------------------------------------------------------- PROFIL

export const TITLES = [
  [0, 'Çaylak'], [3, 'Acemi'], [6, 'Oyuncu'], [10, 'Usta'], [15, 'Şampiyon'], [22, 'Efsane']
];
export function levelOf(xp) {
  const level = Math.floor(Math.sqrt(xp / 60)) + 1;
  const base = 60 * (level - 1) ** 2;
  const next = 60 * level ** 2;
  const title = [...TITLES].reverse().find(([l]) => level >= l)?.[1] ?? 'Çaylak';
  return { level, title, base, next, pct: Math.min(1, (xp - base) / (next - base)) };
}

export function profileHTML({ name, avatarUrl, s, rank }) {
  const W = 1100;
  const H = 580;
  const lv = levelOf(s.xp);
  const rate = s.games ? Math.round((s.wins / s.games) * 100) : 0;
  const circ = 2 * Math.PI * 70;
  const tile = (icon, label, value, color) => `<div style="${glass()};padding:18px 20px;display:flex;align-items:center;gap:16px;border-radius:20px">
    <div style="width:54px;height:54px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:${color}26;border:1.5px solid ${color}77">${iconSVG(icon, { size: 30, color })}</div>
    <div><div class="pop" style="font-weight:900;font-size:${String(value).length > 6 ? 24 : 34}px;line-height:1;white-space:nowrap">${value}</div><div style="font-size:15px;color:${THEME.muted};margin-top:4px">${label}</div></div></div>`;
  return `<div style="position:relative;width:${W}px;height:${H}px;overflow:hidden">
    ${background({ width: W, height: H })}
    <div class="abs" style="left:44px;top:44px;width:330px;height:${H - 88}px;${glass()};display:flex;flex-direction:column;align-items:center;padding-top:34px">
      <div style="position:relative">${avatar({ url: avatarUrl, name, size: 150, ring: THEME.violet, ringWidth: 6, glow: THEME.violet + '99' })}
        <div class="pop" style="position:absolute;right:-8px;bottom:-6px;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,${THEME.gold},#ff9b2f);color:#2a1d00;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:24px;border:3px solid #fff">${lv.level}</div></div>
      <div class="pop ell" style="margin-top:22px;max-width:290px;font-weight:800;font-size:30px">${esc(name)}</div>
      <div style="margin-top:10px">${pill({ text: lv.title, color: THEME.gold, bg: THEME.gold + '1f', border: THEME.gold + '88', size: 14, icon: iconSVG('crown', { size: 16, color: THEME.gold }) })}</div>
      <div style="width:250px;margin-top:26px">
        <div class="pop" style="display:flex;justify-content:space-between;font-weight:700;font-size:14px;color:${THEME.muted};margin-bottom:8px"><span>SEVİYE ${lv.level}</span><span>${s.xp} / ${lv.next} XP</span></div>
        <div style="height:14px;border-radius:7px;background:rgba(255,255,255,.1);overflow:hidden"><div style="width:${Math.max(4, lv.pct * 100)}%;height:100%;border-radius:7px;background:linear-gradient(90deg,${THEME.violet},${THEME.pink})"></div></div>
      </div>
      <div style="margin-top:26px;display:flex;align-items:center;gap:10px" class="pop"><span style="font-weight:700;font-size:15px;letter-spacing:2px;color:${THEME.muted}">SIRALAMA</span><span style="font-weight:900;font-size:30px;color:${THEME.gold}">${rank ? '#' + rank : '-'}</span></div>
    </div>
    <div class="abs" style="left:410px;top:44px;right:44px;display:flex;gap:22px">
      <div style="${glass()};width:240px;height:236px;display:flex;align-items:center;justify-content:center;position:relative">
        <svg width="190" height="190" viewBox="0 0 190 190"><circle cx="95" cy="95" r="70" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="16"/>
        <circle cx="95" cy="95" r="70" fill="none" stroke="url(#wr)" stroke-width="16" stroke-linecap="round" stroke-dasharray="${(circ * rate) / 100} ${circ}" transform="rotate(-90 95 95)"/>
        <defs><linearGradient id="wr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${THEME.green}"/><stop offset="1" stop-color="${THEME.cyan}"/></linearGradient></defs></svg>
        <div class="pop abs" style="inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center"><div style="font-weight:900;font-size:46px;line-height:1">%${rate}</div><div style="font-size:14px;color:${THEME.muted};margin-top:4px;letter-spacing:1.5px">KAZANMA</div></div>
      </div>
      <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:18px;height:236px">
        ${tile('play', 'Oyun', s.games, THEME.blue)}${tile('trophy', 'Galibiyet', s.wins, THEME.gold)}
        ${tile('flame', 'Seri', s.streak, THEME.red)}${tile('star', 'En iyi seri', s.bestStreak, THEME.yellow)}
      </div>
    </div>
    <div class="abs" style="left:410px;right:44px;top:306px;display:grid;grid-template-columns:repeat(3,1fr);gap:18px">
      ${tile('card', 'Atılan kart', s.cardsPlayed, THEME.cyan)}${tile('sparkles', 'Güç kartı', s.powersUsed, THEME.violet)}${tile('uno', 'UNO çağrısı', s.unoCalls, THEME.pink)}
      ${tile('deck', 'Çekilen kart', s.cardsDrawn, THEME.green)}${tile('bolt', 'Yakalanma', s.caught, '#ff9b2f')}${tile('clock', 'Hızlı galibiyet', s.fastestWin ? fmtDuration(s.fastestWin) : '-', '#6aa4ff')}
    </div>
  </div>`;
}
export const renderProfile = (d) => renderHTML(profileHTML(d), { width: 1100, height: 580, scale: 1.5, type: 'webp', quality: 90 });

// -------------------------------------------------------------- LIDERLIK

export function leaderboardHTML({ entries }) {
  const W = 1100;
  const top = entries.slice(0, 3);
  const rest = entries.slice(3, 10);
  const H = 150 + (top.length ? 330 : 40) + rest.length * 68 + 44;
  const medal = [THEME.gold, '#c9d3ea', '#e0955a'];
  const podium = [1, 0, 2]
    .filter((i) => top[i])
    .map((i) => {
      const e = top[i];
      const big = i === 0;
      return `<div style="${glass()};width:${big ? 320 : 280}px;height:${big ? 290 : 246}px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;position:relative;${big ? `border-color:${THEME.gold}99;box-shadow:0 0 50px ${THEME.gold}33,0 18px 40px -14px rgba(0,0,0,.65)` : ''}">
        <div class="pop" style="position:absolute;top:-18px;left:50%;transform:translateX(-50%);width:44px;height:44px;border-radius:50%;background:${medal[i]};color:#241a00;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:22px;border:3px solid #fff">${i + 1}</div>
        ${big ? `<div style="position:absolute;top:-62px;filter:drop-shadow(0 0 14px ${THEME.gold}aa)">${iconSVG('crown', { size: 44, color: THEME.gold })}</div>` : ''}
        ${avatar({ url: e.avatarUrl, name: e.name, size: big ? 104 : 84, ring: medal[i], ringWidth: 5, glow: medal[i] + '77' })}
        <div class="pop ell" style="font-weight:800;font-size:${big ? 26 : 22}px;max-width:${big ? 280 : 240}px">${esc(e.name)}</div>
        <div class="pop" style="display:flex;gap:16px;font-weight:700;font-size:16px;color:${THEME.muted}"><span><b style="color:#fff;font-size:20px">${e.wins}</b> galibiyet</span><span>%${e.rate}</span></div></div>`;
    })
    .join('');
  const list = rest
    .map((e, i) => `<div style="display:flex;align-items:center;gap:18px;height:56px;padding:0 20px;border-radius:16px;background:rgba(255,255,255,.045);border:1.5px solid rgba(255,255,255,.09)">
      <div class="pop" style="width:34px;font-weight:900;font-size:22px;color:${THEME.muted}">${i + 4}</div>
      ${avatar({ url: e.avatarUrl, name: e.name, size: 38 })}
      <div class="pop ell" style="flex:1;font-weight:700;font-size:20px">${esc(e.name)}</div>
      <div style="width:170px;height:10px;border-radius:5px;background:rgba(255,255,255,.1);overflow:hidden"><div style="width:${Math.max(3, e.rate)}%;height:100%;background:linear-gradient(90deg,${THEME.green},${THEME.cyan})"></div></div>
      <div class="pop" style="width:60px;text-align:right;font-weight:700;font-size:16px;color:${THEME.muted}">%${e.rate}</div>
      <div class="pop" style="width:120px;text-align:right;font-weight:800;font-size:18px"><span style="font-size:22px">${e.wins}</span> galibiyet</div></div>`)
    .join('');
  return `<div style="position:relative;width:${W}px;height:${H}px;overflow:hidden">
    ${background({ width: W, height: H })}
    <div class="abs" style="left:48px;right:48px;top:36px;display:flex;align-items:center;gap:22px">${wordmark({ size: 64 })}
      <div style="width:2px;height:48px;background:rgba(255,255,255,.18)"></div>
      <div class="pop" style="font-weight:800;font-size:28px;letter-spacing:5px;display:flex;align-items:center;gap:14px">${iconSVG('trophy', { size: 32, color: THEME.gold })}LİDERLİK TABLOSU</div></div>
    <div class="abs" style="left:48px;right:48px;top:${top.length ? 170 : 150}px;display:flex;justify-content:center;align-items:flex-end;gap:26px;height:${top.length ? 290 : 0}px">${podium}</div>
    <div class="abs" style="left:48px;right:48px;top:${150 + (top.length ? 330 : 40)}px;display:flex;flex-direction:column;gap:12px">${list}</div>
  </div>`;
}
export function renderLeaderboard(d) {
  const top = d.entries.slice(0, 3);
  const rest = d.entries.slice(3, 10);
  const H = 150 + (top.length ? 330 : 40) + rest.length * 68 + 44;
  return renderHTML(leaderboardHTML(d), { width: 1100, height: H, scale: 1.5, type: 'webp', quality: 90 });
}

// -------------------------------------------------------- REHBER / BASLIK

export function guideHTML() {
  const W = 1280;
  const cells = POWER_IDS.map((id) => {
    const p = POWERS[id];
    const card = new Card('wild', 'power', id);
    return `<div style="${glass()};padding:20px;display:flex;gap:18px;align-items:center;border-color:${p.color}55">
      <div style="flex:none;filter:drop-shadow(0 0 18px ${p.color}88) drop-shadow(0 10px 14px rgba(0,0,0,.5))">${cardSVG(card, { width: 118 })}</div>
      <div style="min-width:0"><div class="pop" style="font-weight:800;font-size:24px;color:${p.color}">${esc(p.name)}</div>
      <div style="margin-top:8px;font-size:17px;line-height:1.4;color:#dfe4ff">${esc(p.desc)}</div>
      ${p.needsTarget ? `<div class="pop" style="margin-top:10px;display:inline-block;padding:3px 12px;border-radius:999px;background:${p.color}22;border:1.5px solid ${p.color}77;font-size:12px;font-weight:700;letter-spacing:1.2px;color:${p.color}">HEDEF SEÇİLİR</div>` : ''}</div></div>`;
  }).join('');
  const H = 158 + 4 * 206 + 3 * 22 + 48;
  return {
    H,
    html: `<div style="position:relative;width:${W}px;height:${H}px;overflow:hidden">
      ${background({ width: W, height: H })}
      <div class="abs" style="left:56px;top:38px;display:flex;align-items:center;gap:24px">${wordmark({ size: 70 })}
        <div style="width:2px;height:54px;background:rgba(255,255,255,.18)"></div>
        <div><div class="pop" style="font-weight:800;font-size:30px;letter-spacing:5px">GÜÇ KARTLARI</div>
        <div style="font-size:17px;color:${THEME.muted};margin-top:4px">Joker gibi her zaman atılır, atarken bir renk seçersin</div></div></div>
      <div class="abs" style="left:56px;right:56px;top:158px;display:grid;grid-template-columns:1fr 1fr;gap:22px">${cells}</div></div>`
  };
}
export function renderGuide() {
  const g = guideHTML();
  return renderHTML(g.html, { width: 1280, height: g.H, scale: 1.5, type: 'webp', quality: 90 });
}

/** Yardim / kurallar icin ust gorsel */
export function bannerHTML({ title, subtitle, icon = 'card' }) {
  const W = 1280;
  const H = 320;
  const fan = [
    new Card('red', 'number', 7), new Card('yellow', 'skip'), new Card('wild', 'wild4'), new Card('green', 'reverse'), new Card('blue', 'draw2')
  ];
  return `<div style="position:relative;width:${W}px;height:${H}px;overflow:hidden">
    ${background({ width: W, height: H })}
    <div class="abs" style="left:64px;top:56px">${wordmark({ size: 120 })}</div>
    <div class="abs" style="left:68px;top:196px;max-width:620px">
      <div class="pop" style="display:flex;align-items:center;gap:14px;font-weight:800;font-size:32px;letter-spacing:4px">${iconSVG(icon, { size: 36, color: THEME.gold })}${esc(title)}</div>
      <div style="margin-top:8px;font-size:19px;color:${THEME.muted}">${esc(subtitle)}</div></div>
    ${fan.map((c, i) => `<div class="abs" style="left:${700 + i * 100}px;top:${44 + Math.abs(i - 2) * 16}px;transform:rotate(${(i - 2) * 9}deg);transform-origin:50% 130%;filter:drop-shadow(0 14px 18px rgba(0,0,0,.55))">${cardSVG(c, { width: 150 })}</div>`).join('')}
  </div>`;
}
export const renderBanner = (d) => renderHTML(bannerHTML(d), { width: 1280, height: 320, scale: 1.25, type: 'webp', quality: 90 });
