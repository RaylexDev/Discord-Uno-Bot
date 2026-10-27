import { parseCardArgs } from '../utils/cardParser.js';
import { GameError } from '../game/UnoGame.js';
import { POWERS } from '../game/cards.js';
import { replyNotice, replyView } from '../ui/reply.js';
import { peekView } from '../ui/views.js';

export const name = 'at';
export const aliases = ['oyna', 'play'];
export const description = 'Kart atar: !at kirmizi 5 | !at joker mavi | !at 3';

export async function execute(message, { manager, args }) {
  const s = manager.get(message.channel.id);
  if (!s || s.game.status !== 'playing') throw new GameError('Bu kanalda devam eden bir oyun yok.');
  const player = s.game.getPlayer(message.author.id);
  if (!player) throw new GameError('Bu oyunda değilsin.');
  const { card, color, targetId } = parseCardArgs(args, player, s.game, message.mentions.users.first()?.id ?? null);
  if (card.isWild && !color) throw new GameError(`${card.kind === 'power' ? POWERS[card.value].name : 'Joker'} için renk de yaz. Örnek: \`!at joker mavi\`.`);
  if (card.isPower && POWERS[card.value].needsTarget && !targetId && s.game.players.length > 2) {
    throw new GameError('Bu kart için bir hedef etiketle. Örnek: `!at duello mavi @kisi`.');
  }
  const res = await s.play(message.author.id, card.id, { color, targetId });
  if (res.peek) {
    const view = await peekView(s, res.peek.targetId);
    if (view) {
      // Kanalda gizli mesaj olmadigi icin Rontgen sonucunu DM ile gonder
      await message.author.send({ flags: 1 << 15, components: view.components, files: view.files }).catch(() =>
        replyNotice(message, 'Röntgen', 'DM kutun kapalı, sonucu gönderemedim. Güç kartını butonlardan oynarsan sonuç sana gizli gösterilir.', 'warn')
      );
    }
  }
}
