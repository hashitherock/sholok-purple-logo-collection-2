import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CATEGORIES, LOGOS, filterLogos, type Category } from "@/lib/logos";
import { LogoCard } from "@/components/LogoCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SHOLOK Brand Logo Studio" },
      { name: "description", content: "Explore 44 professional SHOLOK wordmarks in Premium Purple and download them as SVG or PNG." },
      { property: "og:title", content: "SHOLOK Brand Logo Studio" },
      { property: "og:description", content: "Explore professional typography and brand identity for SHOLOK." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [cat, setCat] = useState<Category | "all">("all");
  const [q, setQ] = useState("");
  const list = useMemo(() => filterLogos(LOGOS, cat, q), [cat, q]);

  return (
    <div className="min-h-screen font-sans">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-10 md:py-14">
          <p className="text-sm font-semibold tracking-[0.4em] text-brand">SHOLOK</p>
          <h1 className="mt-4 font-display text-4xl text-foreground md:text-6xl">SHOLOK Brand Logo Studio</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">Explore Professional Typography and Brand Identity</p>
        </div>
      </header>

      <div className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div role="tablist" aria-label="Logo categories" className="-mx-1 flex gap-1 overflow-x-auto px-1">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={cat === c.id}
                onClick={() => setCat(c.id)}
                className={
                  "whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
                  (cat === c.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground")
                }
              >
                {c.label}
              </button>
            ))}
          </div>
          <label className="relative block lg:w-72">
            <span className="sr-only">Search logos</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search font, style or category"
              className="w-full rounded-md border border-input bg-card py-2 pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <p className="mb-5 text-sm text-muted-foreground">{list.length} logos</p>
        {list.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {list.map((l) => (
              <LogoCard key={l.id} logo={l} />
            ))}
          </div>
        ) : (
          <p className="py-20 text-center text-muted-foreground">No logos match “{q}”.</p>
        )}
      </main>
    </div>
  );
}
