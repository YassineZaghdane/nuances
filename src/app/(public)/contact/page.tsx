import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Nuances Parfums — Nabeul. Horaires, téléphone, WhatsApp, Instagram et plan d’accès.",
};

const MAPS_URL =
  "https://www.google.com/maps/place/Nuances+Parfums/@36.4547717,10.7338328,17z/data=!3m1!4b1!4m6!3m5!1s0x130299000c2e3b5f:0x8cf69e4033a7386!8m2!3d36.4547674!4d10.7364077!16s%2Fg%2F11msf5xmmr";

function formatTnDisplay(e164: string) {
  if (e164.length === 11 && e164.startsWith("216")) {
    const r = e164.slice(3);
    return `+216 ${r.slice(0, 2)} ${r.slice(2, 5)} ${r.slice(5)}`;
  }
  return `+${e164}`;
}

export default function ContactPage() {
  const waRaw = (process.env.NEXT_PUBLIC_WHATSAPP || "21696557557").replace(/\D/g, "");
  const waE164 = waRaw.startsWith("216") ? waRaw : `216${waRaw}`;
  const phoneDisplay = formatTnDisplay(waE164);
  const telHref = `tel:+${waE164}`;
  const waHref = `https://wa.me/${waE164}`;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#FDFAF5",
        fontFamily: "Jost, sans-serif",
      }}
    >
      {/* Hero */}
      <section
        style={{
          paddingTop: "120px",
          paddingBottom: "3.5rem",
          paddingLeft: "max(1.25rem, 6%)",
          paddingRight: "max(1.25rem, 6%)",
          background: "linear-gradient(165deg, #1A1208 0%, #2C1E10 55%, #3D2A14 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 120%, rgba(196,150,10,0.1) 0%, transparent 50%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 1, maxWidth: "720px", margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "#C4960A",
              marginBottom: "1rem",
            }}
          >
            <Link href="/" style={{ color: "#C4B090", textDecoration: "none" }}>
              Accueil
            </Link>
            <span style={{ color: "rgba(255,255,255,0.25)", margin: "0 0.5rem" }}>›</span>
            <span style={{ color: "#C4960A" }}>Contact</span>
          </div>
          <h1
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
              fontWeight: 300,
              color: "white",
              lineHeight: 1.12,
              marginBottom: "1rem",
            }}
          >
            Nous contacter
          </h1>
          <p
            style={{
              fontSize: "0.92rem",
              lineHeight: 1.75,
              color: "rgba(255,255,255,0.5)",
              fontWeight: 300,
              maxWidth: "440px",
              margin: "0 auto",
            }}
          >
            Une question, un conseil parfum ou une commande — écrivez-nous ou passez en boutique à
            Nabeul.
          </p>
        </div>
      </section>

      {/* Contenu */}
      <section
        style={{
          maxWidth: "1040px",
          margin: "0 auto",
          padding: "clamp(2.5rem, 6vw, 4rem) max(1.25rem, 6%)",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: "clamp(1.5rem, 4vw, 2.5rem)",
          alignItems: "start",
        }}
        className="contact-grid"
      >
        <style>{`
          @media (max-width: 900px) {
            .contact-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {(
            [
              {
                k: "adresse",
                label: "Adresse",
                body: "Nabeul 8000, Tunisie",
                href: MAPS_URL,
                cta: "Voir sur Google Maps →",
                external: true,
              },
              {
                k: "horaires",
                label: "Horaires",
                body: "Lundi — Samedi · 9h — 18h",
                href: null,
                cta: null,
                external: false,
              },
              {
                k: "tel",
                label: "Téléphone",
                body: phoneDisplay,
                href: telHref,
                cta: "Appeler",
                external: false,
              },
              {
                k: "wa",
                label: "WhatsApp",
                body: "Message rapide pour commande ou conseil",
                href: waHref,
                cta: "Ouvrir WhatsApp",
                external: true,
              },
              {
                k: "ig",
                label: "Instagram",
                body: "@nuances.parfums",
                href: "https://www.instagram.com/nuances.parfums/",
                cta: "Suivre sur Instagram",
                external: true,
              },
            ] as const
          ).map((item) => (
            <div
              key={item.k}
              style={{
                background: "white",
                border: "1px solid rgba(196,150,10,0.15)",
                borderRadius: "8px",
                padding: "1.35rem 1.5rem",
                boxShadow: "0 8px 32px rgba(26,18,8,0.04)",
              }}
            >
              <div
                style={{
                  fontSize: "0.62rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#C4960A",
                  marginBottom: "0.5rem",
                }}
              >
                {item.label}
              </div>
              <p
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "1.25rem",
                  fontWeight: 400,
                  color: "#1A1208",
                  margin: "0 0 0.75rem",
                  lineHeight: 1.35,
                }}
              >
                {item.body}
              </p>
              {item.href && item.cta ? (
                <Link
                  href={item.href}
                  {...(item.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  style={{
                    fontSize: "0.72rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#C4960A",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  {item.cta}
                </Link>
              ) : null}
            </div>
          ))}
        </div>

        <div
          style={{
            position: "sticky",
            top: "96px",
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid rgba(196,150,10,0.2)",
            boxShadow: "0 16px 48px rgba(26,18,8,0.08)",
            background: "#fff",
            minHeight: "280px",
          }}
        >
          <iframe
            title="Nuances Parfums — Nabeul"
            src="https://maps.google.com/maps?q=Nuances%20Parfums%20Nabeul&t=&z=16&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="360"
            style={{ border: 0, display: "block" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div
            style={{
              padding: "1rem 1.25rem",
              borderTop: "1px solid #F0EBE0",
              fontSize: "0.78rem",
              color: "#8A7B68",
              lineHeight: 1.6,
            }}
          >
            Représentant officiel V.o Aromatiques — extraits purs, classiques & niche.
          </div>
        </div>
      </section>

      <div
        style={{
          textAlign: "center",
          paddingBottom: "3rem",
        }}
      >
        <Link
          href="/boutique"
          style={{
            display: "inline-block",
            background: "linear-gradient(135deg,#C4960A,#A07808)",
            color: "white",
            padding: "0.9rem 2rem",
            fontSize: "0.72rem",
            fontWeight: 500,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            textDecoration: "none",
            borderRadius: "2px",
            boxShadow: "0 8px 24px rgba(196,150,10,0.3)",
          }}
        >
          Voir la boutique
        </Link>
      </div>
    </main>
  );
}
