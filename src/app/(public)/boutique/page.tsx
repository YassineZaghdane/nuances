"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/vitrine/ProductCard";
import { useCartStore } from "@/store/cart-store";

interface Categorie {
  id: string;
  nom: string;
  slug: string;
}
interface Produit {
  id: string;
  nom: string;
  slug: string;
  notes?: string;
  prix: number;
  images: string[];
  featured: boolean;
  exclusif?: boolean;
  nouveaute?: boolean;
  offre?: boolean;
  offreLabel?: string | null;
  categorie: Categorie;
  stocks: { taille: string; quantite: number }[];
}

function BoutiqueSkeleton() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "1.5rem",
      }}
    >
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          style={{
            height: "420px",
            background:
              "linear-gradient(90deg, #EDE5D4 0%, #F5EFE0 50%, #EDE5D4 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
          }}
        />
      ))}
    </div>
  );
}

function BoutiquePageInner() {
  const searchParams = useSearchParams();
  const typeFilter = (searchParams.get("type") || "").toLowerCase();

  const [produits, setProduits] = useState<Produit[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [catActive, setCatActive] = useState("tous");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { count, openCart } = useCartStore();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(null);

    fetch("/api/produits")
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          const msg =
            typeof data?.error === "string"
              ? data.error
              : `Impossible de charger les produits (${r.status})`;
          throw new Error(msg);
        }
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setProduits(list);
        const cats = Array.from(
          new Map(
            list
              .filter((p: Produit) => p.categorie)
              .map((p: Produit) => [p.categorie!.id, p.categorie!])
          ).values()
        ) as Categorie[];
        setCategories(cats);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setProduits([]);
          setCategories([]);
          setFetchError(e instanceof Error ? e.message : "Erreur réseau");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const parUnivers = useMemo(() => {
    if (typeFilter === "niche") {
      return produits.filter((p) => p.exclusif === true);
    }
    if (typeFilter === "classiques") {
      return produits.filter((p) => !p.exclusif);
    }
    return produits;
  }, [produits, typeFilter]);

  const filtered = parUnivers.filter((p) => {
    const matchCat = catActive === "tous" || p.categorie?.id === catActive;
    const matchSearch = p.nom.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const sousTitre =
    typeFilter === "niche"
      ? "Collection Niche"
      : typeFilter === "classiques"
        ? "Classiques"
        : "Classiques & Niche";

  return (
    <main
      style={{
        background: "#FDFAF5",
        minHeight: "100vh",
        fontFamily: "Jost, sans-serif",
      }}
    >
      {/* HEADER BOUTIQUE */}
      <div
        style={{
          background: "#1A1208",
          paddingTop: "120px",
          paddingBottom: "60px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            fontFamily: "Cormorant Garamond, serif",
            fontSize: "18rem",
            fontWeight: 700,
            color: "rgba(196,150,10,0.04)",
            pointerEvents: "none",
            lineHeight: 1,
          }}
        >
          N
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <span
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "#C4960A",
              display: "block",
              marginBottom: "1rem",
              fontFamily: "Jost, sans-serif",
            }}
          >
            Luxury in Every Drop
          </span>
          <h1
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "clamp(3rem, 6vw, 5.5rem)",
              fontWeight: 300,
              color: "white",
              marginBottom: "0.5rem",
              lineHeight: 1.1,
            }}
          >
            Notre Collection
          </h1>
          <p
            style={{
              fontSize: "0.9rem",
              color: "rgba(255,255,255,0.45)",
              fontWeight: 300,
            }}
          >
            {loading
              ? "Chargement du catalogue…"
              : fetchError
                ? "Catalogue indisponible pour le moment"
                : `${filtered.length} parfum${filtered.length > 1 ? "s" : ""} · ${sousTitre}`}
          </p>
        </div>
      </div>

      {/* BARRE RECHERCHE + FILTRES */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid rgba(196,150,10,0.12)",
          padding: "1.2rem 5%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem",
          flexWrap: "wrap",
          position: "sticky",
          top: "76px",
          zIndex: 50,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "0.3rem",
            flexWrap: "wrap",
          }}
        >
          {[{ id: "tous", nom: "Tous", slug: "" }, ...categories].map(
            (cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCatActive(cat.id)}
                style={{
                  padding: "0.5rem 1.2rem",
                  fontSize: "0.72rem",
                  fontFamily: "Jost, sans-serif",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  background: catActive === cat.id ? "#1A1208" : "transparent",
                  color: catActive === cat.id ? "white" : "#8A7B68",
                  border: "1px solid",
                  borderColor:
                    catActive === cat.id
                      ? "#1A1208"
                      : "rgba(26,18,8,0.12)",
                  cursor: "pointer",
                  transition: "all 0.25s",
                }}
              >
                {cat.nom}
              </button>
            )
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "0.8rem",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "0.8rem",
                color: "#8A7B68",
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                paddingLeft: "2rem",
                paddingRight: "1rem",
                paddingTop: "0.55rem",
                paddingBottom: "0.55rem",
                fontSize: "0.8rem",
                fontFamily: "Jost, sans-serif",
                border: "1px solid rgba(26,18,8,0.12)",
                background: "#FDFAF5",
                color: "#1A1208",
                outline: "none",
                width: "200px",
              }}
            />
          </div>

          <button
            type="button"
            onClick={openCart}
            style={{
              background: "#C4960A",
              color: "white",
              border: "none",
              padding: "0.55rem 1.2rem",
              fontSize: "0.72rem",
              fontFamily: "Jost, sans-serif",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              position: "relative",
            }}
          >
            🛍 Panier
            {count() > 0 && (
              <span
                style={{
                  background: "#1A1208",
                  color: "white",
                  borderRadius: "50%",
                  width: "18px",
                  height: "18px",
                  fontSize: "0.6rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                }}
              >
                {count()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* GRILLE PRODUITS */}
      <div style={{ padding: "4% 5%" }}>
        {fetchError && (
          <div
            style={{
              marginBottom: "2rem",
              padding: "1rem 1.25rem",
              background: "#FAEAEA",
              border: "1px solid rgba(139,58,58,0.2)",
              color: "#8B3A3A",
              fontSize: "0.88rem",
              lineHeight: 1.6,
            }}
          >
            <strong>Erreur :</strong> {fetchError}
            <br />
            <span style={{ color: "#6B5C3E" }}>
              Vérifie que PostgreSQL tourne et que{" "}
              <code style={{ fontSize: "0.8em" }}>DATABASE_URL</code> est
              correct dans <code style={{ fontSize: "0.8em" }}>.env</code>,
              puis relance <code style={{ fontSize: "0.8em" }}>npm run dev</code>
              .
            </span>
          </div>
        )}

        {loading ? (
          <BoutiqueSkeleton />
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "6rem 0",
            }}
          >
            <div
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "5rem",
                color: "rgba(196,150,10,0.15)",
                marginBottom: "1rem",
              }}
            >
              ✿
            </div>
            <p
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "1.5rem",
                color: "#8A7B68",
                fontStyle: "italic",
              }}
            >
              {fetchError ? "Impossible d'afficher les parfums" : "Aucun parfum trouvé"}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {filtered.map((p, i) => (
              <div
                key={p.id}
                style={{
                  opacity: 0,
                  animation: `fadeUp 0.6s ease ${i * 0.08}s forwards`,
                }}
              >
                <ProductCard
                  id={p.id}
                  nom={p.nom}
                  slug={p.slug}
                  notes={p.notes}
                  prix={Number(p.prix)}
                  images={p.images}
                  stocks={p.stocks}
                  featured={p.featured}
                  exclusif={p.exclusif}
                  nouveaute={p.nouveaute}
                  offre={p.offre}
                  offreLabel={p.offreLabel ?? undefined}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}

export default function BoutiquePage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            background: "#FDFAF5",
            minHeight: "100vh",
            fontFamily: "Jost, sans-serif",
            paddingTop: "120px",
          }}
        >
          <div style={{ padding: "0 5% 4%" }}>
            <BoutiqueSkeleton />
          </div>
          <style>{`
            @keyframes shimmer {
              0%   { background-position: -200% center; }
              100% { background-position: 200% center; }
            }
          `}</style>
        </main>
      }
    >
      <BoutiquePageInner />
    </Suspense>
  );
}
