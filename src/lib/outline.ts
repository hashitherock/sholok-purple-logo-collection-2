import opentype from "opentype.js";
import { BRAND_HEX, WORD, fontUrl, type LogoVariant } from "./logos";

const cache = new Map<string, Promise<opentype.Font>>();

function loadFont(l: LogoVariant) {
  const url = fontUrl(l);
  let p = cache.get(url);
  if (!p) {
    p = fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`Font ${l.family} failed to load`);
        return r.arrayBuffer();
      })
      .then((b) => opentype.parse(b));
    p.catch(() => cache.delete(url));
    cache.set(url, p);
  }
  return p;
}

export interface Outlined {
  d: string;
  viewBox: string;
  width: number;
  height: number;
}

const SIZE = 200;
const f = (n: number) => Math.round(n * 100) / 100;
let _grow: ((a: number, b: number, c: number, d: number) => void) | null = null;
const rect = (x: number, y: number, w: number, h: number) =>
  (_grow?.(x, y, x + w, y + h), `M${f(x)} ${f(y)}H${f(x + w)}V${f(y + h)}H${f(x)}Z`);
// circle; ccw=true reverses winding so nonzero fill punches a hole
const circle = (cx: number, cy: number, r: number, ccw = false) => {
  const s = ccw ? 0 : 1;
  _grow?.(cx - r, cy - r, cx + r, cy + r);
  return `M${f(cx - r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 ${s} ${f(cx + r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 ${s} ${f(cx - r)} ${f(cy)}Z`;
};

/** Convert the variant into pure vector path data (no <text>). */
export async function outlineLogo(l: LogoVariant): Promise<Outlined> {
  const font = await loadFont(l);
  const scale = SIZE / font.unitsPerEm;
  const capH = ((font.tables.os2 as { sCapHeight?: number })?.sCapHeight || font.unitsPerEm * 0.7) * scale;
  const track = l.tracking * SIZE;
  const mods = new Set(l.mods ?? []);
  const sx = l.scaleX ?? 1;
  const skew = Math.tan(((l.skew ?? 0) * Math.PI) / 180);
  const stroke = Math.max(4, capH * (l.weight >= 700 ? 0.14 : l.weight >= 500 ? 0.1 : 0.07));

  const glyphs = [...WORD].map((c) => font.charToGlyph(c));
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  const grow = (x1: number, y1: number, x2: number, y2: number) => {
    // apply matrix(sx 0 -skew 1) to corners
    for (const [px, py] of [[x1, y1], [x2, y1], [x1, y2], [x2, y2]]) {
      const tx = sx * px - skew * py;
      minX = Math.min(minX, tx); maxX = Math.max(maxX, tx);
      minY = Math.min(minY, py); maxY = Math.max(maxY, py);
    }
  };
  _grow = grow;
  const parts: string[] = [];
  const boxes: { x: number; w: number }[] = [];
  let x = 0;
  glyphs.forEach((g, i) => {
    const adv = (g.advanceWidth ?? 0) * scale;
    const ch = WORD[i];
    const gp = g.getPath(x, 0, SIZE);
    const bb = gp.getBoundingBox();
    const gx1 = isFinite(bb.x1) ? bb.x1 : x;
    const gw = isFinite(bb.x1) ? bb.x2 - bb.x1 : adv;
    if (ch === "O" && mods.has("ring-o")) {
      const r = capH / 2;
      const cx = gx1 + gw / 2;
      parts.push(circle(cx, -r, r) + circle(cx, -r, r - stroke, true));
    } else {
      if (isFinite(bb.x1)) grow(bb.x1, bb.y1, bb.x2, bb.y2);
      parts.push(gp.toPathData(2));
    }
    if (ch === "O" && mods.has("dot-o")) parts.push(circle(gx1 + gw / 2, -capH / 2, stroke * 0.55));
    boxes.push({ x: gx1, w: gw });
    let kern = 0;
    if (i < glyphs.length - 1) kern = font.getKerningValue(g, glyphs[i + 1]) * scale;
    x += adv + kern + (i < glyphs.length - 1 ? track : 0);
  });

  const left = boxes[0].x;
  const right = boxes[boxes.length - 1].x + boxes[boxes.length - 1].w;
  const span = right - left;
  const gap = capH * 0.22;

  if (mods.has("underline")) parts.push(rect(left, gap, span, stroke * 0.5));
  if (mods.has("overline")) parts.push(rect(left, -capH - gap - stroke * 0.4, span, stroke * 0.4));
  if (mods.has("side-rules")) {
    const len = capH * 0.9;
    parts.push(rect(left - gap * 1.6 - len, -capH / 2 - 1, len, 2.5));
    parts.push(rect(right + gap * 1.6, -capH / 2 - 1, len, 2.5));
  }
  if (mods.has("frame")) {
    const p = capH * 0.45;
    const t = 3;
    const X = left - p, Y = -capH - p, Wd = span + p * 2, H = capH + p * 2;
    parts.push(rect(X, Y, Wd, H) + `M${f(X + t)} ${f(Y + t)}V${f(Y + H - t)}H${f(X + Wd - t)}V${f(Y + t)}Z`);
  }
  if (mods.has("bar-ol")) {
    const a = boxes[2], b = boxes[4];
    parts.push(rect(a.x + a.w / 2, gap * 0.9, b.x + b.w / 2 - (a.x + a.w / 2), stroke * 0.45));
  }
  if (mods.has("k-bar")) {
    const k = boxes[5];
    parts.push(rect(k.x + k.w + track * 0.4, -capH * 0.55, capH * 0.5, stroke * 0.6));
  }

  let d = parts.join("");
  const svgD = d;

  // Apply horizontal scale / skew transform as a group transform in the SVG
  const transform = sx !== 1 || skew ? `matrix(${sx} 0 ${-skew} 1 0 0)` : "";

  _grow = null;
  const w = maxX - minX, h = maxY - minY;
  const pad = Math.max(w, h) * 0.08;
  d = svgD;
  const vbX = minX - pad, vbY = minY - pad, vbW = w + pad * 2, vbH = h + pad * 2;
  return {
    d: transform ? `${transform}|${d}` : d,
    viewBox: `${f(vbX)} ${f(vbY)} ${f(vbW)} ${f(vbH)}`,
    width: vbW,
    height: vbH,
  };
}

export function splitPath(o: Outlined) {
  const i = o.d.indexOf("|");
  return i === -1 ? { transform: "", d: o.d } : { transform: o.d.slice(0, i), d: o.d.slice(i + 1) };
}

export function toSvgString(o: Outlined, width?: number) {
  const { transform, d } = splitPath(o);
  const w = width ?? Math.round(o.width * 2);
  const h = Math.round((w * o.height) / o.width);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="${o.viewBox}" width="${w}" height="${h}"><path fill="${BRAND_HEX}" d="${d}"${transform ? ` transform="${transform}"` : ""}/></svg>\n`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export async function pngBlob(o: Outlined, width = 2400): Promise<Blob> {
  const svg = toSvgString(o, width);
  const h = Math.round((width * o.height) / o.width);
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = width;
    c.height = h;
    c.getContext("2d")!.drawImage(img, 0, 0, width, h);
    return await new Promise<Blob>((res, rej) =>
      c.toBlob((b) => (b ? res(b) : rej(new Error("PNG render failed"))), "image/png"),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
