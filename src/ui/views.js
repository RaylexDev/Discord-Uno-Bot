/**
 * Tum ekranlar: gorsel + Components V2 bilesenleri. Her fonksiyon { components, files } dondurur.
 */
import { E, text, sep, gallery, section, thumb, button, select, row, container, hexToInt, notice } from './v2.js';
import * as S from '../render/scenes.js';
import { renderBoard } from '../render/board.js';
import { withAvatars, avatarData } from '../utils/avatar.js';
import { COLORS, COLOR_TR, COLOR_HEX, POWERS, POWER_IDS, cardName } from '../game/cards.js';
import stats from '../utils/stats.js';

const file = (buf, name) => ({ attachment: buf, name });
const att = (name) => `attachment://${name}`;

/** Gorsel uretilemezse metne duser */
async function safeRender(fn, name) {
  try {
    const buf = await fn();
    return { buf, name };
  } catch (e) {
    console.error(`Görsel çizilemedi (${name}):`, e.message);
    return null;
  }
}

const accent = (c) => hexToInt(COLOR_HEX[c] ?? '#8b5cff');

// ------------------------------------------------------------------ LOBI

export async function lobbyView(session, { starting = false } = {}) {
  const g = session.game;
  const players = await withAvatars(g.players.map((p) => ({ id: p.id, name: p.name, avatarUrl: p.avatarUrl })));
  const img = await safeRender(() => S.renderLobby({ players, maxPlayers: g.options.maxPlayers, hostId: g.hostId, options: g.options, starting }), 'lobi.webp');
  const o = g.options;
  const tog = (key, label, emoji) => button({ id: `uno:opt:${key}`, label: `${label}: ${o[key] ? 'Açık' : 'Kapalı'}`, style: o[key] ? 'success' : 'secondary', emoji, disabled: starting });
  const children = [
    text(`## ${E('card')} UNO Lobisi\n${E('crown')} **Kurucu:** <@${g.hostId}>\n${E('users')} **Oyuncular:** ${g.players.length}/${o.maxPlayers}`),
    img ? gallery({ url: att(img.name), alt: 'UNO lobisi' }) : text(g.players.map((p, i) => `${i + 1}. ${p.name}`).join('\n')),
    sep(),
    text(`-# Komutlar: \`!katil\`  \`!ayril\`  \`!baslat\`  \`!iptal\`  |  Yardım için \`!yardim\``),
    row(
      button({ id: 'uno:join', label: 'Katıl', style: 'success', emoji: 'check', disabled: starting }),
      button({ id: 'uno:leave', label: 'Ayrıl', style: 'secondary', emoji: 'door', disabled: starting }),
      button({ id: 'uno:start', label: `Başlat (${g.players.length}/${o.minPlayers}+)`, style: 'primary', emoji: 'play', disabled: starting || g.players.length < o.minPlayers }),
      button({ id: 'uno:cancel', label: 'İptal', style: 'danger', emoji: 'stop', disabled: starting })
    ),
    row(tog('powers', 'Güç Kartları', 'sparkles'), tog('stacking', 'İstifleme', 'draw2'), tog('jumpIn', 'Atlama', 'bolt'), tog('challenge', 'İtiraz', 'target'))
  ];
  return { components: [container(children, 0x8b5cff)], files: img ? [file(img.buf, img.name)] : [] };
}

// ------------------------------------------------------------------ MASA

