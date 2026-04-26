"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  marque?: { id: string; nom: string; slug: string; description?: string | null }
  mode: 'creation' | 'edition'
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.75rem 1rem',
  border: '1px solid #EDE5D4', background: 'white',
  fontFamily: 'Jost,sans-serif', fontSize: '0.85rem',
  color: '#1A1208', outline: 'none', borderRadius: '3px',
  transition: 'border-color 0.2s', boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.62rem', letterSpacing: '0.15em',
  textTransform: 'uppercase', color: '#C4B090',
  marginBottom: '0.4rem', fontFamily: 'Jost,sans-serif',
}

export function MarqueForm({ marque, mode }: Props) {
  const router = useRouter()
  const [nom, setNom] = useState(marque?.nom || '')
  const [slug, setSlug] = useState(marque?.slug || '')
  const [description, setDescription] = useState(marque?.description || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (mode === 'creation' && nom) {
      setSlug(
        nom.toLowerCase().normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      )
    }
  }, [nom, mode])

  const handleSubmit = async () => {
    if (!nom.trim()) { setError('Le nom est obligatoire.'); return }
    setSaving(true); setError('')
    try {
      const url = mode === 'edition' && marque?.id
        ? `/api/marques/${marque.id}`
        : '/api/marques'
      const res = await fetch(url, {
        method: mode === 'edition' ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, description }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Erreur serveur')
      }
      setSaved(true)
      setTimeout(() => { router.push('/erp/marques'); router.refresh() }, 900)
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ fontFamily: 'Jost,sans-serif', maxWidth: '520px' }}>
      {error && (
        <div style={{ background: '#FAEAEA', border: '1px solid rgba(139,58,58,0.2)', color: '#8B3A3A', padding: '0.8rem 1.2rem', fontSize: '0.82rem', marginBottom: '1rem', borderRadius: '3px' }}>
          {error}
        </div>
      )}
      {saved && (
        <div style={{ background: '#E4F2EB', border: '1px solid rgba(46,125,82,0.2)', color: '#2E7D52', padding: '0.8rem 1.2rem', fontSize: '0.82rem', marginBottom: '1rem', borderRadius: '3px' }}>
          ✓ Marque enregistrée — redirection…
        </div>
      )}

      <div style={{ background: '#FDFAF5', border: '1px solid #EDE5D4', borderRadius: '6px', overflow: 'hidden', marginBottom: '1rem' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #EDE5D4', fontFamily: 'Cormorant Garamond,serif', fontSize: '1.05rem', color: '#1A1208' }}>
          Informations
        </div>
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Nom *</label>
            <input
              style={inputStyle}
              value={nom}
              onChange={e => setNom(e.target.value)}
              placeholder="ex: Nuances"
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#C4960A'}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#EDE5D4'}
            />
          </div>
          <div>
            <label style={labelStyle}>Slug (URL)</label>
            <input
              style={{ ...inputStyle, color: '#8A7B68' }}
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="nuances"
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#C4960A'}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#EDE5D4'}
            />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description de la marque…"
              onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = '#C4960A'}
              onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = '#EDE5D4'}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.8rem' }}>
        <button
          onClick={() => router.push('/erp/marques')}
          style={{ padding: '0.9rem 1.5rem', background: 'none', color: '#8A7B68', border: '1px solid #EDE5D4', fontFamily: 'Jost,sans-serif', fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '3px' }}
        >← Annuler</button>
        <button
          onClick={handleSubmit}
          disabled={saving || saved}
          style={{ flex: 1, padding: '0.9rem', background: saved ? '#2E7D52' : saving ? '#C4B090' : 'linear-gradient(135deg,#C4960A,#A07808)', color: 'white', border: 'none', fontFamily: 'Jost,sans-serif', fontSize: '0.78rem', letterSpacing: '0.18em', textTransform: 'uppercase', cursor: saving || saved ? 'not-allowed' : 'pointer', borderRadius: '3px' }}
        >
          {saved ? '✓ Enregistré' : saving ? 'Enregistrement…' : mode === 'edition' ? 'Enregistrer' : 'Créer la marque'}
        </button>
      </div>
    </div>
  )
}
