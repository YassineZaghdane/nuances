"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || "21696557557";

function ConfirmationContent() {
  const params = useSearchParams();
  const numero = params.get("numero") || "NP-2026-XXXX";
  const [details, setDetails] = useState<{
    statut: string;
    montantTotal: number;
    fraisLivraison: number;
    villeLivraison: string | null;
    adresseLivraison: string | null;
    lignes: Array<{ produit: string | { nom: string }; taille: string; quantite: number; prixUnitaire?: number }>;
  } | null>(null);

  useEffect(() => {
    if (!numero) return;
    fetch(`/api/commandes/suivi?numero=${encodeURIComponent(numero)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setDetails(d);
      })
      .catch(() => {});
  }, [numero]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#FDFAF5",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "7rem 2rem 2rem",
        fontFamily: "Jost, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "560px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #C4960A, #A07808)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 2rem",
            boxShadow: "0 16px 48px rgba(196,150,10,0.3)",
            animation: "scaleIn 0.6s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          <span style={{ fontSize: "2.5rem", color: "white" }}>✓</span>
        </div>

        <h1
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 300,
            color: "#1A1208",
            marginBottom: "0.5rem",
          }}
        >
          Commande confirmée !
        </h1>

        <p
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: "1.1rem",
            fontStyle: "italic",
            color: "#8A7B68",
            marginBottom: "2.5rem",
          }}
        >
          Merci pour votre confiance
        </p>

        <div
          style={{
            background: "white",
            border: "1px solid rgba(196,150,10,0.2)",
            padding: "1.5rem 2rem",
            marginBottom: "2rem",
            display: "inline-block",
          }}
        >
          <div
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#8A7B68",
              marginBottom: "0.5rem",
            }}
          >
            Numéro de commande
          </div>
          <div
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "1.8rem",
              color: "#C4960A",
              fontWeight: 400,
            }}
          >
            {numero}
          </div>
        </div>

        <div
          style={{
            background: "white",
            border: "1px solid rgba(196,150,10,0.12)",
            padding: "1.5rem 2rem",
            marginBottom: "2rem",
            textAlign: "left",
          }}
        >
          <h3
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "1.1rem",
              color: "#1A1208",
              marginBottom: "1rem",
            }}
          >
            Prochaines étapes
          </h3>
          {[
            {
              icon: "📞",
              text: "Notre équipe vous contacte sous 24h",
              done: true,
            },
            {
              icon: "📦",
              text: "Préparation de votre commande",
              done: false,
            },
            {
              icon: "🚚",
              text: "Livraison sous 2-3 jours",
              done: false,
            },
            {
              icon: "✨",
              text: "Profitez de vos parfums !",
              done: false,
            },
          ].map((step, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "0.6rem 0",
                opacity: step.done ? 1 : 0.5,
              }}
            >
              <span>{step.icon}</span>
              <span
                style={{
                  fontSize: "0.85rem",
                  color: "#1A1208",
                  fontFamily: "Jost, sans-serif",
                }}
              >
                {step.text}
              </span>
              {step.done && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "0.7rem",
                    color: "#5A8A5A",
                    fontWeight: 500,
                  }}
                >
                  ✓
                </span>
              )}
            </div>
          ))}
        </div>

        {details && (
          <div
            style={{
              background: "white",
              border: "1px solid rgba(196,150,10,0.12)",
              padding: "1.2rem 1.4rem",
              marginBottom: "2rem",
              textAlign: "left",
            }}
          >
            <h3
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "1.1rem",
                color: "#1A1208",
                marginBottom: "0.8rem",
              }}
            >
              Détails de suivi
            </h3>
            <p style={{ margin: "0 0 0.4rem", fontSize: "0.82rem", color: "#3B2D1F" }}>
              Statut: <strong>{details.statut}</strong>
            </p>
            <p style={{ margin: "0 0 0.4rem", fontSize: "0.82rem", color: "#3B2D1F" }}>
              Total: <strong>{details.montantTotal.toFixed(2)} DT</strong>
            </p>
            <p style={{ margin: "0 0 0.8rem", fontSize: "0.82rem", color: "#3B2D1F" }}>
              Livraison: <strong>{details.adresseLivraison || "—"}, {details.villeLivraison || "—"}</strong>
            </p>
            <div style={{ fontSize: "0.8rem", color: "#6F5B45" }}>
              {details.lignes.map((l, idx) => {
                const nom = typeof l.produit === "string" ? l.produit : l.produit?.nom ?? "";
                return (
                  <div key={`${nom}-${idx}`} style={{ padding: "0.2rem 0" }}>
                    {l.quantite}x {nom} ({l.taille})
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: "2rem",
          }}
        >
          <a
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
              `Bonjour, je viens de passer la commande ${numero} et je souhaite avoir des informations sur la livraison.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "#25D366",
              color: "white",
              padding: "0.9rem 1.8rem",
              fontFamily: "Jost, sans-serif",
              fontSize: "0.75rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            💬 Suivre sur WhatsApp
          </a>

          <Link
            href="/boutique"
            style={{
              border: "1px solid rgba(26,18,8,0.15)",
              color: "#8A7B68",
              padding: "0.9rem 1.8rem",
              fontFamily: "Jost, sans-serif",
              fontSize: "0.75rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            ← Continuer mes achats
          </Link>
        </div>

        <p
          style={{
            fontSize: "0.78rem",
            color: "#8A7B68",
            lineHeight: 1.7,
            fontWeight: 300,
          }}
        >
          Un email de confirmation vous sera envoyé si vous avez fourni votre
          adresse email. Notre équipe vous contactera pour organiser la
          livraison.
        </p>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </main>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
