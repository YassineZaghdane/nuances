"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";

interface ProductCardProps {
  id: string;
  nom: string;
  slug: string;
  notes?: string;
  prix30ml?: number | null;
  prix50ml?: number | null;
  prix100ml?: number | null;
  stockMlTotal?: number | null;
  images?: string[];
  featured?: boolean;
  exclusif?: boolean;
  nouveaute?: boolean;
  offre?: boolean;
  offreLabel?: string;
}

const FORMATS: { taille: string; key: keyof ProductCardProps; minMl: number }[] = [
  { taille: '30ml',  key: 'prix30ml',  minMl: 11 },
  { taille: '50ml',  key: 'prix50ml',  minMl: 18 },
  { taille: '100ml', key: 'prix100ml', minMl: 33 },
];

// Cache simple pour éviter de re-télécharger la résolution Imgur
// pour chaque carte (utile quand plusieurs cartes utilisent le même album).
const imgurResolveCache = new Map<string, string>();

const cardHoverEnter = (e: React.MouseEvent<HTMLElement>) => {
  const el = e.currentTarget as HTMLElement;
  el.style.transform = "translateY(-4px)";
  el.style.boxShadow = "0 12px 40px rgba(196,150,10,0.15)";
};

const cardHoverLeave = (e: React.MouseEvent<HTMLElement>) => {
  const el = e.currentTarget as HTMLElement;
  el.style.transform = "translateY(0)";
  el.style.boxShadow = "none";
};

