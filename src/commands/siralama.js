import { leaderboardView } from '../ui/views.js';
import { replyView } from '../ui/reply.js';

export const name = 'siralama';
export const aliases = ['top', 'liderlik', 'leaderboard'];
export const description = 'Liderlik tablosunu gösterir';

export async function execute(message) {
  await message.channel.sendTyping?.().catch(() => {});
  await replyView(message, await leaderboardView());
}
