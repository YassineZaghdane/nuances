"use client"
import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[App Error]', error)
  }, [error])

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
        fontSize: '5rem', color: 'rgba(196,150,10,0.2)',
      }}>✿</div>
      <h2 style={{
        fontFamily: 'Cormorant Garamond,serif',
        fontSize: '1.8rem', fontWeight: 300, color: '#1A1208',
      }}>Une erreur est survenue</h2>
      <p style={{
        fontSize: '0.85rem', color: '#8A7B68',
        maxWidth: '380px', lineHeight: 1.7,
      }}>
        Nous nous en excusons. Veuillez réessayer
        ou retourner à l'accueil.
      </p>
      <div style={{ display: 'flex', gap: '0.8rem' }}>
        <button
          onClick={reset}
          style={{
            padding: '0.8rem 1.8rem',
            background: '#1A1208', color: 'white',
            border: 'none', cursor: 'pointer',
            fontFamily: 'Jost,sans-serif',
            fontSize: '0.72rem', letterSpacing: '0.15em',
            textTransform: 'uppercase' as const,
          }}
        >Réessayer</button>
        <Link href="/" style={{
          padding: '0.8rem 1.8rem',
          border: '1px solid #EDE5D4', color: '#8A7B68',
          fontFamily: 'Jost,sans-serif',
          fontSize: '0.72rem', letterSpacing: '0.15em',
          textTransform: 'uppercase' as const,
          textDecoration: 'none',
        }}>← Accueil</Link>
      </div>
    </main>
  )
}
