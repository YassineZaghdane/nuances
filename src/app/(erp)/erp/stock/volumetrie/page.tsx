"use client";

import { useEffect, useState } from "react";

interface VenteParTaille {
  produitNom: string;
  categorie: string;
  taille: string;
  volumeMl: number;
  quantiteVendue: number;
  volumeVenduMl: number;
  volumeVenduKg: number;
  ca: number;
}

interface VenteParCat {
  categorie: string;
  totalMlVendu: number;
  totalKgVendu: number;
  totalFlacons: number;
  ca: number;
  parTaille: Record<string, number>;
}

interface StockItem {
  produit: string;
  categorie: string;
  taille: string;
  volumeMl: number;
  quantite: number;
  stockTotalMl: number;
  stockTotalKg: number;
  enAlerte: boolean;
}

interface Totaux {
  mlVendu: number;
  kgVendu: number;
  flacons: number;
  ca: number;
}

export default function VolumetriePage() {
  const [data, setData] = useState<{
    stockVolumetrique: StockItem[];
    ventesParProduitTaille: VenteParTaille[];
    ventesParCategorie: VenteParCat[];
    totaux: Totaux;
  } | null>(null);
  const [periode, setPeriode] = useState("mois");
  const [loading, setLoading] = useState(true);
  const [viewTab, setViewTab] = useState<"stock" | "ventes" | "categories">(
    "stock"
  );

  useEffect(() => {
    setLoading(true);
    fetch(`/api/stock/volumetrie?periode=${periode}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [periode]);

  const s = { fontFamily: "Jost, sans-serif" };

  return (
    <div style={{ ...s, background: "#F5EFE0", minHeight: "100vh" }}>
      <div
        style={{
          height: "64px",
          background: "white",
          borderBottom: "1px solid rgba(196,150,10,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 2rem",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "1.3rem",
              fontWeight: 400,
              color: "#1A1208",
            }}
          >
            Stock Volumétrique
          </h1>
          <p style={{ fontSize: "0.68rem", color: "#8A7B68" }}>
            Suivi en kg · ml · flacons par taille
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.4rem" }}>
          {[
            { val: "semaine", label: "7 jours" },
            { val: "mois", label: "Ce mois" },
            { val: "annee", label: "Cette année" },
            { val: "tout", label: "Tout" },
          ].map((p) => (
            <button
              key={p.val}
              type="button"
              onClick={() => setPeriode(p.val)}
              style={{
                padding: "0.4rem 0.9rem",
                fontSize: "0.68rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                background: periode === p.val ? "#1A1208" : "white",
                color: periode === p.val ? "white" : "#8A7B68",
                border: "1px solid",
                borderColor:
                  periode === p.val ? "#1A1208" : "rgba(26,18,8,0.12)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "2rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          {[
            {
              label: "Volume vendu",
              value: data ? `${data.totaux.kgVendu.toFixed(2)} kg` : "—",
              sub: data ? `${(data.totaux.mlVendu / 1000).toFixed(1)} L` : "",
              icon: "💧",
              color: "#5A7A9A",
            },
            {
              label: "Flacons vendus",
              value: data ? data.totaux.flacons.toString() : "—",
              sub: "unités toutes tailles",
              icon: "🧴",
              color: "#C4960A",
            },
            {
              label: "Stock total",
              value: data
                ? `${data.stockVolumetrique
                    .reduce((s, i) => s + i.stockTotalKg, 0)
                    .toFixed(2)} kg`
                : "—",
              sub: `${data ? data.stockVolumetrique.reduce((s, i) => s + i.quantite, 0) : 0} flacons`,
              icon: "📦",
              color: "#5A8A5A",
            },
            {
              label: "CA généré",
              value: data ? `${data.totaux.ca.toFixed(0)} DT` : "—",
              sub: "commandes livrées",
              icon: "💰",
              color: "#8A6A2A",
            },
          ].map((k, i) => (
            <div
              key={i}
              style={{
                background: "white",
                border: "1px solid rgba(196,150,10,0.12)",
                borderRadius: "6px",
                padding: "1.4rem",
                borderLeft: `3px solid ${k.color}`,
                boxShadow: "0 2px 8px rgba(26,18,8,0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "0.6rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.62rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "#8A7B68",
                  }}
                >
                  {k.label}
                </span>
                <span style={{ fontSize: "1.1rem", opacity: 0.5 }}>
                  {k.icon}
                </span>
              </div>
              <div
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "2rem",
                  fontWeight: 300,
                  color: "#1A1208",
                  lineHeight: 1,
                  marginBottom: "0.3rem",
                }}
              >
                {k.value}
              </div>
              <div style={{ fontSize: "0.68rem", color: "#8A7B68" }}>
                {k.sub}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: "0",
            marginBottom: "1.5rem",
            borderBottom: "1px solid rgba(196,150,10,0.15)",
          }}
        >
          {[
            { key: "stock" as const, label: "📦 Stock actuel" },
            { key: "ventes" as const, label: "📊 Ventes par taille" },
            { key: "categories" as const, label: "🏷 Par catégorie" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setViewTab(tab.key)}
              style={{
                padding: "0.8rem 1.5rem",
                fontSize: "0.72rem",
                letterSpacing: "0.08em",
                background: "none",
                border: "none",
                borderBottom:
                  viewTab === tab.key
                    ? "2px solid #C4960A"
                    : "2px solid transparent",
                color: viewTab === tab.key ? "#C4960A" : "#8A7B68",
                cursor: "pointer",
                fontFamily: "Jost, sans-serif",
                transition: "all 0.2s",
                marginBottom: "-1px",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div
            style={{
              background: "white",
              padding: "4rem",
              textAlign: "center",
              color: "#8A7B68",
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "1.2rem",
              fontStyle: "italic",
            }}
          >
            Chargement des données...
          </div>
        ) : (
          <>
            {viewTab === "stock" && (
              <div
                style={{
                  background: "white",
                  border: "1px solid rgba(196,150,10,0.12)",
                  borderRadius: "6px",
                  overflow: "hidden",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "rgba(245,239,224,0.6)" }}>
                      {[
                        "Produit",
                        "Catégorie",
                        "Format",
                        "Qté flacons",
                        "Volume/flacon",
                        "Stock total ml",
                        "Stock total kg",
                        "Statut",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "0.8rem 1rem",
                            textAlign: "left",
                            fontSize: "0.62rem",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "#8A7B68",
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data?.stockVolumetrique.map((item, i) => (
                      <tr
                        key={i}
                        style={{
                          borderTop: "1px solid rgba(196,150,10,0.07)",
                          background: item.enAlerte
                            ? "rgba(160,80,80,0.03)"
                            : "transparent",
                        }}
                      >
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <span
                            style={{
                              fontSize: "0.85rem",
                              color: "#1A1208",
                              fontFamily: "Jost, sans-serif",
                              fontWeight: 500,
                            }}
                          >
                            {item.produit}
                          </span>
                        </td>
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <span
                            style={{
                              fontSize: "0.72rem",
                              color: "#8A7B68",
                            }}
                          >
                            {item.categorie}
                          </span>
                        </td>
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <span
                            style={{
                              background: "rgba(196,150,10,0.1)",
                              color: "#C4960A",
                              padding: "0.2rem 0.6rem",
                              fontSize: "0.7rem",
                              letterSpacing: "0.05em",
                              fontWeight: 500,
                            }}
                          >
                            {item.taille}
                          </span>
                        </td>
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <span
                            style={{
                              fontFamily: "Cormorant Garamond, serif",
                              fontSize: "1.1rem",
                              color: "#1A1208",
                            }}
                          >
                            {item.quantite}
                          </span>
                        </td>
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <span
                            style={{
                              fontSize: "0.82rem",
                              color: "#8A7B68",
                            }}
                          >
                            {item.volumeMl} ml
                          </span>
                        </td>
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <span
                            style={{
                              fontFamily: "Cormorant Garamond, serif",
                              fontSize: "1rem",
                              color: "#5A7A9A",
                            }}
                          >
                            {item.stockTotalMl.toFixed(0)} ml
                          </span>
                        </td>
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <span
                            style={{
                              fontFamily: "Cormorant Garamond, serif",
                              fontSize: "1rem",
                              color: "#5A8A5A",
                              fontWeight: 400,
                            }}
                          >
                            {item.stockTotalKg.toFixed(3)} kg
                          </span>
                        </td>
                        <td style={{ padding: "0.85rem 1rem" }}>
                          {item.enAlerte ? (
                            <span
                              style={{
                                background: "rgba(160,80,80,0.1)",
                                color: "#A05050",
                                padding: "0.2rem 0.6rem",
                                fontSize: "0.65rem",
                                letterSpacing: "0.08em",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.3rem",
                              }}
                            >
                              ⚠ Bas
                            </span>
                          ) : (
                            <span
                              style={{
                                background: "rgba(90,138,90,0.1)",
                                color: "#5A8A5A",
                                padding: "0.2rem 0.6rem",
                                fontSize: "0.65rem",
                                letterSpacing: "0.08em",
                              }}
                            >
                              ✓ OK
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {viewTab === "ventes" && (
              <div
                style={{
                  background: "white",
                  border: "1px solid rgba(196,150,10,0.12)",
                  borderRadius: "6px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "1rem 1.5rem",
                    borderBottom: "1px solid rgba(196,150,10,0.1)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "#8A7B68",
                    }}
                  >
                    Pour 1 kg de parfum vendu, combien de flacons de chaque
                    taille ? Ce tableau montre la répartition exacte.
                  </p>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "rgba(245,239,224,0.6)" }}>
                      {[
                        "Produit",
                        "Catégorie",
                        "Format",
                        "Flacons vendus",
                        "Volume vendu (ml)",
                        "Volume vendu (kg)",
                        "CA généré",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "0.8rem 1rem",
                            textAlign: "left",
                            fontSize: "0.62rem",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "#8A7B68",
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data?.ventesParProduitTaille
                      .sort((a, b) => b.volumeVenduMl - a.volumeVenduMl)
                      .map((v, i) => {
                        const maxQte = Math.max(
                          ...(data?.ventesParProduitTaille.map(
                            (x) => x.quantiteVendue
                          ) ?? [1])
                        );
                        const pct =
                          maxQte > 0 ? (v.quantiteVendue / maxQte) * 100 : 0;
                        return (
                          <tr
                            key={i}
                            style={{
                              borderTop: "1px solid rgba(196,150,10,0.07)",
                            }}
                          >
                            <td style={{ padding: "0.85rem 1rem" }}>
                              <span
                                style={{
                                  fontSize: "0.85rem",
                                  color: "#1A1208",
                                  fontWeight: 500,
                                }}
                              >
                                {v.produitNom}
                              </span>
                            </td>
                            <td style={{ padding: "0.85rem 1rem" }}>
                              <span
                                style={{
                                  fontSize: "0.72rem",
                                  color: "#8A7B68",
                                }}
                              >
                                {v.categorie}
                              </span>
                            </td>
                            <td style={{ padding: "0.85rem 1rem" }}>
                              <span
                                style={{
                                  background: "rgba(196,150,10,0.1)",
                                  color: "#C4960A",
                                  padding: "0.2rem 0.6rem",
                                  fontSize: "0.7rem",
                                  fontWeight: 500,
                                }}
                              >
                                {v.taille}
                              </span>
                            </td>
                            <td style={{ padding: "0.85rem 1rem" }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.6rem",
                                }}
                              >
                                <div
                                  style={{
                                    width: "80px",
                                    height: "6px",
                                    background: "rgba(196,150,10,0.12)",
                                    borderRadius: "3px",
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    style={{
                                      height: "100%",
                                      width: `${Math.min(100, pct)}%`,
                                      background:
                                        "linear-gradient(90deg, #C4960A, #E8C96A)",
                                      borderRadius: "3px",
                                    }}
                                  />
                                </div>
                                <span
                                  style={{
                                    fontFamily: "Cormorant Garamond, serif",
                                    fontSize: "1.1rem",
                                    color: "#1A1208",
                                  }}
                                >
                                  {v.quantiteVendue}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: "0.85rem 1rem" }}>
                              <span
                                style={{
                                  fontFamily: "Cormorant Garamond, serif",
                                  fontSize: "1rem",
                                  color: "#5A7A9A",
                                }}
                              >
                                {v.volumeVenduMl.toFixed(0)} ml
                              </span>
                            </td>
                            <td style={{ padding: "0.85rem 1rem" }}>
                              <span
                                style={{
                                  fontFamily: "Cormorant Garamond, serif",
                                  fontSize: "1rem",
                                  color: "#5A8A5A",
                                  fontWeight: 400,
                                }}
                              >
                                {v.volumeVenduKg.toFixed(3)} kg
                              </span>
                            </td>
                            <td style={{ padding: "0.85rem 1rem" }}>
                              <span
                                style={{
                                  fontFamily: "Cormorant Garamond, serif",
                                  fontSize: "1rem",
                                  color: "#C4960A",
                                }}
                              >
                                {v.ca.toFixed(0)} DT
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}

            {viewTab === "categories" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(340px, 1fr))",
                  gap: "1rem",
                }}
              >
                {data?.ventesParCategorie.map((cat, i) => (
                  <div
                    key={i}
                    style={{
                      background: "white",
                      border: "1px solid rgba(196,150,10,0.12)",
                      borderRadius: "6px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding: "1.2rem 1.5rem",
                        borderBottom: "1px solid rgba(196,150,10,0.1)",
                        background:
                          "linear-gradient(135deg, #1A1208, #2C1E10)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <h3
                        style={{
                          fontFamily: "Cormorant Garamond, serif",
                          fontSize: "1.2rem",
                          fontWeight: 300,
                          color: "white",
                        }}
                      >
                        {cat.categorie || "Sans catégorie"}
                      </h3>
                      <span
                        style={{
                          fontFamily: "Cormorant Garamond, serif",
                          fontSize: "1.1rem",
                          color: "#C4960A",
                        }}
                      >
                        {cat.ca.toFixed(0)} DT
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3,1fr)",
                        gap: "1px",
                        background: "rgba(196,150,10,0.1)",
                      }}
                    >
                      {[
                        {
                          label: "Flacons",
                          value: cat.totalFlacons.toString(),
                        },
                        {
                          label: "ml vendus",
                          value: cat.totalMlVendu.toFixed(0),
                        },
                        {
                          label: "kg vendus",
                          value: cat.totalKgVendu.toFixed(3),
                        },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          style={{
                            background: "white",
                            padding: "0.8rem",
                            textAlign: "center",
                          }}
                        >
                          <div
                            style={{
                              fontFamily: "Cormorant Garamond, serif",
                              fontSize: "1.3rem",
                              color: "#1A1208",
                              lineHeight: 1,
                            }}
                          >
                            {stat.value}
                          </div>
                          <div
                            style={{
                              fontSize: "0.62rem",
                              color: "#8A7B68",
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                              marginTop: "0.2rem",
                            }}
                          >
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ padding: "1rem 1.5rem" }}>
                      <div
                        style={{
                          fontSize: "0.62rem",
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          color: "#8A7B68",
                          marginBottom: "0.8rem",
                        }}
                      >
                        Répartition par format
                      </div>
                      {Object.entries(cat.parTaille)
                        .sort((a, b) => b[1] - a[1])
                        .map(([taille, qte]) => {
                          const total = Object.values(
                            cat.parTaille
                          ).reduce((s, q) => s + q, 0);
                          const pct =
                            total > 0 ? (qte / total) * 100 : 0;
                          return (
                            <div
                              key={taille}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.8rem",
                                marginBottom: "0.6rem",
                              }}
                            >
                              <span
                                style={{
                                  width: "52px",
                                  fontSize: "0.72rem",
                                  color: "#C4960A",
                                  fontWeight: 500,
                                  letterSpacing: "0.05em",
                                }}
                              >
                                {taille}
                              </span>
                              <div
                                style={{
                                  flex: 1,
                                  height: "8px",
                                  background: "rgba(196,150,10,0.12)",
                                  borderRadius: "4px",
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    height: "100%",
                                    width: `${pct}%`,
                                    background:
                                      "linear-gradient(90deg, #C4960A, #E8C96A)",
                                    borderRadius: "4px",
                                    transition: "width 0.8s ease",
                                  }}
                                />
                              </div>
                              <span
                                style={{
                                  width: "36px",
                                  textAlign: "right",
                                  fontFamily: "Cormorant Garamond, serif",
                                  fontSize: "1rem",
                                  color: "#1A1208",
                                }}
                              >
                                {qte}
                              </span>
                              <span
                                style={{
                                  width: "36px",
                                  textAlign: "right",
                                  fontSize: "0.65rem",
                                  color: "#8A7B68",
                                }}
                              >
                                {pct.toFixed(0)}%
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
