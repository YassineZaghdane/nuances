"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '21696557557'

const STATUT_STEPS = [
  { key: 'EN_ATTENTE',     label: 'Commande reçue',    icon: '✓', desc: 'Votre commande est bien enregistrée' },
  { key: 'CONFIRMEE',      label: 'Confirmée',          icon: '📞', desc: 'Notre équipe a validé votre commande' },
  { key: 'EN_PREPARATION', label: 'En préparation',     icon: '📦', desc: 'Votre commande est en cours de préparation' },
  { key: 'EXPEDIEE',       label: 'Expédiée',           icon: '🚚', desc: 'Votre colis est en route' },
  { key: 'LIVREE',         label: 'Livrée',             icon: '✨', desc: 'Commande livrée avec succès' },
]

interface CommandeDetails {
  numero: string
  statut: string
  montantTotal: number
  fraisLivraison?: number
  adresseLivraison?: string | null
  villeLivraison?: string | null
  createdAt?: string
  lignes: Array<{
    taille: string
    quantite: number
    prixUnitaire: number
    produit: { nom: string } | null
  }>
}

export default function ConfirmationIdPage() {
  const { id } = useParams<{ id: string }>()
  const [commande, setCommande] = useState<CommandeDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')

  const load = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const res = await fetch(`/api/commandes/suivi?id=${encodeURIComponent(id)}`)
      if (!res.ok) { setNotFound(true); return }
      const data = await res.json()
      setCommande(data)
      setNotFound(false)
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleCancel = async () => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ? Cette action est irréversible.')) return
    setCancelling(true)
    setCancelError('')
    try {
      const res = await fetch('/api/commandes/suivi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur serveur')
      await load(true)
    } catch (e: unknown) {
      setCancelError(e instanceof Error ? e.message : 'Une erreur est survenue.')
    } finally {
      setCancelling(false)
    }
  }

  const canCancel = commande && ['EN_ATTENTE', 'CONFIRMEE'].includes(commande.statut)

  const currentStepIdx = commande
    ? STATUT_STEPS.findIndex(s => s.key === commande.statut)
    : -1

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: '#FDFAF5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Jost, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#C4B090', fontStyle: 'italic' }}>Chargement…</div>
        </div>
      </main>
    )
  }

  if (notFound || !commande) {
    return (
      <main style={{ minHeight: '100vh', background: '#FDFAF5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Jost, sans-serif', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '420px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 300, color: '#1A1208', marginBottom: '0.5rem' }}>Commande introuvable</h1>
          <p style={{ fontSize: '0.85rem', color: '#8A7B68', marginBottom: '2rem' }}>Le lien de suivi est peut-être expiré ou invalide.</p>
          <Link href="/boutique" style={{ background: '#1A1208', color: 'white', padding: '0.8rem 2rem', textDecoration: 'none', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif' }}>
            ← Retour à la boutique
          </Link>
        </div>
      </main>
    )
  }

  const isLivree = commande.statut === 'LIVREE'
  const isAnnulee = commande.statut === 'ANNULEE'

  return (
    <main style={{ minHeight: '100vh', background: '#FDFAF5', fontFamily: 'Jost, sans-serif' }}>
      {/* Header strip */}
      <div style={{ background: 'linear-gradient(145deg,#120E08,#1A1208)', padding: '2.5rem 2rem 3rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.6rem', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#C4960A', marginBottom: '0.8rem' }}>
          ✿ Nuances Parfums
        </div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 300, color: 'white', marginBottom: '0.4rem' }}>
          {isAnnulee ? 'Commande annulée' : isLivree ? 'Commande livrée ✨' : 'Suivi de commande'}
        </h1>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#C4960A', letterSpacing: '0.08em' }}>
          {commande.numero}
        </div>
        {commande.createdAt && (
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.4rem', letterSpacing: '0.05em' }}>
            Passée le {new Date(commande.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </div>
        )}
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Progress tracker */}
        {!isAnnulee && (
          <div style={{ background: 'white', border: '1px solid #EDE5D4', borderRadius: '6px', padding: '1.8rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C4B090', marginBottom: '1.5rem' }}>
              Étapes de livraison
            </div>
            {STATUT_STEPS.map((step, i) => {
              const done = i <= currentStepIdx
              const current = i === currentStepIdx
              return (
                <div key={step.key} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: i < STATUT_STEPS.length - 1 ? '0' : '0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: done ? (current && !isLivree ? '#C4960A' : '#2E7D52') : '#F0EBE0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: done ? '0.85rem' : '0.7rem',
                      color: done ? 'white' : '#C4B090',
                      transition: 'all 0.3s',
                      boxShadow: current ? '0 0 0 4px rgba(196,150,10,0.15)' : 'none',
                    }}>
                      {done ? step.icon : <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#C4B090' }}>{i + 1}</span>}
                    </div>
                    {i < STATUT_STEPS.length - 1 && (
                      <div style={{ width: '2px', height: '32px', background: i < currentStepIdx ? '#2E7D52' : '#EDE5D4', transition: 'background 0.3s', margin: '4px 0' }} />
                    )}
                  </div>
                  <div style={{ paddingTop: '6px', paddingBottom: '24px', flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: current ? 600 : 400, color: done ? '#1A1208' : '#C4B090', marginBottom: '0.15rem' }}>
                      {step.label}
                    </div>
                    {current && (
                      <div style={{ fontSize: '0.72rem', color: '#8A7B68' }}>{step.desc}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Annulée banner */}
        {isAnnulee && (
          <div style={{ background: '#FAEAEA', border: '1px solid #DFB8B8', borderRadius: '6px', padding: '1.2rem 1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✕</div>
            <div style={{ fontSize: '0.85rem', color: '#8B3A3A', fontWeight: 500 }}>Cette commande a été annulée.</div>
            <div style={{ fontSize: '0.75rem', color: '#C09090', marginTop: '0.3rem' }}>Contactez-nous pour plus d&apos;informations.</div>
          </div>
        )}

        {/* Order lines */}
        <div style={{ background: 'white', border: '1px solid #EDE5D4', borderRadius: '6px', overflow: 'hidden', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #EDE5D4' }}>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#1A1208' }}>Détail de la commande</span>
          </div>
          <div style={{ padding: '0.5rem 1.5rem' }}>
            {commande.lignes.map((l, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 0', borderBottom: i < commande.lignes.length - 1 ? '1px solid #F0EBE0' : 'none' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#1A1208', fontWeight: 500 }}>{l.produit?.nom ?? '—'}</div>
                  <div style={{ fontSize: '0.7rem', color: '#C4960A' }}>{l.taille} · ×{l.quantite}</div>
                </div>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem', color: '#C4960A' }}>
                  {(l.prixUnitaire * l.quantite).toFixed(0)} DT
                </span>
              </div>
            ))}
          </div>
          <div style={{ padding: '0.8rem 1.5rem', background: '#FAF7F2', borderTop: '1px solid #EDE5D4', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', color: '#8A7B68' }}>Total</span>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#1A1208', fontWeight: 400 }}>
              {commande.montantTotal.toFixed(0)} DT
            </span>
          </div>
        </div>

        {/* Delivery info */}
        {(commande.adresseLivraison || commande.villeLivraison) && (
          <div style={{ background: 'white', border: '1px solid #EDE5D4', borderRadius: '6px', padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C4B090', marginBottom: '0.6rem' }}>Livraison à</div>
            <div style={{ fontSize: '0.85rem', color: '#1A1208', lineHeight: 1.6 }}>
              {commande.adresseLivraison && <div>{commande.adresseLivraison}</div>}
              {commande.villeLivraison && <div style={{ color: '#8A7B68' }}>{commande.villeLivraison}</div>}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            style={{
              flex: '1 1 140px', padding: '0.85rem 1.2rem',
              background: 'white', color: '#1A1208',
              border: '1px solid #EDE5D4', cursor: refreshing ? 'not-allowed' : 'pointer',
              fontFamily: 'Jost, sans-serif', fontSize: '0.75rem',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              borderRadius: '3px', transition: 'all 0.2s',
              opacity: refreshing ? 0.6 : 1,
            }}
          >
            {refreshing ? '…' : '↻ Actualiser'}
          </button>
          <a
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Bonjour, je souhaite avoir des informations sur ma commande ${commande.numero}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: '1 1 140px', padding: '0.85rem 1.2rem',
              background: '#25D366', color: 'white',
              textDecoration: 'none', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '0.5rem',
              fontFamily: 'Jost, sans-serif', fontSize: '0.75rem',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              borderRadius: '3px',
            }}
          >
            💬 WhatsApp
          </a>
        </div>

        {/* Cancel */}
        {canCancel && (
          <div style={{ marginBottom: '1.5rem' }}>
            {cancelError && (
              <div style={{ background: '#FAEAEA', border: '1px solid rgba(139,58,58,0.2)', color: '#8B3A3A', padding: '0.7rem 1rem', fontSize: '0.78rem', borderRadius: '3px', marginBottom: '0.75rem' }}>
                {cancelError}
              </div>
            )}
            <button
              onClick={handleCancel}
              disabled={cancelling}
              style={{
                width: '100%', padding: '0.85rem 1.2rem',
                background: 'transparent', color: '#8B3A3A',
                border: '1px solid rgba(139,58,58,0.3)',
                cursor: cancelling ? 'not-allowed' : 'pointer',
                fontFamily: 'Jost, sans-serif', fontSize: '0.75rem',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                borderRadius: '3px', transition: 'all 0.2s',
                opacity: cancelling ? 0.6 : 1,
              }}
              onMouseEnter={e => { if (!cancelling) { (e.currentTarget as HTMLButtonElement).style.background = '#FAEAEA' } }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
            >
              {cancelling ? 'Annulation en cours…' : '✕ Annuler ma commande'}
            </button>
            <p style={{ fontSize: '0.68rem', color: '#C4B090', textAlign: 'center', marginTop: '0.5rem', fontStyle: 'italic' }}>
              Possible uniquement avant la mise en préparation
            </p>
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <Link href="/boutique" style={{ fontSize: '0.75rem', color: '#C4B090', textDecoration: 'none', letterSpacing: '0.08em' }}>
            ← Continuer mes achats
          </Link>
        </div>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  )
}
