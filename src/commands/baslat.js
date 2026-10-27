import { replyNotice } from '../ui/reply.js';

export const name = 'baslat';
export const aliases = ['start'];
export const description = 'Lobideki oyunu başlatır (kurucu)';

export async function execute(message, { manager }) {
  const s = manager.get(message.channel.id);
  if (!s) return replyNotice(message, 'Lobi yok', 'Önce `!uno` ile bir lobi aç.', 'warn');
  await s.start(message.author.id);
}
