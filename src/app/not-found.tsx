import Link from 'next/link'

export default function NotFound() {
  return (
    <main style={{
      minHeight: '100vh', background: '#FDFAF5',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexDirection: 'column',
      gap: '1.5rem', fontFamily: 'Jost,sans-serif',
      padding: '2rem', textAlign: 'center',
    }}>
      <div style={{
        fontFamily: 'Cormorant Garamond,serif',
        fontSize: '7rem', fontWeight: 300,
        color: 'rgba(196,150,10,0.12)', lineHeight: 1,
      }}>404</div>
      <div style={{
        fontFamily: 'Cormorant Garamond,serif',
        fontSize: '1.5rem', color: 'rgba(196,150,10,0.3)',
      }}>✿</div>
      <h1 style={{
        fontFamily: 'Cormorant Garamond,serif',
        fontSize: '2rem', fontWeight: 300, color: '#1A1208',
      }}>Page introuvable</h1>
      <p style={{
        fontSize: '0.85rem', color: '#8A7B68',
        maxWidth: '360px', lineHeight: 1.7,
      }}>
        Cette page n'existe pas ou a été déplacée.
      </p>
      <div style={{
        display: 'flex', gap: '0.8rem',
        flexWrap: 'wrap', justifyContent: 'center',
      }}>
        <Link href="/" style={{
          padding: '0.8rem 1.8rem',
          background: '#1A1208', color: 'white',
          fontFamily: 'Jost,sans-serif',
          fontSize: '0.72rem', letterSpacing: '0.15em',
          textTransform: 'uppercase' as const,
          textDecoration: 'none',
        }}>← Accueil</Link>
        <Link href="/boutique" style={{
          padding: '0.8rem 1.8rem',
          border: '1px solid #EDE5D4', color: '#8A7B68',
          fontFamily: 'Jost,sans-serif',
          fontSize: '0.72rem', letterSpacing: '0.15em',
          textTransform: 'uppercase' as const,
          textDecoration: 'none',
        }}>Voir la boutique</Link>
      </div>
    </main>
  )
}
