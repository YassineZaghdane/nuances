'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useState, useEffect, useCallback } from 'react'
import type { CSSProperties } from 'react'
import { Menu, X } from 'lucide-react'
import { Logo } from './Logo'
import { useCartStore } from '@/store/cart-store'

const NAV_LINKS = [
  { label: 'Collections', href: '/boutique' },
  { label: 'Classiques', href: '/boutique?type=classiques' },
  { label: 'Niche', href: '/boutique?type=niche' },
  { label: 'À Propos', href: '/a-propos' },
] as const

const MOBILE_MQ = '(max-width: 900px)'

function navLinkActive(
  pathname: string,
  searchParams: URLSearchParams,
  href: string
) {
  if (href === '/a-propos') return pathname === '/a-propos'
  if (href === '/boutique') {
    return pathname === '/boutique' && !searchParams.get('type')
  }
  const q = href.includes('?') ? href.split('?')[1] : ''
  const type = new URLSearchParams(q).get('type')
  if (type && pathname === '/boutique') {
    return searchParams.get('type') === type
  }
  return false
}

function NavbarFallback() {
  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 100,
        background: 'rgba(245,239,224,0.9)',
        backdropFilter: 'blur(16px)',
        padding: '0 max(1rem, 5%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '76px',
      }}
    >
      <Link href="/" style={{ textDecoration: 'none' }}>
        <Logo dark />
      </Link>
    </nav>
  )
}

function NavbarInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [scrolled, setScrolled] = useState(false)
  const [mobile, setMobile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { count, openCart } = useCartStore()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ)
    const update = () => {
      setMobile(mq.matches)
      if (!mq.matches) setMenuOpen(false)
    }
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  const linkStyle = useCallback(
    (active?: boolean): CSSProperties => ({
      fontFamily: 'Jost, sans-serif',
      fontSize: mobile ? '0.85rem' : '0.76rem',
      letterSpacing: '0.15em',
      textTransform: 'uppercase',
      color: active ? '#C4960A' : 'var(--muted)',
      textDecoration: 'none',
      transition: 'color 0.3s',
      fontWeight: 400,
      display: 'block',
      padding: mobile ? '0.85rem 0' : undefined,
      borderBottom: mobile ? '1px solid rgba(26,18,8,0.06)' : undefined,
    }),
    [mobile]
  )

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          width: '100%',
          zIndex: 100,
          background: scrolled
            ? 'rgba(245,239,224,0.97)'
            : 'rgba(245,239,224,0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: scrolled
            ? '1px solid rgba(196,150,10,0.25)'
            : '1px solid transparent',
          padding: '0 max(1rem, 5%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '76px',
          transition: 'all 0.4s ease',
          boxShadow: scrolled ? '0 4px 24px rgba(26,18,8,0.06)' : 'none',
        }}
      >
        <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <Logo dark />
        </Link>

        {!mobile && (
          <ul
            style={{
              display: 'flex',
              gap: '2rem',
              listStyle: 'none',
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
            }}
          >
            {NAV_LINKS.map((item) => {
              const active = navLinkActive(pathname, searchParams, item.href)
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    style={linkStyle(active)}
                    onMouseEnter={(e) => {
                      if (!active)
                        (e.currentTarget as HTMLElement).style.color =
                          'var(--gold)'
                    }}
                    onMouseLeave={(e) => {
                      if (!active)
                        (e.currentTarget as HTMLElement).style.color =
                          'var(--muted)'
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
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
                  ;(e.currentTarget as HTMLAnchorElement).style.background =
                    '#1A1208'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLAnchorElement).style.background =
                    '#C4960A'
                }}
              >
                Commander
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={openCart}
                aria-label="Ouvrir le panier"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  padding: '0.4rem',
                  color: '#1A1208',
                  fontSize: '1.1rem',
                }}
              >
                🛍
                {count() > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: '#C4960A',
                      color: 'white',
                      borderRadius: '50%',
                      width: '16px',
                      height: '16px',
                      fontSize: '0.55rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                    }}
                  >
                    {count()}
                  </span>
                )}
              </button>
            </li>
          </ul>
        )}

        {mobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              type="button"
              onClick={openCart}
              aria-label="Panier"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                padding: '0.5rem',
                color: '#1A1208',
                fontSize: '1.15rem',
              }}
            >
              🛍
              {count() > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    background: '#C4960A',
                    color: 'white',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    fontSize: '0.55rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  {count()}
                </span>
              )}
            </button>
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              onClick={() => setMenuOpen((o) => !o)}
              style={{
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: menuOpen ? 'rgba(196,150,10,0.15)' : 'transparent',
                border: '1px solid rgba(26,18,8,0.12)',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#1A1208',
              }}
            >
              {menuOpen ? (
                <X size={22} strokeWidth={1.75} />
              ) : (
                <Menu size={22} strokeWidth={1.75} />
              )}
            </button>
          </div>
        )}
      </nav>

      {mobile && menuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navigation"
          style={{
            position: 'fixed',
            top: '76px',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99,
            background: 'rgba(253,250,245,0.98)',
            backdropFilter: 'blur(12px)',
            padding: '1.25rem max(1rem, 5%) 2rem',
            overflowY: 'auto',
            borderTop: '1px solid rgba(196,150,10,0.2)',
          }}
        >
          <nav style={{ maxWidth: '400px', margin: '0 auto' }}>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {NAV_LINKS.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    style={linkStyle(
                      navLinkActive(pathname, searchParams, item.href)
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/boutique"
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'block',
                marginTop: '1.5rem',
                textAlign: 'center',
                background: '#C4960A',
                color: 'white',
                padding: '0.9rem 1.5rem',
                fontFamily: 'Jost, sans-serif',
                fontSize: '0.72rem',
                fontWeight: 500,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                borderRadius: '3px',
              }}
            >
              Commander
            </Link>
          </nav>
        </div>
      )}
    </>
  )
}

export function Navbar() {
  return (
    <Suspense fallback={<NavbarFallback />}>
      <NavbarInner />
    </Suspense>
  )
}
