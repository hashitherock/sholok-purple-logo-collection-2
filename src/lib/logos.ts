export const BRAND_HEX = "#5D0096";
export const BRAND_NAME = "Premium Purple";
export const WORD = "SHOLOK";

export type Category = "luxury" | "modern" | "bold" | "elegant" | "custom" | "minimal";

export const CATEGORIES: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All Logos" },
  { id: "luxury", label: "Luxury" },
  { id: "modern", label: "Modern Sans-Serif" },
  { id: "bold", label: "Bold" },
  { id: "elegant", label: "Elegant" },
  { id: "custom", label: "Custom Wordmarks" },
  { id: "minimal", label: "Minimalist" },
];

/** Vector modifications drawn alongside the outlined letters. */
export type Mod =
  | "underline"
  | "overline"
  | "frame"
  | "ring-o"
  | "dot-o"
  | "bar-ol"
  | "k-bar"
  | "side-rules";

export interface LogoVariant {
  id: string;
  name: string;
  category: Category;
  family: string;
  fontId: string; // fontsource id
  weight: number;
  weightLabel: string;
  tracking: number; // em
  scaleX?: number;
  skew?: number; // degrees
  mods?: Mod[];
}

const W: Record<number, string> = {
  100: "Thin", 200: "ExtraLight", 300: "Light", 400: "Regular", 500: "Medium",
  600: "SemiBold", 700: "Bold", 800: "ExtraBold", 900: "Black",
};

function v(
  name: string, category: Category, family: string, weight: number, tracking: number,
  extra: Partial<LogoVariant> = {},
): LogoVariant {
  const fontId = family.toLowerCase().replace(/\s+/g, "-");
  return {
    id: slug(name), name, category, family, fontId, weight, weightLabel: W[weight] ?? "",
    tracking, ...extra,
  };
}

export function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const LOGOS: LogoVariant[] = [
  // Luxury
  v("Haute Couture Serif", "luxury", "Bodoni Moda", 700, 0.06),
  v("Atelier Garamond", "luxury", "Cormorant Garamond", 600, 0.14),
  v("Maison Display", "luxury", "Playfair Display", 800, 0.04),
  v("Boutique Serif", "luxury", "DM Serif Display", 400, 0.08, { mods: ["underline"] }),
  v("Heritage Baskerville", "luxury", "Libre Baskerville", 700, 0.12),
  v("Prata Signature", "luxury", "Prata", 400, 0.2),
  v("Imperial Capitals", "luxury", "Cinzel", 600, 0.18, { mods: ["side-rules"] }),
  v("Editorial Instrument", "luxury", "Instrument Serif", 400, 0.04),
  // Modern
  v("Neo Grotesk", "modern", "Inter", 700, -0.02),
  v("Manrope Commerce", "modern", "Manrope", 800, 0.02),
  v("Jakarta Clean", "modern", "Plus Jakarta Sans", 700, 0.04),
  v("DM Contemporary", "modern", "DM Sans", 600, 0.08),
  v("Montserrat Wide", "modern", "Montserrat", 600, 0.28),
  v("Outfit Geometric", "modern", "Outfit", 600, 0.06),
  v("Sora Tech", "modern", "Sora", 700, 0.03),
  v("Space Grotesk Edge", "modern", "Space Grotesk", 600, 0.02),
  // Bold
  v("Archivo Impact", "bold", "Archivo Black", 400, 0.01),
  v("Spartan Heavy", "bold", "League Spartan", 800, 0.02),
  v("Condensed Power", "bold", "Barlow Condensed", 800, 0.06),
  v("Oswald Industrial", "bold", "Oswald", 700, 0.08),
  v("Anton Statement", "bold", "Anton", 400, 0.04),
  v("Sora Extra", "bold", "Sora", 800, -0.02),
  v("Manrope Slant", "bold", "Manrope", 800, 0.0, { skew: -10 }),
  // Elegant
  v("Urbanist Airy", "elegant", "Urbanist", 300, 0.32),
  v("Jost Fashion", "elegant", "Jost", 400, 0.24),
  v("Raleway Refined", "elegant", "Raleway", 500, 0.18),
  v("Lato Balanced", "elegant", "Lato", 300, 0.22),
  v("Josefin Vintage", "elegant", "Josefin Sans", 600, 0.16),
  v("Instrument Sans Medium", "elegant", "Instrument Sans", 500, 0.12),
  v("Outfit Thin Line", "elegant", "Outfit", 200, 0.3),
  // Custom
  v("Orbit O", "custom", "Montserrat", 700, 0.06, { mods: ["ring-o"] }),
  v("Halo Dots", "custom", "Jost", 500, 0.12, { mods: ["dot-o"] }),
  v("Ruled Horizon", "custom", "Archivo Black", 400, 0.03, { mods: ["underline", "overline"] }),
  v("O–L–O Bridge", "custom", "Outfit", 700, 0.04, { mods: ["bar-ol"] }),
  v("Struck K", "custom", "Space Grotesk", 700, 0.04, { mods: ["k-bar"] }),
  v("Framed Monolith", "custom", "Cinzel", 700, 0.14, { mods: ["frame"] }),
  v("Expanded Geometry", "custom", "League Spartan", 600, 0.1, { scaleX: 1.25 }),
  v("Bodoni Italic Lean", "custom", "Bodoni Moda", 600, 0.05, { skew: -12, mods: ["overline"] }),
  // Minimal
  v("Simple Capitals", "minimal", "DM Sans", 500, 0.2),
  v("Understated Inter", "minimal", "Inter", 400, 0.36),
  v("Compact Mark", "minimal", "Manrope", 700, -0.04, { scaleX: 0.88 }),
  v("Timeless Raleway", "minimal", "Raleway", 300, 0.42),
  v("Quiet Serif", "minimal", "Cormorant Garamond", 400, 0.3),
  v("Plain Urbanist", "minimal", "Urbanist", 600, 0.1),
];

export function filterLogos(list: LogoVariant[], cat: Category | "all", q: string) {
  const s = q.trim().toLowerCase();
  return list.filter((l) => {
    if (cat !== "all" && l.category !== cat) return false;
    if (!s) return true;
    const catLabel = CATEGORIES.find((c) => c.id === l.category)?.label ?? "";
    return [l.name, l.family, l.weightLabel, catLabel].join(" ").toLowerCase().includes(s);
  });
}

export function fontUrl(l: LogoVariant) {
  return `https://cdn.jsdelivr.net/fontsource/fonts/${l.fontId}@latest/latin-${l.weight}-normal.woff`;
}
