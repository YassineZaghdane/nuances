import Image from "next/image";
import Link from "next/link";

export default function AProposPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#FDFAF5",
        fontFamily: "Jost, sans-serif",
      }}
    >
      <style>{`
        .about-hero {
          padding-top: 120px;
          padding-bottom: 3rem;
          padding-left: 5%;
          padding-right: 5%;
          text-align: center;
          background: linear-gradient(180deg, #1A1208 0%, #2a1f14 100%);
          position: relative;
          overflow: hidden;
        }
        .about-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 120%, rgba(196,150,10,0.12) 0%, transparent 55%);
          pointer-events: none;
        }
        .about-hero-inner {
          position: relative;
          z-index: 1;
          max-width: 720px;
          margin: 0 auto;
        }
        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(1.5rem, 4vw, 3rem);
          align-items: start;
          max-width: 1120px;
          margin: 0 auto;
          padding: clamp(2rem, 5vw, 4rem) 5% clamp(3rem, 8vw, 5rem);
          box-sizing: border-box;
        }
        .about-image-wrap {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #EDE5D4;
          box-shadow: 0 20px 50px rgba(26, 18, 8, 0.08);
          aspect-ratio: 3 / 4;
          max-height: min(85vh, 640px);
          margin: 0 auto;
          width: 100%;
        }
        .about-copy {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          min-width: 0;
        }
        .about-copy p {
          font-size: clamp(0.9rem, 2.2vw, 1rem);
          line-height: 1.85;
          color: #5c4f42;
          margin: 0;
          max-width: 52ch;
        }
        @media (max-width: 900px) {
          .about-grid {
            grid-template-columns: 1fr;
            padding-left: max(1.25rem, 5%);
            padding-right: max(1.25rem, 5%);
          }
          .about-image-wrap {
            max-height: none;
            aspect-ratio: 4 / 5;
            order: -1;
          }
          .about-copy {
            align-items: stretch;
          }
          .about-copy p {
            max-width: none;
          }
        }
        @media (max-width: 480px) {
          .about-hero {
            padding-top: 100px;
            padding-bottom: 2rem;
          }
        }
      `}</style>

      <header className="about-hero">
        <div className="about-hero-inner">
          <span
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.38em",
              textTransform: "uppercase",
              color: "#C4960A",
              display: "block",
              marginBottom: "1rem",
            }}
          >
            Notre maison
          </span>
          <h1
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "clamp(2.2rem, 6vw, 3.5rem)",
              fontWeight: 300,
              color: "white",
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            À propos de Nuances Parfums
          </h1>
          <p
            style={{
              marginTop: "1.25rem",
              fontSize: "0.95rem",
              color: "rgba(255,255,255,0.55)",
              fontWeight: 300,
              lineHeight: 1.65,
            }}
          >
            Parfumerie à Nabeul — fragrances d&apos;exception, accueil et
            conseil personnalisés.
          </p>
        </div>
      </header>

      <div className="about-grid">
        <div className="about-image-wrap">
          <Image
            src="/images/about/boutique-nabeul.png"
            alt="Façade de la boutique Nuances Parfums à Nabeul"
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            style={{ objectFit: "cover", objectPosition: "center top" }}
            priority
          />
        </div>

        <div className="about-copy">
          <h2
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "clamp(1.5rem, 3.5vw, 2rem)",
              fontWeight: 400,
              color: "#1A1208",
              margin: 0,
              lineHeight: 1.25,
            }}
          >
            L&apos;art du parfum, près de chez vous
          </h2>
          <p>
            Nuances Parfums est une parfumerie tunisienne établie à{" "}
            <strong style={{ color: "#1A1208", fontWeight: 600 }}>Nabeul</strong>
            . Notre passion : vous offrir des huiles et parfums
            d&apos;exception, soigneusement sélectionnés pour leur qualité et
            leur singularité.
          </p>
          <p>
            Nous sommes fiers d&apos;être partenaires de{" "}
            <strong style={{ color: "#C4960A", fontWeight: 600 }}>
              V.o Aromatiques
            </strong>
            , ce qui nous permet de proposer une gamme de fragrances
            authentiques et durables.
          </p>
          <p>
            Que vous soyez à la recherche d&apos;un parfum boisé, floral,
            oriental ou frais, notre équipe est à votre écoute pour vous guider
            et vous faire découvrir les nuances qui vous correspondent.
          </p>
          <div
            style={{
              marginTop: "0.5rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              alignItems: "center",
            }}
          >
            <Link
              href="/boutique"
              style={{
                display: "inline-block",
                background: "#C4960A",
                color: "white",
                padding: "0.75rem 1.75rem",
                fontSize: "0.72rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                textDecoration: "none",
                borderRadius: "3px",
                fontWeight: 500,
              }}
            >
              Découvrir la collection
            </Link>
            <Link
              href="/contact"
              style={{
                display: "inline-block",
                color: "#8A7B68",
                fontSize: "0.78rem",
                letterSpacing: "0.08em",
                textDecoration: "none",
                padding: "0.75rem 0",
              }}
            >
              Nous contacter →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
