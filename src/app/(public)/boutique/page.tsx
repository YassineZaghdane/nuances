"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/vitrine/ProductCard";
import { useCartStore } from "@/store/cart-store";
import { urlListeProduitsComplete, VITRINE_FETCH_INIT } from "@/lib/catalog-api";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";

interface Categorie { id: string; nom: string; slug: string }
interface Marque    { id: string; nom: string; slug: string }
interface Produit {
  id: string; nom: string; slug: string; notes?: string;
  prix: number;
  prix30ml?: number | null; prix50ml?: number | null; prix100ml?: number | null;
  images: string[];
  featured: boolean; exclusif?: boolean; nouveaute?: boolean;
  offre?: boolean; offreLabel?: string | null;
  categorie: Categorie;
  marque?: Marque | null;
  stockKilo?: { stockMlTotal: number } | null;
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const SECTION_LABEL: React.CSSProperties = {
  fontSize: "0.56rem", letterSpacing: "0.22em", textTransform: "uppercase",
  color: "#C4B090", fontFamily: "Jost, sans-serif", fontWeight: 500,
  marginBottom: "0.55rem", display: "block",
};

const PILL_BASE: React.CSSProperties = {
  padding: "0.32rem 0.85rem", fontSize: "0.72rem",
  fontFamily: "Jost, sans-serif", letterSpacing: "0.06em",
  border: "1px solid", borderRadius: "20px", cursor: "pointer",
  transition: "all 0.2s", background: "transparent",
  whiteSpace: "nowrap" as const,
};

function pill(active: boolean, accent: "dark" | "gold" = "dark"): React.CSSProperties {
  if (active) {
    return { ...PILL_BASE, background: accent === "gold" ? "#C4960A" : "#1A1208", color: "white", borderColor: accent === "gold" ? "#C4960A" : "#1A1208" };
  }
  return { ...PILL_BASE, color: "#8A7B68", borderColor: "rgba(26,18,8,0.14)" };
}

function SectionDivider() {
  return <div style={{ height: "1px", background: "#EDE5D4", margin: "1.2rem 0" }} />;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function BoutiqueSkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.5rem" }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ height: "420px", background: "linear-gradient(90deg, #EDE5D4 0%, #F5EFE0 50%, #EDE5D4 100%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function BoutiquePageInner() {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();

  // URL-synced filters
  const badgeParam = params.get("badge") || "";
  const typeParam  = params.get("type")  || "";
  const catParam   = params.get("cat")   || "";
  const marqueParam= params.get("marque")|| "";
  const qParam     = params.get("q")     || "";

  const setParam = (key: string, val: string | null) => {
    const p = new URLSearchParams(params.toString());
    if (val) p.set(key, val); else p.delete(key);
    const qs = p.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const resetAll = () => router.push(pathname, { scroll: false });

  // Data
  const [produits,    setProduits]    = useState<Produit[]>([]);
  const [categories,  setCategories]  = useState<Categorie[]>([]);
  const [marques,     setMarques]     = useState<Marque[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [fetchError,  setFetchError]  = useState<string | null>(null);
  const [tick,        setTick]        = useState(0);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  const { count, openCart } = useCartStore();
  useRefreshOnFocus(() => setTick(n => n + 1));

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setFetchError(null);
    fetch(urlListeProduitsComplete(), VITRINE_FETCH_INIT)
      .then(async r => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(typeof data?.error === "string" ? data.error : `Erreur ${r.status}`);
        return data;
      })
      .then((data: Produit[]) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setProduits(list);

        const catMap = new Map<string, Categorie>();
        const marqueMap = new Map<string, Marque>();
        for (const p of list) {
          if (p.categorie) catMap.set(p.categorie.id, p.categorie);
          if (p.marque)    marqueMap.set(p.marque.id, p.marque);
        }
        setCategories(Array.from(catMap.values()));
        setMarques(Array.from(marqueMap.values()));
      })
      .catch((e: unknown) => {
        if (!cancelled) { setProduits([]); setFetchError(e instanceof Error ? e.message : "Erreur réseau"); }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tick]);

  // Client-side filtering
  const filtered = useMemo(() => {
    return produits.filter(p => {
      if (typeParam === "niche"      && !p.exclusif) return false;
      if (typeParam === "classiques" &&  p.exclusif) return false;
      if (badgeParam === "featured"  && !p.featured)  return false;
      if (badgeParam === "exclusif"  && !p.exclusif)  return false;
      if (badgeParam === "nouveaute" && !p.nouveaute) return false;
      if (badgeParam === "offre"     && !p.offre)     return false;
      if (catParam    && p.categorie?.id !== catParam)  return false;
      if (marqueParam && p.marque?.id    !== marqueParam) return false;
      if (qParam && !p.nom.toLowerCase().includes(qParam.toLowerCase())) return false;
      return true;
    });
  }, [produits, typeParam, badgeParam, catParam, marqueParam, qParam]);

  const anyFilter = !!(badgeParam || typeParam || catParam || marqueParam || qParam);

  // ── Sidebar content ─────────────────────────────────────────────────────────
  const Sidebar = (
    <aside style={{
      width: "240px", flexShrink: 0,
      position: "sticky", top: "76px", alignSelf: "flex-start",
      height: "calc(100vh - 76px)", overflowY: "auto",
      background: "#FDFAF5", borderRight: "1px solid #EDE5D4",
      padding: "1.6rem 1.2rem",
      fontFamily: "Jost, sans-serif",
      scrollbarWidth: "none",
    }}>
      {/* Title */}
      <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.1rem", color: "#1A1208", marginBottom: "1.2rem", fontWeight: 400 }}>
        Filtres
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "0.2rem" }}>
        <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", fontSize: "0.75rem", color: "#C4B090" }}>
          ✦
        </span>
        <input
          type="text"
          placeholder="Rechercher…"
          value={qParam}
          onChange={e => setParam("q", e.target.value || null)}
          style={{
            width: "100%", paddingLeft: "2rem", paddingRight: "0.75rem",
            paddingTop: "0.6rem", paddingBottom: "0.6rem",
            fontSize: "0.78rem", fontFamily: "Jost, sans-serif",
            border: "1px solid #EDE5D4", background: "white",
            color: "#1A1208", outline: "none", borderRadius: "3px",
            boxSizing: "border-box",
          }}
          onFocus={e => (e.target as HTMLInputElement).style.borderColor = "#C4960A"}
          onBlur={e  => (e.target as HTMLInputElement).style.borderColor = "#EDE5D4"}
        />
      </div>

      {/* Reset */}
      {anyFilter && (
        <button onClick={resetAll} style={{ fontSize: "0.65rem", color: "#C4960A", background: "none", border: "none", cursor: "pointer", padding: "0.4rem 0", fontFamily: "Jost, sans-serif", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: "0.3rem" }}>
          ✕ Effacer les filtres
        </button>
      )}

      <SectionDivider />

      {/* Catégorie */}
      <span style={SECTION_LABEL}>Catégorie</span>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", marginBottom: "0.2rem" }}>
        <button onClick={() => setParam("cat", null)} style={pill(!catParam)}>Toutes</button>
        {categories.map(c => (
          <button key={c.id} onClick={() => setParam("cat", catParam === c.id ? null : c.id)} style={pill(catParam === c.id)}>
            {c.nom}
          </button>
        ))}
      </div>

      {/* Marque */}
      {marques.length > 0 && (
        <>
          <SectionDivider />
          <span style={SECTION_LABEL}>Marque</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", marginBottom: "0.2rem" }}>
            <button onClick={() => setParam("marque", null)} style={pill(!marqueParam)}>Toutes</button>
            {marques.map(m => (
              <button key={m.id} onClick={() => setParam("marque", marqueParam === m.id ? null : m.id)} style={pill(marqueParam === m.id)}>
                {m.nom}
              </button>
            ))}
          </div>
        </>
      )}

      <SectionDivider />

      {/* Collections / Badges */}
      <span style={SECTION_LABEL}>Collections</span>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", marginBottom: "0.2rem" }}>
        {([
          { id: "",          label: "Toutes" },
          { id: "featured",  label: "Bestsellers" },
          { id: "exclusif",  label: "Exclusifs"   },
          { id: "nouveaute", label: "Nouveautés"  },
          { id: "offre",     label: "Offres"      },
        ] as const).map(b => {
          const active = b.id === "" ? !badgeParam : badgeParam === b.id;
          return (
            <button key={b.id || "tous"} onClick={() => setParam("badge", b.id || null)} style={pill(active, "gold")}>
              {b.label}
            </button>
          );
        })}
      </div>

      <SectionDivider />

      {/* Type */}
      <span style={SECTION_LABEL}>Type</span>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        {([
          { id: "",           label: "Tous"       },
          { id: "classiques", label: "Classiques" },
          { id: "niche",      label: "Niche"      },
        ] as const).map(t => (
          <button key={t.id || "tous"} onClick={() => setParam("type", t.id || null)} style={pill(!typeParam && !t.id || typeParam === t.id)}>
            {t.label}
          </button>
        ))}
      </div>
    </aside>
  );

