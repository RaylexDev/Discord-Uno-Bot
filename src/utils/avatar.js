const cache = new Map();

/** Avatar URL'sini data URI'ye cevirir (Puppeteer'in agdan bagimsiz cizmesi icin). Basarisizsa null. */
export async function avatarData(url) {
  if (!url) return null;
  if (cache.has(url)) return cache.get(url);
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) throw new Error(String(res.status));
    const type = res.headers.get('content-type') || 'image/png';
    const buf = Buffer.from(await res.arrayBuffer());
    const data = `data:${type};base64,${buf.toString('base64')}`;
    if (cache.size > 300) cache.delete(cache.keys().next().value);
    cache.set(url, data);
    return data;
  } catch {
    cache.set(url, null);
    return null;
  }
}

/** Oyuncu listesindeki avatarUrl alanlarini data URI ile degistirir */
export async function withAvatars(list) {
  return Promise.all(list.map(async (p) => ({ ...p, avatarUrl: await avatarData(p.avatarUrl) })));
}
