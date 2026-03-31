"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ErpPage, ErpTable, StatutBadge, BtnPrimary } from '@/components/erp/ErpPage'

const STATUTS = [
  { val: 'Tous',           label: 'Tous' },
  { val: 'EN_ATTENTE',     label: 'En attente' },
  { val: 'CONFIRMEE',      label: 'Confirmée' },
  { val: 'EN_PREPARATION', label: 'En prépa.' },
  { val: 'EXPEDIEE',       label: 'Expédiée' },
  { val: 'LIVREE',         label: 'Livrée' },
  { val: 'ANNULEE',        label: 'Annulée' },
]

interface Commande {
  id: string
  numero: string
  statut: string
  montantTotal: number
  createdAt: string
  client: { nom: string }
  lignes: { quantite: number }[]
}

export default function CommandesPage() {
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [statut, setStatut]       = useState('Tous')
  const [search, setSearch]       = useState('')
  const [page, setPage]           = useState(1)
  const [total, setTotal]         = useState(0)
  const PER = 20

  useEffect(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: PER.toString(),
    })
    if (statut !== 'Tous') params.set('statut', statut)
    if (search.trim()) params.set('search', search.trim())

    fetch(`/api/commandes?${params.toString()}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(d => {
        const liste = d.commandes ?? d.data ?? (Array.isArray(d) ? d : [])
        setCommandes(liste)
        setTotal(typeof d.total === 'number' ? d.total : liste.length)
      })
      .catch(err => {
        console.error('[Commandes fetch]', err)
        setCommandes([])
        setTotal(0)
      })
  }, [statut, search, page])

  const pages     = Math.ceil(total / PER) || 1
  const hasNext   = page < pages
  const hasPrev   = page > 1

  return (
    <ErpPage
      title="Commandes"
      subtitle={`${total} commandes au total`}
      actions={
        <>
          <input
            placeholder="Rechercher…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
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
          <BtnPrimary href="/erp/commandes/nouveau">
            + Nouvelle
          </BtnPrimary>
        </>
      }
    >

      {/* Filtres statut */}
      <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
        {STATUTS.map(s => (
          <button
            key={s.val}
            onClick={() => { setStatut(s.val); setPage(1) }}
            style={{
              padding: '0.38rem 0.85rem',
              fontSize: '0.7rem',
              letterSpacing: '0.05em',
              background: statut === s.val ? '#1A1208' : '#FDFAF5',
              color: statut === s.val ? 'white' : '#8A7B68',
              border: `1px solid ${statut === s.val ? '#1A1208' : '#EDE5D4'}`,
              cursor: 'pointer',
              fontFamily: 'Jost,sans-serif',
              borderRadius: '3px',
              transition: 'all 0.18s',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <ErpTable
        headers={['Numéro', 'Client', 'Articles', 'Montant', 'Statut', 'Date', '']}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#C4B090' }}>
              {total === 0
                ? 'Aucun résultat'
                : `${Math.min((page - 1) * PER + 1, total)}–${Math.min(page * PER, total)} sur ${total}`}
            </span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!hasPrev}
                style={{
                  padding: '0.3rem 0.7rem',
                  fontSize: '0.7rem',
                  border: '1px solid #EDE5D4',
                  background: '#FDFAF5',
                  color: hasPrev ? '#1A1208' : '#C4B090',
                  cursor: hasPrev ? 'pointer' : 'not-allowed',
                  fontFamily: 'Jost,sans-serif',
                  borderRadius: '3px',
                }}
              >
                ←
              </button>
              <span style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', color: '#8A7B68' }}>
                {page} / {pages}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!hasNext}
                style={{
                  padding: '0.3rem 0.7rem',
                  fontSize: '0.7rem',
                  border: '1px solid #EDE5D4',
                  background: '#FDFAF5',
                  color: hasNext ? '#1A1208' : '#C4B090',
                  cursor: hasNext ? 'pointer' : 'not-allowed',
                  fontFamily: 'Jost,sans-serif',
                  borderRadius: '3px',
                }}
              >
                →
              </button>
            </div>
          </div>
        }
      >
        {commandes.length === 0 ? (
          <tr>
            <td
              colSpan={7}
              style={{
                padding: '3rem',
                textAlign: 'center',
                color: '#C4B090',
                fontFamily: 'Cormorant Garamond,serif',
                fontSize: '1.1rem',
                fontStyle: 'italic',
              }}
            >
              Aucune commande trouvée
            </td>
          </tr>
        ) : (
          commandes.map(cmd => {
            const articles = cmd.lignes?.reduce((s, l) => s + l.quantite, 0) || 0
            return (
              <tr
                key={cmd.id}
                style={{ borderBottom: '1px solid #F0EBE0', transition: 'background 0.15s' }}
                onMouseEnter={e =>
                  ((e.currentTarget as HTMLElement).style.background = '#FAF7F2')
                }
                onMouseLeave={e =>
                  ((e.currentTarget as HTMLElement).style.background = 'transparent')
                }
              >
                <td style={{ padding: '0.8rem 1rem' }}>
                  <Link
                    href={`/erp/commandes/${cmd.id}`}
                    style={{
                      fontSize: '0.8rem',
                      color: '#C4960A',
                      textDecoration: 'none',
                      fontWeight: 500,
                      letterSpacing: '0.03em',
                    }}
                  >
                    {cmd.numero}
                  </Link>
                </td>

                <td style={{ padding: '0.8rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: '#EDE5D4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.65rem',
                        color: '#8A7B68',
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {(cmd.client?.nom || '?').charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#1A1208' }}>
                      {cmd.client?.nom || '—'}
                    </span>
                  </div>
                </td>

                <td style={{ padding: '0.8rem 1rem' }}>
                  <span style={{ fontSize: '0.78rem', color: '#8A7B68' }}>{articles}</span>
                </td>

                <td style={{ padding: '0.8rem 1rem' }}>
                  <span
                    style={{
                      fontFamily: 'Cormorant Garamond,serif',
                      fontSize: '1rem',
                      color: '#1A1208',
                    }}
                  >
                    {Number(cmd.montantTotal).toFixed(0)} DT
                  </span>
                </td>

                <td style={{ padding: '0.8rem 1rem' }}>
                  <StatutBadge statut={cmd.statut} />
                </td>

                <td style={{ padding: '0.8rem 1rem' }}>
                  <span style={{ fontSize: '0.72rem', color: '#C4B090' }}>
                    {new Date(cmd.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                    })}
                  </span>
                </td>

                <td style={{ padding: '0.8rem 1rem' }}>
                  <Link
                    href={`/erp/commandes/${cmd.id}`}
                    style={{
                      fontSize: '0.68rem',
                      color: '#8A7B68',
                      textDecoration: 'none',
                      border: '1px solid #EDE5D4',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '3px',
                      transition: 'all 0.18s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Détail →
                  </Link>
                </td>
              </tr>
            )
          })
        )}
      </ErpTable>
    </ErpPage>
  )
}
