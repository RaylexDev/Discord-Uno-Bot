import { payload, notice, container, text, row, button } from './v2.js';

const quiet = { parse: [], repliedUser: false };

export const replyView = (message, view) => message.reply(payload(view.components, { files: view.files, mentions: quiet }));

export const replyNotice = (message, title, body, kind = 'info') => replyView(message, { components: [notice(title, body, { kind })], files: [] });

export const sendView = (channel, view) => channel.send(payload(view.components, { files: view.files, mentions: quiet }));

/** Kartlarim butonu iceren kucuk bilgi karti */
export const handPrompt = (message, body) =>
  replyView(message, { components: [container([text(body), row(button({ id: 'uno:hand', label: 'Kartlarımı Aç', style: 'primary', emoji: 'card' }))], 0x3d7bff)], files: [] });
