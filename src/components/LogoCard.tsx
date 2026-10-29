import { useEffect, useRef, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { BRAND_HEX, BRAND_NAME, CATEGORIES, slug, type LogoVariant } from "@/lib/logos";
import { downloadBlob, outlineLogo, pngBlob, splitPath, toSvgString, type Outlined } from "@/lib/outline";

export function LogoCard({ logo }: { logo: LogoVariant }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [outline, setOutline] = useState<Outlined | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"svg" | "png" | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e?.isIntersecting && setVisible(true), {
      rootMargin: "300px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || outline) return;
    outlineLogo(logo).then(setOutline, (e: Error) => setError(e.message));
  }, [visible, logo, outline]);

  const file = `sholok-${slug(logo.name)}`;
  const cat = CATEGORIES.find((c) => c.id === logo.category)?.label;

  async function dl(kind: "svg" | "png") {
    if (!outline) return;
    setBusy(kind);
    setError(null);
    try {
      if (kind === "svg")
        downloadBlob(new Blob([toSvgString(outline)], { type: "image/svg+xml" }), `${file}.svg`);
      else downloadBlob(await pngBlob(outline), `${file}.png`);
    } catch (e) {
      setError(`Export failed: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  const p = outline ? splitPath(outline) : null;

  return (
    <article
      ref={ref}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-[0_8px_30px_-12px_color-mix(in_oklab,var(--brand)_25%,transparent)]"
    >
      <div className="flex aspect-[16/10] items-center justify-center bg-preview px-8">
        {p && outline ? (
          <svg viewBox={outline.viewBox} className="max-h-[60%] w-full" role="img" aria-label={`SHOLOK in ${logo.family}`}>
            <path d={p.d} transform={p.transform || undefined} fill={BRAND_HEX} />
          </svg>
        ) : error ? (
          <p className="text-center text-sm text-destructive">{error}</p>
        ) : (
          <Loader2 className="size-5 animate-spin text-muted-foreground" aria-label="Loading font" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-4 border-t border-border p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-medium text-foreground">{logo.name}</h3>
          <span className="shrink-0 text-xs uppercase tracking-wider text-muted-foreground">{cat}</span>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
          <dt className="text-muted-foreground">Font:</dt>
          <dd className="text-foreground">{logo.family} {logo.weightLabel}</dd>
          <dt className="text-muted-foreground">Brand Color:</dt>
          <dd className="flex items-center gap-2 font-mono text-foreground">
            {BRAND_HEX}
            <span className="inline-block size-3.5 rounded-sm bg-brand ring-1 ring-border" aria-hidden />
          </dd>
          <dt className="text-muted-foreground">Color Name:</dt>
          <dd className="text-foreground">{BRAND_NAME}</dd>
        </dl>
        <div className="mt-auto grid grid-cols-2 gap-2">
          {(["svg", "png"] as const).map((k) => (
            <button
              key={k}
              onClick={() => dl(k)}
              disabled={!outline || !!busy}
              aria-label={`Download ${logo.name} as ${k.toUpperCase()}`}
              className={
                "inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 " +
                (k === "svg"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground")
              }
            >
              {busy === k ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              Download {k.toUpperCase()}
            </button>
          ))}
        </div>
        {error && outline && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </article>
  );
}
