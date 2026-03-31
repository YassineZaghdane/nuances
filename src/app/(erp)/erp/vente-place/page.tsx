"use client"

import { useEffect, useState } from 'react'
import { ErpPage } from '@/components/erp/ErpPage'

interface Produit { id: string; nom: string; notes?: string; prix: number; stocks: { taille: string; quantite: number }[] }
interface LignePanier { produitId: string; nom: string; taille: string; prix: number; quantite: number }

const TAILLE_ML: Record<string, number> = {
  '1ml': 1, '2ml': 2, '5ml': 5, '10ml': 10,
  '15ml': 15, '30ml': 30, '50ml': 50, '100ml': 100,
}

export default function VentePlacePage() {
  const [produits, setProduits] = useState<Produit[]>([])
  const [panier, setPanier] = useState<LignePanier[]>([])
  const [search, setSearch] = useState('')
  const [client, setClient] = useState({ nom: '', telephone: '' })
  const [paiement, setPaiement] = useState('CASH')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetch('/api/produits')
      .then(r => r.json())
      .then(d => setProduits(Array.isArray(d) ? d : []))
      .catch(() => setProduits([]))
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

  const total = panier.reduce((s, l) => s + l.prix * l.quantite, 0)

  const valider = async () => {
    if (panier.length === 0) return
    setSaving(true)
    try {
      const res = await fetch('/api/commandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: {
            nom: client.nom || 'Client boutique',
            telephone: client.telephone || '00000000',
          },
          lignes: panier.map(l => ({
            produitId: l.produitId,
            taille: l.taille,
            quantite: l.quantite,
            prixUnitaire: l.prix,
          })),
          source: 'BOUTIQUE',
          modePaiement: paiement,
          fraisLivraison: 0,
          montantTotal: total,
          statut: 'LIVREE',
          notes: `Vente sur place — ${paiement}`,
          adresseLivraison: 'Boutique Nabeul',
          villeLivraison: 'Nabeul',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      setSuccess(data.numero || 'OK')
      setPanier([])
      setClient({ nom: '', telephone: '' })
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ErpPage title="Vente sur place" subtitle="Caisse boutique — Nabeul">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start' }}>

        {/* CATALOGUE */}
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
                  {p.stocks?.filter(s => s.quantite > 0).map(s => {
                    const prix = Number(p.prix) + (s.taille === '50ml' ? 10 : s.taille === '100ml' ? 20 : 0)
                    return (
                      <button key={s.taille} type="button" onClick={() => addToCart(p, s.taille, prix)} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.45rem 0.7rem',
                        background: '#F0EBE0', border: '1px solid #EDE5D4',
                        cursor: 'pointer', fontFamily: 'Jost,sans-serif',
                        fontSize: '0.72rem', borderRadius: '3px',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#E8DFD0' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#F0EBE0' }}
                      >
                        <span style={{ color: '#C4960A', fontWeight: 600 }}>{s.taille}</span>
                        <span style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '0.9rem', color: '#1A1208' }}>{prix} DT</span>
                        <span style={{ fontSize: '0.6rem', color: '#C4B090' }}>+</span>
                      </button>
                    )
                  })}
                  {(!p.stocks || p.stocks.every(s => s.quantite <= 0)) && (
                    <div style={{ fontSize: '0.7rem', color: '#C09070', textAlign: 'center', padding: '0.4rem' }}>Rupture de stock</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CAISSE / PANIER */}
        <div style={{ position: 'sticky', top: '76px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

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
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.78rem', color: '#8A7B68' }}>Total</span>
                  <span style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.3rem', color: '#C4960A' }}>{total.toFixed(0)} DT</span>
                </div>
              </div>
            )}
          </div>

          <div style={{ background: '#FDFAF5', border: '1px solid #EDE5D4', borderRadius: '6px', padding: '1rem 1.5rem' }}>
            <div style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C4B090', marginBottom: '0.8rem' }}>Client (optionnel)</div>
            <input
              placeholder="Nom du client"
              value={client.nom}
              onChange={e => setClient({ ...client, nom: e.target.value })}
              style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #EDE5D4', background: 'white', fontFamily: 'Jost,sans-serif', fontSize: '0.8rem', color: '#1A1208', outline: 'none', borderRadius: '3px', marginBottom: '0.5rem' }}
            />
            <input
              placeholder="Téléphone"
              value={client.telephone}
              onChange={e => setClient({ ...client, telephone: e.target.value })}
              style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #EDE5D4', background: 'white', fontFamily: 'Jost,sans-serif', fontSize: '0.8rem', color: '#1A1208', outline: 'none', borderRadius: '3px' }}
            />
          </div>

          <div style={{ background: '#FDFAF5', border: '1px solid #EDE5D4', borderRadius: '6px', padding: '1rem 1.5rem' }}>
            <div style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C4B090', marginBottom: '0.8rem' }}>Mode de paiement</div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {[
                { val: 'CASH', label: '💵 Espèces / Cash' },
                { val: 'VIREMENT', label: '🏦 Virement' },
              ].map(opt => (
                <button key={opt.val} type="button" onClick={() => setPaiement(opt.val)} style={{
                  flex: 1, padding: '0.55rem',
                  background: paiement === opt.val ? '#1A1208' : 'white',
                  color: paiement === opt.val ? 'white' : '#8A7B68',
                  border: `1px solid ${paiement === opt.val ? '#1A1208' : '#EDE5D4'}`,
                  cursor: 'pointer', fontFamily: 'Jost,sans-serif',
                  fontSize: '0.72rem', borderRadius: '3px', transition: 'all 0.18s',
                }}>{opt.label}</button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={valider}
            disabled={saving || panier.length === 0}
            style={{
              width: '100%', padding: '1rem',
              background: (saving || panier.length === 0) ? '#C4B090' : 'linear-gradient(135deg,#2E7D52,#1B5E3B)',
              color: 'white', border: 'none',
              fontSize: '0.8rem', fontFamily: 'Jost,sans-serif',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              cursor: (saving || panier.length === 0) ? 'not-allowed' : 'pointer',
              borderRadius: '6px',
              boxShadow: panier.length > 0 ? '0 6px 20px rgba(46,125,82,0.25)' : 'none',
              transition: 'all 0.2s',
            }}
          >{saving ? 'Enregistrement…' : `✓ Encaisser ${total.toFixed(0)} DT`}</button>
        </div>
      </div>
    </ErpPage>
  )
}
