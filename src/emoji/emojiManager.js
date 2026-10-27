import fs from 'node:fs/promises';
import path from 'node:path';
import { emojiDefs, EMOJI_PREFIX } from './emojiDefs.js';
import { renderEmoji } from './emojiRenderer.js';

const FILE = path.join(process.cwd(), 'data', 'emojis.json');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Emoji sistemi (2 katman, Unicode yok):
 * 1. Elle atanan ozel emoji (!emoji ata)   2. Otomatik cizilen uygulama emojisi
 */
export class EmojiManager {
  constructor(client) {
    this.client = client;
    this.app = new Map(); // key -> { id, name }
    this.custom = new Map(); // key -> { id, name, animated }
    this.syncing = false;
  }

  /** <:ad:id> bicimli metni ayristirir */
  static parse(str) {
    const m = /^<(a?):(\w{2,32}):(\d{15,25})>$/.exec(String(str).trim());
    return m ? { animated: !!m[1], name: m[2], id: m[3] } : null;
  }

  async loadCustom() {
    try {
      const data = JSON.parse(await fs.readFile(FILE, 'utf8'));
      for (const [k, v] of Object.entries(data)) this.custom.set(k, v);
    } catch (e) {
      if (e.code !== 'ENOENT') console.error('Emoji dosyasi okunamadi:', e.message);
    }
  }

  async saveCustom() {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(Object.fromEntries(this.custom), null, 2));
  }

  /** Discord'taki mevcut uygulama emojilerini hafizaya alir */
  async loadExisting() {
    const list = await this.client.application.emojis.fetch();
    for (const e of list.values()) {
      if (e.name?.startsWith(EMOJI_PREFIX)) {
        const key = e.name.slice(EMOJI_PREFIX.length);
        if (emojiDefs[key]) this.app.set(key, { id: e.id, name: e.name, animated: !!e.animated });
      }
    }
    return this.app.size;
  }

  /** Eksik emojileri cizip yukler. force=true hepsini yeniden olusturur. */
  async sync({ force = false, onProgress } = {}) {
    if (this.syncing) return null;
    this.syncing = true;
    const res = { existing: 0, created: 0, failed: 0 };
    try {
      const list = await this.client.application.emojis.fetch();
      for (const [key, def] of Object.entries(emojiDefs)) {
        const name = EMOJI_PREFIX + key;
        const found = list.find((e) => e.name === name);
        if (found && !force) {
          this.app.set(key, { id: found.id, name, animated: false });
          res.existing++;
          continue;
        }
        try {
          const buf = await renderEmoji(def);
          if (found) await this.client.application.emojis.delete(found.id).catch(() => {});
          const e = await this.client.application.emojis.create({ attachment: buf, name });
          this.app.set(key, { id: e.id, name, animated: false });
          res.created++;
          onProgress?.(key, res);
          await sleep(400);
        } catch (err) {
          res.failed++;
          console.error(`Emoji yuklenemedi (${key}):`, err.message);
        }
      }
    } finally {
      this.syncing = false;
    }
    return res;
  }

  /** Emoji nesnesi { id, name } ya da null */
  obj(key) {
    return this.custom.get(key) ?? this.app.get(key) ?? null;
  }

  /** Metin icin <:ad:id>, yoksa bos metin (Unicode yedegi yok) */
  get(key) {
    const e = this.obj(key);
    return e ? `<${e.animated ? 'a' : ''}:${e.name}:${e.id}>` : '';
  }

  async setCustom(key, str) {
    if (!emojiDefs[key]) throw new Error('Bilinmeyen emoji anahtarı.');
    const p = EmojiManager.parse(str);
    if (!p) throw new Error('Yalnızca özel Discord emojisi kabul edilir (örnek: <:ad:123456789012345678>).');
    this.custom.set(key, p);
    await this.saveCustom();
  }

  async resetCustom(key) {
    this.custom.delete(key);
    await this.saveCustom();
  }

  keys() {
    return Object.keys(emojiDefs);
  }
}

export default EmojiManager;
