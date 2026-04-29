import Link from "next/link";

const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP || "21696557557";

function IconMapPin() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 5h18v14H3z" />
      <path d="M3 5l9 8 9-8" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__col footer__col--brand">
          <Link href="/" className="footer__logo">
            Nuances Parfums
          </Link>
          <p className="footer__tagline">
            Parfumerie à Nabeul.<br />
            Huiles et parfums d&apos;exception.
          </p>
          <div className="footer__separateur" />
        </div>

        <div className="footer__col">
          <h3 className="footer__titre">Contact</h3>
          <ul className="footer__liste">
            <li>
              <IconMapPin />
              Nabeul, Tunisie
            </li>
            <li>
              <IconInstagram />
              <a
                href="https://instagram.com/nuancesparfums"
                target="_blank"
                rel="noopener noreferrer"
              >
                @nuancesparfums
              </a>
            </li>
            <li>
              <IconMail />
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </div>

        <div className="footer__col">
          <h3 className="footer__titre">Liens</h3>
          <ul className="footer__liste footer__liste--liens">
            <li>
              <Link href="/boutique">Boutique</Link>
            </li>
            <li>
              <Link href="/a-propos">À propos</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
            <li>
              <Link href="/commande">Commander</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer__bas">
        <p>© 2026 Nuances Parfums. Tous droits réservés.</p>
        <p className="footer__bas-deco">✦ Excellence · Authenticité · Raffinement ✦</p>
      </div>
    </footer>
  );
}