export async function boardView(session) {
  const g = session.game;
  const snap = g.snapshot();
  snap.players = await withAvatars(snap.players);
  const img = await safeRender(() => renderBoard(snap), 'masa.webp');
  const cur = g.currentPlayer;
  const endAt = session.turnEndsAt ? Math.floor(session.turnEndsAt / 1000) : null;
  const dir = g.direction === 1 ? 'Saat yönü' : 'Ters yön';

  const lines = [`## ${E('play')} Sıra: <@${cur.id}>`, `-# Tur ${g.turn} | ${dir} | Deste ${g.deck.count}${endAt ? ` | Süre <t:${endAt}:R>` : ''}`];
  if (g.stack > 0) lines.push(`${E('draw2')} **${g.stack} kart cezası var!** Aynı türde ceza kartı at ya da çek.`);
  if (g.unoVulnerable) lines.push(`${E('uno')} <@${g.unoVulnerable}> tek kart kaldı ve UNO demedi! **UNO!** butonuyla yakala.`);
  if (g.drawnCardId) lines.push(`${E('deck')} <@${cur.id}> kart çekti, oynayabilir ya da pas geçebilir.`);

  const canChallenge = g.challenge && g.stack === 4;
  const children = [
    text(lines.join('\n')),
    img ? gallery({ url: att(img.name), alt: 'UNO masası' }) : text(snap.players.map((p) => `${p.isCurrent ? '>' : '-'} ${p.name}: ${p.count} kart`).join('\n')),
    sep(),
    row(
      button({ id: 'uno:hand', label: 'Kartlarım', style: 'primary', emoji: 'card' }),
      button({ id: 'uno:draw', label: g.stack > 0 ? `${g.stack} Kart Çek` : 'Kart Çek', style: g.stack > 0 ? 'danger' : 'secondary', emoji: 'deck', disabled: !!g.drawnCardId }),
      button({ id: 'uno:uno', label: 'UNO!', style: 'danger', emoji: 'uno' }),
      canChallenge ? button({ id: 'uno:challenge', label: 'İtiraz Et', style: 'secondary', emoji: 'target' }) : null,
      g.drawnCardId ? button({ id: 'uno:pass', label: 'Pas', style: 'secondary', emoji: 'arrow_right' }) : null
    )
  ];
  return { components: [container(children, accent(g.activeColor))], files: img ? [file(img.buf, img.name)] : [] };
}

// -------------------------------------------------------------------- EL

function cardEmojiKey(c) {
  if (c.kind === 'power') return c.value;
  if (c.kind === 'wild') return 'wild';
  if (c.kind === 'wild4') return 'draw4';
  if (c.kind === 'skip' || c.kind === 'reverse' || c.kind === 'draw2') return c.kind;
  return c.color;
}

