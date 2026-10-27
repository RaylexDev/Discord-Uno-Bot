import fs from 'node:fs/promises';
import path from 'node:path';
import { levelOf } from '../render/scenes.js';

const FILE = path.join(process.cwd(), 'data', 'stats.json');

const blank = (name = '') => ({
  name, games: 0, wins: 0, losses: 0, streak: 0, bestStreak: 0, cardsPlayed: 0, powersUsed: 0,
  cardsDrawn: 0, unoCalls: 0, caught: 0, fastestWin: 0, points: 0, xp: 0, avatarUrl: null, last: 0
});

class Stats {
  constructor() {
    this.users = {};
    this.timer = null;
  }

  async load() {
    try {
      this.users = JSON.parse(await fs.readFile(FILE, 'utf8'));
    } catch (e) {
      if (e.code !== 'ENOENT') console.error('İstatistik okunamadı:', e.message);
    }
  }

  /** Yazmayi biriktirir, gecici dosya + rename ile guvenli kaydeder */
  save(now = false) {
    if (this.timer && !now) return;
    const run = async () => {
      this.timer = null;
      try {
        await fs.mkdir(path.dirname(FILE), { recursive: true });
        const tmp = FILE + '.tmp';
        await fs.writeFile(tmp, JSON.stringify(this.users));
        await fs.rename(tmp, FILE);
      } catch (e) {
        console.error('İstatistik kaydedilemedi:', e.message);
      }
    };
    if (now) return run();
    this.timer = setTimeout(run, 2000);
  }

  get(id) {
    return this.users[id] ?? null;
  }

  ensure(id, name, avatarUrl) {
    const u = (this.users[id] ??= blank(name));
    if (name) u.name = name;
    if (avatarUrl) u.avatarUrl = avatarUrl;
    return u;
  }

  /** Oyun bitince cagrilir: game.result ve oyuncu sayaclari kullanilir */
  record(game) {
    const r = game.result;
    for (const p of game.players) {
      const u = this.ensure(p.id, p.name, p.avatarUrl);
      const won = p.id === r.winnerId;
      u.games++;
      u.cardsPlayed += p.played;
      u.powersUsed += p.powersUsed;
      u.cardsDrawn += p.drawn;
      u.unoCalls += p.unoCount;
      u.caught += p.caught;
      u.last = Date.now();
      if (won) {
        u.wins++;
        u.streak++;
        u.bestStreak = Math.max(u.bestStreak, u.streak);
        u.points += r.points;
        if (r.reason === 'normal') u.fastestWin = u.fastestWin ? Math.min(u.fastestWin, r.duration) : r.duration;
      } else {
        u.losses++;
        u.streak = 0;
      }
      u.xp += 10 + (won ? 40 : 0) + Math.min(30, p.played);
    }
    this.save();
  }

  leaderboard(limit = 10) {
    return Object.entries(this.users)
      .filter(([, u]) => u.games > 0)
      .map(([id, u]) => ({ id, name: u.name, avatarUrl: u.avatarUrl, wins: u.wins, games: u.games, rate: Math.round((u.wins / u.games) * 100) }))
      .sort((a, b) => b.wins - a.wins || b.rate - a.rate || b.games - a.games)
      .slice(0, limit);
  }

  rank(id) {
    const all = this.leaderboard(10000);
    const i = all.findIndex((e) => e.id === id);
    return i === -1 ? null : i + 1;
  }
}

export { levelOf };
export default new Stats();
