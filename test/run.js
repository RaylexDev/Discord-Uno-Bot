// Sahte Discord ile uctan uca test: komutlar, butonlar, menu akislari, V2 yuk dogrulama, gorsel uretimi.
import fs from 'node:fs';
import path from 'node:path';
import { GameManager } from '../src/game/GameManager.js';
import { EmojiManager } from '../src/emoji/emojiManager.js';
import { emojiDefs } from '../src/emoji/emojiDefs.js';
import { loadCommands, fold } from '../src/handler/commandLoader.js';
import { createMessageHandler } from '../src/handler/messageHandler.js';
import { createInteractionHandler } from '../src/handler/interactionHandler.js';
import { initRenderer, closeRenderer } from '../src/render/renderer.js';
import { env } from '../src/ui/v2.js';
import { GameError } from '../src/game/UnoGame.js';
import { fakeAvatar } from './mock.js';

const OUT = 'test/out/flow';
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

let problems = 0;
const bad = (m) => { problems++; console.error('SORUN:', m); };

// ---------------------------------------------------------------- dogrulayici
const EMOJI_RE = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{2190}-\u{21FF}\u{2300}-\u{23FF}]/u;
function validate(label, data) {
  const files = new Set((data.files ?? []).map((f) => f.name));
  let count = 0; let textLen = 0;
  const ids = new Set();
  const walk = (c, parent) => {
    count++;
    if (c.type === 10) { textLen += c.content.length; if (EMOJI_RE.test(c.content)) bad(`${label}: metinde Unicode emoji: ${c.content.slice(0, 60)}`); }
    if (c.type === 12) for (const it of c.items) { const m = /^attachment:\/\/(.+)$/.exec(it.media.url); if (!m || !files.has(m[1])) bad(`${label}: galeri dosyası eksik ${it.media.url}`); }
    if (c.type === 2) {
      if (!c.custom_id || c.custom_id.length > 100) bad(`${label}: buton custom_id`);
      if (ids.has(c.custom_id)) bad(`${label}: tekrar eden custom_id ${c.custom_id}`); ids.add(c.custom_id);
      if ((c.label ?? '').length > 80) bad(`${label}: buton etiketi uzun`);
      if (EMOJI_RE.test(c.label ?? '')) bad(`${label}: buton etiketinde emoji`);
    }
    if (c.type === 3) {
      if (ids.has(c.custom_id)) bad(`${label}: tekrar eden custom_id ${c.custom_id}`); ids.add(c.custom_id);
      if (c.options.length < 1 || c.options.length > 25) bad(`${label}: select seçenek sayısı ${c.options.length}`);
      for (const o of c.options) { if (o.label.length > 100 || (o.description ?? '').length > 100) bad(`${label}: seçenek uzun`); if (EMOJI_RE.test(o.label + (o.description ?? ''))) bad(`${label}: seçenekte emoji`); }
      if (parent?.components?.length !== 1) bad(`${label}: select satırda tek olmalı`);
    }
    if (c.type === 1) { if (c.components.length > 5) bad(`${label}: satırda 5+ bileşen`); if (c.components.some((x) => x.type === 3) && c.components.length > 1) bad(`${label}: select ile buton aynı satırda`); }
    for (const ch of c.components ?? []) walk(ch, c);
    if (c.accessory) walk(c.accessory, c);
  };
  for (const c of data.components) walk(c, null);
  if (count > 40) bad(`${label}: ${count} bileşen (>40)`);
  if (textLen > 4000) bad(`${label}: metin ${textLen} (>4000)`);
  if (!(data.flags & (1 << 15))) bad(`${label}: V2 bayrağı yok`);
  if (data.content || data.embeds) bad(`${label}: V2 ile content/embed kullanılamaz`);
}

let shot = 0;
function save(label, data) {
  validate(label, data);
  for (const f of data.files ?? []) fs.writeFileSync(path.join(OUT, `${String(++shot).padStart(3, '0')}_${label.replace(/\W+/g, '_')}_${f.name}`), f.attachment);
}

