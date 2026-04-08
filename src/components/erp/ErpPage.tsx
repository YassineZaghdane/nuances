"use client"

import Link from 'next/link'

const BASE = {
  font: 'Jost, sans-serif',
  topbarBg: '#FDFAF5',
  topbarBorder: '#EDE5D4',
  titleColor: '#1A1208',
  subtitleColor: '#C4B090',
  accent: '#C4960A',
}

export function ErpPage({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div style={{ fontFamily: BASE.font, minHeight: '100vh', background: '#F8F5F0' }}>
      <div style={{
        height: '60px',
        background: BASE.topbarBg,
        borderBottom: `1px solid ${BASE.topbarBorder}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
          <span style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '1.15rem',
            color: BASE.titleColor,
            fontWeight: 400,
          }}>
            {title}
          </span>
          {subtitle != null && (
            <span style={{ fontSize: '0.7rem', color: BASE.subtitleColor, letterSpacing: '0.02em' }}>
              {subtitle}
            </span>
          )}
        </div>
        {actions != null && <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>{actions}</div>}
      </div>
      <div style={{ padding: '2rem' }}>{children}</div>
    </div>
  )
}

export function ErpTable({
  headers,
  children,
  footer,
}: {
  headers: string[]
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div style={{
      background: '#FDFAF5',
      border: `1px solid ${BASE.topbarBorder}`,
      borderRadius: '6px',
      overflow: 'hidden',
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#FAF7F2' }}>
            {headers.map(h => (
              <th key={h} style={{
                padding: '0.7rem 1rem',
                textAlign: 'left',
                fontSize: '0.6rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: BASE.subtitleColor,
                fontWeight: 500,
                borderBottom: `1px solid ${BASE.topbarBorder}`,
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {footer != null && (
        <div style={{ padding: '0.9rem 1.5rem', borderTop: `1px solid ${BASE.topbarBorder}` }}>
          {footer}
        </div>
      )}
    </div>
  )
}

export const STATUT_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  EN_ATTENTE:     { color: '#B8860B', bg: '#FFF8E6', label: 'En attente' },
  CONFIRMEE:      { color: '#4A7A9B', bg: '#EEF5FA', label: 'Confirmée' },
  EN_PREPARATION: { color: '#7A5C9B', bg: '#F4EFF9', label: 'En prépa.' },
  EXPEDIEE:       { color: '#2E7D52', bg: '#EBF6F0', label: 'Expédiée' },
  LIVREE:         { color: '#1B5E3B', bg: '#E4F2EB', label: 'Livrée' },
  ANNULEE:        { color: '#8B3A3A', bg: '#FAEAEA', label: 'Annulée' },
}

export function StatutBadge({ statut }: { statut: string }) {
  const s = STATUT_STYLE[statut] ?? { color: '#8A7B68', bg: '#F0EBE0', label: statut }
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      padding: '0.18rem 0.6rem',
      fontSize: '0.62rem',
      borderRadius: '3px',
      fontWeight: 500,
      display: 'inline-block',
    }}>
      {s.label}
    </span>
  )
}

const paginBtnStyle = (active: boolean): React.CSSProperties => ({
  padding: '0.3rem 0.7rem',
  fontSize: '0.7rem',
  border: '1px solid #EDE5D4',
  background: '#FDFAF5',
  color: active ? '#1A1208' : '#C4B090',
  cursor: active ? 'pointer' : 'not-allowed',
  fontFamily: 'Jost,sans-serif',
  borderRadius: '3px',
})

export function ErpPagination({
  page,
  total,
  perPage,
  onPage,
}: {
  page: number
  total: number
  perPage: number
  onPage: (p: number) => void
}) {
  const pages = Math.ceil(total / perPage) || 1
  if (pages <= 1 && total <= perPage) return null
  const hasPrev = page > 1
  const hasNext = page < pages
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.72rem', color: '#C4B090' }}>
        {total === 0
          ? 'Aucun résultat'
          : `${Math.min((page - 1) * perPage + 1, total)}–${Math.min(page * perPage, total)} sur ${total}`}
      </span>
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
        <button type="button" onClick={() => hasPrev && onPage(page - 1)} disabled={!hasPrev} style={paginBtnStyle(hasPrev)}>←</button>
        <span style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', color: '#8A7B68' }}>{page} / {pages}</span>
        <button type="button" onClick={() => hasNext && onPage(page + 1)} disabled={!hasNext} style={paginBtnStyle(hasNext)}>→</button>
      </div>
    </div>
  )
}

export function BtnPrimary({
  children,
  onClick,
  href,
  disabled,
}: {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  disabled?: boolean
}) {
  const style: React.CSSProperties = {
    background: disabled ? '#C4B090' : '#1A1208',
    color: 'white',
    padding: '0.38rem 1rem',
    fontSize: '0.7rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    textDecoration: 'none',
    fontFamily: 'Jost,sans-serif',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 0.2s',
    display: 'inline-block',
  }
  if (href != null) return <Link href={href} style={style}>{children}</Link>
  return <button type="button" onClick={onClick} disabled={disabled} style={style}>{children}</button>
}
