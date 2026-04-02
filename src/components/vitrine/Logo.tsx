import Image from 'next/image'

export function Logo({ dark = false }: { dark?: boolean }) {
  // Sur fond clair (navbar, sidebar) → image du logo
  if (dark) {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Image
          src="/images/brand/logo.png"
          alt="Nuances Parfums"
          width={140}
          height={52}
          priority
          style={{ objectFit: 'contain', display: 'block' }}
        />
      </div>
    )
  }

  // Sur fond sombre (hero, email) → version texte blanche
  return (
    <div style={{ textAlign: 'center', lineHeight: 1 }}>
      <div style={{ fontSize: '1.2rem', color: 'white' }}>✿</div>
      <div style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '1.4rem',
        fontWeight: 700,
        letterSpacing: '0.25em',
        color: 'white',
        textTransform: 'uppercase'
      }}>NUANCES</div>
      <div style={{
        fontFamily: 'Jost, sans-serif',
        fontSize: '0.55rem',
        letterSpacing: '0.3em',
        color: '#E8C96A',
        textTransform: 'uppercase'
      }}>— PARFUMS —</div>
    </div>
  )
}
