import { GameError } from '../game/UnoGame.js';

export const name = 'pas';
export const aliases = ['pass'];
export const description = 'Kart çektikten sonra sırayı geçer';

export async function execute(message, { manager }) {
  const s = manager.get(message.channel.id);
  if (!s || s.game.status !== 'playing') throw new GameError('Bu kanalda devam eden bir oyun yok.');
  await s.pass(message.author.id);
}
