// Test icin sahte avatar ve oyun verisi
import { Card } from '../src/game/Card.js';
import { UnoGame } from '../src/game/UnoGame.js';

const GRADS = [['#ff6a7a', '#8b5cff'], ['#3dd9ff', '#3d7bff'], ['#5df0a4', '#12a5b8'], ['#ffd166', '#ff5d3d'], ['#ff4fa3', '#8b5cff'], ['#9be04a', '#1fcf7c']];
export function fakeAvatar(i) {
  const [a, b] = GRADS[i % GRADS.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="128" height="128" fill="url(#g)"/><circle cx="64" cy="50" r="22" fill="#fff" opacity=".85"/><path d="M20 128c0-30 20-48 44-48s44 18 44 48z" fill="#fff" opacity=".85"/></svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}
export const NAMES = ['Ayşe', 'Mehmet', 'Zeynep', 'Can', 'Elif Naz', 'Burak', 'Şeyma', 'Ömer Faruk', 'Gülşen', 'İbrahim'];
export function makeGame(n = 6, { avatars = true } = {}) {
  const g = new UnoGame('ch', 'u0');
  for (let i = 0; i < n; i++) g.addPlayer({ id: `u${i}`, name: NAMES[i], avatarUrl: avatars && i % 3 !== 2 ? fakeAvatar(i) : null });
  g.start();
  return g;
}