// ------------------------------------------------------------------ sahteler
let msgId = 0;
const sent = [];
function makeChannel(id = 'chan1') {
  return {
    id,
    sendTyping: async () => {},
    send: async (data) => {
      const m = { id: `m${++msgId}`, deleted: false, data, flags: { has: () => false },
        edit: async (d) => { if (m.deleted) throw new Error('Unknown Message'); m.data = d; save('edit', d); return m; },
        delete: async () => { m.deleted = true; } };
      save('send', data); sent.push(m); return m;
    }
  };
}
const channel = makeChannel();
const users = ['u1', 'u2', 'u3'].map((id, i) => ({ id, username: `Oyuncu${i + 1}`, globalName: ['Ayşe', 'Mehmet', 'Şeyma'][i], bot: false, displayAvatarURL: () => fakeAvatar(i), send: async (d) => { save('dm', d); } }));
const memberOf = (u) => ({ displayName: u.globalName, permissions: { has: () => true }, displayAvatarURL: u.displayAvatarURL });

const client = { application: { emojis: { fetch: async () => new Map() } } };
const emoji = new EmojiManager(client);
Object.keys(emojiDefs).forEach((k, i) => emoji.app.set(k, { id: String(100000000000000000n + BigInt(i)), name: 'uno_' + k, animated: false }));
env.emoji = emoji;
const manager = new GameManager();
const config = { prefix: '!', ownerId: '', turnSeconds: 45, cooldownMs: 0 };
const ctx = { client, manager, emoji, config, commands: await loadCommands() };
console.log('komutlar:', [...new Set(ctx.commands.values())].map((c) => c.name).join(', '));
const onMessage = createMessageHandler(ctx);
const onInteraction = createInteractionHandler(ctx);

const replies = [];
async function say(u, content, mentions = []) {
  const m = { content, author: u, member: memberOf(u), guild: { id: 'g1' }, channel, mentions: { users: { first: () => mentions[0] }, members: { first: () => undefined } },
    reply: async (d) => { replies.push({ to: content, d }); save('reply_' + fold(content.split(' ')[0]), typeof d === 'string' ? { components: [], flags: 1 << 15 } : d); return {}; } };
  await onMessage(m);
  await new Promise((r) => setTimeout(r, 5));
}

function makeInteraction(u, customId, { values, ephemeral = false } = {}) {
  const log = [];
  const i = {
    user: u, member: memberOf(u), channelId: channel.id, channel, customId, values,
    memberPermissions: { has: () => true },
    message: { flags: { has: () => ephemeral } },
    replied: false, deferred: false, log,
    isButton: () => !values, isStringSelectMenu: () => !!values,
    deferUpdate: async () => { i.deferred = true; },
    deferReply: async () => { i.deferred = true; },
    reply: async (d) => { i.replied = true; save('i_reply', d); log.push('reply'); },
    update: async (d) => { i.replied = true; save('i_update', d); log.push(['update', d]); },
    editReply: async (d) => { save('i_edit', d); log.push(['edit', d]); },
    followUp: async (d) => { save('i_follow', d); log.push(['follow', d]); }
  };
  return i;
}
const click = async (u, id, o) => { const i = makeInteraction(u, id, o); await onInteraction(i); return i; };

// ------------------------------------------------------------------ senaryo
await initRenderer();
await say(users[0], '!yardim');
await say(users[0], '!kartlar');
await say(users[0], '!uno');
const s = manager.get('chan1');
if (!s || s.game.status !== 'waiting') bad('lobi açılmadı');
await say(users[1], '!katil');
await click(users[2], 'uno:join');
await click(users[1], 'uno:opt:stacking'); // kurucu degil: hata beklenir
await click(users[0], 'uno:opt:stacking');
if (s.game.options.stacking !== false) bad('ayar değişmedi');
await click(users[0], 'uno:opt:stacking');
await say(users[2], '!baslat'); // kurucu degil
await say(users[0], '!baslat');
if (s.game.status !== 'playing') bad('oyun başlamadı');

