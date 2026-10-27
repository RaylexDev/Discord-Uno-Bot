/**
 * UNO Discord Botu
 * Başlatma: npm start   (token: DISCORD_TOKEN ortam değişkeni ya da config.json)
 */
import { Client, GatewayIntentBits, ActivityType, Events } from 'discord.js';
import { CONFIG } from './src/config.js';
import { GameManager } from './src/game/GameManager.js';
import { EmojiManager } from './src/emoji/emojiManager.js';
import { loadCommands } from './src/handler/commandLoader.js';
import { createMessageHandler } from './src/handler/messageHandler.js';
import { createInteractionHandler } from './src/handler/interactionHandler.js';
import { initRenderer, closeRenderer } from './src/render/renderer.js';
import { env } from './src/ui/v2.js';
import stats from './src/utils/stats.js';

if (!CONFIG.token) {
  console.error('Token bulunamadı. DISCORD_TOKEN ortam değişkenini ya da config.json içindeki "token" alanını doldur.');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const manager = new GameManager();
const emoji = new EmojiManager(client);
env.emoji = emoji;
const ctx = { client, manager, emoji, config: CONFIG, commands: new Map() };

client.once(Events.ClientReady, async () => {
  console.log(`${client.user.tag} hazır, ${client.guilds.cache.size} sunucuda.`);
  client.user.setActivity(`${CONFIG.prefix}uno | UNO oyna`, { type: ActivityType.Playing });

  await stats.load();
  await emoji.loadCustom();
  try {
    await emoji.loadExisting();
  } catch (e) {
    console.error('Mevcut emojiler okunamadı:', e.message);
  }
  try {
    await initRenderer();
    console.log('Görsel motoru hazır.');
  } catch (e) {
    console.error('Görsel motoru başlatılamadı (Chromium eksik olabilir):', e.message);
  }
  ctx.commands = await loadCommands();
  console.log(`${new Set(ctx.commands.values()).size} komut yüklendi.`);

  if (CONFIG.autoSyncEmojis) {
    emoji
      .sync({ onProgress: (k, r) => console.log(`Emoji yüklendi: ${k} (${r.created})`) })
      .then((r) => r && console.log(`Emoji senkronu bitti: ${r.existing} mevcut, ${r.created} yeni, ${r.failed} hatalı.`))
      .catch((e) => console.error('Emoji senkronu hatası:', e.message));
  }
});

client.on(Events.MessageCreate, createMessageHandler(ctx));
client.on(Events.InteractionCreate, createInteractionHandler(ctx));

async function shutdown() {
  console.log('Kapatılıyor...');
  manager.shutdown();
  await stats.save(true);
  await closeRenderer();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('unhandledRejection', (r) => console.error('Yakalanmayan söz reddi:', r));
process.on('uncaughtException', (e) => console.error('Yakalanmayan hata:', e));

client.login(CONFIG.token);
