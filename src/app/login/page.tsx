"use client"
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email || !password) return
    setLoading(true); setError('')
    const res = await signIn('credentials', {
      email, password, redirect: false
    })
    if (res?.error) {
      setError('Identifiants incorrects')
      setLoading(false)
    } else {
      router.push('/erp/dashboard')
    }
  }

  const inputStyle = {
    width:'100%', padding:'0.85rem 1rem',
    border:'1px solid #EDE5D4',
    background:'white', fontFamily:'Jost,sans-serif',
    fontSize:'0.88rem', color:'#1A1208', outline:'none',
    transition:'border-color 0.2s', borderRadius:'3px',
  }

  return (
    <main style={{
      minHeight:'100vh', background:'#F5EFE0',
      display:'flex', alignItems:'center',
      justifyContent:'center', fontFamily:'Jost,sans-serif',
    }}>
      <div style={{ width:'380px' }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'2.5rem' }}>
          <div style={{
            fontFamily:'Cormorant Garamond,serif',
            fontSize:'2.2rem', letterSpacing:'0.3em',
            color:'#1A1208', textTransform:'uppercase',
          }}>✿ NUANCES</div>
          <div style={{
            fontSize:'0.6rem', letterSpacing:'0.25em',
            color:'#C4960A', textTransform:'uppercase', marginTop:'0.2rem',
          }}>— Espace Gestion —</div>
        </div>

        {/* Card */}
        <div style={{
          background:'#FDFAF5',
          border:'1px solid #EDE5D4',
          padding:'2.5rem 2rem',
          borderRadius:'6px',
          boxShadow:'0 4px 24px rgba(26,18,8,0.06)',
        }}>
          <h1 style={{
            fontFamily:'Cormorant Garamond,serif',
            fontSize:'1.6rem', fontWeight:300,
            color:'#1A1208', marginBottom:'1.8rem',
            textAlign:'center',
          }}>Connexion</h1>

          {error && (
            <div style={{
              background:'#FAEAEA', color:'#8B3A3A',
              padding:'0.7rem 1rem', fontSize:'0.78rem',
              marginBottom:'1.2rem', borderRadius:'3px',
              border:'1px solid rgba(139,58,58,0.15)',
            }}>{error}</div>
          )}

          <div style={{ marginBottom:'1rem' }}>
            <label style={{
              display:'block', fontSize:'0.65rem',
              letterSpacing:'0.15em', textTransform:'uppercase',
              color:'#C4B090', marginBottom:'0.4rem',
            }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@nuances.tn"
              style={inputStyle}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor='#C4960A'}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor='#EDE5D4'}
            />
          </div>

          <div style={{ marginBottom:'1.8rem' }}>
            <label style={{
              display:'block', fontSize:'0.65rem',
              letterSpacing:'0.15em', textTransform:'uppercase',
              color:'#C4B090', marginBottom:'0.4rem',
            }}>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor='#C4960A'}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor='#EDE5D4'}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width:'100%', padding:'0.95rem',
              background: loading ? '#C4B090' : '#1A1208',
              color:'white', border:'none',
              fontSize:'0.75rem', fontFamily:'Jost,sans-serif',
              letterSpacing:'0.2em', textTransform:'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition:'background 0.2s', borderRadius:'3px',
            }}
          >{loading ? 'Connexion…' : 'Se connecter'}</button>
        </div>

        <p style={{
          textAlign:'center', marginTop:'1.5rem',
          fontSize:'0.7rem', color:'#C4B090',
        }}>Nuances Parfums · Nabeul 2026</p>
      </div>
    </main>
  )
}
