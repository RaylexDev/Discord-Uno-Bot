import { POWERS, COLOR_TR, COLOR_HEX, cardName } from '../game/cards.js';

/** Olaylari (events) Turkce cumleye ve ust serit ikonuna cevirir */
export function describe(game, events, { pre = '' } = {}) {
  const nm = (id) => game.getPlayer(id)?.name ?? 'Bir oyuncu';
  const parts = [];
  let icon = 'play';
  let color = null;
  for (const e of events) {
    switch (e.type) {
      case 'jump':
        parts.push(`${nm(e.playerId)} sırayı beklemeden araya girdi!`);
        break;
      case 'play': {
        const c = e.card;
        const wild = c.kind === 'wild' || c.kind === 'wild4' || c.kind === 'power';
        parts.push(`${nm(e.playerId)} ${cardName(c)} oynadı${wild ? `, renk ${COLOR_TR[e.color]}` : ''}.`);
        icon = c.kind === 'power' ? c.value : c.kind === 'wild4' ? 'draw4' : c.kind === 'wild' ? 'dice' : c.kind === 'number' ? 'card' : c.kind;
        color = c.kind === 'power' ? POWERS[c.value].color : COLOR_HEX[e.color];
        break;
      }
      case 'skip': parts.push(`${nm(e.playerId)} atlandı.`); break;
      case 'reverse': parts.push('Yön değişti.'); break;
      case 'stack': parts.push(`Ceza ${e.stack} kart oldu.`); break;
      case 'penalty': parts.push(`${nm(e.playerId)} ${e.count} kart çekti.`); break;
      case 'shield_block': parts.push(`${nm(e.playerId)} kalkanıyla cezadan korundu.`); break;
      case 'shield_on': parts.push(`${nm(e.playerId)} kalkan kazandı.`); break;
      case 'uno_open': parts.push(`${nm(e.playerId)} tek kart kaldı ve UNO demedi! Yakala!`); break;
      case 'uno_safe': parts.push(`${nm(e.playerId)} UNO!`); break;
      case 'uno': parts.push(`${nm(e.playerId)} UNO dedi!`); icon = 'uno'; color = '#ff4fa3'; break;
      case 'uno_ready': parts.push(`${nm(e.playerId)} UNO için hazırlandı.`); icon = 'uno'; color = '#ff4fa3'; break;
      case 'caught':
        parts.push(`${nm(e.byId)}, ${nm(e.playerId)} oyuncusunu yakaladı: ${e.count} kart ceza!`);
        icon = 'uno'; color = '#ff3d55';
        break;
      case 'challenge':
        parts.push(e.success
          ? `${nm(e.challengerId)} itiraz etti ve haklı çıktı: ${nm(e.offenderId)} ${e.count} kart çekti.`
          : `${nm(e.challengerId)} itiraz etti ama haksızdı: ${e.count} kart çekti.`);
        icon = 'target'; color = '#ffc61a';
        break;
      case 'peek': parts.push(`${nm(e.playerId)}, ${nm(e.targetId)} oyuncusunun eline baktı.`); break;
      case 'swap': parts.push('Eller sıradaki oyuncuya kaydı.'); break;
      case 'duel': parts.push(`${nm(e.playerId)} ve ${nm(e.targetId)} ellerini değiştirdi.`); break;
      case 'harvest': parts.push(`${nm(e.playerId)} ${e.total} kart topladı.`); break;
      case 'double': parts.push(`${nm(e.playerId)} yine oynayacak.`); break;
      case 'draw': parts.push(`${nm(e.playerId)} kart çekti.`); icon = 'deck'; break;
      case 'pass': parts.push(`${nm(e.playerId)} pas geçti.`); icon = 'arrow_right'; break;
      case 'empty_deck': parts.push('Deste tükendi, sıra geçti.'); break;
      case 'forfeit': parts.push(`${e.name} oyundan ayrıldı.`); icon = 'door'; break;
      case 'win': icon = 'trophy'; color = '#ffd166'; parts.push(`${nm(e.playerId)} kazandı!`); break;
      default: break;
    }
  }
  const t = (pre ? pre + ' ' : '') + parts.join(' ');
  return { text: t.trim() || 'Sıra devam ediyor.', icon, color };
}
