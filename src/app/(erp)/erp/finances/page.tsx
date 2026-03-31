"use client"
import { useEffect, useState } from 'react'
import { ErpPage } from '@/components/erp/ErpPage'

interface StatsMois {
  mois: string
  ca: number
  commandes: number
  depenses: number
  marge: number
}

interface Depense {
  id: string
  libelle: string
  montant: number
  categorie: string
  date: string
  notes?: string
}

export default function FinancesPage() {
  const [stats, setStats]       = useState<StatsMois[]>([])
  const [depenses, setDepenses] = useState<Depense[]>([])
  const [loading, setLoading]   = useState(true)
  const [onglet, setOnglet]     = useState<'apercu' | 'depenses'>('apercu')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [form, setForm] = useState({
    libelle: '', montant: '', categorie: 'AUTRE', date: new Date().toISOString().split('T')[0], notes: ''
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/stats/ventes').then(r => r.json()).catch(() => []),
      fetch('/api/stats/dashboard').then(r => r.json()).catch(() => ({})),
    ]).then(([ventes, dashboard]) => {
      setStats(Array.isArray(ventes) ? ventes : [])
      setLoading(false)
    })

    fetch('/api/stats/produits').then(r => r.json()).catch(() => [])
  }, [])

  const caTotal    = stats.reduce((s, m) => s + m.ca, 0)
  const depTotal   = stats.reduce((s, m) => s + (m.depenses || 0), 0)
  const margeTotal = caTotal - depTotal
  const cmdTotal   = stats.reduce((s, m) => s + m.commandes, 0)

  const moisActuel = stats[stats.length - 1]

  const ajouterDepense = async () => {
    if (!form.libelle || !form.montant) return
    setSaving(true)
    await fetch('/api/stats/ventes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        libelle:   form.libelle,
        montant:   Number(form.montant),
        categorie: form.categorie,
        date:      form.date,
        notes:     form.notes || undefined,
      }),
    }).catch(() => {})
    setSaving(false)
    setShowForm(false)
    setForm({ libelle: '', montant: '', categorie: 'AUTRE', date: new Date().toISOString().split('T')[0], notes: '' })
  }

  const CATEGORIES = ['ACHAT_STOCK','LIVRAISON','MARKETING','LOYER','AUTRE']

  const inputStyle = {
    width: '100%', padding: '0.7rem 0.9rem',
    border: '1px solid #EDE5D4', background: 'white',
    fontFamily: 'Jost,sans-serif', fontSize: '0.82rem',
    color: '#1A1208', outline: 'none', borderRadius: '3px',
  }

  return (
    <ErpPage
      title="Finances"
      subtitle="Chiffre d'affaires · Dépenses · Marges"
      actions={
        <button onClick={() => setShowForm(s => !s)} style={{
          padding: '0.38rem 1rem', background: '#1A1208',
          color: 'white', border: 'none', cursor: 'pointer',
          fontSize: '0.7rem', letterSpacing: '0.1em',
          textTransform: 'uppercase', fontFamily: 'Jost,sans-serif',
          borderRadius: '3px',
        }}>+ Dépense</button>
      }
    >
      {/* KPIs globaux */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'CA total',    value: `${caTotal.toFixed(0)} DT`,    color: '#2E7D52', bg: '#E4F2EB' },
          { label: 'Dépenses',    value: `${depTotal.toFixed(0)} DT`,   color: '#8B3A3A', bg: '#FAEAEA' },
          { label: 'Marge nette', value: `${margeTotal.toFixed(0)} DT`, color: margeTotal >= 0 ? '#2E7D52' : '#8B3A3A', bg: margeTotal >= 0 ? '#E4F2EB' : '#FAEAEA' },
          { label: 'Commandes',   value: cmdTotal.toString(),           color: '#C4960A', bg: '#FFF8E6' },
        ].map(k => (
          <div key={k.label} style={{
            background: '#FDFAF5', border: '1px solid #EDE5D4',
            borderRadius: '6px', padding: '1.4rem',
            borderTop: `3px solid ${k.color}`,
          }}>
            <div style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C4B090', marginBottom: '0.5rem' }}>{k.label}</div>
            <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '2rem', fontWeight: 300, color: '#1A1208' }}>{k.value}</div>
            <div style={{ fontSize: '0.65rem', color: k.color, background: k.bg, display: 'inline-block', padding: '0.12rem 0.45rem', borderRadius: '3px', marginTop: '0.4rem' }}>
              {moisActuel ? `${moisActuel.ca.toFixed(0)} DT ce mois` : '—'}
            </div>
          </div>
        ))}
      </div>

      {/* Formulaire dépense */}
      {showForm && (
        <div style={{
          background: '#FDFAF5', border: '1px solid #EDE5D4',
          borderRadius: '6px', padding: '1.5rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.05rem', color: '#1A1208', marginBottom: '1rem' }}>
            Ajouter une dépense
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
            <div>
              <div style={{ fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C4B090', marginBottom: '0.3rem' }}>Libellé *</div>
              <input style={inputStyle} value={form.libelle} onChange={e => setForm({...form, libelle: e.target.value})} placeholder="Ex: Achat flacons 50ml"/>
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C4B090', marginBottom: '0.3rem' }}>Montant (DT) *</div>
              <input style={inputStyle} type="number" value={form.montant} onChange={e => setForm({...form, montant: e.target.value})} placeholder="0"/>
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C4B090', marginBottom: '0.3rem' }}>Catégorie</div>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.categorie} onChange={e => setForm({...form, categorie: e.target.value})}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C4B090', marginBottom: '0.3rem' }}>Date</div>
              <input style={inputStyle} type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}/>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button onClick={() => setShowForm(false)} style={{ padding: '0.65rem 1.2rem', background: 'none', border: '1px solid #EDE5D4', cursor: 'pointer', fontSize: '0.72rem', color: '#8A7B68', fontFamily: 'Jost,sans-serif', borderRadius: '3px' }}>Annuler</button>
            <button onClick={ajouterDepense} disabled={saving || !form.libelle || !form.montant} style={{ padding: '0.65rem 1.5rem', background: saving ? '#C4B090' : '#1A1208', color: 'white', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.72rem', fontFamily: 'Jost,sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: '3px' }}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      )}

      {/* Tableau par mois */}
      <div style={{ background: '#FDFAF5', border: '1px solid #EDE5D4', borderRadius: '6px', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #EDE5D4' }}>
          <span style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.05rem', color: '#1A1208' }}>
            Résultats par mois
          </span>
        </div>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#C4B090', fontFamily: 'Cormorant Garamond,serif', fontStyle: 'italic' }}>Chargement…</div>
        ) : stats.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#C4B090', fontFamily: 'Cormorant Garamond,serif', fontStyle: 'italic' }}>Aucune donnée disponible</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FAF7F2' }}>
                {['Période','Commandes','CA','Dépenses','Marge','% Marge'].map(h => (
                  <th key={h} style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C4B090', fontWeight: 500, borderBottom: '1px solid #EDE5D4' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...stats].reverse().map((m, i) => {
                const marge = m.ca - (m.depenses || 0)
                const pct   = m.ca > 0 ? (marge / m.ca) * 100 : 0
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #F0EBE0' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FAF7F2'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ fontSize: '0.82rem', color: '#1A1208', fontWeight: 500 }}>{m.mois || '—'}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1rem', color: '#1A1208' }}>{m.commandes}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1rem', color: '#C4960A' }}>{m.ca.toFixed(0)} DT</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1rem', color: '#8B3A3A' }}>{(m.depenses || 0).toFixed(0)} DT</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1rem', color: marge >= 0 ? '#2E7D52' : '#8B3A3A' }}>{marge.toFixed(0)} DT</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: '60px', height: '5px', background: '#EDE5D4', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.max(0, Math.min(100, pct))}%`, background: pct >= 0 ? 'linear-gradient(90deg,#2E7D52,#52A876)' : '#8B3A3A', borderRadius: '3px' }}/>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: pct >= 0 ? '#2E7D52' : '#8B3A3A' }}>{pct.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </ErpPage>
  )
}
