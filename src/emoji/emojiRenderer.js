import { renderHTML } from '../render/renderer.js';
import { iconSVG } from './icons.js';
import { quadrants } from '../render/cardArt.js';

const S = 128;

function html(def) {
  if (def.type === 'gem') {
    const c = def.color;
    return `<div style="width:${S}px;height:${S}px;display:flex;align-items:center;justify-content:center">
      <div style="width:108px;height:108px;border-radius:50%;background:radial-gradient(circle at 32% 26%,#fff 0%,${c} 36%,${c} 70%,#00000055 130%);box-shadow:0 5px 10px rgba(0,0,0,.35),inset 0 -8px 14px rgba(0,0,0,.25),inset 0 3px 0 rgba(255,255,255,.5)"></div></div>`;
  }
  if (def.type === 'wild') {
    return `<div style="width:${S}px;height:${S}px;display:flex;align-items:center;justify-content:center;position:relative">
      <svg width="108" height="108" viewBox="0 0 108 108" style="filter:drop-shadow(0 5px 6px rgba(0,0,0,.35))">
        <defs><clipPath id="k"><circle cx="54" cy="54" r="52"/></clipPath><radialGradient id="h" cx=".3" cy=".25" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
        <g clip-path="url(#k)">${quadrants(54, 54, 60)}<circle cx="54" cy="54" r="52" fill="url(#h)"/></g>
        <circle cx="54" cy="54" r="52" fill="none" stroke="#fff" stroke-width="4"/></svg></div>`;
  }
  return `<div style="width:${S}px;height:${S}px;position:relative">
    <div style="position:absolute;inset:8px;border-radius:36px;background:linear-gradient(160deg,${def.from},${def.to});box-shadow:0 5px 10px rgba(0,0,0,.38),inset 0 3px 0 rgba(255,255,255,.55),inset 0 -7px 12px rgba(0,0,0,.22)"></div>
    <div style="position:absolute;left:18px;right:18px;top:13px;height:44px;border-radius:30px 30px 44px 44px;background:linear-gradient(rgba(255,255,255,.36),rgba(255,255,255,0))"></div>
    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 3px 3px rgba(0,0,0,.35))">${iconSVG(def.icon, { size: 70, color: '#fff', sw: 2.2 })}</div></div>`;
}

export function renderEmoji(def) {
  return renderHTML(html(def), { width: S, height: S, scale: 1, type: 'png', transparent: true });
}
