"use client";
import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";

interface Stock {
  taille: string;
  quantite: number;
}

interface ProductCardProps {
  id: string;
  nom: string;
  slug: string;
  notes?: string;
  prix: number;
  images?: string[];
  stocks?: Stock[];
  featured?: boolean;
  exclusif?: boolean;
  nouveaute?: boolean;
  offre?: boolean;
  offreLabel?: string;
}

const TAILLE_PRIX: Record<string, number> = {
  "30ml": 0,
  "50ml": 10,
  "100ml": 20,
};

export function ProductCard({
  id,
  nom,
  slug,
  notes,
  prix,
  images,
  stocks,
  featured,
  exclusif,
  nouveaute,
  offre,
  offreLabel,
}: ProductCardProps) {
  const { addItem, openCart } = useCartStore();
  const [selectedTaille, setSelectedTaille] = useState(
    stocks?.[0]?.taille || "30ml"
  );
  const [hovered, setHovered] = useState(false);
  const [adding, setAdding] = useState(false);

  const taillesDispos = stocks?.filter((s) => s.quantite > 0) || [];
  const prixFinal = Number(prix) + (TAILLE_PRIX[selectedTaille] || 0);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#FDFAF5",
        border: "1px solid rgba(196,150,10,0.12)",
        overflow: "hidden",
        cursor: "pointer",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 24px 56px rgba(196,150,10,0.18)"
          : "0 2px 12px rgba(26,18,8,0.04)",
        transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
        position: "relative",
      }}
    >
      <Link href={`/boutique/${slug}`} style={{ textDecoration: "none" }}>
        {/* ZONE IMAGE */}
        <div
          style={{
            height: "280px",
            background: "linear-gradient(145deg, #EDE5D4 0%, #D4B896 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{
            position:'absolute', top:'1rem', left:'1rem',
            display:'flex', flexDirection:'column', gap:'0.3rem', zIndex:2,
          }}>
            {nouveaute && (
              <span style={{ background:'#1A1208', color:'white', fontSize:'0.55rem', letterSpacing:'0.14em', textTransform:'uppercase', padding:'0.22rem 0.6rem' }}>Nouveauté</span>
            )}
            {exclusif && (
              <span style={{ background:'#C4960A', color:'white', fontSize:'0.55rem', letterSpacing:'0.14em', textTransform:'uppercase', padding:'0.22rem 0.6rem' }}>Exclusif</span>
            )}
            {offre && offreLabel && (
              <span style={{ background:'#2E7D52', color:'white', fontSize:'0.55rem', letterSpacing:'0.14em', textTransform:'uppercase', padding:'0.22rem 0.6rem' }}>{offreLabel}</span>
            )}
            {featured && !nouveaute && !exclusif && (
              <span style={{ background:'#7A5C9B', color:'white', fontSize:'0.55rem', letterSpacing:'0.14em', textTransform:'uppercase', padding:'0.22rem 0.6rem' }}>Bestseller</span>
            )}
          </div>

          {images?.[0] ? (
            <img
              src={images[0]}
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

        {/* INFOS PRODUIT */}
        <div style={{ padding: "1.4rem 1.4rem 0.8rem" }}>
          <h3
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "1.25rem",
              fontWeight: 400,
              color: "#1A1208",
              marginBottom: "0.25rem",
            }}
          >
            {nom}
          </h3>
          {notes && (
            <p
              style={{
                fontSize: "0.7rem",
                color: "#8A7B68",
                letterSpacing: "0.08em",
                marginBottom: "1rem",
              }}
            >
              {notes}
            </p>
          )}

          {taillesDispos.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "0.4rem",
                marginBottom: "1rem",
                flexWrap: "wrap",
              }}
            >
              {taillesDispos.map((s) => (
                <button
                  key={s.taille}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedTaille(s.taille);
                  }}
                  style={{
                    padding: "0.3rem 0.7rem",
                    fontSize: "0.65rem",
                    fontFamily: "Jost, sans-serif",
                    letterSpacing: "0.08em",
                    border:
                      selectedTaille === s.taille
                        ? "1px solid #1A1208"
                        : "1px solid rgba(26,18,8,0.15)",
                    background:
                      selectedTaille === s.taille ? "#1A1208" : "transparent",
                    color: selectedTaille === s.taille ? "white" : "#8A7B68",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {s.taille}
                </button>
              ))}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "1rem",
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
              onClick={handleAdd}
              style={{
                background: adding ? "#5A8A5A" : "#1A1208",
                color: "white",
                border: "none",
                padding: "0.6rem 1.2rem",
                fontSize: "0.65rem",
                fontFamily: "Jost, sans-serif",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.3s",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              {adding ? "✓ Ajouté" : "+ Panier"}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}
