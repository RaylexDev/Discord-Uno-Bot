import { EmojiManager } from '../emoji/emojiManager.js';
import { emojiDefs } from '../emoji/emojiDefs.js';
import { replyNotice } from '../ui/reply.js';
import { E } from '../ui/v2.js';

export const name = 'emoji';
export const aliases = ['emojiler'];
export const description = 'Emoji yönetimi (yönetici): liste | sync [force] | ata <anahtar> <emoji> | sifirla <anahtar>';

export async function execute(message, { emoji, args, config }) {
  const isOwner = config.ownerId && message.author.id === config.ownerId;
  if (!isOwner && !message.member?.permissions.has('Administrator')) {
    return replyNotice(message, 'Yetki yok', 'Bu komutu sadece yöneticiler kullanabilir.', 'error');
  }
  const sub = (args[0] ?? '').toLowerCase();
  if (sub === 'liste' || sub === 'list') {
    const keys = emoji.keys();
    const lines = keys.map((k) => `${emoji.get(k) || '`yok`'} \`${k}\``);
    const have = keys.filter((k) => emoji.obj(k)).length;
    return replyNotice(message, 'Emoji listesi', `**${have}/${keys.length}** emoji hazır.\n${lines.join('  ')}`, 'info');
  }
  if (sub === 'sync') {
    if (emoji.syncing) return replyNotice(message, 'Zaten çalışıyor', 'Emoji senkronizasyonu devam ediyor.', 'warn');
    const force = args[1] === 'force';
    await replyNotice(message, 'Senkronizasyon başladı', `${Object.keys(emojiDefs).length} emoji kontrol ediliyor${force ? ' (hepsi yeniden çizilecek)' : ''}. Bu birkaç dakika sürebilir.`, 'info');
    const res = await emoji.sync({ force });
    return message.channel.send({ flags: 1 << 15, components: [{ type: 17, accent_color: 0x1fcf7c, components: [{ type: 10, content: `## ${E('check')} Emojiler hazır\nMevcut: **${res?.existing ?? 0}** | Oluşturulan: **${res?.created ?? 0}** | Başarısız: **${res?.failed ?? 0}**` }] }] });
  }
  if (sub === 'ata' || sub === 'set') {
    const key = args[1];
    const value = args.slice(2).join(' ');
    if (!key || !value) return replyNotice(message, 'Kullanım', `\`${config.prefix}emoji ata <anahtar> <emoji>\`\nAnahtarlar: ${emoji.keys().map((k) => `\`${k}\``).join(' ')}`, 'info');
    try {
      await emoji.setCustom(key, value);
    } catch (e) {
      return replyNotice(message, 'Geçersiz', e.message, 'error');
    }
    return replyNotice(message, 'Emoji atandı', `\`${key}\` artık ${emoji.get(key)} olarak kullanılacak.`, 'ok');
  }
  if (sub === 'sifirla' || sub === 'reset') {
    if (!args[1]) return replyNotice(message, 'Kullanım', `\`${config.prefix}emoji sifirla <anahtar>\``, 'info');
    await emoji.resetCustom(args[1]);
    return replyNotice(message, 'Sıfırlandı', `\`${args[1]}\` varsayılan emojiye döndü.`, 'ok');
  }
  return replyNotice(message, 'Emoji komutları', `\`${config.prefix}emoji liste\`\n\`${config.prefix}emoji sync [force]\`\n\`${config.prefix}emoji ata <anahtar> <emoji>\`\n\`${config.prefix}emoji sifirla <anahtar>\``, 'info');
}
