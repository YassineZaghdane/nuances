"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ErpPage, ErpTable, StatutBadge } from '@/components/erp/ErpPage'

interface Facture {
  id: string
  numero: string
  statut: string
  montantTotal: number
  createdAt: string
  client: { nom: string; telephone?: string }
}

export default function FacturesPage() {
  const [factures, setFactures] = useState<Facture[]>([])
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetch('/api/factures')
      .then(r => r.ok ? r.json() : fetch('/api/commandes').then(r2 => r2.json()))
      .then(d => {
        setFactures(Array.isArray(d) ? d : d.commandes || d.factures || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = factures.filter(f =>
    f.numero?.toLowerCase().includes(search.toLowerCase()) ||
    f.client?.nom?.toLowerCase().includes(search.toLowerCase())
  )

  const totalCA = filtered.reduce((s, f) => s + Number(f.montantTotal || 0), 0)

  return (
    <ErpPage
      title="Factures"
      subtitle={`${filtered.length} factures`}
      actions={
        <input
          placeholder="Rechercher…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '0.38rem 0.9rem',
            fontSize: '0.78rem',
            border: '1px solid #EDE5D4',
            background: '#FDFAF5',
            color: '#1A1208',
            outline: 'none',
            width: '200px',
            fontFamily: 'Jost,sans-serif',
            borderRadius: '3px',
          }}
        />
      }
    >

      {/* Résumé */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        {[
          { label: 'Total factures', value: filtered.length.toString(), color: '#4A7A9B', bg: '#EEF5FA' },
          { label: 'CA total',       value: `${totalCA.toFixed(0)} DT`, color: '#2E7D52', bg: '#E4F2EB' },
          { label: 'Livrées',
            value: filtered.filter(f => f.statut === 'LIVREE').length.toString(),
            color: '#1B5E3B', bg: '#E4F2EB'
          },
        ].map(k => (
          <div key={k.label} style={{
            background: '#FDFAF5',
            border: '1px solid #EDE5D4',
            borderRadius: '6px',
            padding: '1.2rem 1.4rem',
            borderTop: `3px solid ${k.color}`,
          }}>
            <div style={{
              fontSize: '0.6rem', letterSpacing: '0.15em',
              textTransform: 'uppercase', color: '#C4B090',
              marginBottom: '0.5rem',
            }}>{k.label}</div>
            <div style={{
              fontFamily: 'Cormorant Garamond,serif',
              fontSize: '2rem', fontWeight: 300, color: '#1A1208', lineHeight: 1,
            }}>{k.value}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{
          background: '#FDFAF5', border: '1px solid #EDE5D4',
          borderRadius: '6px', padding: '4rem',
          textAlign: 'center', color: '#C4B090',
          fontFamily: 'Cormorant Garamond,serif',
          fontSize: '1.1rem', fontStyle: 'italic',
        }}>Chargement…</div>
      ) : (
        <ErpTable
          headers={['Numéro', 'Client', 'Montant', 'Statut', 'Date', '']}
        >
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={6} style={{
                padding: '3rem', textAlign: 'center',
                color: '#C4B090',
                fontFamily: 'Cormorant Garamond,serif',
                fontSize: '1.1rem', fontStyle: 'italic',
              }}>
                Aucune facture trouvée
              </td>
            </tr>
          ) : (
            filtered.map(f => (
              <tr
                key={f.id}
                style={{ borderBottom: '1px solid #F0EBE0', transition: 'background 0.15s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#FAF7F2')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span style={{
                    fontSize: '0.8rem', color: '#C4960A',
                    fontWeight: 500, letterSpacing: '0.03em',
                  }}>{f.numero}</span>
                </td>

                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <div style={{
                      width: '26px', height: '26px', borderRadius: '50%',
                      background: '#EDE5D4',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.65rem', color: '#8A7B68', fontWeight: 600, flexShrink: 0,
                    }}>
                      {(f.client?.nom || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.82rem', color: '#1A1208' }}>{f.client?.nom || '—'}</div>
                      {f.client?.telephone && (
                        <div style={{ fontSize: '0.68rem', color: '#C4B090' }}>{f.client.telephone}</div>
                      )}
                    </div>
                  </div>
                </td>

                <td style={{ padding: '0.85rem 1rem' }}>
                  <span style={{
                    fontFamily: 'Cormorant Garamond,serif',
                    fontSize: '1.05rem', color: '#C4960A',
                  }}>
                    {Number(f.montantTotal).toFixed(0)} DT
                  </span>
                </td>

                <td style={{ padding: '0.85rem 1rem' }}>
                  <StatutBadge statut={f.statut} />
                </td>

                <td style={{ padding: '0.85rem 1rem' }}>
                  <span style={{ fontSize: '0.72rem', color: '#C4B090' }}>
                    {new Date(f.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: '2-digit', year: '2-digit',
                    })}
                  </span>
                </td>

                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <Link
                      href={`/erp/commandes/${f.id}`}
                      style={{
                        fontSize: '0.68rem', color: '#8A7B68',
                        textDecoration: 'none',
                        border: '1px solid #EDE5D4',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '3px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Voir →
                    </Link>
                    <a
                      href={`/api/factures/${f.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '0.68rem', color: '#4A7A9B',
                        textDecoration: 'none',
                        border: '1px solid #C8DDE8',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '3px',
                        background: '#EEF5FA',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      PDF
                    </a>
                  </div>
                </td>
              </tr>
            ))
          )}
        </ErpTable>
      )}
    </ErpPage>
  )
}
