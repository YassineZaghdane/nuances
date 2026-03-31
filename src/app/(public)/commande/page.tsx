"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || "21612345678";

const TAILLE_ML: Record<string, number> = {
  "1ml": 1, "2ml": 2, "5ml": 5, "10ml": 10,
  "15ml": 15, "30ml": 30, "50ml": 50, "100ml": 100,
};

export default function CommandePage() {
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const { items, total, clearCart, updateQty, removeItem } = useCartStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nom: "",
    telephone: "",
    email: "",
    adresse: "",
    ville: "",
    notes: "",
    paiement: "PAIEMENT_LIVRAISON",
  });

  const fraisLivraison = 8;
  const totalFinal = Number(total()) + fraisLivraison;

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 960);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleSubmit = async () => {
    if (!form.nom || !form.telephone || !form.adresse || !form.ville) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/commandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: {
            nom: form.nom,
            telephone: form.telephone,
            email: form.email || undefined,
            adresse: form.adresse,
            ville: form.ville,
          },
          lignes: items.map((i) => {
            const ml = TAILLE_ML[i.taille] ?? 0;
            return {
              produitId: i.produitId,
              taille: i.taille,
              quantite: i.quantite,
              prixUnitaire: Number(i.prix),
              volumeMl: ml,
              volumeMlTotal: ml * i.quantite,
            };
          }),
          modePaiement: form.paiement,
          notes: form.notes || undefined,
        }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error || "Erreur");
      }
      const data = await res.json();
      clearCart();
      router.push(`/commande/confirmation?numero=${data.numero || ""}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Une erreur est survenue. Veuillez réessayer.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && step === 1) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#FDFAF5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "2rem",
          fontFamily: "Jost, sans-serif",
        }}
      >
        <div
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: "5rem",
            color: "rgba(196,150,10,0.2)",
          }}
        >
          ✿
        </div>
        <h2
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: "2rem",
            fontWeight: 300,
            color: "#1A1208",
          }}
        >
          Votre panier est vide
        </h2>
        <a
          href="/boutique"
          style={{
            background: "#C4960A",
            color: "white",
            padding: "1rem 2.5rem",
            textDecoration: "none",
            fontSize: "0.75rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontFamily: "Jost, sans-serif",
          }}
        >
          Découvrir nos parfums
        </a>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#FDFAF5",
        fontFamily: "Jost, sans-serif",
      }}
    >
      <div
        style={{
          background: "#1A1208",
          paddingTop: "100px",
          paddingBottom: "40px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: "clamp(2rem, 4vw, 3.5rem)",
            fontWeight: 300,
            color: "white",
          }}
        >
          Ma Commande
        </h1>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0",
            marginTop: "2rem",
          }}
        >
          {[
            { n: 1, label: "Panier" },
            { n: 2, label: "Coordonnées" },
            { n: 3, label: "Confirmation" },
          ].map((s, i) => (
            <div key={s.n} style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background:
                      step >= s.n ? "#C4960A" : "rgba(255,255,255,0.1)",
                    border:
                      step >= s.n
                        ? "none"
                        : "1px solid rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: "1rem",
                    color: "white",
                    transition: "all 0.3s",
                  }}
                >
                  {step > s.n ? "✓" : s.n}
                </div>
                <span
                  style={{
                    fontSize: "0.62rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: step >= s.n ? "#C4960A" : "rgba(255,255,255,0.3)",
                  }}
                >
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div
                  style={{
                    width: "80px",
                    height: "1px",
                    background:
                      step > s.n ? "#C4960A" : "rgba(255,255,255,0.15)",
                    margin: "0 0.5rem",
                    marginBottom: "1.4rem",
                    transition: "background 0.3s",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "3rem 2rem",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 360px",
          gap: "2rem",
          alignItems: "start",
        }}
      >
        {step === 1 && (
          <div>
            <h2
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "1.8rem",
                fontWeight: 300,
                color: "#1A1208",
                marginBottom: "1.5rem",
              }}
            >
              Votre sélection
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {items.map((item) => (
                <div
                  key={`${item.produitId}-${item.taille}`}
                  style={{
                    background: "white",
                    border: "1px solid rgba(196,150,10,0.12)",
                    padding: "1.2rem 1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1.2rem",
                  }}
                >
                  <div
                    style={{
                      width: "70px",
                      height: "85px",
                      flexShrink: 0,
                      background:
                        "linear-gradient(145deg, #EDE5D4, #D4B896)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                      color: "rgba(196,150,10,0.4)",
                      overflow: "hidden",
                    }}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      "✿"
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontFamily: "Cormorant Garamond, serif",
                        fontSize: "1.1rem",
                        color: "#1A1208",
                        marginBottom: "0.2rem",
                      }}
                    >
                      {item.nom}
                    </h3>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "#C4960A",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      {item.taille}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      border: "1px solid rgba(26,18,8,0.12)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        updateQty(
                          item.produitId,
                          item.taille,
                          item.quantite - 1
                        )
                      }
                      style={{
                        width: "32px",
                        height: "32px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1rem",
                        color: "#1A1208",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      −
                    </button>
                    <span
                      style={{
                        width: "36px",
                        textAlign: "center",
                        fontSize: "0.85rem",
                        fontFamily: "Jost, sans-serif",
                      }}
                    >
                      {item.quantite}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQty(
                          item.produitId,
                          item.taille,
                          item.quantite + 1
                        )
                      }
                      style={{
                        width: "32px",
                        height: "32px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1rem",
                        color: "#1A1208",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      +
                    </button>
                  </div>

                  <div style={{ textAlign: "right", minWidth: "80px" }}>
                    <div
                      style={{
                        fontFamily: "Cormorant Garamond, serif",
                        fontSize: "1.2rem",
                        color: "#C4960A",
                      }}
                    >
                      {(Number(item.prix) * item.quantite).toFixed(0)} DT
                    </div>
                    <div
                      style={{
                        fontSize: "0.65rem",
                        color: "#8A7B68",
                      }}
                    >
                      {Number(item.prix).toFixed(0)} DT/u
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeItem(item.produitId, item.taille)
                    }
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#8A7B68",
                      fontSize: "1rem",
                      padding: "0.3rem",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "2rem",
                display: "flex",
                gap: "1rem",
              }}
            >
              <a
                href="/boutique"
                style={{
                  flex: 1,
                  textAlign: "center",
                  border: "1px solid rgba(26,18,8,0.15)",
                  color: "#8A7B68",
                  padding: "0.9rem",
                  fontFamily: "Jost, sans-serif",
                  fontSize: "0.72rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  display: "block",
                }}
              >
                ← Continuer mes achats
              </a>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  flex: 2,
                  background: "#1A1208",
                  color: "white",
                  border: "none",
                  padding: "0.9rem",
                  fontFamily: "Jost, sans-serif",
                  fontSize: "0.75rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "1.8rem",
                fontWeight: 300,
                color: "#1A1208",
                marginBottom: "1.5rem",
              }}
            >
              Vos coordonnées
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.68rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "#8A7B68",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    placeholder="Votre nom"
                    value={form.nom}
                    onChange={(e) =>
                      setForm({ ...form, nom: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "0.85rem 1rem",
                      border: "1px solid rgba(26,18,8,0.15)",
                      background: "white",
                      fontFamily: "Jost, sans-serif",
                      fontSize: "0.88rem",
                      color: "#1A1208",
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.68rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "#8A7B68",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    placeholder="XX XXX XXX"
                    value={form.telephone}
                    onChange={(e) =>
                      setForm({ ...form, telephone: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "0.85rem 1rem",
                      border: "1px solid rgba(26,18,8,0.15)",
                      background: "white",
                      fontFamily: "Jost, sans-serif",
                      fontSize: "0.88rem",
                      color: "#1A1208",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.68rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "#8A7B68",
                    marginBottom: "0.5rem",
                  }}
                >
                  Email (optionnel)
                </label>
                <input
                  type="email"
                  placeholder="email@exemple.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.85rem 1rem",
                    border: "1px solid rgba(26,18,8,0.15)",
                    background: "white",
                    fontFamily: "Jost, sans-serif",
                    fontSize: "0.88rem",
                    color: "#1A1208",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.68rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "#8A7B68",
                    marginBottom: "0.5rem",
                  }}
                >
                  Adresse de livraison *
                </label>
                <input
                  type="text"
                  placeholder="Adresse complète"
                  value={form.adresse}
                  onChange={(e) =>
                    setForm({ ...form, adresse: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.85rem 1rem",
                    border: "1px solid rgba(26,18,8,0.15)",
                    background: "white",
                    fontFamily: "Jost, sans-serif",
                    fontSize: "0.88rem",
                    color: "#1A1208",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.68rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "#8A7B68",
                    marginBottom: "0.5rem",
                  }}
                >
                  Ville *
                </label>
                <select
                  value={form.ville}
                  onChange={(e) =>
                    setForm({ ...form, ville: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.85rem 1rem",
                    border: "1px solid rgba(26,18,8,0.15)",
                    background: "white",
                    fontFamily: "Jost, sans-serif",
                    fontSize: "0.88rem",
                    color: "#1A1208",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="">Sélectionner une ville</option>
                  {[
                    "Nabeul",
                    "Tunis",
                    "Sfax",
                    "Sousse",
                    "Monastir",
                    "Hammamet",
                    "Bizerte",
                    "Kairouan",
                    "Gabès",
                    "Ariana",
                    "Ben Arous",
                    "La Marsa",
                    "Carthage",
                    "Autre",
                  ].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.68rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "#8A7B68",
                    marginBottom: "1rem",
                  }}
                >
                  Mode de paiement
                </label>
                <div style={{ display: "flex", gap: "0.8rem", flexWrap: isMobile ? "wrap" : "nowrap" }}>
                  {[
                    {
                      val: "PAIEMENT_LIVRAISON",
                      label: "💵 À la livraison",
                      sub: "Cash à réception",
                    },
                    {
                      val: "VIREMENT",
                      label: "🏦 Virement",
                      sub: "Bancaire",
                    },
                  ].map((opt) => (
                    <div
                      key={opt.val}
                      onClick={() =>
                        setForm({ ...form, paiement: opt.val })
                      }
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        setForm({ ...form, paiement: opt.val })
                      }
                      style={{
                        flex: 1,
                        padding: "1rem",
                        border: `1px solid ${
                          form.paiement === opt.val
                            ? "#C4960A"
                            : "rgba(26,18,8,0.12)"
                        }`,
                        background:
                          form.paiement === opt.val
                            ? "rgba(196,150,10,0.06)"
                            : "white",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#1A1208",
                          marginBottom: "0.2rem",
                          fontFamily: "Jost, sans-serif",
                        }}
                      >
                        {opt.label}
                      </div>
                      <div
                        style={{
                          fontSize: "0.68rem",
                          color: "#8A7B68",
                        }}
                      >
                        {opt.sub}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.68rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "#8A7B68",
                    marginBottom: "0.5rem",
                  }}
                >
                  Notes (optionnel)
                </label>
                <textarea
                  placeholder="Instructions particulières, parfums préférés..."
                  value={form.notes}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "0.85rem 1rem",
                    border: "1px solid rgba(26,18,8,0.15)",
                    background: "white",
                    fontFamily: "Jost, sans-serif",
                    fontSize: "0.88rem",
                    color: "#1A1208",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                marginTop: "2rem",
              }}
            >
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  border: "1px solid rgba(26,18,8,0.15)",
                  background: "none",
                  color: "#8A7B68",
                  padding: "0.9rem",
                  fontFamily: "Jost, sans-serif",
                  fontSize: "0.72rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                ← Retour
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  flex: 2,
                  background: loading
                    ? "#8A7B68"
                    : "linear-gradient(135deg, #C4960A, #A07808)",
                  color: "white",
                  border: "none",
                  padding: "0.9rem",
                  fontFamily: "Jost, sans-serif",
                  fontSize: "0.75rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: loading
                    ? "none"
                    : "0 8px 24px rgba(196,150,10,0.35)",
                  transition: "all 0.3s",
                }}
              >
                {loading ? "Traitement..." : "✓ Confirmer ma commande"}
              </button>
            </div>
          </div>
        )}

        <div
          style={{
            background: "white",
            border: "1px solid rgba(196,150,10,0.15)",
            position: isMobile ? "static" : "sticky",
            top: isMobile ? "auto" : "100px",
          }}
        >
          <div
            style={{
              padding: "1.5rem",
              borderBottom: "1px solid rgba(196,150,10,0.12)",
            }}
          >
            <h3
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "1.2rem",
                fontWeight: 400,
                color: "#1A1208",
              }}
            >
              Résumé
            </h3>
          </div>

          <div style={{ padding: "1.2rem 1.5rem" }}>
            {items.map((item) => (
              <div
                key={`${item.produitId}-${item.taille}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.6rem 0",
                  borderBottom:
                    "1px solid rgba(196,150,10,0.08)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.82rem",
                      color: "#1A1208",
                      fontFamily: "Jost, sans-serif",
                    }}
                  >
                    {item.nom}
                  </div>
                  <div
                    style={{
                      fontSize: "0.65rem",
                      color: "#C4960A",
                    }}
                  >
                    {item.taille} × {item.quantite}
                  </div>
                </div>
                <span
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: "0.95rem",
                    color: "#1A1208",
                  }}
                >
                  {(Number(item.prix) * item.quantite).toFixed(0)} DT
                </span>
              </div>
            ))}
          </div>

          <div style={{ padding: "1rem 1.5rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0.5rem 0",
                fontSize: "0.82rem",
                color: "#8A7B68",
                fontFamily: "Jost, sans-serif",
              }}
            >
              <span>Sous-total</span>
              <span>{Number(total()).toFixed(0)} DT</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0.5rem 0",
                fontSize: "0.82rem",
                color: "#8A7B68",
                fontFamily: "Jost, sans-serif",
              }}
            >
              <span>Livraison</span>
              <span style={{ color: "#5A8A5A" }}>
                + {fraisLivraison} DT
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "1rem 0 0",
                borderTop: "1px solid rgba(196,150,10,0.15)",
                marginTop: "0.5rem",
              }}
            >
              <span
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "1.1rem",
                  color: "#1A1208",
                }}
              >
                Total
              </span>
              <span
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "1.4rem",
                  color: "#C4960A",
                  fontWeight: 400,
                }}
              >
                {totalFinal.toFixed(0)} DT
              </span>
            </div>
          </div>

          <div
            style={{
              padding: "1rem 1.5rem",
              borderTop: "1px solid rgba(196,150,10,0.1)",
              background: "rgba(196,150,10,0.03)",
            }}
          >
            {[
              ["✓", "Paiement sécurisé à la livraison"],
              ["✓", "Livraison sous 2-3 jours"],
              ["✓", "Produits 100% authentiques"],
            ].map(([icon, text]) => (
              <div
                key={text}
                style={{
                  display: "flex",
                  gap: "0.6rem",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                  fontSize: "0.72rem",
                  color: "#5A8A5A",
                  fontFamily: "Jost, sans-serif",
                }}
              >
                <span>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>

          <div
            style={{
              padding: "1rem 1.5rem",
              borderTop: "1px solid rgba(196,150,10,0.1)",
              textAlign: "center",
            }}
          >
            <a
              href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                "Bonjour Nuances Parfums, je souhaite passer une commande."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                fontSize: "0.72rem",
                color: "#25D366",
                textDecoration: "none",
                fontFamily: "Jost, sans-serif",
              }}
            >
              <span>💬</span> Commander via WhatsApp
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
