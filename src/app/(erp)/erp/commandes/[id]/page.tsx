"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ErpPage } from '@/components/erp/ErpPage'

const STATUT_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  EN_ATTENTE:      { color: '#B8860B', bg: '#FFF8E6', label: 'En attente' },
  CONFIRMEE:       { color: '#4A7A9B', bg: '#EEF5FA', label: 'Confirmée' },
  EN_PREPARATION:  { color: '#7A5C9B', bg: '#F4EFF9', label: 'En prépa.' },
  EXPEDIEE:        { color: '#2E7D52', bg: '#EBF6F0', label: 'Expédiée' },
  LIVREE:          { color: '#1B5E3B', bg: '#E4F2EB', label: 'Livrée' },
  ANNULEE:         { color: '#8B3A3A', bg: '#FAEAEA', label: 'Annulée' },
}
const STATUTS_ORDRE = ['EN_ATTENTE', 'CONFIRMEE', 'EN_PREPARATION', 'EXPEDIEE', 'LIVREE', 'ANNULEE']

type CommandeState = {
  id: string
  numero: string
  statut: string
  montantTotal: number
  client?: { nom: string; telephone?: string; email?: string }
  adresseLivraison?: string
  villeLivraison?: string
  lignes?: { produit?: { nom: string }; taille: string; quantite: number; prixUnitaire: number }[]
  notes?: string | null
} | null