export async function handView(session, userId, { note = '', newCardId = null, mode = 'hand' } = {}) {
  const g = session.game;
  const p = g.getPlayer(userId);
  if (!p) return { components: [notice('Oyunda değilsin', 'Bu oyunda yer almıyorsun.', { kind: 'error' })], files: [] };
  const playable = g.playableCards(p);
  const ids = new Set(playable.map((c) => c.id));
  const isTurn = g.currentPlayer.id === userId;
  const img = await safeRender(
    () => S.renderHand({ cards: p.hand.map((c) => ({ card: c, playable: ids.has(c.id) })), top: g.top, activeColor: g.activeColor, isTurn, stack: isTurn ? g.stack : 0, newCardId, jumpIn: !isTurn && playable.length > 0 }),
    'el.webp'
  );

  // Ayni yuzlu kartlari tek secenek yap
  const seen = new Set();
  const options = [];
  for (const c of S_sorted(playable)) {
    const key = `${c.color}|${c.kind}|${c.value}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const idx = S_sorted(p.hand).findIndex((x) => x.id === c.id) + 1;
    options.push({ label: cardName(c), value: c.id, description: `Elindeki ${idx}. kart${c.kind === 'power' ? ' | ' + POWERS[c.value].short : ''}`, emoji: cardEmojiKey(c) });
  }

  const lines = [`### ${E('card')} Elin: ${p.hand.length} kart`];
  if (note) lines.push(note);
  if (isTurn && g.stack > 0 && playable.length === 0) lines.push(`${E('draw2')} ${g.stack} kart çekmelisin.`);
  else if (isTurn && playable.length === 0) lines.push(`${E('deck')} Oynayabileceğin kart yok, kart çek.`);
  else if (!isTurn && playable.length) lines.push(`${E('bolt')} Sıra sende değil ama bu kart(lar)la araya girebilirsin.`);
  else if (!isTurn) lines.push(`${E('hourglass')} Sıra <@${g.currentPlayer.id}> oyuncusunda.`);

  const children = [text(lines.join('\n')), img ? gallery({ url: att(img.name), alt: 'Elindeki kartlar' }) : text(S_sorted(p.hand).map((c, i) => `${i + 1}. ${cardName(c)}`).join('\n')), sep()];
  if (options.length) children.push(row(select({ id: 'uno:play', placeholder: 'Oynamak istediğin kartı seç', options })));
  children.push(
    row(
      button({ id: 'uno:draw', label: g.stack > 0 && isTurn ? `${g.stack} Kart Çek` : 'Kart Çek', style: g.stack > 0 && isTurn ? 'danger' : 'secondary', emoji: 'deck', disabled: !isTurn || !!g.drawnCardId }),
      g.drawnCardId && isTurn ? button({ id: 'uno:pass', label: 'Pas', style: 'secondary', emoji: 'arrow_right' }) : null,
      button({ id: 'uno:uno', label: 'UNO!', style: 'danger', emoji: 'uno' }),
      button({ id: 'uno:hand', label: 'Yenile', style: 'secondary', emoji: 'refresh' })
    )
  );
  return { components: [container(children, accent(g.activeColor))], files: img ? [file(img.buf, img.name)] : [] };
}

import { compareCards } from '../game/cards.js';
function S_sorted(list) {
  return [...list].sort(compareCards);
}

/** Baskasinin elini gosterir (Rontgen) */
export async function peekView(session, targetId) {
  const g = session.game;
  const t = g.getPlayer(targetId);
  if (!t) return null;
  const img = await safeRender(
    () => S.renderHand({ cards: t.hand.map((c) => ({ card: c, playable: false })), top: g.top, activeColor: g.activeColor, isTurn: false, title: `${t.name} OYUNCUSUNUN ELİ`.toLocaleUpperCase('tr'), plain: true }),
    'rontgen.webp'
  );
  const children = [text(`## ${E('peek')} Röntgen\n**${t.name}** oyuncusunun ${t.hand.length} kartı:`), img ? gallery({ url: att(img.name) }) : text(S_sorted(t.hand).map((c) => cardName(c)).join(', '))];
  return { components: [container(children, 0x4dabff)], files: img ? [file(img.buf, img.name)] : [] };
}

// ---------------------------------------------------------- RENK / HEDEF

export function colorPickView(card) {
  const names = { red: 'Kırmızı', yellow: 'Sarı', green: 'Yeşil', blue: 'Mavi' };
  const style = { red: 'danger', yellow: 'secondary', green: 'success', blue: 'primary' };
  return {
    components: [
      container([
        text(`## ${E('wild')} Renk Seç\n**${cardName(card)}** için bir renk seç.`),
        row(...COLORS.map((c) => button({ id: `uno:color:${card.id}:${c}`, label: names[c], style: style[c], emoji: c }))),
        row(button({ id: 'uno:hand', label: 'Vazgeç', style: 'secondary', emoji: 'arrow_left' }))
      ], 0x8b5cff)
    ],
    files: []
  };
}

export function targetPickView(session, userId, card, color) {
  const others = session.game.players.filter((p) => p.id !== userId);
  const pw = POWERS[card.value];
  return {
    components: [
      container([
        text(`## ${E(card.value)} ${pw.name}\n${pw.desc}\nBir hedef oyuncu seç.`),
        row(select({ id: `uno:target:${card.id}:${color}`, placeholder: 'Hedef oyuncuyu seç', options: others.map((p) => ({ label: p.name, value: p.id, description: `${p.hand.length} kartı var`, emoji: 'user' })) })),
        row(button({ id: 'uno:hand', label: 'Vazgeç', style: 'secondary', emoji: 'arrow_left' }))
      ], hexToInt(pw.color))
    ],
    files: []
  };
}

// --------------------------------------------------------------- KAZANAN

export async function winnerView(session) {
  const g = session.game;
  const r = g.result;
  const ranking = await withAvatars(r.ranking);
  const winner = ranking.find((x) => x.id === r.winnerId);
  const img = await safeRender(() => S.renderWinner({ winner, ranking, duration: r.duration, turns: r.turns, points: r.points, reason: r.reason }), 'kazanan.webp');
  const children = [
    text(`## ${E('trophy')} Oyun Bitti\n${E('crown')} **Kazanan:** <@${r.winnerId}>\n-# Süre ${S.fmtDuration(r.duration)} | ${r.turns} tur | ${r.points} puan`),
    img ? gallery({ url: att(img.name), alt: 'Kazanan' }) : null,
    sep(),
    row(
      button({ id: 'uno:again', label: 'Yeni Lobi', style: 'success', emoji: 'play' }),
      button({ id: 'uno:lb', label: 'Liderlik', style: 'primary', emoji: 'trophy' }),
      button({ id: 'uno:me', label: 'Profilim', style: 'secondary', emoji: 'chart' })
    )
  ];
  return { components: [container(children, 0xffd166)], files: img ? [file(img.buf, img.name)] : [] };
}

// ---------------------------------------------------------------- PROFIL

export async function profileView(user, member) {
  const name = member?.displayName ?? user.globalName ?? user.username;
  const s = stats.get(user.id);
  if (!s || s.games === 0) {
    return { components: [notice('Profil yok', `**${name}** henüz hiç UNO oynamamış.`, { kind: 'warn' })], files: [] };
  }
  const avatarUrl = await avatarData(user.displayAvatarURL({ extension: 'png', size: 256 }));
  const img = await safeRender(() => S.renderProfile({ name, avatarUrl, s, rank: stats.rank(user.id) }), 'profil.webp');
  const children = [text(`## ${E('chart')} ${name} | Profil`), img ? gallery({ url: att(img.name), alt: 'Profil kartı' }) : text(`Oyun: ${s.games} | Galibiyet: ${s.wins}`)];
  return { components: [container(children, 0x8b5cff)], files: img ? [file(img.buf, img.name)] : [] };
}

export async function leaderboardView() {
  const entries = stats.leaderboard(10);
  if (!entries.length) return { components: [notice('Liderlik tablosu boş', 'Henüz tamamlanmış oyun yok. `!uno` ile ilk oyunu başlat.', { kind: 'warn' })], files: [] };
  const list = await withAvatars(entries);
  const img = await safeRender(() => S.renderLeaderboard({ entries: list }), 'liderlik.webp');
  const children = [text(`## ${E('trophy')} Liderlik Tablosu`), img ? gallery({ url: att(img.name), alt: 'Liderlik tablosu' }) : text(entries.map((e, i) => `${i + 1}. ${e.name} - ${e.wins} galibiyet`).join('\n'))];
  return { components: [container(children, 0xffd166)], files: img ? [file(img.buf, img.name)] : [] };
}

// ----------------------------------------------------------------- YARDIM

export const HELP_PAGES = {
  genel: { label: 'Genel', desc: 'UNO botuna giriş', emoji: 'info' },
  komutlar: { label: 'Komutlar', desc: 'Tüm komutlar', emoji: 'book' },
  kurallar: { label: 'Kurallar', desc: 'Oyun kuralları', emoji: 'card' },
  guc: { label: 'Güç Kartları', desc: '8 özel kart', emoji: 'sparkles' }
};

export async function helpView(page = 'genel', prefix = '!') {
  const p = prefix;
  let body = '';
  let img = null;
  if (page === 'guc') {
    img = await safeRender(() => S.renderGuide(), 'guc.webp');
    body = `## ${E('sparkles')} Güç Kartları\nJoker gibi her zaman atılır, atarken bir renk seçersin. Hedefli kartlarda ayrıca bir oyuncu seçilir.\n${POWER_IDS.map((id) => `${E(id)} **${POWERS[id].name}**: ${POWERS[id].desc}`).join('\n')}`;
  } else {
    const titles = { genel: ['YARDIM MERKEZİ', 'Komutlar, kurallar ve güç kartları'], komutlar: ['KOMUTLAR', 'Hepsi ' + p + ' ile başlar'], kurallar: ['KURALLAR', 'Kısa ve net'] };
    img = await safeRender(() => S.renderBanner({ title: titles[page][0], subtitle: titles[page][1], icon: page === 'kurallar' ? 'card' : 'book' }), 'baslik.webp');
    if (page === 'genel') {
      body = `## ${E('card')} UNO\nArkadaşlarınla Discord'da UNO oyna. Masa, kartlar ve eller her hamlede çizilir; kartlarını sadece sen görürsün.\n\n${E('play')} **Başlamak için** \`${p}uno\` yaz, oyuncular **Katıl** butonuna bassın, kurucu **Başlat**'a bassın.\n${E('card')} **Oynamak için** masadaki **Kartlarım** butonuna bas, listeden kartı seç.\n${E('uno')} Tek kart kalınca **UNO!** butonuna basmayı unutma.`;
    } else if (page === 'komutlar') {
      body = `## ${E('book')} Komutlar\n**Oyun**\n\`${p}uno\` lobi aç (oyun sırasında UNO çağrısı)\n\`${p}katil\` lobiye katıl  |  \`${p}ayril\` ayrıl\n\`${p}baslat\` oyunu başlat  |  \`${p}iptal\` oyunu bitir\n\`${p}at <renk> <değer>\` kart at, örnek: \`${p}at kirmizi 5\`, \`${p}at mavi atla\`, \`${p}at joker sari\`, \`${p}at +4 yesil\`\n\`${p}at <sıra no>\` elindeki sıra numarasıyla at, örnek: \`${p}at 3\`\n\`${p}cek\` kart çek  |  \`${p}pas\` çektikten sonra pas geç\n\`${p}itiraz\` +4'e itiraz et  |  \`${p}kartlarim\` elini aç  |  \`${p}masa\` masayı yeniden gönder\n\n**Bilgi**\n\`${p}profil [@kişi]\`  \`${p}siralama\`  \`${p}kartlar\` (güç kartları)  \`${p}yardim\`\n\n**Yönetici**\n\`${p}emoji liste | sync | ata <anahtar> <emoji> | sifirla <anahtar>\``;
    } else {
      body = `## ${E('card')} Kurallar\n${E('check')} Masadaki kartla **renk** ya da **değer** aynıysa kartını atabilirsin. Joker kartlar her zaman atılır.\n${E('skip')} **Atla** sıradakini geçer, ${E('reverse')} **Yön** oyun yönünü çevirir (2 kişide atla gibi çalışır).\n${E('draw2')} **+2** ve **+4** cezaları üst üste istiflenir: cezayı sadece aynı türde kartla devredebilirsin, yoksa toplamı çekersin.\n${E('target')} İlk **+4**'e **İtiraz Et** diyebilirsin: atan oyuncunun elinde o renkten kart varsa o çeker, yoksa sen 6 kart çekersin.\n${E('deck')} Atabileceğin kart yoksa kart çek. Çektiğin kart uyuyorsa hemen atabilir ya da pas geçebilirsin.\n${E('bolt')} **Atlama:** masadaki kartın birebir aynısı sende varsa, sıran olmasa bile atıp araya girebilirsin.\n${E('uno')} Tek kart kalınca **UNO!** de. Demezsen herhangi biri seni yakalayıp 2 kart çektirebilir.\n${E('clock')} Sıra süren dolarsa otomatik kart çekersin, üst üste 2 kez dolarsa oyundan atılırsın.\n${E('trophy')} Elini ilk bitiren kazanır.`;
    }
  }
  const children = [img ? gallery({ url: att(img.name) }) : null, text(body), sep(), row(select({ id: 'uno:help', placeholder: 'Bir bölüm seç', options: Object.entries(HELP_PAGES).map(([v, o]) => ({ value: v, label: o.label, description: o.desc, emoji: o.emoji, default: v === page })) }))];
  return { components: [container(children, 0x8b5cff)], files: img ? [file(img.buf, img.name)] : [] };
}
