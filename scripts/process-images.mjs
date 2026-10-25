/**
 * Builds web images from the originals in assets/originals (originals are never modified).
 *
 *   npm run images
 *
 * Banners  -> public/images/banners/<name>-{768,1280,1983}.webp + <name>.png (original, fallback)
 * Products -> public/images/products/<slug>-{400,800,1200}.webp + <slug>-800.jpg (fallback)
 * Cutouts  -> public/images/cutouts/<slug>-{480,960}.webp (transparent, for the home hero)
 * Logo     -> public/images/logo/durani-logo-{160,320}.{webp,png} (round badge, transparent corners)
 *             + public/favicon-32.png and public/apple-touch-icon.png
 *
 * Product listing images are composed on a square white canvas with a soft
 * contact shadow. The source is the background-removed cutout in
 * assets/processed/cutouts/<slug>.png when present; otherwise the script falls
 * back to a plain crop of the original photo (household background kept) and
 * reports it so the image can be edited properly.
 */
import { copyFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const originals = path.join(root, 'assets/originals');
const cutouts = path.join(root, 'assets/processed/cutouts');
const outBanners = path.join(root, 'public/images/banners');
const outProducts = path.join(root, 'public/images/products');
const outCutouts = path.join(root, 'public/images/cutouts');
const outLogo = path.join(root, 'public/images/logo');

const banners = [
  'durani-serum-banner',
  'durani-face-wash-banner',
  'durani-beauty-cream-banner',
  'durani-rice-face-wash-banner',
];
const bannerWidths = [768, 1280, 1983];

/**
 * `crop` isolates the product in the original 960x1280 photo (used for the
 * fallback and as the input region for background removal).
 */
export const productSources = [
  {
    slug: 'durani-skin-whitening-serum',
    original: 'durani-skin-whitening-serum-box-original.jpg',
    crop: { left: 150, top: 330, width: 500, height: 810 },
    // Flat box: the model matte bites into its white faces, so mask by its measured corners instead.
    polygon: [[185, 374], [605, 365], [616, 1106], [207, 1112]],
  },
  {
    slug: 'durani-skin-brightening-face-wash',
    original: 'durani-skin-brightening-face-wash-original.jpg',
    crop: { left: 180, top: 250, width: 540, height: 810 },
  },
  {
    slug: 'durani-rice-face-wash',
    original: 'durani-rice-face-wash-original.jpg',
    crop: { left: 190, top: 250, width: 470, height: 790 },
  },
  {
    slug: 'durani-beauty-cream',
    original: 'durani-beauty-cream-original.jpg',
    crop: { left: 128, top: 350, width: 572, height: 600 },
    polygon: [[139, 409], [651, 387], [663, 894], [169, 919]],
  },
];
const productWidths = [400, 800, 1200];
/** Heights of the transparent hero cutouts. */
const cutoutHeights = [480, 960];
const CANVAS = 1200;
/** Products are scaled so their area is similar, within these maximums. */
const MAX_W = 760;
const MAX_H = 900;
const TARGET_AREA = 560_000;

const exists = (p) =>
  access(p).then(
    () => true,
    () => false,
  );

async function processBanners() {
  await mkdir(outBanners, { recursive: true });
  for (const name of banners) {
    const src = path.join(originals, 'banners', `${name}.png`);
    await copyFile(src, path.join(outBanners, `${name}.png`));
    for (const w of bannerWidths) {
      await sharp(src)
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: 82, effort: 6 })
        .toFile(path.join(outBanners, `${name}-${w}.webp`));
    }
    console.log(`banner  ${name}`);
  }
}

/** Soft elliptical contact shadow as a PNG buffer. */
async function shadow(width, height) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs><radialGradient id="g" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#3a2614" stop-opacity="0.26"/>
      <stop offset="55%" stop-color="#3a2614" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#3a2614" stop-opacity="0"/>
    </radialGradient></defs>
    <ellipse cx="${width / 2}" cy="${height / 2}" rx="${width / 2}" ry="${height / 2}" fill="url(#g)"/>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/** Square min (erode) or max (dilate) filter on a 0/1 mask, separable. */
