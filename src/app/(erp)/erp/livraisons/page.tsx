"use client"
import { useEffect, useState } from 'react'
import { ErpPage, StatutBadge } from '@/components/erp/ErpPage'
import Link from 'next/link'

interface Livraison {
  id: string
  commandeId: string
  commande: {
    numero: string
    client: { nom: string; telephone: string }
    montantTotal: number
    villeLivraison?: string
  }
  livreur?: string
  adresse?: string
  ville?: string
  statut: string
  dateEstimee?: string
  dateLivree?: string
  notes?: string
}

const STATUT_LIV: Record<string, { color: string; bg: string; label: string }> = {
  EN_ATTENTE: { color: '#B8860B', bg: '#FFF8E6', label: 'En attente' },
  EN_COURS:   { color: '#4A7A9B', bg: '#EEF5FA', label: 'En cours' },
  LIVREE:     { color: '#1B5E3B', bg: '#E4F2EB', label: 'Livrée' },
  ECHEC:      { color: '#8B3A3A', bg: '#FAEAEA', label: 'Échec' },
}

export default function LivraisonsPage() {
  const [livraisons, setLivraisons] = useState<Livraison[]>([])
  const [loading, setLoading]       = useState(true)
  const [statut, setStatut]         = useState('Tous')
  const [search, setSearch]         = useState('')
  const [saving, setSaving]         = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/livraisons')
      .then(r => r.json())
      .then(d => {
        setLivraisons(Array.isArray(d) ? d : d.livraisons || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = livraisons.filter(l => {
    const matchStatut = statut === 'Tous' || l.statut === statut
    const matchSearch =
      l.commande?.client?.nom?.toLowerCase().includes(search.toLowerCase()) ||
      l.commande?.numero?.toLowerCase().includes(search.toLowerCase()) ||
      l.ville?.toLowerCase().includes(search.toLowerCase())
    return matchStatut && matchSearch
  })

  const updateStatut = async (id: string, newStatut: string) => {
    setSaving(id)
    await fetch(`/api/livraisons/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        statut: newStatut,
        ...(newStatut === 'LIVREE' ? { dateLivree: new Date().toISOString() } : {}),
      }),
    })
    setLivraisons(prev =>
      prev.map(l => l.id === id ? { ...l, statut: newStatut } : l)
    )
    setSaving(null)
  }

  const stats = {
    total:      livraisons.length,
    enAttente:  livraisons.filter(l => l.statut === 'EN_ATTENTE').length,
    enCours:    livraisons.filter(l => l.statut === 'EN_COURS').length,
    livrees:    livraisons.filter(l => l.statut === 'LIVREE').length,
    echecs:     livraisons.filter(l => l.statut === 'ECHEC').length,
  }

  return (
    <ErpPage
      title="Livraisons"
      subtitle={`${stats.total} livraisons · ${stats.enAttente} en attente`}
      actions={
        <input
          placeholder="Rechercher client, commande, ville…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '0.38rem 0.9rem', fontSize: '0.78rem',
            border: '1px solid #EDE5D4', background: '#FDFAF5',
            color: '#1A1208', outline: 'none', width: '240px',
            fontFamily: 'Jost,sans-serif', borderRadius: '3px',
          }}
        />
      }
    >
      {/* KPIs */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
        gap: '1rem', marginBottom: '1.5rem',
      }}>
        {[
          { label: 'En attente', value: stats.enAttente, color: '#B8860B', bg: '#FFF8E6' },
          { label: 'En cours',   value: stats.enCours,   color: '#4A7A9B', bg: '#EEF5FA' },
          { label: 'Livrées',    value: stats.livrees,   color: '#1B5E3B', bg: '#E4F2EB' },
          { label: 'Échecs',     value: stats.echecs,    color: '#8B3A3A', bg: '#FAEAEA' },
        ].map(k => (
          <div key={k.label} style={{
            background: '#FDFAF5', border: '1px solid #EDE5D4',
            borderRadius: '6px', padding: '1.2rem 1.4rem',
            borderTop: `3px solid ${k.color}`,
          }}>
            <div style={{ fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C4B090', marginBottom: '0.5rem' }}>{k.label}</div>
            <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '2rem', fontWeight: 300, color: '#1A1208' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '1.2rem' }}>
        {['Tous', 'EN_ATTENTE', 'EN_COURS', 'LIVREE', 'ECHEC'].map(s => (
          <button key={s} onClick={() => setStatut(s)} style={{
            padding: '0.38rem 0.85rem', fontSize: '0.7rem',
            background: statut === s ? '#1A1208' : '#FDFAF5',
            color: statut === s ? 'white' : '#8A7B68',
            border: `1px solid ${statut === s ? '#1A1208' : '#EDE5D4'}`,
            cursor: 'pointer', fontFamily: 'Jost,sans-serif',
            borderRadius: '3px', transition: 'all 0.18s',
          }}>
            {STATUT_LIV[s]?.label || 'Tous'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#FDFAF5', border: '1px solid #EDE5D4', borderRadius: '6px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#C4B090', fontFamily: 'Cormorant Garamond,serif', fontStyle: 'italic' }}>
            Chargement…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#C4B090', fontFamily: 'Cormorant Garamond,serif', fontStyle: 'italic' }}>
            Aucune livraison trouvée
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FAF7F2' }}>
                {['Commande','Client','Ville','Livreur','Statut','Date estimée','Actions'].map(h => (
                  <th key={h} style={{
                    padding: '0.7rem 1rem', textAlign: 'left',
                    fontSize: '0.6rem', letterSpacing: '0.12em',
                    textTransform: 'uppercase', color: '#C4B090',
                    fontWeight: 500, borderBottom: '1px solid #EDE5D4',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id}
                  style={{ borderBottom: '1px solid #F0EBE0', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FAF7F2'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <Link href={`/erp/commandes/${l.commandeId}`} style={{
                      fontSize: '0.8rem', color: '#C4960A',
                      textDecoration: 'none', fontWeight: 500,
                    }}>
                      {l.commande?.numero || '—'}
                    </Link>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontSize: '0.82rem', color: '#1A1208' }}>
                      {l.commande?.client?.nom || '—'}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#C4B090' }}>
                      {l.commande?.client?.telephone}
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ fontSize: '0.78rem', color: '#1A1208' }}>
                      {l.ville || l.commande?.villeLivraison || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ fontSize: '0.78rem', color: '#8A7B68' }}>
                      {l.livreur || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{
                      background: STATUT_LIV[l.statut]?.bg || '#F0EBE0',
                      color: STATUT_LIV[l.statut]?.color || '#8A7B68',
                      padding: '0.18rem 0.55rem', fontSize: '0.62rem',
                      borderRadius: '3px', fontWeight: 500,
                    }}>
                      {STATUT_LIV[l.statut]?.label || l.statut}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ fontSize: '0.72rem', color: '#C4B090' }}>
                      {l.dateEstimee
                        ? new Date(l.dateEstimee).toLocaleDateString('fr-FR')
                        : '—'}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      {l.statut === 'EN_ATTENTE' && (
                        <button
                          onClick={() => updateStatut(l.id, 'EN_COURS')}
                          disabled={saving === l.id}
                          style={{
                            fontSize: '0.62rem', background: '#EEF5FA',
                            color: '#4A7A9B', border: '1px solid #C8DDE8',
                            padding: '0.18rem 0.5rem', cursor: 'pointer',
                            borderRadius: '3px', fontFamily: 'Jost,sans-serif',
                          }}
                        >→ En cours</button>
                      )}
                      {l.statut === 'EN_COURS' && (
                        <>
                          <button
                            onClick={() => updateStatut(l.id, 'LIVREE')}
                            disabled={saving === l.id}
                            style={{
                              fontSize: '0.62rem', background: '#E4F2EB',
                              color: '#1B5E3B', border: '1px solid #B8DFC8',
                              padding: '0.18rem 0.5rem', cursor: 'pointer',
                              borderRadius: '3px', fontFamily: 'Jost,sans-serif',
                            }}
                          >✓ Livrée</button>
                          <button
                            onClick={() => updateStatut(l.id, 'ECHEC')}
                            disabled={saving === l.id}
                            style={{
                              fontSize: '0.62rem', background: '#FAEAEA',
                              color: '#8B3A3A', border: '1px solid #DFB8B8',
                              padding: '0.18rem 0.5rem', cursor: 'pointer',
                              borderRadius: '3px', fontFamily: 'Jost,sans-serif',
                            }}
                          >✗ Échec</button>
                        </>
                      )}
                      {(l.statut === 'LIVREE' || l.statut === 'ECHEC') && (
                        <span style={{ fontSize: '0.68rem', color: '#C4B090' }}>
                          {l.dateLivree
                            ? new Date(l.dateLivree).toLocaleDateString('fr-FR')
                            : 'Terminée'}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </ErpPage>
  )
}
