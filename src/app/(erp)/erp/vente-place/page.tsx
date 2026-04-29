"use client"

import React, { useEffect, useState } from 'react'
import { ErpPage } from '@/components/erp/ErpPage'

interface Produit {
  id: string; nom: string; notes?: string; prix: number
  prix30ml?: number | null; prix50ml?: number | null; prix100ml?: number | null
  stockKilo?: { stockMlTotal: number } | null
}
interface LignePanier { produitId: string; nom: string; taille: string; prix: number; quantite: number }

const FORMATS_CONFIG = [
  { taille: '30ml',  key: 'prix30ml'  as const, minMl: 11 },
  { taille: '50ml',  key: 'prix50ml'  as const, minMl: 18 },
  { taille: '100ml', key: 'prix100ml' as const, minMl: 33 },
]

export default function VentePlacePage() {
  const [produits, setProduits] = useState<Produit[]>([])
  const [panier, setPanier] = useState<LignePanier[]>([])
  const [search, setSearch] = useState('')
  const [client, setClient] = useState({ nom: '', telephone: '', adresse: '' })
  const [paiement, setPaiement] = useState('CASH')
  const [mode, setMode] = useState<'boutique' | 'livraison'>('boutique')
  const [plateforme, setPlateforme] = useState('INSTAGRAM')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [fullscreen, setFullscreen] = useState(false)
  const [reversed, setReversed] = useState(false)

  useEffect(() => {
    fetch('/api/produits')
      .then(r => r.json())
      .then(d => setProduits(Array.isArray(d) ? d : []))
      .catch(() => setProduits([]))
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFullscreen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const filtered = produits.filter(p =>
    p.nom.toLowerCase().includes(search.toLowerCase())
  )

  const addToCart = (p: Produit, taille: string, prix: number) => {
    setPanier(prev => {
      const ex = prev.find(l => l.produitId === p.id && l.taille === taille)
      if (ex) return prev.map(l => l.produitId === p.id && l.taille === taille
        ? { ...l, quantite: l.quantite + 1 } : l)
      return [...prev, { produitId: p.id, nom: p.nom, taille, prix, quantite: 1 }]
    })
  }

  const updateQty = (produitId: string, taille: string, qty: number) => {
    if (qty <= 0) setPanier(prev => prev.filter(l => !(l.produitId === produitId && l.taille === taille)))
    else setPanier(prev => prev.map(l => l.produitId === produitId && l.taille === taille ? { ...l, quantite: qty } : l))
  }

  const sousTotal = panier.reduce((s, l) => s + l.prix * l.quantite, 0)
  const FRAIS_LIVRAISON = 8
  const fraisLivraison = mode === 'livraison' ? FRAIS_LIVRAISON : 0
  const total = sousTotal + fraisLivraison

  const valider = async () => {
    if (panier.length === 0) return
    if (mode === 'livraison') {
      if (!client.nom.trim() || !client.telephone.trim() || !client.adresse.trim()) {
        setFormError('Nom, téléphone et adresse sont obligatoires pour une livraison.')
        return
      }
    }
    setFormError('')
    setSaving(true)
    try {
      const source = mode === 'boutique' ? 'BOUTIQUE' : plateforme
      const res = await fetch('/api/commandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: {
            nom: client.nom || 'Client boutique',
            telephone: client.telephone || '00000000',
            adresse: client.adresse || undefined,
          },
          lignes: panier.map(l => ({
            produitId: l.produitId,
            taille: l.taille,
            quantite: l.quantite,
            prixUnitaire: l.prix,
          })),
          source,
          modePaiement: paiement,
          fraisLivraison,
          montantTotal: total,
          statut: mode === 'boutique' ? 'LIVREE' : 'EN_ATTENTE',
          notes: mode === 'boutique'
            ? `Vente sur place — ${paiement}`
            : `Livraison — ${source} — ${paiement}`,
          adresseLivraison: mode === 'livraison' ? client.adresse : 'Boutique Nabeul',
          villeLivraison: 'Nabeul',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      setSuccess(data.numero || 'OK')
      setPanier([])
      setClient({ nom: '', telephone: '', adresse: '' })
      setMode('boutique')
      setPlateforme('INSTAGRAM')
      setPaiement('CASH')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  const btnStyle = (active?: boolean): React.CSSProperties => ({
    padding: '0.4rem 0.85rem',
    background: active ? '#1A1208' : 'rgba(255,255,255,0.12)',
    color: active ? 'white' : 'rgba(255,255,255,0.85)',
    border: '1px solid rgba(255,255,255,0.2)',
    cursor: 'pointer', borderRadius: '4px',
    fontFamily: 'Jost,sans-serif', fontSize: '0.7rem',
    letterSpacing: '0.08em', transition: 'all 0.18s',
  })

  const catalogue = (
    <div>
      {success && (
        <div style={{
          background: '#E4F2EB', border: '1px solid #2E7D52',
          color: '#1B5E3B', padding: '1rem 1.5rem',
          borderRadius: '6px', marginBottom: '1rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: '0.85rem' }}>✓ Vente enregistrée — {success}</span>
          <button type="button" onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1B5E3B', fontSize: '1.1rem' }}>×</button>
        </div>
      )}

      <input
        placeholder="Rechercher un parfum…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%', padding: '0.7rem 1rem',
          border: '1px solid #EDE5D4', background: '#FDFAF5',
          fontFamily: 'Jost,sans-serif', fontSize: '0.85rem',
          color: '#1A1208', outline: 'none', borderRadius: '6px',
          marginBottom: '1rem',
        }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '0.8rem' }}>
        {filtered.map(p => (
          <div key={p.id} style={{
            background: '#FDFAF5', border: '1px solid #EDE5D4',
            borderRadius: '6px', padding: '1rem', overflow: 'hidden',
          }}>
            <div style={{
              height: '70px', background: 'linear-gradient(145deg,#EDE5D4,#D4B896)',
              borderRadius: '4px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', marginBottom: '0.8rem',
              fontSize: '1.5rem', color: 'rgba(196,150,10,0.4)',
            }}>✿</div>

            <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1rem', color: '#1A1208', marginBottom: '0.15rem' }}>{p.nom}</div>
            {p.notes && <div style={{ fontSize: '0.65rem', color: '#C4B090', marginBottom: '0.7rem' }}>{p.notes}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {(() => {
                const ml = p.stockKilo?.stockMlTotal ?? 0
                const formats = FORMATS_CONFIG
                  .filter(f => p[f.key] != null && ml >= f.minMl)
                  .map(f => ({ taille: f.taille, prix: Number(p[f.key]) }))
                if (formats.length === 0) return (
                  <div style={{ fontSize: '0.7rem', color: '#C09070', textAlign: 'center', padding: '0.4rem' }}>Rupture de stock</div>
                )
                return formats.map(f => (
                  <button key={f.taille} type="button" onClick={() => addToCart(p, f.taille, f.prix)} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.45rem 0.7rem',
                    background: '#F0EBE0', border: '1px solid #EDE5D4',
                    cursor: 'pointer', fontFamily: 'Jost,sans-serif',
                    fontSize: '0.72rem', borderRadius: '3px', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#E8DFD0' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#F0EBE0' }}
                  >
                    <span style={{ color: '#C4960A', fontWeight: 600 }}>{f.taille}</span>
                    <span style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '0.9rem', color: '#1A1208' }}>{f.prix} DT</span>
                    <span style={{ fontSize: '0.6rem', color: '#C4B090' }}>+</span>
                  </button>
                ))
              })()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const inputSt: React.CSSProperties = {
    width: '100%', padding: '0.6rem 0.8rem',
    border: '1px solid #EDE5D4', background: 'white',
    fontFamily: 'Jost,sans-serif', fontSize: '0.8rem',
    color: '#1A1208', outline: 'none', borderRadius: '3px',
  }

  const caisse = (
    <div className="vente-caisse" style={{ position: 'sticky', top: '76px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* ── Panier ── */}
      <div style={{ background: '#FDFAF5', border: '1px solid #EDE5D4', borderRadius: '6px', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #EDE5D4', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.05rem', color: '#1A1208' }}>Panier</span>
          {panier.length > 0 && (
            <button type="button" onClick={() => setPanier([])} style={{ fontSize: '0.65rem', color: '#C09070', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Jost,sans-serif' }}>Vider</button>
          )}
        </div>

        <div style={{ padding: '0.8rem 1.5rem', minHeight: '120px' }}>
          {panier.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: '#C4B090', fontFamily: 'Cormorant Garamond,serif', fontStyle: 'italic' }}>
              Sélectionnez des produits
            </div>
          ) : (
            panier.map(l => (
              <div key={`${l.produitId}-${l.taille}`} style={{
                display: 'flex', alignItems: 'center', gap: '0.7rem',
                padding: '0.55rem 0', borderBottom: '1px solid #F0EBE0',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', color: '#1A1208', fontWeight: 500 }}>{l.nom}</div>
                  <div style={{ fontSize: '0.65rem', color: '#C4960A' }}>{l.taille} · {l.prix} DT</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #EDE5D4', borderRadius: '3px' }}>
                  <button type="button" onClick={() => updateQty(l.produitId, l.taille, l.quantite - 1)} style={{ width: '24px', height: '24px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: '#1A1208' }}>−</button>
                  <span style={{ width: '24px', textAlign: 'center', fontSize: '0.8rem' }}>{l.quantite}</span>
                  <button type="button" onClick={() => updateQty(l.produitId, l.taille, l.quantite + 1)} style={{ width: '24px', height: '24px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: '#1A1208' }}>+</button>
                </div>
                <span style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '0.95rem', color: '#C4960A', minWidth: '55px', textAlign: 'right' }}>
                  {(l.prix * l.quantite).toFixed(0)} DT
                </span>
              </div>
            ))
          )}
        </div>

        {panier.length > 0 && (
          <div style={{ padding: '0.8rem 1.5rem', borderTop: '1px solid #EDE5D4', background: '#FAF7F2' }}>
            {mode === 'livraison' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#8A7B68' }}>Sous-total</span>
                <span style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '0.95rem', color: '#8A7B68' }}>{sousTotal.toFixed(0)} DT</span>
              </div>
            )}
            {mode === 'livraison' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#4A7A9B' }}>Frais de livraison</span>
                <span style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '0.95rem', color: '#4A7A9B' }}>+{FRAIS_LIVRAISON} DT</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', color: '#8A7B68', fontWeight: 600 }}>Total</span>
              <span style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.3rem', color: '#C4960A', fontWeight: 600 }}>{total.toFixed(0)} DT</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Mode : Boutique / Livraison ── */}
      <div className="vente-mode-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
        {[
          { val: 'boutique' as const,  label: '🏪 Boutique',  sub: 'Vente immédiate' },
          { val: 'livraison' as const, label: '🚚 Livraison',  sub: '+8 DT · formulaire' },
        ].map((opt, i) => (
          <button key={opt.val} type="button" onClick={() => { setMode(opt.val); setFormError('') }} style={{
            padding: '0.75rem 0.5rem',
            background: mode === opt.val ? '#1A1208' : '#FDFAF5',
            color: mode === opt.val ? 'white' : '#8A7B68',
            border: '1px solid #EDE5D4',
            borderLeft: i === 1 ? 'none' : '1px solid #EDE5D4',
            borderRadius: i === 0 ? '6px 0 0 6px' : '0 6px 6px 0',
            cursor: 'pointer', fontFamily: 'Jost,sans-serif',
            fontSize: '0.75rem', transition: 'all 0.18s',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem',
          }}>
            <span style={{ fontWeight: 600 }}>{opt.label}</span>
            <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>{opt.sub}</span>
          </button>
        ))}
      </div>

      {/* ── Plateforme (livraison uniquement) ── */}
      {mode === 'livraison' && (
        <div style={{ background: '#FDFAF5', border: '1px solid #EDE5D4', borderRadius: '6px', padding: '1rem 1.5rem' }}>
          <div style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C4B090', marginBottom: '0.8rem' }}>
            Provenance *
          </div>
          <div className="vente-platform-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
            {[
              { val: 'INSTAGRAM', label: 'Instagram', icon: '📸', color: '#C13584' },
              { val: 'FACEBOOK',  label: 'Facebook',  icon: '👤', color: '#1877F2' },
              { val: 'TIKTOK',    label: 'TikTok',    icon: '🎵', color: '#010101' },
              { val: 'WHATSAPP',  label: 'WhatsApp',  icon: '💬', color: '#25D366' },
            ].map(opt => (
              <button key={opt.val} type="button" onClick={() => setPlateforme(opt.val)} style={{
                padding: '0.65rem 0.5rem',
                background: plateforme === opt.val ? opt.color : 'white',
                color: plateforme === opt.val ? 'white' : '#8A7B68',
                border: `1px solid ${plateforme === opt.val ? opt.color : '#EDE5D4'}`,
                cursor: 'pointer', fontFamily: 'Jost,sans-serif',
                fontSize: '0.72rem', borderRadius: '4px',
                textAlign: 'center', transition: 'all 0.18s',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '0.4rem',
                fontWeight: plateforme === opt.val ? 600 : 400,
              }}>
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Formulaire client ── */}
      <div style={{ background: '#FDFAF5', border: `1px solid ${formError ? '#D49090' : '#EDE5D4'}`, borderRadius: '6px', padding: '1rem 1.5rem' }}>
        <div style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C4B090', marginBottom: '0.8rem' }}>
          Client {mode === 'boutique' ? '(optionnel)' : '*'}
        </div>
        <input
          placeholder="Nom du client"
          value={client.nom}
          onChange={e => { setClient({ ...client, nom: e.target.value }); setFormError('') }}
          style={{ ...inputSt, marginBottom: '0.5rem', borderColor: formError && !client.nom.trim() ? '#D49090' : '#EDE5D4' }}
        />
        <input
          placeholder="Téléphone"
          value={client.telephone}
          onChange={e => { setClient({ ...client, telephone: e.target.value }); setFormError('') }}
          style={{ ...inputSt, marginBottom: mode === 'livraison' ? '0.5rem' : '0', borderColor: formError && !client.telephone.trim() ? '#D49090' : '#EDE5D4' }}
        />
        {mode === 'livraison' && (
          <input
            placeholder="Adresse de livraison"
            value={client.adresse}
            onChange={e => { setClient({ ...client, adresse: e.target.value }); setFormError('') }}
            style={{ ...inputSt, borderColor: formError && !client.adresse.trim() ? '#D49090' : '#EDE5D4' }}
          />
        )}
        {formError && (
          <div style={{ fontSize: '0.72rem', color: '#8B3A3A', marginTop: '0.5rem' }}>{formError}</div>
        )}
      </div>

      {/* ── Paiement ── */}
      <div style={{ background: '#FDFAF5', border: '1px solid #EDE5D4', borderRadius: '6px', padding: '1rem 1.5rem' }}>
        <div style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C4B090', marginBottom: '0.8rem' }}>Mode de paiement</div>
        <div className="vente-payment-grid" style={{ display: 'flex', gap: '0.4rem' }}>
          {(mode === 'boutique'
            ? [
                { val: 'CASH',     label: '💵 Cash' },
                { val: 'VIREMENT', label: '🏦 Virement' },
              ]
            : [
                { val: 'CASH',               label: '💵 Cash' },
                { val: 'VIREMENT',           label: '🏦 Virement' },
                { val: 'PAIEMENT_LIVRAISON', label: '🚪 À la livraison' },
              ]
          ).map(opt => (
            <button key={opt.val} type="button" onClick={() => setPaiement(opt.val)} style={{
              flex: 1, padding: '0.55rem 0.3rem',
              background: paiement === opt.val ? '#1A1208' : 'white',
              color: paiement === opt.val ? 'white' : '#8A7B68',
              border: `1px solid ${paiement === opt.val ? '#1A1208' : '#EDE5D4'}`,
              cursor: 'pointer', fontFamily: 'Jost,sans-serif',
              fontSize: '0.65rem', borderRadius: '3px', transition: 'all 0.18s',
            }}>{opt.label}</button>
          ))}
        </div>
      </div>

      {/* ── Bouton valider ── */}
      <button
        type="button"
        onClick={valider}
        disabled={saving || panier.length === 0}
        style={{
          width: '100%', padding: '1rem',
          background: (saving || panier.length === 0) ? '#C4B090'
            : mode === 'livraison'
              ? 'linear-gradient(135deg,#4A7A9B,#2E5A7A)'
              : 'linear-gradient(135deg,#2E7D52,#1B5E3B)',
          color: 'white', border: 'none',
          fontSize: '0.8rem', fontFamily: 'Jost,sans-serif',
          letterSpacing: '0.15em', textTransform: 'uppercase',
          cursor: (saving || panier.length === 0) ? 'not-allowed' : 'pointer',
          borderRadius: '6px',
          boxShadow: panier.length > 0 ? '0 6px 20px rgba(46,125,82,0.25)' : 'none',
          transition: 'all 0.2s',
        }}
      >
        {saving
          ? 'Enregistrement…'
          : mode === 'livraison'
            ? `🚚 Créer la livraison — ${total.toFixed(0)} DT`
            : `✓ Encaisser ${total.toFixed(0)} DT`}
      </button>
    </div>
  )

  const inner = (
    <div className="vente-layout" style={{
      display: 'grid',
      gridTemplateColumns: reversed ? '360px 1fr' : '1fr 360px',
      gap: '1.5rem',
      alignItems: 'start',
    }}>
      {reversed ? <>{caisse}{catalogue}</> : <>{catalogue}{caisse}</>}
    </div>
  )

  if (fullscreen) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#F5EFE0', display: 'flex', flexDirection: 'column',
        fontFamily: 'Jost,sans-serif',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.6rem 1.2rem',
          background: 'linear-gradient(135deg,#1A1208,#2C1F0E)',
          borderBottom: '1px solid rgba(196,150,10,0.3)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1rem', color: '#C4960A', letterSpacing: '0.05em' }}>
              Nuances · Caisse
            </span>
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>|</span>
            <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)' }}>Appuyez sur Échap pour quitter</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" onClick={() => setReversed(r => !r)} style={btnStyle(reversed)}>
              ⇄ {reversed ? 'Normal' : 'Inverser'}
            </button>
            <button type="button" onClick={() => setFullscreen(false)} style={{ ...btnStyle(), background: 'rgba(139,58,58,0.4)', borderColor: 'rgba(139,58,58,0.5)' }}>
              ✕ Quitter
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '1.2rem 1.5rem' }}>
          {inner}
        </div>
      </div>
    )
  }

  return (
    <ErpPage
      title="Vente sur place"
      subtitle="Caisse boutique — Nabeul"
      actions={
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setReversed(r => !r)}
            title="Inverser la disposition"
            style={{
              padding: '0.38rem 0.8rem', background: reversed ? '#1A1208' : 'white',
              color: reversed ? 'white' : '#8A7B68',
              border: '1px solid #EDE5D4', cursor: 'pointer',
              fontSize: '0.7rem', fontFamily: 'Jost,sans-serif',
              borderRadius: '3px', transition: 'all 0.18s',
            }}
          >⇄ Inverser</button>
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            title="Mode plein écran"
            style={{
              padding: '0.38rem 0.9rem', background: '#1A1208', color: 'white',
              border: 'none', cursor: 'pointer',
              fontSize: '0.7rem', fontFamily: 'Jost,sans-serif',
              letterSpacing: '0.06em', borderRadius: '3px',
            }}
          >⛶ Plein écran</button>
        </div>
      }
    >
      {inner}
      <style>{`
        @media (max-width: 980px) {
          .vente-layout {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          .vente-caisse {
            position: static !important;
            top: auto !important;
          }
        }
        @media (max-width: 700px) {
          .vente-mode-grid,
          .vente-platform-grid,
          .vente-payment-grid {
            grid-template-columns: 1fr !important;
            display: grid !important;
          }
          .vente-payment-grid button {
            width: 100%;
          }
        }
      `}</style>
    </ErpPage>
  )
}
