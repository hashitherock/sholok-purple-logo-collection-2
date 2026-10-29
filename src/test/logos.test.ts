import { describe, expect, it } from "vitest";
import { BRAND_HEX, LOGOS, filterLogos } from "@/lib/logos";

describe("SHOLOK logo collection", () => {
  it("has at least 40 variations with unique filenames", () => {
    expect(LOGOS.length).toBeGreaterThanOrEqual(40);
    expect(new Set(LOGOS.map((l) => l.id)).size).toBe(LOGOS.length);
  });
  it("uses the official brand color", () => {
    expect(BRAND_HEX).toBe("#5D0096");
  });
  it("filters by category and by font search", () => {
    expect(filterLogos(LOGOS, "bold", "").every((l) => l.category === "bold")).toBe(true);
    expect(filterLogos(LOGOS, "all", "bodoni").every((l) => l.family === "Bodoni Moda")).toBe(true);
  });
});
