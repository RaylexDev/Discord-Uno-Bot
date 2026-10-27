import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'commands');

export const fold = (s) =>
  String(s).toLocaleLowerCase('tr').replace(/ç/g, 'c').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u');

/** src/commands altindaki her .js dosyasini komut olarak yukler (ad + takma adlar) */
export async function loadCommands() {
  const commands = new Map();
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.js'))) {
    const mod = await import(pathToFileURL(path.join(dir, f)).href);
    if (!mod.name || typeof mod.execute !== 'function') continue;
    commands.set(fold(mod.name), mod);
    for (const a of mod.aliases ?? []) commands.set(fold(a), mod);
  }
  return commands;
}
