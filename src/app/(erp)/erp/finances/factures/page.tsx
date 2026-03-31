"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ErpPage } from '@/components/erp/ErpPage'

interface Facture {
  id: string
  numero: string
  statut: string
  montantTotal: number
  createdAt: string
  client: { nom: string; telephone?: string }
  commandeId?: string
}

export default function FacturesPage() {
  const [factures, setFactures] = useState<Facture[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')

  useEffect(() => {
    // Utilise /api/commandes comme source des factures
    // car chaque commande = une facture
    fetch('/api/commandes?limit=100')
      .then(r => r.json())
      .then(d => {
        const liste = d.commandes || d.data || (Array.isArray(d) ? d : [])
        setFactures(liste.map((c: any) => ({
          id:           c.id,
          numero:       c.numero,
          statut:       c.statut,
          montantTotal: Number(c.montantTotal),
          createdAt:    c.createdAt,
          client:       c.client,
          commandeId:   c.id,
        })))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = factures.filter(f =>
    f.numero?.toLowerCase().includes(search.toLowerCase()) ||
    f.client?.nom?.toLowerCase().includes(search.toLowerCase())
  )

  const totalCA = filtered.reduce((s, f) => s + f.montantTotal, 0)
  const nbLivrees = filtered.filter(f => f.statut === 'LIVREE').length

  const STATUT_COLORS: Record<string, { color: string; bg: string; label: string }> = {
    EN_ATTENTE:     { color: '#B8860B', bg: '#FFF8E6', label: 'En attente' },
    CONFIRMEE:      { color: '#4A7A9B', bg: '#EEF5FA', label: 'Confirmée' },
    EN_PREPARATION: { color: '#7A5C9B', bg: '#F4EFF9', label: 'En prépa.' },
    EXPEDIEE:       { color: '#2E7D52', bg: '#EBF6F0', label: 'Expédiée' },
    LIVREE:         { color: '#1B5E3B', bg: '#E4F2EB', label: 'Livrée' },
    ANNULEE:        { color: '#8B3A3A', bg: '#FAEAEA', label: 'Annulée' },
  }

  return (
    <ErpPage
      title="Factures"
      subtitle={`${filtered.length} factures · ${totalCA.toFixed(0)} DT`}
      actions={
        <input
          placeholder="Rechercher…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '0.38rem 0.9rem', fontSize: '0.78rem',
            border: '1px solid #EDE5D4', background: '#FDFAF5',
            color: '#1A1208', outline: 'none', width: '200px',
            fontFamily: 'Jost,sans-serif', borderRadius: '3px',
          }}
        />
      }
    >
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total factures', value: filtered.length.toString(), color: '#4A7A9B', bg: '#EEF5FA' },
          { label: 'CA total',       value: `${totalCA.toFixed(0)} DT`, color: '#2E7D52', bg: '#E4F2EB' },
          { label: 'Livrées',        value: nbLivrees.toString(),       color: '#1B5E3B', bg: '#E4F2EB' },
        ].map(k => (
          <div key={k.label} style={{
            background: '#FDFAF5', border: '1px solid #EDE5D4',
            borderRadius: '6px', padding: '1.2rem 1.4rem',
            borderTop: `3px solid ${k.color}`,
          }}>
            <div style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C4B090', marginBottom: '0.5rem' }}>{k.label}</div>
            <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '2rem', fontWeight: 300, color: '#1A1208' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#FDFAF5', border: '1px solid #EDE5D4', borderRadius: '6px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#C4B090', fontFamily: 'Cormorant Garamond,serif', fontStyle: 'italic' }}>Chargement…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#C4B090', fontFamily: 'Cormorant Garamond,serif', fontStyle: 'italic' }}>Aucune facture</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FAF7F2' }}>
                {['Numéro','Client','Montant','Statut','Date','Actions'].map(h => (
                  <th key={h} style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C4B090', fontWeight: 500, borderBottom: '1px solid #EDE5D4' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => {
                const st = STATUT_COLORS[f.statut] || { color: '#8A7B68', bg: '#F0EBE0', label: f.statut }
                return (
                  <tr key={f.id}
                    style={{ borderBottom: '1px solid #F0EBE0', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FAF7F2'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#C4960A', fontWeight: 500 }}>{f.numero}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#EDE5D4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#8A7B68', fontWeight: 600 }}>
                          {(f.client?.nom || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.82rem', color: '#1A1208' }}>{f.client?.nom || '—'}</div>
                          {f.client?.telephone && <div style={{ fontSize: '0.68rem', color: '#C4B090' }}>{f.client.telephone}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.05rem', color: '#C4960A' }}>
                        {f.montantTotal.toFixed(0)} DT
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ background: st.bg, color: st.color, padding: '0.18rem 0.55rem', fontSize: '0.62rem', borderRadius: '3px', fontWeight: 500 }}>
                        {st.label}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ fontSize: '0.72rem', color: '#C4B090' }}>
                        {new Date(f.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <Link href={`/erp/commandes/${f.commandeId}`} style={{ fontSize: '0.68rem', color: '#8A7B68', textDecoration: 'none', border: '1px solid #EDE5D4', padding: '0.2rem 0.55rem', borderRadius: '3px' }}>
                          Voir →
                        </Link>
                        <a href={`/api/factures/${f.commandeId}/pdf`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.68rem', color: '#4A7A9B', textDecoration: 'none', border: '1px solid #C8DDE8', padding: '0.2rem 0.55rem', borderRadius: '3px', background: '#EEF5FA' }}>
                          PDF
                        </a>
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
