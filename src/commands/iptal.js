import { replyNotice } from '../ui/reply.js';

export const name = 'iptal';
export const aliases = ['bitir', 'cancel'];
export const description = 'Oyunu iptal eder (kurucu veya yönetici)';

export async function execute(message, { manager }) {
  const s = manager.get(message.channel.id);
  if (!s) return replyNotice(message, 'Oyun yok', 'İptal edilecek bir oyun yok.', 'warn');
  const admin = message.member?.permissions.has('ManageGuild') ?? false;
  await s.cancel(message.author.id, admin);
  await replyNotice(message, 'Oyun iptal edildi', 'Tüm zamanlayıcılar durdu. Yeni oyun için `!uno` yaz.', 'ok');
}
