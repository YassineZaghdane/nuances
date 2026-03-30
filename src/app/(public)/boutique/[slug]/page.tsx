/**
 * @module FicheProduit
 * @description Page détail produit avec galerie, sélecteur taille, panier
 */
"use client"
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '@/store/cart-store'

interface StockItem { taille: string; quantite: number; prixVente?: number }
interface Produit {
  id: string; nom: string; slug: string
  description?: string; notes?: string
  prix: number; images: string[]
  featured: boolean; exclusif: boolean; nouveaute: boolean
  offre: boolean; offreLabel?: string
  categorie?: { nom: string }
  stocks: StockItem[]
}

const TAILLE_PRIX: Record<string,number> = {
  '5ml':0,'10ml':0,'15ml':0,
  '30ml':0,'50ml':10,'100ml':20
}

export default function FicheProduitPage() {
  const { slug } = useParams()
  const [produit, setProduit] = useState<Produit | null>(null)
  const [loading, setLoading] = useState(true)
  const [imgActive, setImgActive] = useState(0)
  const [taille, setTaille] = useState('')
  const [qte, setQte] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCartStore()

  useEffect(() => {
    fetch(`/api/produits/${slug}`)
      .then(r => r.json())
      .then(d => {
        setProduit(d)
        const firstDispo = d.stocks?.find((s: StockItem) => s.quantite > 0)
        if (firstDispo) setTaille(firstDispo.taille)
        setLoading(false)
      })
  }, [slug])

  if (loading) return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:'#FDFAF5',
      fontFamily:'Cormorant Garamond,serif', fontSize:'1.2rem',
      fontStyle:'italic', color:'#C4B090'
    }}>Chargement…</div>
  )

  if (!produit) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'1.5rem', background:'#FDFAF5' }}>
      <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.5rem', color:'#1A1208' }}>Produit introuvable</div>
      <Link href="/boutique" style={{ fontSize:'0.75rem', color:'#C4960A', textDecoration:'none', letterSpacing:'0.15em', textTransform:'uppercase' }}>← Retour boutique</Link>
    </div>
  )

  const stockTaille = produit.stocks.find(s => s.taille === taille)
  const dispo = stockTaille?.quantite || 0
  const prixBase = Number(produit.prix)
  const prixFinal = prixBase + (TAILLE_PRIX[taille] || 0)
  const images = produit.images?.length > 0 ? produit.images : []

  const handleAdd = () => {
    if (!taille || dispo === 0) return
    addItem({
      id: `${produit.id}-${taille}`,
      produitId: produit.id,
      nom: produit.nom,
      taille,
      prix: prixFinal,
      image: images[0],
    })
    if (qte > 1) {
      for (let i = 1; i < qte; i += 1) {
        addItem({
          id: `${produit.id}-${taille}`,
          produitId: produit.id,
          nom: produit.nom,
          taille,
          prix: prixFinal,
          image: images[0],
        })
      }
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <>
      <main style={{ fontFamily:'Jost,sans-serif', background:'#FDFAF5', minHeight:'100vh', paddingTop:'76px' }}>
        <div style={{ padding:'1.2rem 6%', borderBottom:'1px solid rgba(196,150,10,0.1)' }}>
          <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', fontSize:'0.7rem', color:'#C4B090', letterSpacing:'0.08em' }}>
            <Link href="/" style={{ color:'#C4B090', textDecoration:'none' }}>Accueil</Link>
            <span>›</span>
            <Link href="/boutique" style={{ color:'#C4B090', textDecoration:'none' }}>Boutique</Link>
            <span>›</span>
            <span style={{ color:'#1A1208' }}>{produit.nom}</span>
          </div>
        </div>

        <div style={{
          display:'grid', gridTemplateColumns:'1fr 1fr',
          gap:'0', maxWidth:'1200px', margin:'0 auto',
          padding:'4rem 6%', alignItems:'start'
        }}>
          <div style={{ paddingRight:'4rem' }}>
            <div style={{
              background:'linear-gradient(145deg,#EDE5D4,#D4C4A8)',
              aspectRatio:'1', display:'flex', alignItems:'center',
              justifyContent:'center', marginBottom:'1rem',
              position:'relative', overflow:'hidden'
            }}>
              <div style={{ position:'absolute', top:'1.2rem', left:'1.2rem', display:'flex', flexDirection:'column', gap:'0.4rem', zIndex:2 }}>
                {produit.nouveaute && <span style={{ background:'#1A1208', color:'white', fontSize:'0.58rem', letterSpacing:'0.15em', textTransform:'uppercase', padding:'0.25rem 0.6rem' }}>Nouveauté</span>}
                {produit.exclusif && <span style={{ background:'#C4960A', color:'white', fontSize:'0.58rem', letterSpacing:'0.15em', textTransform:'uppercase', padding:'0.25rem 0.6rem' }}>Exclusif</span>}
                {produit.offre && produit.offreLabel && <span style={{ background:'#2E7D52', color:'white', fontSize:'0.58rem', letterSpacing:'0.15em', textTransform:'uppercase', padding:'0.25rem 0.6rem' }}>{produit.offreLabel}</span>}
              </div>
              {images.length > 0 ? (
                <img src={images[imgActive]} alt={produit.nom} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              ) : (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
                  <div style={{ width:'32px', height:'20px', background:'linear-gradient(180deg,#C4960A,#8B6914)', borderRadius:'4px 4px 0 0', boxShadow:'0 4px 12px rgba(196,150,10,0.4)' }}/>
                  <div style={{ width:'20px', height:'12px', background:'#C4960A88' }}/>
                  <div style={{ width:'90px', height:'140px', background:'linear-gradient(160deg,rgba(255,255,255,0.6),#D4B89680,#C4960A50)', borderRadius:'8px 8px 6px 6px', boxShadow:'8px 14px 36px rgba(196,150,10,0.22),inset 3px 0 12px rgba(255,255,255,0.45)', position:'relative', overflow:'hidden', border:'1px solid rgba(196,150,10,0.18)' }}>
                    <div style={{ position:'absolute', top:0, left:'17%', width:'13%', height:'100%', background:'rgba(255,255,255,0.35)' }}/>
                  </div>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div style={{ display:'flex', gap:'0.6rem' }}>
                {images.map((img, i) => (
                  <button key={i} onClick={() => setImgActive(i)} style={{ width:'72px', height:'72px', border: imgActive === i ? '2px solid #C4960A' : '1px solid #EDE5D4', background:'#EDE5D4', cursor:'pointer', padding:0, overflow:'hidden' }}>
                    <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {produit.categorie && <div style={{ fontSize:'0.65rem', letterSpacing:'0.28em', textTransform:'uppercase', color:'#C4960A', marginBottom:'0.8rem' }}>{produit.categorie.nom}</div>}
            <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(2rem,4vw,3.2rem)', fontWeight:300, color:'#1A1208', lineHeight:1.1, marginBottom:'0.6rem' }}>{produit.nom}</h1>
            {produit.notes && <p style={{ fontSize:'0.8rem', color:'#8A7B68', letterSpacing:'0.06em', marginBottom:'1.5rem' }}>{produit.notes}</p>}
            <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'2.4rem', fontWeight:300, color:'#C4960A', marginBottom:'2rem' }}>
              {prixFinal.toFixed(0)} DT
              {taille && <span style={{ fontSize:'1rem', color:'#8A7B68', marginLeft:'0.5rem' }}>({taille})</span>}
            </div>
            <div style={{ height:'1px', background:'rgba(196,150,10,0.15)', marginBottom:'2rem' }}/>
            <div style={{ marginBottom:'1.5rem' }}>
              <div style={{ fontSize:'0.65rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'#8A7B68', marginBottom:'0.8rem' }}>Choisir le format</div>
              <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap' }}>
                {produit.stocks.map(s => {
                  const p = prixBase + (TAILLE_PRIX[s.taille] || 0)
                  const isSelected = taille === s.taille
                  const isDispo = s.quantite > 0
                  return (
                    <button key={s.taille} onClick={() => isDispo && setTaille(s.taille)} disabled={!isDispo} style={{ padding:'0.7rem 1.2rem', border: isSelected ? '2px solid #1A1208' : '1px solid rgba(26,18,8,0.18)', background: isSelected ? '#1A1208' : 'white', color: isSelected ? 'white' : isDispo ? '#1A1208' : '#C4B090', cursor: isDispo ? 'pointer' : 'not-allowed', opacity: isDispo ? 1 : 0.45, transition:'all 0.2s', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.15rem' }}>
                      <span style={{ fontFamily:'Jost,sans-serif', fontSize:'0.82rem', fontWeight: isSelected ? 600 : 400 }}>{s.taille}</span>
                      <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'0.88rem', color: isSelected ? 'rgba(255,255,255,0.8)' : '#C4960A' }}>{p.toFixed(0)} DT</span>
                    </button>
                  )
                })}
              </div>
            </div>
            <div style={{ marginBottom:'2rem' }}>
              <div style={{ fontSize:'0.65rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'#8A7B68', marginBottom:'0.8rem' }}>Quantité</div>
              <div style={{ display:'flex', alignItems:'center', gap:'0' }}>
                <button onClick={() => setQte(curr => Math.max(1, curr - 1))} style={{ width:'44px', height:'44px', border:'1px solid rgba(26,18,8,0.18)', background:'white', cursor:'pointer' }}>−</button>
                <div style={{ width:'60px', height:'44px', border:'1px solid rgba(26,18,8,0.18)', borderLeft:'none', borderRight:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>{qte}</div>
                <button onClick={() => setQte(curr => Math.min(dispo, curr + 1))} style={{ width:'44px', height:'44px', border:'1px solid rgba(26,18,8,0.18)', background:'white', cursor:'pointer' }}>+</button>
              </div>
            </div>
            <div style={{ display:'flex', gap:'0.8rem', marginBottom:'2rem', flexWrap:'wrap' }}>
              <button onClick={handleAdd} disabled={!taille || dispo === 0} style={{ flex:1, padding:'1.1rem 2rem', background: added ? '#2E7D52' : (!taille || dispo === 0) ? '#C4B090' : 'linear-gradient(135deg,#C4960A,#A07808)', color:'white', border:'none', cursor: (!taille || dispo === 0) ? 'not-allowed' : 'pointer', minWidth:'200px' }}>
                {added ? '✓ Ajouté au panier' : dispo === 0 ? 'Rupture de stock' : `Ajouter au panier — ${(prixFinal * qte).toFixed(0)} DT`}
              </button>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP || '21612345678'}?text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par ${produit.nom} (${taille}) — ${prixFinal} DT`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ padding:'1.1rem 1.5rem', background:'none', color:'#25D366', border:'1px solid #25D366', textDecoration:'none', display:'flex', alignItems:'center', gap:'0.4rem' }}
              >
                💬 WhatsApp
              </a>
            </div>
            {produit.description && <p style={{ fontSize:'0.88rem', lineHeight:1.85, color:'#8A7B68' }}>{produit.description}</p>}
          </div>
        </div>
      </main>
    </>
  )
}
