import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);

// fontsource alt kumeleri: latin-ext Turkce harfler (ş, ğ, İ) icin zorunludur.
const RANGES = {
  latin:
    'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
  'latin-ext':
    'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF'
};

const WANTED = [
  ['poppins', 'Poppins', [500, 600, 700, 800, 900], 'normal'],
  ['poppins', 'Poppins', [700, 800, 900], 'italic'],
  ['inter', 'Inter', [400, 500, 600, 700, 800], 'normal']
];

function packageDir(name) {
  try {
    return path.dirname(require.resolve(`@fontsource/${name}/package.json`));
  } catch {
    return null;
  }
}

/** @font-face kurallarini dosya URL'leriyle uretir (yoksa sistem fontlarina duser) */
export function buildFontCSS() {
  const faces = [];
  for (const [pkg, family, weights, style] of WANTED) {
    const dir = packageDir(pkg);
    if (!dir) continue;
    for (const weight of weights) {
      for (const [subset, range] of Object.entries(RANGES)) {
        const file = path.join(dir, 'files', `${pkg}-${subset}-${weight}-${style}.woff2`);
        if (!fs.existsSync(file)) continue;
        faces.push(
          `@font-face{font-family:'${family}';font-style:${style};font-weight:${weight};font-display:block;` +
            `src:url('${pathToFileURL(file).href}') format('woff2');unicode-range:${range};}`
        );
      }
    }
  }
  return faces.join('\n');
}

export default buildFontCSS;
