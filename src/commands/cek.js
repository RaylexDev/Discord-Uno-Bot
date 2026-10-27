import { GameError } from '../game/UnoGame.js';

export const name = 'cek';
export const aliases = ['draw', 'cekil'];
export const description = 'Desteden kart çeker';

export async function execute(message, { manager }) {
  const s = manager.get(message.channel.id);
  if (!s || s.game.status !== 'playing') throw new GameError('Bu kanalda devam eden bir oyun yok.');
  await s.draw(message.author.id);
}
