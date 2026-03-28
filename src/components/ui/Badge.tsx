/**
 * @module Badge
 * @description Badge générique réutilisable
 */
interface BadgeProps {
  label: string
  color: string
  bg: string
  size?: 'sm' | 'md'
}

export function Badge({ label, color, bg, size = 'sm' }: BadgeProps) {
  return (
    <span style={{
      background: bg,
      color,
      padding: size === 'sm' ? '0.18rem 0.55rem' : '0.3rem 0.8rem',
      fontSize: size === 'sm' ? '0.62rem' : '0.72rem',
      borderRadius: '3px',
      fontWeight: 500,
      letterSpacing: '0.06em',
      display: 'inline-block',
    }}>
      {label}
    </span>
  )
}
