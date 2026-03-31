export default function Loading() {
  return (
    <div style={{
      minHeight: '100vh', background: '#FDFAF5',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        fontFamily: 'Cormorant Garamond,serif',
        fontSize: '3rem', color: 'rgba(196,150,10,0.35)',
        animation: 'nuancePulse 1.5s ease-in-out infinite',
      }}>✿</div>
      <style>{`
        @keyframes nuancePulse {
          0%,100% { opacity:0.3; transform:scale(1) rotate(0deg); }
          50%      { opacity:0.8; transform:scale(1.15) rotate(180deg); }
        }
      `}</style>
    </div>
  )
}
