import { replyNotice } from '../ui/reply.js';

export const name = 'ayril';
export const aliases = ['leave', 'cik'];
export const description = 'Lobiden ya da oyundan ayrılır';

export async function execute(message, { manager }) {
  const s = manager.get(message.channel.id);
  if (!s) return replyNotice(message, 'Oyun yok', 'Bu kanalda aktif bir oyun yok.', 'warn');
  await s.leave(message.author.id);
}
