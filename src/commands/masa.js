import { GameError } from '../game/UnoGame.js';

export const name = 'masa';
export const aliases = ['durum', 'board'];
export const description = 'Masayı yeniden gönderir (mesaj yukarıda kaldıysa)';

export async function execute(message, { manager }) {
  const s = manager.get(message.channel.id);
  if (!s) throw new GameError('Bu kanalda açık bir oyun yok.');
  await s.resend();
}
