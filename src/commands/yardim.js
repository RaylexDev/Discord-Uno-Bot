import { helpView } from '../ui/views.js';
import { replyView } from '../ui/reply.js';

export const name = 'yardim';
export const aliases = ['help', 'komutlar', 'yardım'];
export const description = 'Yardım menüsünü gösterir';

export async function execute(message, { config }) {
  await replyView(message, await helpView('genel', config.prefix));
}