// Oyun dongusu: arayuz uzerinden oyna
const U = Object.fromEntries(users.map((u) => [u.id, u]));
let moves = 0; let flowUsed = { color: 0, target: 0, draw: 0, text: 0, uno: 0, jump: 0 };
while (s.game.status === 'playing' && moves++ < 400) {
  const g = s.game;
  const cur = g.currentPlayer; const u = U[cur.id];
  if (moves === 1) { await click(u, 'uno:hand'); }
  if (g.unoVulnerable && Math.random() < 0.5) { const other = users.find((x) => x.id !== g.unoVulnerable); await click(other, 'uno:uno'); flowUsed.uno++; if (g.status !== 'playing') break; }
  if (g.challenge && g.stack === 4 && Math.random() < 0.5) { await click(u, 'uno:challenge'); continue; }
  const opts = g.playableCards(cur);
  if (opts.length && Math.random() < 0.92) {
    const c = opts[Math.floor(Math.random() * opts.length)];
    const eph = Math.random() < 0.5;
    if (Math.random() < 0.25 && c.kind !== 'power') {
      // metin komutuyla at
      const names = { red: 'kirmizi', yellow: 'sari', green: 'yesil', blue: 'mavi' };
      const val = c.kind === 'number' ? String(c.value) : c.kind === 'skip' ? 'atla' : c.kind === 'reverse' ? 'ters' : c.kind === 'draw2' ? '+2' : c.kind === 'wild4' ? '+4' : 'joker';
      const col = c.isWild ? names[['red', 'yellow', 'green', 'blue'][moves % 4]] : names[c.color];
      await say(u, `!at ${col} ${val}`); flowUsed.text++;
    } else {
      const i = await click(u, 'uno:play', { values: [c.id], ephemeral: eph });
      if (c.isWild) {
        flowUsed.color++;
        const color = ['red', 'yellow', 'green', 'blue'][moves % 4];
        const i2 = await click(u, `uno:color:${c.id}:${color}`, { ephemeral: true });
        if (c.kind === 'power' && c.value === 'duel' || c.value === 'peek') {
          const other = g.players.find((p) => p.id !== u.id);
          await click(u, `uno:target:${c.id}:${color}`, { values: [other.id], ephemeral: true }); flowUsed.target++;
        }
      }
    }
  } else if (g.drawnCardId) {
    await click(u, 'uno:pass', { ephemeral: Math.random() < 0.5 });
  } else {
    await click(u, 'uno:draw', { ephemeral: Math.random() < 0.5 }); flowUsed.draw++;
  }
  if (moves % 40 === 0) await say(u, '!masa');
}
console.log('hamle:', moves, JSON.stringify(flowUsed), 'durum:', s.game.status);
if (s.game.status === 'playing') { await say(users[0], '!iptal'); }
await say(users[0], '!profil');
await say(users[1], '!siralama');
await click(users[0], 'uno:help', { values: ['kurallar'] });
await click(users[0], 'uno:again');
await say(users[0], '!cek'); // oyun yok -> hata mesaji
await say(users[0], '!emoji liste');
await say(users[0], '!at 3');

// ------------------------------------------------------ Unicode emoji taramasi
const scan = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => d.isDirectory() ? (d.name === 'node_modules' || d.name === 'out' ? [] : scan(path.join(dir, d.name))) : [path.join(dir, d.name)]);
for (const f of scan('.').filter((f) => /\.(js|json|md)$/.test(f) && !f.includes('package-lock'))) {
  const t = fs.readFileSync(f, 'utf8');
  const m = EMOJI_RE.exec(t);
  if (m) bad(`${f}: Unicode emoji/simge bulundu (${m[0]} U+${m[0].codePointAt(0).toString(16)})`);
  if (/vamp[iı]r|k[oö]yl[uü]|werewolf/i.test(t) && !f.endsWith('run.js')) bad(`${f}: "vampir/köylü" ifadesi geçiyor`);
}

await closeRenderer();
fs.rmSync('data/stats.json', { force: true });
console.log(`gönderilen mesaj: ${sent.length}, sorun: ${problems}`);
process.exit(problems ? 1 : 0);
