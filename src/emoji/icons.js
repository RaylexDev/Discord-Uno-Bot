/**
 * Elle cizilmis SVG ikon seti (24x24 izgara). Hicbir Unicode emoji kullanilmaz.
 * Cizgi ikonlar currentColor ile boyanir, dolu ikonlar fill="currentColor" kullanir.
 */

const F = 'fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"';

export const ICONS = {
  play: `<path d="M8 5.2v13.6L19 12z" ${F}/>`,
  pause: `<rect x="6" y="5" width="4.2" height="14" rx="1.4" ${F}/><rect x="13.8" y="5" width="4.2" height="14" rx="1.4" ${F}/>`,
  stop: `<rect x="6" y="6" width="12" height="12" rx="2.6" ${F}/>`,
  check: `<path d="M5 12.8l4.6 4.6L19.2 7.6" stroke-width="3"/>`,
  cross: `<path d="M6.5 6.5l11 11M17.5 6.5l-11 11" stroke-width="3"/>`,
  plus: `<path d="M12 5v14M5 12h14" stroke-width="3"/>`,
  arrow_right: `<path d="M5 12h14M13 6l6 6-6 6" stroke-width="2.6"/>`,
  arrow_left: `<path d="M19 12H5M11 6l-6 6 6 6" stroke-width="2.6"/>`,
  refresh: `<path d="M20 12a8 8 0 0 1-13.9 5.4"/><path d="M4 12a8 8 0 0 1 13.9-5.4"/><path d="M18.5 3v4.2h-4.2"/><path d="M5.5 21v-4.2h4.2"/>`,
  skip: `<circle cx="12" cy="12" r="8.4" stroke-width="2.6"/><path d="M6.3 17.7L17.7 6.3" stroke-width="2.6"/>`,
  reverse: `<path d="M4 8.5h13.5M13.5 4.5l4 4-4 4" stroke-width="2.6"/><path d="M20 15.5H6.5M10.5 11.5l-4 4 4 4" stroke-width="2.6"/>`,
  draw2: `<rect x="3.5" y="8" width="11" height="13" rx="2.4"/><path d="M8 5h8.6a2.4 2.4 0 0 1 2.4 2.4V17"/><path d="M9 12.6v5.2M6.4 15.2h5.2" stroke-width="2.2"/>`,
  draw4: `<rect x="2.5" y="9.5" width="10" height="11.5" rx="2.2"/><path d="M6 6.6h8.4a2.2 2.2 0 0 1 2.2 2.2v9"/><path d="M9.5 3.4h8.3a2.2 2.2 0 0 1 2.2 2.2V14"/><path d="M7.5 13v4.6M5.2 15.3h4.6" stroke-width="2.2"/>`,
  card: `<rect x="5" y="2.8" width="14" height="18.4" rx="3.2"/><circle cx="12" cy="12" r="3.4" stroke-width="2.2"/>`,
  deck: `<rect x="4" y="7.5" width="11.5" height="14" rx="2.4"/><path d="M8.2 4h8.3A3.5 3.5 0 0 1 20 7.5V17"/><path d="M7.4 14.4h5.1" stroke-width="2.2"/>`,
  crown: `<path d="M3.4 8.2l4.6 3.9L12 4.6l4 7.5 4.6-3.9-1.7 10.6H5.1z" ${F}/><path d="M5.8 21h12.4" stroke-width="2.4"/>`,
  trophy: `<path d="M7.5 3.5h9v6a4.5 4.5 0 0 1-9 0z" ${F}/><path d="M7.5 5.5H4.6v1.2A3.3 3.3 0 0 0 7.9 10M16.5 5.5h2.9v1.2A3.3 3.3 0 0 1 16.1 10"/><path d="M12 14.2v3.4M8.2 20.5h7.6M9.4 17.6h5.2"/>`,
  star: `<path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17.1l-5.4 2.8 1.1-6.1-4.5-4.2 6.1-.8z" ${F}/>`,
  flame: `<path d="M12 2.8c.7 3.3 5.4 5.4 5.4 10.4a5.4 5.4 0 0 1-10.8 0c0-2.3 1-3.8 2.2-5 .3 1.5 1 2.3 1.8 2.6C10.2 8 10.6 5.2 12 2.8z" ${F}/>`,
  users: `<circle cx="9" cy="8.2" r="3.6"/><path d="M2.6 20a6.4 6.4 0 0 1 12.8 0"/><path d="M16 4.9a3.6 3.6 0 0 1 0 6.6M17.8 14.2a6.4 6.4 0 0 1 3.6 5.8"/>`,
  user: `<circle cx="12" cy="8" r="4"/><path d="M4.6 20.4a7.4 7.4 0 0 1 14.8 0"/>`,
  clock: `<circle cx="12" cy="12" r="9"/><path d="M12 6.6V12l3.6 2.2"/>`,
  hourglass: `<path d="M6.5 3h11M6.5 21h11M7.8 3c0 5 4.2 5.4 4.2 9s-4.2 4-4.2 9M16.2 3c0 5-4.2 5.4-4.2 9s4.2 4 4.2 9"/>`,
  bolt: `<path d="M13.4 2.5L4.8 13.6h6.2l-1 7.9 8.6-11.1h-6.2z" ${F}/>`,
  sparkles: `<path d="M10 3.5l1.8 5.2 5.2 1.8-5.2 1.8L10 17.5l-1.8-5.2L3 10.5l5.2-1.8z" ${F}/><path d="M18.4 3.4l.8 2.3 2.3.8-2.3.8-.8 2.3-.8-2.3-2.3-.8 2.3-.8z" ${F} stroke-width="1"/><path d="M18 15.6l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7z" ${F} stroke-width="1"/>`,
  target: `<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4" ${F}/>`,
  chart: `<rect x="3.8" y="12" width="4.2" height="8.2" rx="1.2" ${F}/><rect x="9.9" y="4" width="4.2" height="16.2" rx="1.2" ${F}/><rect x="16" y="8.6" width="4.2" height="11.6" rx="1.2" ${F}/>`,
  info: `<circle cx="12" cy="12" r="9.2"/><path d="M12 11v5.6" stroke-width="2.6"/><circle cx="12" cy="7.6" r="1.2" ${F}/>`,
  settings: `<path d="M4 7h8.5M17.5 7H20M4 12h2.5M11.5 12H20M4 17h9.5M18.5 17H20"/><circle cx="15" cy="7" r="2.4"/><circle cx="9" cy="12" r="2.4"/><circle cx="16" cy="17" r="2.4"/>`,
  door: `<path d="M10.5 4H6.4A2.4 2.4 0 0 0 4 6.4v11.2A2.4 2.4 0 0 0 6.4 20h4.1"/><path d="M15 8l4 4-4 4M19 12H9.5"/>`,
  book: `<path d="M5 4.6A1.6 1.6 0 0 1 6.6 3H18v15.5H7.4A2.4 2.4 0 0 0 5 20.9z"/><path d="M5 20.9A2.4 2.4 0 0 0 7.4 23H18v-4.5" transform="translate(0 -2)"/><path d="M9 7.5h5.5" stroke-width="2.2"/>`,
  lock: `<rect x="4.8" y="10.5" width="14.4" height="10" rx="2.6" ${F}/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>`,
  unlock: `<rect x="4.8" y="10.5" width="14.4" height="10" rx="2.6" ${F}/><path d="M8 10.5V8a4 4 0 0 1 7.6-1.7"/>`,
  bell: `<path d="M6 16.5v-5.2a6 6 0 0 1 12 0v5.2l1.6 2.2H4.4z" ${F}/><path d="M10 21.2a2.2 2.2 0 0 0 4 0"/>`,
  heart: `<path d="M12 20.4S3.6 15.2 3.6 8.9A4.6 4.6 0 0 1 12 6.6a4.6 4.6 0 0 1 8.4 2.3c0 6.300-8.4 11.500-8.4 11.500z" ${F}/>`,
  dice: `<rect x="3.6" y="3.6" width="16.8" height="16.8" rx="4"/><circle cx="8.6" cy="8.6" r="1.3" ${F}/><circle cx="15.4" cy="8.6" r="1.3" ${F}/><circle cx="12" cy="12" r="1.3" ${F}/><circle cx="8.6" cy="15.4" r="1.3" ${F}/><circle cx="15.4" cy="15.4" r="1.3" ${F}/>`,
  uno: `<path d="M4 9.6v4.8a1.2 1.2 0 0 0 1.2 1.2h2.6l7.2 4.2V4.2L7.8 8.4H5.2A1.2 1.2 0 0 0 4 9.6z" ${F}/><path d="M18.4 8.8a4.6 4.6 0 0 1 0 6.4" stroke-width="2.2"/>`,
  // Guc kartlari
  storm: `<path d="M7.2 15.6a4.3 4.3 0 0 1-.6-8.5 5.8 5.8 0 0 1 11 1.5 3.6 3.6 0 0 1-.4 7"/><path d="M12.6 11.4l-2.6 4.4h3.4l-2.2 4.6" stroke-width="2.2"/>`,
  revenge: `<path d="M9.500 5.500L4.500 10.500l5 5"/><path d="M4.500 10.500H14a5.500 5.500 0 0 1 0 11h-3"/>`,
  shield: `<path d="M12 2.8l7.4 2.8v5.700c0 4.600-3.100 8.100-7.400 9.900-4.300-1.800-7.400-5.300-7.400-9.900V5.600z" ${F}/><path d="M8.6 11.8l2.6 2.6 4.4-4.800" stroke="#0b1022" stroke-width="2.2" fill="none"/>`,
  peek: `<path d="M2.4 12S5.9 5.6 12 5.6 21.6 12 21.6 12 18.100 18.400 12 18.400 2.400 12 2.400 12z"/><circle cx="12" cy="12" r="3.200" ${F}/>`,
  swap: `<path d="M7 3.8L3.2 7.6 7 11.4M3.2 7.6h14.600"/><path d="M17 12.6l3.800 3.800-3.800 3.800M20.800 16.400H6.200"/>`,
  duel: `<path d="M20 4L5 19M4 4l15 15" stroke-width="2.400"/><path d="M6.500 12.500l5 5M12.500 17.500l5-5" stroke-width="2.400"/>`,
  harvest: `<path d="M12 3.500v10.500M7.600 10l4.400 4.400 4.400-4.400" stroke-width="2.600"/><path d="M4 15v3.400A2.600 2.600 0 0 0 6.600 21h10.800a2.600 2.600 0 0 0 2.600-2.600V15"/>`,
  double: `<path d="M5.500 5.500l6.500 6.500-6.500 6.500M12.500 5.500L19 12l-6.500 6.500" stroke-width="2.800"/>`
};

export function iconSVG(name, { size = 24, color = 'currentColor', sw = 2 } = {}) {
  const body = ICONS[name] ?? ICONS.card;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" style="color:${color};overflow:visible">${body}</svg>`;
}

export default ICONS;