  return (
    <div style={{ background: "#FDFAF5", minHeight: "100vh", fontFamily: "Jost, sans-serif" }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div style={{ background: "#1A1208", paddingTop: "110px", paddingBottom: "52px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontFamily: "Cormorant Garamond, serif", fontSize: "18rem", fontWeight: 700, color: "rgba(196,150,10,0.04)", pointerEvents: "none", lineHeight: 1 }}>N</div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <span style={{ fontSize: "0.65rem", letterSpacing: "0.4em", textTransform: "uppercase", color: "#C4960A", display: "block", marginBottom: "1rem" }}>
            Luxury in Every Drop
          </span>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(3rem, 6vw, 5rem)", fontWeight: 300, color: "white", marginBottom: "0.5rem", lineHeight: 1.1 }}>
            Notre Collection
          </h1>
          <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.45)", fontWeight: 300 }}>
            {loading ? "Chargement…" : fetchError ? "Catalogue indisponible" : `${filtered.length} parfum${filtered.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* ── Mobile filter toggle ──────────────────────────────────────────── */}
      <div className="mobile-filter-bar" style={{ display: "none", background: "white", borderBottom: "1px solid #EDE5D4", padding: "0.8rem 1.2rem", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => setMobileOpen(o => !o)} style={{ fontSize: "0.75rem", fontFamily: "Jost, sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", background: "#1A1208", color: "white", border: "none", padding: "0.55rem 1.1rem", cursor: "pointer", borderRadius: "3px" }}>
          {mobileOpen ? "✕ Fermer" : "▼ Filtres"}
          {anyFilter && <span style={{ marginLeft: "0.4rem", background: "#C4960A", color: "white", borderRadius: "50%", width: "16px", height: "16px", fontSize: "0.55rem", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>!</span>}
        </button>
        <button onClick={openCart} style={{ background: "#C4960A", color: "white", border: "none", padding: "0.55rem 1rem", fontSize: "0.72rem", fontFamily: "Jost, sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", borderRadius: "3px", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          Panier {count() > 0 && <span style={{ background: "#1A1208", borderRadius: "50%", width: "16px", height: "16px", fontSize: "0.55rem", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{count()}</span>}
        </button>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start" }}>

        {/* Sidebar — hidden on mobile unless toggled */}
        <div className={`sidebar-wrap${mobileOpen ? " sidebar-open" : ""}`}>
          {Sidebar}
        </div>

        {/* Products */}
        <div style={{ flex: 1, minWidth: 0, padding: "2rem 2.5rem" }}>

          {/* Topbar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <div style={{ fontSize: "0.78rem", color: "#8A7B68", fontFamily: "Jost, sans-serif" }}>
              {!loading && !fetchError && (
                <>
                  <span style={{ color: "#1A1208", fontWeight: 500 }}>{filtered.length}</span> parfum{filtered.length !== 1 ? "s" : ""}
                  {catParam    && categories.find(c => c.id === catParam)    && <> · <span style={{ color: "#C4960A" }}>{categories.find(c => c.id === catParam)!.nom}</span></>}
                  {marqueParam && marques.find(m => m.id === marqueParam)    && <> · <span style={{ color: "#C4960A" }}>{marques.find(m => m.id === marqueParam)!.nom}</span></>}
                  {badgeParam  && <> · <span style={{ color: "#C4960A" }}>{badgeParam === "featured" ? "Bestsellers" : badgeParam === "exclusif" ? "Exclusifs" : badgeParam === "nouveaute" ? "Nouveautés" : "Offres"}</span></>}
                  {typeParam   && <> · <span style={{ color: "#C4960A" }}>{typeParam === "niche" ? "Niche" : "Classiques"}</span></>}
                </>
              )}
            </div>

            <button onClick={openCart} className="desktop-cart" style={{ background: "#C4960A", color: "white", border: "none", padding: "0.5rem 1.2rem", fontSize: "0.72rem", fontFamily: "Jost, sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", borderRadius: "3px", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              Panier
              {count() > 0 && <span style={{ background: "#1A1208", color: "white", borderRadius: "50%", width: "18px", height: "18px", fontSize: "0.6rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600 }}>{count()}</span>}
            </button>
          </div>

          {/* Error */}
          {fetchError && (
            <div style={{ marginBottom: "2rem", padding: "1rem 1.25rem", background: "#FAEAEA", border: "1px solid rgba(139,58,58,0.2)", color: "#8B3A3A", fontSize: "0.85rem", lineHeight: 1.6, borderRadius: "3px" }}>
              <strong>Erreur :</strong> {fetchError}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <BoutiqueSkeleton />
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "6rem 0" }}>
              <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "5rem", color: "rgba(196,150,10,0.15)", marginBottom: "1rem" }}>✿</div>
              <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", color: "#8A7B68", fontStyle: "italic" }}>Aucun parfum trouvé</p>
              {anyFilter && (
                <button onClick={resetAll} style={{ marginTop: "1.5rem", fontSize: "0.72rem", color: "#C4960A", background: "none", border: "1px solid #C4960A", padding: "0.55rem 1.4rem", cursor: "pointer", fontFamily: "Jost, sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "3px" }}>
                  Effacer les filtres
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.5rem", alignItems: "stretch" }}>
              {filtered.map((p, i) => (
                <div key={p.id} style={{ opacity: 0, animation: `fadeUp 0.5s ease ${i * 0.07}s forwards`, height: "100%", display: "flex", flexDirection: "column" }}>
                  <ProductCard
                    id={p.id} nom={p.nom} slug={p.slug} notes={p.notes}
                    prix30ml={p.prix30ml} prix50ml={p.prix50ml} prix100ml={p.prix100ml}
                    stockMlTotal={p.stockKilo?.stockMlTotal}
                    images={p.images} featured={p.featured}
                    exclusif={p.exclusif} nouveaute={p.nouveaute}
                    offre={p.offre} offreLabel={p.offreLabel ?? undefined}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .sidebar-wrap { display: block; }
        .desktop-cart { display: flex !important; }
        @media (max-width: 768px) {
          .sidebar-wrap { display: none; }
          .sidebar-wrap.sidebar-open { display: block; width: 100%; }
          .sidebar-wrap.sidebar-open aside { width: 100%; height: auto; position: static; border-right: none; border-bottom: 1px solid #EDE5D4; }
          .mobile-filter-bar { display: flex !important; }
          .desktop-cart { display: none !important; }
        }
        aside::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

export default function BoutiquePage() {
  return (
    <Suspense fallback={
      <div style={{ background: "#FDFAF5", minHeight: "100vh", padding: "120px 5% 4%" }}>
        <BoutiqueSkeleton />
        <style>{`@keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }`}</style>
      </div>
    }>
      <BoutiquePageInner />
    </Suspense>
  );
}
