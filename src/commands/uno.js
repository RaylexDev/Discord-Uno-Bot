import { identify } from '../game/GameManager.js';
import { GameError } from '../game/UnoGame.js';
import { replyNotice } from '../ui/reply.js';

export const name = 'uno';
export const aliases = ['lobi', 'oyun'];
export const description = 'Lobi açar; oyun sırasında UNO çağrısı yapar / yakalar';

export async function execute(message, { manager }) {
  const session = manager.get(message.channel.id);
  if (!session) {
    const s = manager.create(message.channel, identify(message.author, message.member));
    return s.postLobby();
  }
  if (session.game.status === 'waiting') {
    await session.resend();
    return;
  }
  if (!session.game.getPlayer(message.author.id)) throw new GameError('Bu oyunda değilsin.');
  await session.uno(message.author.id);
}
