"use client"
import { useEffect, useState } from 'react'
import { ErpPage } from '@/components/erp/ErpPage'
import { patchProduit, urlListeProduitsErp, VITRINE_FETCH_INIT } from '@/lib/catalog-api'

interface Produit {
  id: string; nom: string; slug: string; prix: number
  exclusif: boolean; nouveaute: boolean; offre: boolean; offreLabel?: string
  featured: boolean; images: string[]
}

type BadgeType = 'exclusif' | 'nouveaute' | 'offre' | 'featured'

export default function ExclusivitesPage() {
  const [produits, setProduits] = useState<Produit[]>([])
  const [saving, setSaving] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<BadgeType | 'tous'>('tous')

  useEffect(() => {
    fetch('/api/produits?limit=100', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setProduits(Array.isArray(d) ? d : []))
  }, [])

  const toggleBadge = async (id: string, field: BadgeType, value: boolean) => {
    const prevSnap = produits
    setSaveError(null)
    setProduits(p =>
      p.map(x => (x.id === id ? { ...x, [field]: value } : x))
    )
    setSaving(id)
    try {
      const res = await fetch(`/api/produits/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const msg =
          typeof body?.error === 'string' ? body.error : `Erreur ${res.status}`
        setProduits(prevSnap)
        setSaveError(msg)
        return
      }
    } catch {
      setProduits(prevSnap)
      setSaveError('Réseau indisponible. Réessayez.')
    } finally {
      setSaving(null)
    }
  }

  const updateLabel = async (id: string, label: string) => {
    const prevSnap = produits
    setSaveError(null)
    setProduits(p =>
      p.map(x => (x.id === id ? { ...x, offreLabel: label } : x))
    )
    try {
      const res = await patchProduit(id, { offreLabel: label })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const msg =
          typeof body?.error === 'string' ? body.error : `Erreur ${res.status}`
        setProduits(prevSnap)
        setSaveError(msg)
      }
    } catch {
      setProduits(prevSnap)
      setSaveError('Réseau indisponible. Réessayez.')
    }
  }

  const filtered = produits.filter(p => {
    const matchSearch = p.nom.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'tous' ? true :
      filter === 'exclusif' ? p.exclusif :
      filter === 'nouveaute' ? p.nouveaute :
      filter === 'offre' ? p.offre :
      filter === 'featured' ? p.featured : true
    return matchSearch && matchFilter
  })

  const BADGES: { key: BadgeType; label: string; color: string; bg: string }[] = [
    { key:'exclusif',  label:'Exclusif',   color:'#C4960A', bg:'#FFF8E6' },
    { key:'nouveaute', label:'Nouveauté',  color:'#4A7A9B', bg:'#EEF5FA' },
    { key:'offre',     label:'Offre',      color:'#2E7D52', bg:'#E4F2EB' },
    { key:'featured',  label:'Bestseller', color:'#7A5C9B', bg:'#F4EFF9' },
  ]

  const isBadgeActive = (produit: Produit, key: BadgeType) => {
    if (key === 'exclusif') return produit.exclusif
    if (key === 'nouveaute') return produit.nouveaute
    if (key === 'offre') return produit.offre
    return produit.featured
  }

  return (
    <ErpPage
      title="Exclusivités & Offres"
      subtitle="Gérer les badges et mises en avant"
      actions={
        <input
          placeholder="Rechercher…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding:'0.38rem 0.9rem', fontSize:'0.78rem',
            border:'1px solid #EDE5D4', background:'#FDFAF5',
            color:'#1A1208', outline:'none', width:'200px',
            fontFamily:'Jost,sans-serif', borderRadius:'3px',
          }}
        />
      }
    >
      {saveError && (
        <div
          role="alert"
          style={{
            marginBottom: '1rem',
            padding: '0.65rem 1rem',
            background: '#FAEAEA',
            color: '#8B3A3A',
            fontSize: '0.78rem',
            border: '1px solid rgba(139,58,58,0.2)',
            borderRadius: '4px',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '0.35rem' }}>{saveError}</div>
          <div style={{ fontSize: '0.72rem', color: '#6B3030', lineHeight: 1.5 }}>
            Astuce : en production, l’ERP et la vitrine doivent partager la même base
            (<code style={{ fontSize: '0.68rem' }}>DATABASE_URL</code> sur Vercel). Les cookies de
            session doivent être envoyés avec la requête (restez connecté sur le même domaine).
          </div>
        </div>
      )}
      <div style={{ display:'flex', gap:'0.4rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
        {[{ key:'tous', label:'Tous' }, ...BADGES.map(b => ({ key:b.key, label:b.label }))].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key as BadgeType | 'tous')} style={{
            padding:'0.38rem 0.85rem', fontSize:'0.7rem',
            background: filter === f.key ? '#1A1208' : '#FDFAF5',
            color: filter === f.key ? 'white' : '#8A7B68',
            border:`1px solid ${filter === f.key ? '#1A1208' : '#EDE5D4'}`,
            cursor:'pointer', fontFamily:'Jost,sans-serif',
            borderRadius:'3px', transition:'all 0.18s',
          }}>{f.label}</button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1rem' }}>
        {filtered.map(p => (
          <div key={p.id} style={{
            background:'#FDFAF5', border:'1px solid #EDE5D4',
            borderRadius:'6px', overflow:'hidden',
            opacity: saving === p.id ? 0.6 : 1,
            transition:'opacity 0.2s',
          }}>
            <div style={{
              padding:'1rem 1.2rem',
              borderBottom:'1px solid #EDE5D4',
              display:'flex', alignItems:'center', gap:'0.8rem',
            }}>
              <div style={{
                width:'44px', height:'44px',
                background:'linear-gradient(145deg,#EDE5D4,#D4B896)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'1.1rem', color:'rgba(196,150,10,0.4)', flexShrink:0,
              }}>
                {p.images?.[0]
                  ? <img src={p.images[0]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  : '✿'
                }
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:'0.85rem', color:'#1A1208', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.nom}</div>
                <div style={{ fontSize:'0.68rem', color:'#C4960A' }}>{Number(p.prix).toFixed(0)} DT</div>
              </div>
            </div>

            <div style={{ padding:'1rem 1.2rem', display:'flex', flexDirection:'column', gap:'0.6rem' }}>
              {BADGES.map(badge => (
                <div key={badge.key} style={{
                  display:'flex', alignItems:'center',
                  justifyContent:'space-between', padding:'0.5rem 0',
                  borderBottom:'1px solid #F0EBE0',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                    <span style={{
                      background: isBadgeActive(p, badge.key) ? badge.bg : '#F0EBE0',
                      color: isBadgeActive(p, badge.key) ? badge.color : '#C4B090',
                      fontSize:'0.62rem', padding:'0.15rem 0.5rem',
                      borderRadius:'3px', fontWeight:500,
                      transition:'all 0.2s',
                    }}>{badge.label}</span>
                    {badge.key === 'offre' && isBadgeActive(p, badge.key) && (
                      <input
                        placeholder="ex: -20%"
                        defaultValue={p.offreLabel || ''}
                        onBlur={e => updateLabel(p.id, e.target.value)}
                        style={{
                          width:'80px', padding:'0.2rem 0.4rem',
                          border:'1px solid #EDE5D4', fontSize:'0.72rem',
                          fontFamily:'Jost,sans-serif', outline:'none',
                          borderRadius:'3px',
                        }}
                      />
                    )}
                  </div>

                  <div
                    onClick={() => toggleBadge(p.id, badge.key, !isBadgeActive(p, badge.key))}
                    style={{
                      width:'40px', height:'22px',
                      background: isBadgeActive(p, badge.key) ? badge.color : '#EDE5D4',
                      borderRadius:'11px', cursor:'pointer',
                      position:'relative', transition:'background 0.25s',
                      flexShrink:0,
                    }}
                  >
                    <div style={{
                      position:'absolute', top:'3px',
                      left: isBadgeActive(p, badge.key) ? '21px' : '3px',
                      width:'16px', height:'16px',
                      background:'white', borderRadius:'50%',
                      transition:'left 0.25s',
                      boxShadow:'0 1px 4px rgba(0,0,0,0.2)',
                    }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ErpPage>
  )
}
