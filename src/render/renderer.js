/**
 * Puppeteer tabanli goruntu motoru.
 * - Tarayici bir kez acilir, sayfalar font/CSS yuklu halde sicak tutulur.
 * - Her render sadece #root icerigini degistirir (cok hizli).
 * - Es zamanli render sayisi sinirlidir, tarayici cokerse kendini toparlar.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer';
import { buildFontCSS } from './fonts.js';
import { BASE_CSS } from './theme.js';

const POOL_SIZE = 2;

let browser = null;
let launching = null;
let shellFile = null;
const idle = [];
const waiters = [];
let created = 0;

function writeShell() {
  if (shellFile && fs.existsSync(shellFile)) return shellFile;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'uno-render-'));
  shellFile = path.join(dir, 'shell.html');
  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><style>${buildFontCSS()}\n${BASE_CSS}</style></head><body><div id="root"></div></body></html>`;
  fs.writeFileSync(shellFile, html);
  return shellFile;
}

async function launch() {
  if (browser?.connected) return browser;
  if (launching) return launching;
  launching = (async () => {
    const opts = {
      headless: 'shell',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--font-render-hinting=none', '--hide-scrollbars'],
      defaultViewport: null
    };
    if (process.env.PUPPETEER_EXECUTABLE_PATH) opts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    browser = await puppeteer.launch(opts);
    browser.on('disconnected', () => {
      browser = null;
      idle.length = 0;
      created = 0;
    });
    return browser;
  })();
  try {
    return await launching;
  } finally {
    launching = null;
  }
}

async function newPage() {
  const b = await launch();
  const page = await b.newPage();
  await page.goto(pathToFileURL(writeShell()).href, { waitUntil: 'load' });
  created++;
  return page;
}

async function acquire() {
  if (idle.length) return idle.pop();
  if (created < POOL_SIZE) return newPage();
  return new Promise((resolve) => waiters.push(resolve));
}

function release(page, broken = false) {
  if (broken) {
    created = Math.max(0, created - 1);
    page.close().catch(() => {});
    if (waiters.length) newPage().then((p) => waiters.shift()?.(p)).catch(() => {});
    return;
  }
  const w = waiters.shift();
  if (w) w(page);
  else idle.push(page);
}

export async function initRenderer() {
  const page = await newPage();
  release(page);
}

export async function closeRenderer() {
  idle.length = 0;
  created = 0;
  if (browser) await browser.close().catch(() => {});
  browser = null;
}

/**
 * HTML govdesini goruntuye cevirir.
 * @param {string} html  #root icine yazilacak icerik (<style> icerebilir)
 * @param {{width:number,height:number,scale?:number,type?:'png'|'webp'|'jpeg',quality?:number,transparent?:boolean}} o
 */
export async function renderHTML(html, { width, height, scale = 2, type = 'png', quality = 92, transparent = false }) {
  const page = await acquire();
  let broken = false;
  try {
    await page.setViewport({ width: Math.ceil(width), height: Math.ceil(height), deviceScaleFactor: scale });
    await page.evaluate(
      async (h, t) => {
        document.body.style.background = t ? 'transparent' : '#05070f';
        document.getElementById('root').innerHTML = h;
        await document.fonts.ready;
        const imgs = Array.from(document.images);
        await Promise.all(imgs.map((i) => (i.decode ? i.decode().catch(() => {}) : null)));
      },
      html,
      transparent
    );
    const opts = { type, clip: { x: 0, y: 0, width, height }, omitBackground: transparent };
    if (type !== 'png') opts.quality = quality;
    const buf = await page.screenshot(opts);
    return Buffer.from(buf);
  } catch (err) {
    broken = true;
    throw err;
  } finally {
    release(page, broken);
  }
}

export default { renderHTML, initRenderer, closeRenderer };
