/**
 * Components V2 yardimcilari: discord.js surumunden bagimsiz, ham JSON bilesenler uretir.
 * Tip numaralari: 1 ActionRow, 2 Button, 3 StringSelect, 9 Section, 10 TextDisplay,
 * 11 Thumbnail, 12 MediaGallery, 14 Separator, 17 Container
 */
export const FLAG_V2 = 1 << 15;
export const FLAG_EPHEMERAL = 1 << 6;

/** Emoji kaynagi (bot acilisinda atanir) */
export const env = { emoji: null };
export const E = (key) => env.emoji?.get(key) ?? '';
const EO = (key) => {
  const e = env.emoji?.obj(key);
  return e ? { id: e.id, name: e.name, animated: !!e.animated } : undefined;
};

export const STYLE = { primary: 1, secondary: 2, success: 3, danger: 4 };

export const text = (content) => ({ type: 10, content: String(content).slice(0, 3900) });
export const sep = (large = false, divider = true) => ({ type: 14, divider, spacing: large ? 2 : 1 });
export const gallery = (...items) => ({
  type: 12,
  items: items.map((i) => (typeof i === 'string' ? { media: { url: i } } : { media: { url: i.url }, description: i.alt }))
});
export const section = (texts, accessory) => ({ type: 9, components: texts.map(text), accessory });
export const thumb = (url, alt) => ({ type: 11, media: { url }, description: alt });

export function button({ id, label, style = 'secondary', emoji, disabled = false }) {
  const b = { type: 2, style: STYLE[style] ?? 2, custom_id: id };
  if (label) b.label = String(label).slice(0, 80);
  const e = emoji ? EO(emoji) : undefined;
  if (e) b.emoji = e;
  if (!b.label && !b.emoji) b.label = '-';
  if (disabled) b.disabled = true;
  return b;
}

export function select({ id, placeholder, options, disabled = false }) {
  return {
    type: 3,
    custom_id: id,
    placeholder: String(placeholder).slice(0, 150),
    min_values: 1,
    max_values: 1,
    disabled,
    options: options.slice(0, 25).map((o) => {
      const e = o.emoji ? EO(o.emoji) : undefined;
      return {
        label: String(o.label).slice(0, 100),
        value: String(o.value).slice(0, 100),
        ...(o.description ? { description: String(o.description).slice(0, 100) } : {}),
        ...(o.default ? { default: true } : {}),
        ...(e ? { emoji: e } : {})
      };
    })
  };
}

export const row = (...components) => ({ type: 1, components: components.filter(Boolean).slice(0, 5) });

export function container(children, color = 0x8b5cff) {
  return { type: 17, accent_color: color, components: children.filter(Boolean) };
}

export const hexToInt = (hex) => parseInt(String(hex).replace('#', ''), 16);

/** Her seyi ayni gorunumde gostermek icin hazir sonuc kartlari */
export function notice(title, body, { kind = 'info', iconKey } = {}) {
  const map = { info: ['info', 0x3d7bff], ok: ['check', 0x1fcf7c], error: ['cross', 0xff3d55], warn: ['bell', 0xffc61a] };
  const [icon, color] = map[kind] ?? map.info;
  return container([text(`## ${E(iconKey ?? icon)} ${title}\n${body}`)], color);
}

/** Gonderim secenekleri: V2 bayragi + (istege bagli) gizli */
export function payload(components, { files, ephemeral = false, mentions } = {}) {
  const o = { components, flags: FLAG_V2 | (ephemeral ? FLAG_EPHEMERAL : 0) };
  if (files?.length) o.files = files;
  if (mentions) o.allowedMentions = mentions;
  return o;
}
