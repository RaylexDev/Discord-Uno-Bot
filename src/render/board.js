import { renderHTML } from './renderer.js';
import { cardSVG, backSVG, colorGem } from './cardArt.js';
import { iconSVG } from '../emoji/icons.js';
import { background, avatar, esc, hash, THEME } from './theme.js';
import { COLOR_HEX, COLOR_TR } from '../game/cards.js';

const W = 1280;
const H = 800;
const CX = 640;
const CY = 432;

function ringArrows(dir, color) {
  const rx = 318;
  const ry = 212;
  const arcs = [];
  for (let k = 0; k < 2; k++) {
    const s = (k * 180 + 34) * (Math.PI / 180);
    const e = (k * 180 + 34 + 112) * (Math.PI / 180);
    const pt = (a) => [CX + rx * Math.cos(a), CY + ry * Math.sin(a)];
    const [x0, y0] = pt(s);
    const [x1, y1] = pt(e);
    const headAt = dir === 1 ? e : s;
    const [hx, hy] = pt(headAt);
    let tx = -rx * Math.sin(headAt);
    let ty = ry * Math.cos(headAt);
    const len = Math.hypot(tx, ty);
    tx = (tx / len) * dir;
    ty = (ty / len) * dir;
    const nx = -ty;
    const ny = tx;
    const L = 30;
    const Wd = 19;
    const tip = [hx + L * tx, hy + L * ty];
    const b1 = [hx + Wd * nx, hy + Wd * ny];
    const b2 = [hx - Wd * nx, hy - Wd * ny];
    const f = (v) => v.map((n) => n.toFixed(1)).join(',');
    arcs.push(
      `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)}A${rx} ${ry} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" fill="none" stroke="${color}" stroke-width="9" stroke-linecap="round" opacity=".5"/>` +
        `<polygon points="${f(tip)} ${f(b1)} ${f(b2)}" fill="${color}" opacity=".75" stroke="${color}" stroke-width="5" stroke-linejoin="round"/>`
    );
  }
  return `<svg class="abs" style="left:0;top:0" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <ellipse cx="${CX}" cy="${CY}" rx="${rx + 30}" ry="${ry + 30}" fill="none" stroke="#fff" stroke-opacity=".06" stroke-width="2" stroke-dasharray="3 9"/>
    ${arcs.join('')}</svg>`;
}

function pod(p, x, y) {
  const cur = p.isCurrent;
  const border = cur ? THEME.gold : 'rgba(255,255,255,.14)';
  const glow = cur ? `0 0 0 2px ${THEME.gold}55,0 0 38px ${THEME.gold}66,` : '';
  const countCol = p.count <= 2 ? THEME.red : '#fff';
  const unoTag = p.uno
    ? `<div class="pop" style="position:absolute;right:-6px;top:-12px;padding:3px 11px;border-radius:999px;background:linear-gradient(135deg,#ff3d55,#ff8a3d);font-weight:900;font-style:italic;font-size:15px;letter-spacing:1px;box-shadow:0 0 18px #ff3d55aa;${p.vulnerable ? 'outline:2px solid #fff;' : ''}">UNO</div>`
    : '';
  const shield = p.shield
    ? `<div style="position:absolute;left:-8px;top:-8px;width:28px;height:28px;border-radius:50%;background:#19c3b1;display:flex;align-items:center;justify-content:center;box-shadow:0 0 14px #19c3b1aa">${iconSVG('shield', { size: 17, color: '#fff' })}</div>`
    : '';
  const name = esc(p.name);
  return `<div style="position:absolute;left:${x - 118}px;top:${y - 44}px;width:236px;height:88px;border-radius:24px;display:flex;align-items:center;gap:14px;padding:0 16px 0 12px;
    background:linear-gradient(160deg,rgba(18,24,64,.92),rgba(8,12,36,.92));border:2px solid ${border};box-shadow:${glow}0 14px 28px -10px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,.12)">
    ${avatar({ url: p.avatarUrl, name: p.name, size: 62, ring: cur ? THEME.gold : 'rgba(255,255,255,.25)', ringWidth: 3 })}
    <div style="min-width:0;flex:1">
      <div class="pop ell" style="font-weight:700;font-size:19px;color:${cur ? THEME.gold : '#fff'};max-width:118px">${name}</div>
      <div style="display:flex;align-items:center;gap:8px;margin-top:5px">
        <div style="position:relative;width:34px;height:26px">
          <div style="position:absolute;left:0;top:2px;width:17px;height:24px;border-radius:4px;background:#3a4190;border:1.5px solid #fff;transform:rotate(-12deg)"></div>
          <div style="position:absolute;left:9px;top:0;width:17px;height:24px;border-radius:4px;background:#4a52b8;border:1.5px solid #fff;transform:rotate(8deg)"></div>
        </div>
        <div class="pop" style="font-weight:800;font-size:24px;line-height:1;color:${countCol}">${p.count}</div>
      </div>
    </div>
    ${cur ? `<div style="position:absolute;left:50%;top:-20px;transform:translateX(-50%);padding:2px 14px;border-radius:999px;background:${THEME.gold};color:#2a1d00;font-weight:800;font-size:12px;letter-spacing:1.5px" class="pop">SIRA</div>` : ''}
    ${unoTag}${shield}
  </div>`;
}

