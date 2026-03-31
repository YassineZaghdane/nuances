export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <div style={{ textAlign: 'center', lineHeight: 1 }}>
      <div style={{ fontSize: '1.2rem', color: dark ? '#1A1208' : 'white' }}>✿</div>
      <div style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '1.4rem',
        fontWeight: 700,
        letterSpacing: '0.25em',
        color: dark ? '#1A1208' : 'white',
        textTransform: 'uppercase'
      }}>NUANCES</div>
      <div style={{
        fontFamily: 'Jost, sans-serif',
        fontSize: '0.55rem',
        letterSpacing: '0.3em',
        color: dark ? '#C4960A' : '#E8C96A',
        textTransform: 'uppercase'
      }}>— PARFUMS —</div>
    </div>
  )
}
