import { GameError } from '../game/UnoGame.js';

export const name = 'itiraz';
export const aliases = ['challenge'];
export const description = 'Üzerine atılan +4 kartına itiraz eder';

export async function execute(message, { manager }) {
  const s = manager.get(message.channel.id);
  if (!s || s.game.status !== 'playing') throw new GameError('Bu kanalda devam eden bir oyun yok.');
  await s.challenge(message.author.id);
}