export function boardHTML(s) {
  const n = s.players.length;
  const col = COLOR_HEX[s.activeColor] ?? THEME.violet;
  const rx = 500;
  const ry = 268;
  const pods = s.players
    .map((p, i) => {
      const a = ((90 + (i * 360) / n) * Math.PI) / 180;
      return pod(p, CX + rx * Math.cos(a), CY + ry * Math.sin(a));
    })
    .join('');

  const rot = (hash(s.top?.id ?? 'x') % 11) - 5;
  const act = s.lastAction;
  const ribbonText = esc(act?.text ?? 'Oyun başladı. İyi eğlenceler!');
  const ribbonCol = act?.color ?? col;
  const ribbonIcon = act?.icon ?? 'play';

  const stackBadge = s.stack > 0
    ? `<div class="pop" style="position:absolute;left:${CX + 142}px;top:${CY - 160}px;width:84px;height:84px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ff9a6a,#ff3d55 60%,#b3122e);display:flex;align-items:center;justify-content:center;font-weight:900;font-style:italic;font-size:34px;border:4px solid #fff;box-shadow:0 0 40px #ff3d55cc">+${s.stack}</div>`
    : '';

  return `<div style="position:relative;width:${W}px;height:${H}px;overflow:hidden">
    ${background({ width: W, height: H, tint: col })}
    <!-- masa -->
    <div class="abs" style="left:${CX - 610}px;top:${CY - 330}px;width:1220px;height:660px;border-radius:50%;background:radial-gradient(ellipse at 50% 45%,${col}40 0%,${col}10 45%,transparent 66%)"></div>
    <div class="abs" style="left:${CX - 590}px;top:${CY - 316}px;width:1180px;height:632px;border-radius:50%;background:linear-gradient(180deg,#3b4380,#161a45 45%,#0a0d2a);box-shadow:0 40px 80px -10px rgba(0,0,0,.8),inset 0 2px 0 rgba(255,255,255,.25)"></div>
    <div class="abs" style="left:${CX - 572}px;top:${CY - 300}px;width:1144px;height:600px;border-radius:50%;background:radial-gradient(ellipse at 50% 38%,#173a78 0%,#0f2455 45%,#091535 100%);box-shadow:inset 0 10px 40px rgba(0,0,0,.6)"></div>
    <div class="abs" style="left:${CX - 572}px;top:${CY - 300}px;width:1144px;height:600px;border-radius:50%;background:radial-gradient(ellipse at 50% 48%,${col}40 0%,transparent 62%)"></div>
    <div class="abs" style="left:${CX - 540}px;top:${CY - 270}px;width:1080px;height:540px;border-radius:50%;border:2px dashed rgba(255,255,255,.07)"></div>
    <div class="pop abs" style="left:0;width:${W}px;top:${CY - 70}px;text-align:center;font-weight:900;font-style:italic;font-size:210px;line-height:1;letter-spacing:6px;color:#fff;opacity:.045;transform:rotate(-7deg)">UNO</div>
    ${ringArrows(s.direction, col)}

    <!-- cekme destesi -->
    <div class="abs" style="left:${CX - 178}px;top:${CY - 98}px;width:130px;height:195px">
      <div class="abs" style="left:-8px;top:8px;transform:rotate(-5deg);opacity:.7">${backSVG({ width: 130 })}</div>
      <div class="abs" style="left:-4px;top:4px;transform:rotate(-2deg);opacity:.85">${backSVG({ width: 130 })}</div>
      <div class="abs" style="left:0;top:0;filter:drop-shadow(0 10px 18px rgba(0,0,0,.55))">${backSVG({ width: 130 })}</div>
      <div class="pop abs" style="left:50%;bottom:-20px;transform:translateX(-50%);padding:4px 16px;border-radius:999px;background:#0b1030;border:2px solid rgba(255,255,255,.3);font-weight:800;font-size:17px;white-space:nowrap">DESTE ${s.deckCount}</div>
    </div>

    <!-- atilan -->
    <div class="abs" style="left:${CX + 8}px;top:${CY - 128}px;width:170px;height:255px">
      <div class="abs" style="left:-14px;top:6px;transform:rotate(${rot - 14}deg);opacity:.55;filter:blur(.4px)">${backSVG({ width: 170 })}</div>
      <div class="abs" style="left:10px;top:-4px;transform:rotate(${rot + 11}deg);opacity:.7">${backSVG({ width: 170 })}</div>
      <div class="abs" style="left:0;top:0;transform:rotate(${rot}deg);filter:drop-shadow(0 0 30px ${col}cc) drop-shadow(0 16px 22px rgba(0,0,0,.6))">${cardSVG(s.top, { width: 170 })}</div>
    </div>
    ${stackBadge}
    <div class="abs" style="left:${CX - 120}px;top:${CY + 150}px;width:240px;display:flex;justify-content:center">
      <div class="pop" style="display:flex;align-items:center;gap:12px;padding:6px 20px 6px 10px;border-radius:999px;background:rgba(6,8,24,.85);border:2px solid ${col};box-shadow:0 0 24px ${col}66;font-weight:800;font-size:17px;letter-spacing:1.5px;white-space:nowrap">
        ${s.activeColor ? colorGem(s.activeColor, 28) : ''}${esc((COLOR_TR[s.activeColor] ?? '').toLocaleUpperCase('tr'))}
      </div>
    </div>

    ${pods}

    <!-- ust serit -->
    <div class="abs" style="left:236px;top:22px;width:808px;display:flex;justify-content:center">
      <div style="display:flex;align-items:center;gap:16px;padding:10px 26px 10px 12px;max-width:808px;border-radius:999px;background:linear-gradient(90deg,rgba(14,18,52,.94),rgba(24,30,78,.94));border:2px solid ${ribbonCol}aa;box-shadow:0 0 36px ${ribbonCol}44,0 14px 28px -12px rgba(0,0,0,.7)">
        <div style="width:46px;height:46px;border-radius:50%;flex:none;background:linear-gradient(145deg,${ribbonCol},${ribbonCol}88);display:flex;align-items:center;justify-content:center;box-shadow:inset 0 2px 0 rgba(255,255,255,.4)">${iconSVG(ribbonIcon, { size: 26, color: '#fff' })}</div>
        <div class="pop" style="font-weight:600;font-size:20px;line-height:1.25;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${ribbonText}</div>
      </div>
    </div>
    <div class="pop abs" style="left:28px;top:34px;display:flex;align-items:center;gap:8px;padding:8px 18px;border-radius:999px;background:rgba(255,255,255,.08);border:1.5px solid rgba(255,255,255,.16);font-weight:700;font-size:16px;letter-spacing:1.5px">${iconSVG('clock', { size: 18, color: THEME.muted })}TUR ${s.turn}</div>
    <div class="pop abs" style="right:28px;top:34px;display:flex;align-items:center;gap:8px;padding:8px 18px;border-radius:999px;background:rgba(255,255,255,.08);border:1.5px solid rgba(255,255,255,.16);font-weight:700;font-size:16px;letter-spacing:1.5px">${iconSVG('users', { size: 18, color: THEME.muted })}${n} OYUNCU</div>
  </div>`;
}

export function renderBoard(snapshot) {
  return renderHTML(boardHTML(snapshot), { width: W, height: H, scale: 1.5, type: 'webp', quality: 90 });
}