function morph(mask, w, h, r, op) {
  const pick = op === 'erode' ? Math.min : Math.max;
  const tmp = new Uint8Array(mask.length);
  const out = new Uint8Array(mask.length);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let v = op === 'erode' ? 1 : 0;
      for (let k = Math.max(0, x - r); k <= Math.min(w - 1, x + r); k++) v = pick(v, mask[y * w + k]);
      tmp[y * w + x] = v;
    }
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let v = op === 'erode' ? 1 : 0;
      for (let k = Math.max(0, y - r); k <= Math.min(h - 1, y + r); k++) v = pick(v, tmp[k * w + x]);
      out[y * w + x] = v;
    }
  return out;
}

/**
 * Turns the model's soft matte into a clean solid mask: binarize, fill
 * interior holes (the model leaves white packaging partly transparent),
 * open to strip thin threads of background, then feather by ~1px.
 * Colour comes from the untouched original photo; only alpha is derived.
 */
async function refinedSubject(cutoutPath, originalPath, crop) {
  const { data: matte, info } = await sharp(cutoutPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const n = w * h;
  let mask = new Uint8Array(n);
  for (let i = 0; i < n; i++) mask[i] = matte[i * 4 + 3] > 110 ? 1 : 0;

  // Fill holes: anything transparent not connected to the border becomes solid.
  const outside = new Uint8Array(n);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  while (stack.length) {
    const i = stack.pop();
    if (outside[i] || mask[i]) continue;
    outside[i] = 1;
    const x = i % w;
    if (x > 0) stack.push(i - 1);
    if (x < w - 1) stack.push(i + 1);
    if (i >= w) stack.push(i - w);
    if (i < n - w) stack.push(i + w);
  }
  for (let i = 0; i < n; i++) mask[i] = outside[i] ? 0 : 1;

  // Opening removes lace threads; the extra erosion pixel avoids a background halo.
  mask = morph(morph(mask, w, h, 5, 'erode'), w, h, 4, 'dilate');

  const alpha = await sharp(Buffer.from(mask.map((v) => v * 255)), { raw: { width: w, height: h, channels: 1 } })
    .blur(0.8)
    .extractChannel(0)
    .raw()
    .toBuffer();
  return withAlpha(originalPath, crop, alpha);
}

/** Masks the original photo with a polygon (original-photo coordinates). */
async function polygonSubject(originalPath, crop, polygon) {
  const points = polygon.map(([x, y]) => `${x - crop.left},${y - crop.top}`).join(' ');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${crop.width}" height="${crop.height}">
    <polygon points="${points}" fill="#fff"/></svg>`;
  const alpha = await sharp(Buffer.from(svg)).ensureAlpha().extractChannel(3).blur(0.6).raw().toBuffer();
  return withAlpha(originalPath, crop, alpha);
}

/** Original photo pixels (crop) + the given alpha channel, as a PNG. */
async function withAlpha(originalPath, crop, alpha) {
  const n = crop.width * crop.height;
  const rgb = await sharp(originalPath).extract(crop).removeAlpha().raw().toBuffer();
  if (alpha.length !== n || rgb.length !== n * 3) throw new Error(`Unexpected buffer size for ${originalPath}`);
  const rgba = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) {
    rgba[i * 4] = rgb[i * 3];
    rgba[i * 4 + 1] = rgb[i * 3 + 1];
    rgba[i * 4 + 2] = rgb[i * 3 + 2];
    rgba[i * 4 + 3] = alpha[i];
  }
  return sharp(rgba, { raw: { width: crop.width, height: crop.height, channels: 4 } }).png().toBuffer();
}

async function processProduct({ slug, original, crop, polygon }) {
  const cutoutPath = path.join(cutouts, `${slug}.png`);
  const originalPath = path.join(originals, 'product-photos', original);
  const hasCutout = polygon !== undefined || (await exists(cutoutPath));

  let subject;
  if (hasCutout) {
    const refined = polygon
      ? await polygonSubject(originalPath, crop, polygon)
      : await refinedSubject(cutoutPath, originalPath, crop);
    // Trim transparent margins so sizing is based on the product itself.
    subject = await sharp(refined).trim({ threshold: 1 }).png().toBuffer();
    await mkdir(outCutouts, { recursive: true });
    for (const height of cutoutHeights) {
      await sharp(subject)
        .resize({ height, kernel: 'lanczos3' })
        .webp({ quality: 86, alphaQuality: 90, effort: 6 })
        .toFile(path.join(outCutouts, `${slug}-${height}.webp`));
    }
  } else {
    subject = await sharp(originalPath).extract(crop).png().toBuffer();
  }

  const meta = await sharp(subject).metadata();
  const scale = Math.min(MAX_W / meta.width, MAX_H / meta.height, Math.sqrt(TARGET_AREA / (meta.width * meta.height)));
  const w = Math.round(meta.width * scale);
  const h = Math.round(meta.height * scale);
  const resized = await sharp(subject).resize(w, h, { kernel: 'lanczos3' }).png().toBuffer();

  // Centre the product slightly above middle, leaving room for the shadow.
  const left = Math.round((CANVAS - w) / 2);
  const top = Math.round((CANVAS - h) / 2 - 20);
  const layers = [];
  if (hasCutout) {
    const sw = Math.round(w * 1.15);
    const sh = Math.max(40, Math.round(w * 0.12));
    layers.push({ input: await shadow(sw, sh), left: Math.round((CANVAS - sw) / 2), top: Math.round(top + h - sh * 0.55) });
  }
  layers.push({ input: resized, left, top });

  const composed = await sharp({
    create: { width: CANVAS, height: CANVAS, channels: 3, background: '#ffffff' },
  })
    .composite(layers)
    .png()
    .toBuffer();

  await mkdir(outProducts, { recursive: true });
  for (const size of productWidths) {
    await sharp(composed)
      .resize(size, size)
      .webp({ quality: 85, effort: 6 })
      .toFile(path.join(outProducts, `${slug}-${size}.webp`));
  }
  await sharp(composed).resize(800, 800).jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(outProducts, `${slug}-800.jpg`));

  console.log(`product ${slug} ${hasCutout ? '(background removed)' : '(FALLBACK: original crop — needs editing)'}`);
  return hasCutout;
}

/**
 * The official logo is a round badge on a white square. Mask it to a circle so
 * it sits cleanly on any background. Replace assets/originals/logo/durani-logo.jpg
 * with a larger file for sharper output; sizes are capped at the source size.
 */
async function processLogo() {
  const src = path.join(originals, 'logo', 'durani-logo.jpg');
  if (!(await exists(src))) return;
  const { width } = await sharp(src).metadata();
  const circle = (size) =>
      Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 0.5}"/></svg>`);
  const round = (size) =>
    sharp(src)
      .resize(size, size, { kernel: 'lanczos3' })
      .ensureAlpha()
      .composite([{ input: circle(size), blend: 'dest-in' }]);
  await mkdir(outLogo, { recursive: true });
  for (const size of [160, 320]) {
    const s = Math.min(size, width);
    await round(s).webp({ quality: 90, alphaQuality: 100 }).toFile(path.join(outLogo, `durani-logo-${size}.webp`));
    await round(s).png().toFile(path.join(outLogo, `durani-logo-${size}.png`));
  }
  await round(32).png().toFile(path.join(root, 'public/favicon-32.png'));
  // iOS draws its own rounded mask, so the touch icon keeps the white square.
  await sharp(src).resize(180, 180, { kernel: 'lanczos3' }).flatten({ background: '#ffffff' }).png().toFile(path.join(root, 'public/apple-touch-icon.png'));
  console.log(`logo    durani-logo (${width}px source)`);
}

await processBanners();
await processLogo();
const missing = [];
for (const p of productSources) {
  if (!(await processProduct(p))) missing.push(p.slug);
}
if (missing.length) {
  console.warn(`\nThese product images use the original background and need editing:\n  ${missing.join('\n  ')}`);
}
