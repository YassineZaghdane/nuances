'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Logo } from './Logo'
import { useCartStore } from '@/store/cart-store'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const { count, openCart } = useCartStore()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, width: '100%', zIndex: 100,
      background: scrolled ? 'rgba(245,239,224,0.97)' : 'rgba(245,239,224,0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: scrolled ? '1px solid rgba(196,150,10,0.25)' : '1px solid transparent',
      padding: '0 5%',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: '76px',
      transition: 'all 0.4s ease',
      boxShadow: scrolled ? '0 4px 24px rgba(26,18,8,0.06)' : 'none'
    }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <Logo dark />
      </Link>

      <ul style={{ display: 'flex', gap: '2.5rem', listStyle: 'none', alignItems: 'center' }}>
        {['Collections', 'Classiques', 'Niche', 'À Propos'].map(item => (
          <li key={item}>
            <Link href={item === 'Collections' ? '/boutique' : item === 'À Propos' ? '/a-propos' : `/boutique?type=${item.toLowerCase()}`} style={{
              fontFamily: 'Jost, sans-serif',
              fontSize: '0.76rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              textDecoration: 'none',
              transition: 'color 0.3s',
              fontWeight: 400
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
            >{item}</Link>
          </li>
        ))}
        <li>
          <Link
            href="/boutique"
            style={{
              display: 'inline-block',
              background: '#C4960A',
              color: 'white',
              border: 'none',
              borderRadius: '2px',
              padding: '0.55rem 1.4rem',
              fontFamily: 'Jost, sans-serif',
              fontSize: '0.72rem',
              fontWeight: 500,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'background 0.3s ease, transform 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = '#1A1208'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = '#C4960A'
            }}
          >
            Commander
          </Link>
        </li>
        <li>
          <button
            type="button"
            onClick={openCart}
            style={{
              background: 'none', border: 'none',
              cursor: 'pointer', position: 'relative',
              padding: '0.4rem', color: '#1A1208',
              fontSize: '1.1rem'
            }}
          >
            🛍
            {count() > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                background: '#C4960A', color: 'white',
                borderRadius: '50%', width: '16px', height: '16px',
                fontSize: '0.55rem', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontWeight: 700
              }}>{count()}</span>
            )}
          </button>
        </li>
      </ul>
    </nav>
  )
}
