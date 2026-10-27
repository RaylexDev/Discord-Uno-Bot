import { profileView } from '../ui/views.js';
import { replyView } from '../ui/reply.js';

export const name = 'profil';
export const aliases = ['profile', 'stats'];
export const description = 'Oyuncu profil kartını gösterir';

export async function execute(message) {
  const target = message.mentions.users.first() ?? message.author;
  const member = message.mentions.members?.first() ?? (target.id === message.author.id ? message.member : null);
  await message.channel.sendTyping?.().catch(() => {});
  await replyView(message, await profileView(target, member));
}