export function ProductCard({
  id,
  nom,
  slug,
  notes,
  prix30ml,
  prix50ml,
  prix100ml,
  stockMlTotal,
  images,
  featured,
  exclusif,
  nouveaute,
  offre,
  offreLabel,
}: ProductCardProps) {
  const { addItem } = useCartStore();
  const [hovered, setHovered] = useState(false);
  const [adding, setAdding] = useState(false);

  const ml = stockMlTotal ?? 0;
  const taillesDispos = FORMATS
    .filter(f => (f.key === 'prix30ml' ? prix30ml : f.key === 'prix50ml' ? prix50ml : prix100ml) != null && ml >= f.minMl)
    .map(f => ({
      taille: f.taille,
      prix: Number(f.key === 'prix30ml' ? prix30ml : f.key === 'prix50ml' ? prix50ml : prix100ml),
    }));

  const [selectedTaille, setSelectedTaille] = useState(taillesDispos[0]?.taille || '30ml');
  const prixFinal = taillesDispos.find(t => t.taille === selectedTaille)?.prix
    ?? taillesDispos[0]?.prix ?? 0;
  const rawImg = images?.[0];
  const [resolvedImg, setResolvedImg] = useState<string | undefined>(
    rawImg
  );

  useEffect(() => {
    let cancelled = false;
    if (!rawImg) return;

    if (imgurResolveCache.has(rawImg)) {
      setResolvedImg(imgurResolveCache.get(rawImg));
      return;
    }

    // Résout uniquement les albums/galleries Imgur (les urls directes i.imgur.com passent sans changement).
    const isImgurAlbum = /imgur\.com\/(a|gallery)\//i.test(rawImg);
    if (!isImgurAlbum) {
      setResolvedImg(rawImg);
      imgurResolveCache.set(rawImg, rawImg);
      return;
    }

    (async () => {
      try {
        const r = await fetch(
          `/api/imgur/resolve-image?url=${encodeURIComponent(rawImg)}`
        );
        const d = await r.json().catch(() => ({}));
        const nextSrc =
          typeof d?.src === "string" && d.src ? d.src : rawImg;
        if (cancelled) return;
        setResolvedImg(nextSrc);
        imgurResolveCache.set(rawImg, nextSrc);
      } catch {
        if (!cancelled) setResolvedImg(rawImg);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [rawImg]);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!prixFinal || taillesDispos.length === 0) return;
    setAdding(true);
    addItem({
      id: `${id}-${selectedTaille}`,
      produitId: id,
      nom,
      taille: selectedTaille,
      prix: prixFinal,
      image: images?.[0],
      notes,
    });
    setTimeout(() => setAdding(false), 1000);
  };

  return (
    <div
      onMouseEnter={(e) => {
        setHovered(true);
        cardHoverEnter(e);
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        cardHoverLeave(e);
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        background: "white",
        border: "1px solid #EDE5D4",
        borderRadius: "6px",
        overflow: "hidden",
        transition: "box-shadow 0.3s, transform 0.3s",
        cursor: "pointer",
        position: "relative",
        transform: "translateY(0)",
        boxShadow: "none",
      }}
    >
      <Link
        href={`/boutique/${slug}`}
        style={{
          textDecoration: "none",
          color: "inherit",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
        }}
      >
        <div
          style={{
            height: "220px",
            background: "linear-gradient(135deg,#F5EFE0,#EDE5D4)",
            flexShrink: 0,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "1rem",
              left: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.3rem",
              zIndex: 2,
            }}
          >
            {nouveaute && (
              <span
                style={{
                  background: "#1A1208",
                  color: "white",
                  fontSize: "0.55rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  padding: "0.22rem 0.6rem",
                }}
              >
                Nouveauté
              </span>
            )}
            {exclusif && (
              <span
                style={{
                  background: "#C4960A",
                  color: "white",
                  fontSize: "0.55rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  padding: "0.22rem 0.6rem",
                }}
              >
                Exclusif
              </span>
            )}
            {offre && offreLabel && (
              <span
                style={{
                  background: "#2E7D52",
                  color: "white",
                  fontSize: "0.55rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  padding: "0.22rem 0.6rem",
                }}
              >
                {offreLabel}
              </span>
            )}
            {featured && !nouveaute && !exclusif && (
              <span
                style={{
                  background: "#7A5C9B",
                  color: "white",
                  fontSize: "0.55rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  padding: "0.22rem 0.6rem",
                }}
              >
                Bestseller
              </span>
            )}
          </div>

          {images?.[0] ? (
            <img
              src={resolvedImg || images[0]}
              alt={nom}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: hovered ? "scale(1.05)" : "scale(1)",
                transition: "transform 0.6s ease",
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "flex-end",
                transform: hovered ? "translateY(-4px)" : "translateY(0)",
                transition: "transform 0.4s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                <div
                  style={{
                    width: "26px",
                    height: "16px",
                    background: "linear-gradient(180deg, #C4960A, #8B6914)",
                    borderRadius: "3px 3px 0 0",
                    boxShadow: "0 4px 10px rgba(196,150,10,0.4)",
                  }}
                />
                <div
                  style={{
                    width: "16px",
                    height: "10px",
                    background: "#C4960A88",
                  }}
                />
                <div
                  style={{
                    width: "68px",
                    height: "108px",
                    background:
                      "linear-gradient(160deg, rgba(255,255,255,0.6) 0%, #D4B89680 50%, #C4960A60 100%)",
                    borderRadius: "8px 8px 5px 5px",
                    boxShadow:
                      "6px 10px 28px rgba(196,150,10,0.25), inset 3px 0 10px rgba(255,255,255,0.5)",
                    position: "relative",
                    overflow: "hidden",
                    border: "1px solid rgba(196,150,10,0.2)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "18%",
                      width: "14%",
                      height: "100%",
                      background: "rgba(255,255,255,0.35)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "20%",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "72%",
                      padding: "4px 0",
                      background: "rgba(255,255,255,0.95)",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "Cormorant Garamond, serif",
                        fontSize: "0.5rem",
                        fontWeight: 700,
                        color: "#1A1208",
                        letterSpacing: "0.1em",
                      }}
                    >
                      NUANCES
                    </div>
                    <div
                      style={{
                        fontFamily: "Jost, sans-serif",
                        fontSize: "0.38rem",
                        color: "#C4960A",
                        marginTop: "1px",
                      }}
                    >
                      PARFUMS
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(26,18,8,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: hovered ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
          >
            <span
              style={{
                fontFamily: "Jost, sans-serif",
                fontSize: "0.7rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "white",
                border: "1px solid rgba(255,255,255,0.6)",
                padding: "0.6rem 1.5rem",
              }}
            >
              Voir le produit
            </span>
          </div>
        </div>

        <div
          style={{
            padding: "1.2rem",
            display: "flex",
            flexDirection: "column",
            flex: 1,
            gap: "0.5rem",
          }}
        >
          <h3
            style={{
              fontFamily: "Cormorant Garamond,serif",
              fontSize: "1.15rem",
              fontWeight: 400,
              color: "#1A1208",
              margin: 0,
              minHeight: "2.6rem",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {nom}
          </h3>
          <p
            style={{
              fontSize: "0.72rem",
              color: "#8A7B68",
              margin: 0,
              lineHeight: 1.5,
              height: "2.16rem",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {notes || "\u00A0"}
          </p>

          <div
            style={{
              display: "flex",
              gap: "0.4rem",
              flexWrap: "wrap",
              minHeight: "2rem",
            }}
          >
            {taillesDispos.map((t) => (
              <button
                key={t.taille}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedTaille(t.taille);
                }}
                style={{
                  padding: "0.3rem 0.7rem",
                  fontSize: "0.65rem",
                  fontFamily: "Jost, sans-serif",
                  letterSpacing: "0.08em",
                  border: selectedTaille === t.taille
                    ? "1px solid #1A1208"
                    : "1px solid rgba(26,18,8,0.15)",
                  background: selectedTaille === t.taille ? "#1A1208" : "transparent",
                  color: selectedTaille === t.taille ? "white" : "#8A7B68",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {t.taille}
              </button>
            ))}
            {taillesDispos.length === 0 && (
              <span style={{ fontSize: "0.65rem", color: "#C4B090", lineHeight: "2rem" }}>
                Rupture de stock
              </span>
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "auto",
              paddingTop: "0.8rem",
              borderTop: "1px solid #F0EBE0",
            }}
          >
            <span
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "1.4rem",
                color: "#C4960A",
                fontWeight: 400,
              }}
            >
              {prixFinal.toFixed(0)} DT
            </span>

            <button
              type="button"
              onClick={handleAdd}
              disabled={taillesDispos.length === 0}
              style={{
                background: adding ? "#5A8A5A" : taillesDispos.length === 0 ? "#C4B090" : "#1A1208",
                color: "white",
                border: "none",
                padding: "0.6rem 1.2rem",
                fontSize: "0.65rem",
                fontFamily: "Jost, sans-serif",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: taillesDispos.length === 0 ? "not-allowed" : "pointer",
                transition: "all 0.3s",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              {adding ? "✓ Ajouté" : taillesDispos.length === 0 ? "Indisponible" : "+ Panier"}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}
