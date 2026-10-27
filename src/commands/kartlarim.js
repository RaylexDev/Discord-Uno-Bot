import { GameError } from '../game/UnoGame.js';
import { handPrompt } from '../ui/reply.js';
import { E } from '../ui/v2.js';

export const name = 'kartlarim';
export const aliases = ['kart', 'el', 'hand'];
export const description = 'Elini gizli olarak açan butonu gönderir';

export async function execute(message, { manager }) {
  const s = manager.get(message.channel.id);
  if (!s || !s.game.getPlayer(message.author.id)) throw new GameError('Bu kanalda oynadığın bir oyun yok.');
  // Elin kanalda herkese gorunmesin diye butonla gizli (ephemeral) acilir
  await handPrompt(message, `## ${E('card')} Kartların\nElin sadece sana görünsün diye aşağıdaki butonu kullan.`);
}
