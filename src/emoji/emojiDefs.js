/**
 * Uygulama emojileri: tamami Puppeteer ile cizilir, Unicode emoji yoktur.
 * type: badge (renkli yuvarlak kare + beyaz ikon) | gem (renkli kure) | wild (dort renkli kure)
 */
const b = (icon, from, to) => ({ type: 'badge', icon, from, to });

export const EMOJI_PREFIX = 'uno_';

export const emojiDefs = {
  red: { type: 'gem', color: '#ff3d55' },
  yellow: { type: 'gem', color: '#ffc61a' },
  green: { type: 'gem', color: '#1fcf7c' },
  blue: { type: 'gem', color: '#3d7bff' },
  wild: { type: 'wild' },
  skip: b('skip', '#ffa94d', '#e8590c'),
  reverse: b('reverse', '#b197fc', '#7048e8'),
  draw2: b('draw2', '#ff6b81', '#d6336c'),
  draw4: b('draw4', '#a78bfa', '#4c1d95'),
  card: b('card', '#7c8cff', '#3b46c4'),
  deck: b('deck', '#6c7ae0', '#2c3494'),
  storm: b('storm', '#a78bfa', '#6d28d9'),
  revenge: b('revenge', '#ff8a5c', '#d9420b'),
  shield: b('shield', '#2dd4bf', '#0f8f86'),
  peek: b('peek', '#6cb8ff', '#1c6fd1'),
  swap: b('swap', '#ff7ac0', '#c2255c'),
  duel: b('duel', '#ffb347', '#d97706'),
  harvest: b('harvest', '#b5e655', '#5c940d'),
  double: b('double', '#ffe066', '#e0a100'),
  play: b('play', '#51e08f', '#14924a'),
  stop: b('stop', '#ff6b6b', '#c92a2a'),
  uno: b('uno', '#ff6b81', '#e03131'),
  crown: b('crown', '#ffd95a', '#e8a100'),
  trophy: b('trophy', '#ffd95a', '#e8a100'),
  star: b('star', '#ffe066', '#f59f00'),
  flame: b('flame', '#ff9f43', '#e03131'),
  users: b('users', '#74a8ff', '#2f5fd0'),
  user: b('user', '#8fa2cf', '#4a5a8f'),
  clock: b('clock', '#9aa7c7', '#505c80'),
  hourglass: b('hourglass', '#ffc266', '#d9822b'),
  bolt: b('bolt', '#ffe066', '#f08c00'),
  sparkles: b('sparkles', '#c4a3ff', '#d6336c'),
  target: b('target', '#ff6b6b', '#c92a2a'),
  chart: b('chart', '#6cb8ff', '#1c6fd1'),
  check: b('check', '#51e08f', '#14924a'),
  cross: b('cross', '#ff6b6b', '#c92a2a'),
  plus: b('plus', '#74a8ff', '#2f5fd0'),
  arrow_right: b('arrow_right', '#74a8ff', '#2f5fd0'),
  arrow_left: b('arrow_left', '#74a8ff', '#2f5fd0'),
  refresh: b('refresh', '#4dd7f0', '#0c8fb0'),
  info: b('info', '#6cb8ff', '#1c6fd1'),
  settings: b('settings', '#9aa7c7', '#505c80'),
  door: b('door', '#9aa7c7', '#505c80'),
  book: b('book', '#b197fc', '#6741d9'),
  lock: b('lock', '#9aa7c7', '#505c80'),
  unlock: b('unlock', '#51e08f', '#14924a'),
  bell: b('bell', '#ffd95a', '#e8a100'),
  heart: b('heart', '#ff7a93', '#d6336c'),
  dice: b('dice', '#7c8cff', '#3b46c4')
};

export default emojiDefs;
