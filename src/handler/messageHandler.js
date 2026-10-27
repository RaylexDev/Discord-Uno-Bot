import { fold } from './commandLoader.js';
import { GameError } from '../game/UnoGame.js';
import { replyNotice } from '../ui/reply.js';

const lastUse = new Map();

export function createMessageHandler(ctx) {
  const { config } = ctx;
  return async (message) => {
    if (message.author.bot || !message.content.startsWith(config.prefix)) return;
    const args = message.content.slice(config.prefix.length).trim().split(/\s+/);
    const name = fold(args.shift() ?? '');
    const cmd = ctx.commands.get(name);
    if (!cmd) return;
    if (!message.guild) return message.reply('Bu komutlar sadece sunucularda çalışır.').catch(() => {});

    // Spam korumasi: kullanici basina 800 ms
    const now = Date.now();
    if (now - (lastUse.get(message.author.id) ?? 0) < (config.cooldownMs ?? 800)) return;
    lastUse.set(message.author.id, now);

    try {
      await cmd.execute(message, { ...ctx, args });
    } catch (e) {
      if (e instanceof GameError) return replyNotice(message, 'İşlem yapılamadı', e.message, 'error').catch(() => {});
      console.error(`Komut hatası (${name}):`, e);
      replyNotice(message, 'Beklenmeyen hata', 'Komut çalışırken bir sorun oluştu. Biraz sonra tekrar dene.', 'error').catch(() => {});
    }
  };
}
