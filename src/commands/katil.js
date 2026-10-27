import { identify } from '../game/GameManager.js';
import { replyNotice } from '../ui/reply.js';

export const name = 'katil';
export const aliases = ['join', 'gir'];
export const description = 'Açık lobiye katılır';

export async function execute(message, { manager }) {
  const s = manager.get(message.channel.id);
  if (!s) return replyNotice(message, 'Lobi yok', 'Bu kanalda açık lobi yok. `!uno` ile bir lobi aç.', 'warn');
  await s.join(identify(message.author, message.member));
}
