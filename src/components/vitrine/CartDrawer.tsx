"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useCartStore } from "@/store/cart-store";

export function CartDrawer() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQty,
    total,
    count,
  } = useCartStore();

  return (
    <>
      <div
        onClick={closeCart}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          background: "rgba(26,18,8,0.5)",
          backdropFilter: "blur(4px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "all" : "none",
          transition: "opacity 0.4s ease",
        }}
      />

      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "420px",
          height: "100vh",
          background: "#FDFAF5",
          zIndex: 201,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition:
            "transform 0.4s cubic-bezier(0.16,1,0.3,1)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-20px 0 60px rgba(26,18,8,0.15)",
        }}
      >
        <div
          style={{
            padding: "1.5rem 1.8rem",
            borderBottom: "1px solid rgba(196,150,10,0.15)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "1.5rem",
                fontWeight: 300,
                color: "#1A1208",
              }}
            >
              Mon Panier
            </h2>
            <p
              style={{
                fontSize: "0.72rem",
                color: "#8A7B68",
                fontFamily: "Jost, sans-serif",
                marginTop: "0.2rem",
              }}
            >
              {count()} article{count() > 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={closeCart}
            type="button"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.5rem",
              color: "#8A7B68",
              padding: "0.3rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color 0.2s",
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.2rem 1.8rem",
          }}
        >
          {items.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: "1.5rem",
              }}
            >
              <div
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "4rem",
                  color: "rgba(196,150,10,0.2)",
                }}
              >
                ✿
              </div>
              <p
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "1.2rem",
                  color: "#8A7B68",
                  fontStyle: "italic",
                  textAlign: "center",
                }}
              >
                Votre panier est vide
              </p>
              <button
                onClick={closeCart}
                type="button"
                style={{
                  background: "#1A1208",
                  color: "white",
                  border: "none",
                  padding: "0.8rem 2rem",
                  fontSize: "0.72rem",
                  fontFamily: "Jost, sans-serif",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Découvrir nos parfums
              </button>
            </div>
          ) : (
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
                    display: "flex",
                    gap: "1rem",
                    padding: "1rem",
                    background: "white",
                    border: "1px solid rgba(196,150,10,0.1)",
                  }}
                >
                  <div
                    style={{
                      width: "64px",
                      height: "80px",
                      background:
                        "linear-gradient(145deg, #EDE5D4, #D4B896)",
                      flexShrink: 0,
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
                    <h4
                      style={{
                        fontFamily: "Cormorant Garamond, serif",
                        fontSize: "1rem",
                        color: "#1A1208",
                        marginBottom: "0.2rem",
                      }}
                    >
                      {item.nom}
                    </h4>
                    <p
                      style={{
                        fontSize: "0.68rem",
                        color: "#C4960A",
                        fontFamily: "Jost, sans-serif",
                        marginBottom: "0.8rem",
                      }}
                    >
                      {item.taille}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid rgba(26,18,8,0.15)",
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
                            width: "28px",
                            height: "28px",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#1A1208",
                            fontSize: "1rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          −
                        </button>
                        <span
                          style={{
                            width: "32px",
                            textAlign: "center",
                            fontSize: "0.82rem",
                            fontFamily: "Jost, sans-serif",
                            color: "#1A1208",
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
                            width: "28px",
                            height: "28px",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#1A1208",
                            fontSize: "1rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          +
                        </button>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.8rem",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "Cormorant Garamond, serif",
                            fontSize: "1.1rem",
                            color: "#C4960A",
                          }}
                        >
                          {(item.prix * item.quantite).toFixed(0)} DT
                        </span>
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
                            fontSize: "0.8rem",
                            padding: "0.2rem",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div
            style={{
              padding: "1.5rem 1.8rem",
              borderTop: "1px solid rgba(196,150,10,0.15)",
              background: "white",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.6rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.78rem",
                  color: "#8A7B68",
                  fontFamily: "Jost, sans-serif",
                }}
              >
                Sous-total
              </span>
              <span
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "1rem",
                  color: "#1A1208",
                }}
              >
                {total().toFixed(0)} DT
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1.5rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.78rem",
                  color: "#8A7B68",
                  fontFamily: "Jost, sans-serif",
                }}
              >
                Livraison
              </span>
              <span
                style={{
                  fontSize: "0.78rem",
                  color: "#5A8A5A",
                  fontFamily: "Jost, sans-serif",
                }}
              >
                Calculée à la commande
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1.5rem",
                paddingTop: "1rem",
                borderTop: "1px solid rgba(196,150,10,0.15)",
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
                {total().toFixed(0)} DT
              </span>
            </div>

            <Link
              href="/commande"
              onClick={closeCart}
              style={{
                display: "block",
                textAlign: "center",
                background:
                  "linear-gradient(135deg, #C4960A, #A07808)",
                color: "white",
                padding: "1.1rem",
                fontFamily: "Jost, sans-serif",
                fontSize: "0.75rem",
                fontWeight: 500,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                textDecoration: "none",
                boxShadow: "0 8px 24px rgba(196,150,10,0.35)",
                marginBottom: "0.8rem",
                transition: "all 0.3s",
              }}
            >
              Commander maintenant
            </Link>

            <button
              type="button"
              onClick={closeCart}
              style={{
                display: "block",
                width: "100%",
                textAlign: "center",
                background: "none",
                border: "1px solid rgba(26,18,8,0.15)",
                color: "#8A7B68",
                padding: "0.8rem",
                fontFamily: "Jost, sans-serif",
                fontSize: "0.72rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Continuer mes achats
            </button>
          </div>
        )}
      </div>
    </>
  );
}
