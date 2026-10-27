import fs from 'node:fs';
import path from 'node:path';

const defaults = { token: '', prefix: '!', ownerId: '', autoSyncEmojis: true, turnSeconds: 45 };

let file = {};
try {
  file = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'config.json'), 'utf8'));
} catch (e) {
  if (e.code !== 'ENOENT') console.error('config.json okunamadı:', e.message);
}

export const CONFIG = {
  ...defaults,
  ...file,
  // Ortam değişkeni config.json'dan önceliklidir (token'ı dosyaya yazmamak için önerilir)
  token: process.env.DISCORD_TOKEN || file.token || ''
};

export default CONFIG;
