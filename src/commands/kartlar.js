import { helpView } from '../ui/views.js';
import { replyView } from '../ui/reply.js';

export const name = 'kartlar';
export const aliases = ['guc', 'powers'];
export const description = 'Güç kartlarını görsel olarak gösterir';

export async function execute(message, { config }) {
  await replyView(message, await helpView('guc', config.prefix));
}