export default function CommandeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [cmd, setCmd] = useState<CommandeState>(null)
  const [newStatut, setNewStatut] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/commandes/${id}`)
      .then(r => r.json())
      .then(data => {
        setCmd(data)
        setNewStatut(data.statut || '')
      })
      .catch(() => setCmd(null))
  }, [id])

  const updateStatut = async () => {
    if (!id || !newStatut || newStatut === cmd?.statut) return
    setSaving(true)
    try {
      const res = await fetch(`/api/commandes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: newStatut, note: note || undefined }),
      })
      const data = await res.json()
      setCmd(prev => prev ? { ...prev, ...data, statut: data.statut, notes: data.notes } : null)
    } catch { alert('Erreur lors de la mise à jour') }
    finally { setSaving(false) }
  }

  if (cmd == null) {
    return (
      <ErpPage title="Commande" subtitle="Chargement…">
        <div style={{ padding: '3rem', textAlign: 'center', color: '#C4B090' }}>Chargement…</div>
      </ErpPage>
    )
  }

  const st = STATUT_STYLE[cmd.statut] || STATUT_STYLE.EN_ATTENTE

  return (
    <ErpPage
      title={`Commande ${cmd.numero}`}
      subtitle={st.label}
      actions={
        <>
          <Link href="/erp/commandes" style={{
            fontSize: '0.72rem', color: '#8A7B68',
            textDecoration: 'none', letterSpacing: '0.06em',
            border: '1px solid #EDE5D4', padding: '0.35rem 0.8rem',
            borderRadius: '3px', fontFamily: 'Jost,sans-serif',
            transition: 'all 0.18s',
          }}>← Liste</Link>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>

        {/* Colonne gauche */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Client + adresse */}
          <div style={{ background: '#FDFAF5', border: '1px solid #EDE5D4', borderRadius: '6px', padding: '1.2rem 1.5rem' }}>
            <div style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C4B090', marginBottom: '0.6rem' }}>Client</div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', color: '#1A1208', marginBottom: '0.25rem' }}>{cmd.client?.nom ?? '—'}</div>
            <div style={{ fontSize: '0.8rem', color: '#8A7B68', marginBottom: '0.2rem' }}>{cmd.client?.telephone ?? '—'}</div>
            {cmd.client?.email && <div style={{ fontSize: '0.8rem', color: '#8A7B68', marginBottom: '0.5rem' }}>{cmd.client.email}</div>}
            <div style={{ marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px solid #EDE5D4', fontSize: '0.78rem', color: '#8A7B68' }}>
              {[cmd.adresseLivraison, cmd.villeLivraison].filter(Boolean).join(' — ')}
            </div>
          </div>

          {/* Lignes */}
          <div style={{ background: '#FDFAF5', border: '1px solid #EDE5D4', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #EDE5D4' }}>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem', color: '#1A1208' }}>Détail</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FAF7F2' }}>
                  {['Produit', 'Format', 'Qté', 'P.U.', 'Total'].map(h => (
                    <th key={h} style={{ padding: '0.6rem 1rem', textAlign: 'left', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C4B090', fontWeight: 500, borderBottom: '1px solid #EDE5D4' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(cmd.lignes ?? []).map((l, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F0EBE0' }}>
                    <td style={{ padding: '0.7rem 1rem', fontSize: '0.82rem', color: '#1A1208' }}>{l.produit?.nom ?? '—'}</td>
                    <td style={{ padding: '0.7rem 1rem', fontSize: '0.78rem', color: '#C4960A' }}>{l.taille}</td>
                    <td style={{ padding: '0.7rem 1rem', fontSize: '0.82rem', color: '#1A1208' }}>{l.quantite}</td>
                    <td style={{ padding: '0.7rem 1rem', fontFamily: 'Cormorant Garamond, serif', fontSize: '0.95rem', color: '#1A1208' }}>{Number(l.prixUnitaire).toFixed(0)} DT</td>
                    <td style={{ padding: '0.7rem 1rem', fontFamily: 'Cormorant Garamond, serif', fontSize: '0.95rem', color: '#C4960A' }}>{(Number(l.prixUnitaire) * l.quantite).toFixed(0)} DT</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: '0.8rem 1.5rem', borderTop: '1px solid #EDE5D4', display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', color: '#1A1208' }}>Total </span>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', color: '#C4960A', marginLeft: '0.5rem' }}>{Number(cmd.montantTotal).toFixed(0)} DT</span>
            </div>
          </div>

          {/* Statut actuel + changement */}
          <div style={{ background: '#FDFAF5', border: '1px solid #EDE5D4', borderRadius: '6px', padding: '1.2rem 1.5rem' }}>
            <div style={{ fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C4B090', marginBottom: '0.5rem' }}>Statut actuel</div>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ background: st.bg, color: st.color, padding: '0.18rem 0.55rem', fontSize: '0.62rem', borderRadius: '3px', fontWeight: 500 }}>{st.label}</span>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C4B090', marginBottom: '0.5rem' }}>Changer vers</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {STATUTS_ORDRE.filter(s => s !== cmd.statut).map(s => {
                  const st2 = STATUT_STYLE[s]
                  const isSelected = newStatut === s
                  return (
                    <button key={s} type="button" onClick={() => setNewStatut(s)} style={{
                      padding: '0.55rem 0.8rem',
                      background: isSelected ? st2.bg : 'transparent',
                      border: `1px solid ${isSelected ? st2.color : '#EDE5D4'}`,
                      color: isSelected ? st2.color : '#8A7B68',
                      fontSize: '0.75rem', cursor: 'pointer',
                      fontFamily: 'Jost,sans-serif',
                      textAlign: 'left', borderRadius: '3px',
                      fontWeight: isSelected ? 600 : 400,
                      transition: 'all 0.18s',
                    }}>
                      {isSelected ? '✓ ' : ''}{st2.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C4B090', marginBottom: '0.4rem' }}>Note interne (optionnel)</div>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Ex : Appelé le client, livraison demain…"
                rows={2}
                style={{
                  width: '100%', padding: '0.6rem 0.8rem',
                  border: '1px solid #EDE5D4', background: 'white',
                  fontFamily: 'Jost,sans-serif', fontSize: '0.78rem',
                  color: '#1A1208', outline: 'none', resize: 'vertical',
                  borderRadius: '3px',
                }}
              />
            </div>

            <button
              type="button"
              onClick={updateStatut}
              disabled={saving || newStatut === cmd.statut}
              style={{
                width: '100%', padding: '0.75rem',
                background: (saving || newStatut === cmd.statut) ? '#C4B090' : '#1A1208',
                color: 'white', border: 'none',
                fontSize: '0.72rem', fontFamily: 'Jost,sans-serif',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                cursor: (saving || newStatut === cmd.statut) ? 'not-allowed' : 'pointer',
                borderRadius: '3px', transition: 'all 0.2s',
              }}
            >{saving ? 'Sauvegarde…' : 'Mettre à jour'}</button>
          </div>
        </div>

        {/* Colonne droite */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Timeline statuts */}
          <div style={{ background: '#FDFAF5', border: '1px solid #EDE5D4', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #EDE5D4' }}>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem', color: '#1A1208' }}>Progression</span>
            </div>
            <div style={{ padding: '1.2rem 1.5rem' }}>
              {['EN_ATTENTE', 'CONFIRMEE', 'EN_PREPARATION', 'EXPEDIEE', 'LIVREE'].map((s, i) => {
                const done = STATUTS_ORDRE.indexOf(cmd.statut) >= STATUTS_ORDRE.indexOf(s)
                const current = cmd.statut === s
                const st3 = STATUT_STYLE[s]
                return (
                  <div key={s} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', marginBottom: i < 4 ? '0' : '0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: done ? st3.color : '#EDE5D4',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.6rem', color: 'white', flexShrink: 0,
                        border: current ? `2px solid ${st3.color}` : 'none',
                        boxShadow: current ? `0 0 0 3px ${st3.bg}` : 'none',
                      }}>
                        {done ? '✓' : ''}
                      </div>
                      {i < 4 && <div style={{ width: '1px', height: '24px', background: done ? st3.color : '#EDE5D4', margin: '2px 0' }}/>}
                    </div>
                    <div style={{ paddingBottom: i < 4 ? '0' : '0', paddingTop: '1px' }}>
                      <div style={{ fontSize: '0.75rem', color: done ? '#1A1208' : '#C4B090', fontWeight: current ? 600 : 400 }}>
                        {st3.label}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* WhatsApp */}
          <a href={`https://wa.me/${cmd.client?.telephone ?? ''}?text=${encodeURIComponent(`Bonjour ${cmd.client?.nom ?? ''}, votre commande ${cmd.numero} est maintenant ${STATUT_STYLE[cmd.statut]?.label}. Merci de votre confiance - Nuances Parfums`)}`}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '0.5rem', background: '#25D366', color: 'white',
              padding: '0.75rem', fontSize: '0.72rem', fontFamily: 'Jost,sans-serif',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              textDecoration: 'none', borderRadius: '3px',
              boxShadow: '0 4px 14px rgba(37,211,102,0.25)',
            }}
          >💬 Notifier le client</a>
        </div>
      </div>
    </ErpPage>
  )
}
