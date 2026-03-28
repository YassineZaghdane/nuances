"use client"

import { useEffect, useState } from 'react'
import { ErpPage, ErpTable } from '@/components/erp/ErpPage'

type Tab = 'parfums' | 'flacons' | 'echantillons'

const FLACONS_VIDES = [
  { ref: 'FL-30', label: 'Flacon verre 30ml', type: 'flacon', ml: 30 },
  { ref: 'FL-50', label: 'Flacon verre 50ml', type: 'flacon', ml: 50 },
  { ref: 'FL-100', label: 'Flacon verre 100ml', type: 'flacon', ml: 100 },
  { ref: 'AT-5', label: 'Atomiseur 5ml', type: 'atomiseur', ml: 5 },
  { ref: 'AT-10', label: 'Atomiseur 10ml', type: 'atomiseur', ml: 10 },
  { ref: 'EC-1', label: 'Échantillon 1ml', type: 'echantillon', ml: 1 },
  { ref: 'EC-2', label: 'Échantillon 2ml', type: 'echantillon', ml: 2 },
  { ref: 'JU-PACK', label: 'Emballage jute', type: 'emballage', ml: 0 },
  { ref: 'BOX-GIFT', label: 'Boîte cadeau', type: 'emballage', ml: 0 },
]

export default function StockPage() {
  const [tab, setTab] = useState<Tab>('parfums')
  const [stocks, setStocks] = useState<{ id: string; taille: string; quantite: number; seuilAlerte: number; updatedAt?: string; produit?: { id: string; nom: string } }[]>([])
  const [flaconsQte, setFlaconsQte] = useState<Record<string, number>>({})
  const [editingFlacon, setEditingFlacon] = useState<string | null>(null)
  const [modal, setModal] = useState<{
    open: boolean
    produitId: string
    taille: string
    type: 'ENTREE' | 'SORTIE' | 'AJUSTEMENT'
  } | null>(null)
  const [mvtQte, setMvtQte] = useState(1)
  const [mvtRaison, setMvtRaison] = useState('')

  useEffect(() => {
    fetch('/api/stock')
      .then(r => r.json())
      .then(d => setStocks(Array.isArray(d) ? d : []))
      .catch(() => setStocks([]))
    const saved = typeof window !== 'undefined' ? localStorage.getItem('nuances_flacons') : null
    if (saved) try { setFlaconsQte(JSON.parse(saved)) } catch { /* ignore */ }
  }, [])

  const saveFlacon = (ref: string, qte: number) => {
    const updated = { ...flaconsQte, [ref]: qte }
    setFlaconsQte(updated)
    if (typeof window !== 'undefined') localStorage.setItem('nuances_flacons', JSON.stringify(updated))
    setEditingFlacon(null)
  }

  const parfums = stocks
  const alertes = parfums.filter(s => s.quantite <= (s.seuilAlerte || 5))

  const enregistrerMouvement = async () => {
    if (!modal) return
    await fetch('/api/stock/mouvement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        produitId: modal.produitId,
        taille: modal.taille,
        type: modal.type,
        quantite: mvtQte,
        raison: mvtRaison,
      })
    })
    fetch('/api/stock?include=produit').then(r => r.json()).then(d => setStocks(Array.isArray(d) ? d : []))
    setModal(null)
    setMvtQte(1)
    setMvtRaison('')
  }

  const verifierAlertesEmail = async () => {
    const res = await fetch("/api/stock/alertes");
    const data = await res.json().catch(() => ({}));
    alert(
      `${data.message ?? "Erreur"}\nEmail envoyé: ${data.emailEnvoye ? "Oui" : "Non"}`
    );
  };

  return (
    <ErpPage
      title="Stock"
      subtitle={alertes.length > 0 ? `⚠ ${alertes.length} alerte${alertes.length > 1 ? 's' : ''}` : 'Tout est OK'}
      actions={
        <button
          type="button"
          onClick={verifierAlertesEmail}
          style={{
            padding: "0.38rem 0.9rem",
            background: "#FAEAEA",
            color: "#8B3A3A",
            border: "1px solid #DFB8B8",
            fontSize: "0.7rem",
            fontFamily: "Jost,sans-serif",
            letterSpacing: "0.08em",
            cursor: "pointer",
            borderRadius: "3px",
          }}
        >
          ⚠ Vérifier alertes
        </button>
      }
    >
      <div style={{ display: 'flex', gap: 0, marginBottom: '1.5rem', borderBottom: '1px solid #EDE5D4' }}>
        {[
          { key: 'parfums' as Tab, label: '💧 Parfums' },
          { key: 'flacons' as Tab, label: '🧴 Flacons & Emballages' },
          { key: 'echantillons' as Tab, label: '🧪 Échantillons' },
        ].map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            style={{
              padding: '0.7rem 1.4rem', fontSize: '0.72rem',
              letterSpacing: '0.06em', background: 'none', border: 'none',
              borderBottom: tab === t.key ? '2px solid #C4960A' : '2px solid transparent',
              color: tab === t.key ? '#C4960A' : '#8A7B68',
              cursor: 'pointer', fontFamily: 'Jost,sans-serif',
              transition: 'all 0.18s', marginBottom: '-1px',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'parfums' && (
        <ErpTable headers={['Produit', 'Format', 'Stock', 'Seuil alerte', 'État', 'Mise à jour', 'Mouvement']}>
          {parfums.map((s, i) => {
            const pct = Math.min(100, (s.quantite / Math.max((s.seuilAlerte || 5) * 3, 10)) * 100)
            const color = s.quantite <= (s.seuilAlerte || 5) ? '#8B3A3A' : s.quantite <= (s.seuilAlerte || 5) * 2 ? '#B8860B' : '#2E7D52'
            const bg = s.quantite <= (s.seuilAlerte || 5) ? '#FAEAEA' : s.quantite <= (s.seuilAlerte || 5) * 2 ? '#FFF8E6' : '#E4F2EB'
            return (
              <tr
                key={s.id}
                style={{ borderBottom: '1px solid #F0EBE0', transition: 'background 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAF7F2' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#1A1208', fontWeight: 500 }}>{s.produit?.nom ?? '—'}</div>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span style={{ background: 'rgba(196,150,10,0.1)', color: '#C4960A', padding: '0.15rem 0.5rem', fontSize: '0.68rem', fontWeight: 500, borderRadius: '3px' }}>{s.taille}</span>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ width: '80px', height: '5px', background: '#EDE5D4', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg,${color},${color}99)`, borderRadius: '3px', transition: 'width 0.6s ease' }} />
                    </div>
                    <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#1A1208' }}>{s.quantite}</span>
                  </div>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span style={{ fontSize: '0.78rem', color: '#8A7B68' }}>{s.seuilAlerte ?? 5}</span>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span style={{ background: bg, color, padding: '0.18rem 0.55rem', fontSize: '0.62rem', borderRadius: '3px', fontWeight: 500 }}>
                    {s.quantite <= (s.seuilAlerte || 5) ? '⚠ Bas' : s.quantite <= (s.seuilAlerte || 5) * 2 ? '~ Moyen' : '✓ OK'}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span style={{ fontSize: '0.72rem', color: '#C4B090' }}>
                    {s.updatedAt ? new Date(s.updatedAt).toLocaleDateString('fr-FR') : '—'}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ display:'flex', gap:'0.3rem' }}>
                    <button onClick={() => { if (s.produit?.id) { setModal({ open:true, produitId:s.produit.id, taille:s.taille, type:'ENTREE' }); setMvtQte(1) } }} style={{ fontSize:'0.62rem', background:'#E4F2EB', color:'#2E7D52', border:'1px solid #B8DFC8', padding:'0.18rem 0.45rem', cursor:'pointer', borderRadius:'3px' }}>+ Entrée</button>
                    <button onClick={() => { if (s.produit?.id) { setModal({ open:true, produitId:s.produit.id, taille:s.taille, type:'SORTIE' }); setMvtQte(1) } }} style={{ fontSize:'0.62rem', background:'#FAEAEA', color:'#8B3A3A', border:'1px solid #DFB8B8', padding:'0.18rem 0.45rem', cursor:'pointer', borderRadius:'3px' }}>− Sortie</button>
                    <button onClick={() => { if (s.produit?.id) { setModal({ open:true, produitId:s.produit.id, taille:s.taille, type:'AJUSTEMENT' }); setMvtQte(s.quantite) } }} style={{ fontSize:'0.62rem', background:'#F4EFF9', color:'#7A5C9B', border:'1px solid #C8B4E0', padding:'0.18rem 0.45rem', cursor:'pointer', borderRadius:'3px' }}>≡ Ajust.</button>
                  </div>
                </td>
              </tr>
            )
          })}
        </ErpTable>
      )}

      {tab === 'flacons' && (
        <div>
          <div style={{ background: '#FFF8E6', border: '1px solid #E8C96A', borderRadius: '6px', padding: '0.8rem 1.2rem', marginBottom: '1rem', fontSize: '0.78rem', color: '#B8860B' }}>
            ℹ️ Les quantités de flacons sont saisies manuellement. Mettez à jour après chaque réception de stock.
          </div>
          <ErpTable headers={['Référence', 'Description', 'Type', 'Contenance', 'Quantité', 'Action']}>
            {FLACONS_VIDES.map(f => {
              const qte = flaconsQte[f.ref] ?? 0
              const enAlerte = qte < 10
              return (
                <tr
                  key={f.ref}
                  style={{ borderBottom: '1px solid #F0EBE0', transition: 'background 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAF7F2' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#C4960A', fontWeight: 600, letterSpacing: '0.05em', fontFamily: 'monospace' }}>{f.ref}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#1A1208' }}>{f.label}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ fontSize: '0.68rem', color: '#8A7B68', background: '#F0EBE0', padding: '0.15rem 0.5rem', borderRadius: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.type}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ fontSize: '0.78rem', color: '#8A7B68' }}>{f.ml > 0 ? `${f.ml} ml` : '—'}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    {editingFlacon === f.ref ? (
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <input
                          type="number"
                          defaultValue={qte}
                          id={`input-${f.ref}`}
                          style={{ width: '70px', padding: '0.3rem 0.5rem', border: '1px solid #C4960A', borderRadius: '3px', fontFamily: 'Jost,sans-serif', fontSize: '0.85rem', outline: 'none' }}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const el = document.getElementById(`input-${f.ref}`) as HTMLInputElement | null
                            const val = parseInt(el?.value ?? '0', 10)
                            saveFlacon(f.ref, val)
                          }}
                          style={{ padding: '0.3rem 0.6rem', background: '#1A1208', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.68rem', borderRadius: '3px', fontFamily: 'Jost,sans-serif' }}
                        >✓</button>
                        <button type="button" onClick={() => setEditingFlacon(null)} style={{ padding: '0.3rem 0.5rem', background: 'none', border: '1px solid #EDE5D4', cursor: 'pointer', fontSize: '0.7rem', borderRadius: '3px', color: '#8A7B68' }}>×</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#1A1208' }}>{qte}</span>
                        {enAlerte && <span style={{ fontSize: '0.6rem', color: '#8B3A3A', background: '#FAEAEA', padding: '0.12rem 0.4rem', borderRadius: '3px' }}>⚠ Bas</span>}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <button
                      type="button"
                      onClick={() => setEditingFlacon(f.ref)}
                      style={{
                        fontSize: '0.68rem', color: '#8A7B68',
                        border: '1px solid #EDE5D4', padding: '0.2rem 0.55rem',
                        background: 'none', cursor: 'pointer', borderRadius: '3px',
                        fontFamily: 'Jost,sans-serif', transition: 'all 0.18s',
                      }}
                    >Modifier</button>
                  </td>
                </tr>
              )
            })}
          </ErpTable>
        </div>
      )}

      {tab === 'echantillons' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '1rem' }}>
          {[
            { label: 'Échantillons 1ml', ref: 'EC-1-QTE', icon: '🧪', color: '#4A7A9B' },
            { label: 'Échantillons 2ml', ref: 'EC-2-QTE', icon: '🧪', color: '#7A5C9B' },
            { label: 'Strips papier', ref: 'STRIP-QTE', icon: '📄', color: '#B8860B' },
            { label: 'Cartes de visite', ref: 'CARD-QTE', icon: '📇', color: '#2E7D52' },
          ].map(item => {
            const qte = flaconsQte[item.ref] ?? 0
            const editing = editingFlacon === item.ref
            return (
              <div key={item.ref} style={{ background: '#FDFAF5', border: '1px solid #EDE5D4', borderRadius: '6px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '1.4rem', marginBottom: '0.3rem' }}>{item.icon}</div>
                    <div style={{ fontSize: '0.85rem', color: '#1A1208', fontWeight: 500 }}>{item.label}</div>
                  </div>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', fontWeight: 300, color: item.color }}>{qte}</div>
                </div>
                {editing ? (
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <input id={`inp-${item.ref}`} type="number" defaultValue={qte} style={{ flex: 1, padding: '0.5rem', border: `1px solid ${item.color}`, borderRadius: '3px', fontFamily: 'Jost,sans-serif', outline: 'none' }} autoFocus />
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById(`inp-${item.ref}`) as HTMLInputElement | null
                        const val = parseInt(el?.value ?? '0', 10)
                        saveFlacon(item.ref, val)
                      }}
                      style={{ padding: '0.5rem 0.8rem', background: item.color, color: 'white', border: 'none', cursor: 'pointer', borderRadius: '3px' }}
                    >✓</button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingFlacon(item.ref)}
                    style={{
                      width: '100%', padding: '0.5rem',
                      background: '#F0EBE0', color: '#8A7B68',
                      border: '1px solid #EDE5D4', cursor: 'pointer',
                      fontFamily: 'Jost,sans-serif', fontSize: '0.72rem',
                      letterSpacing: '0.08em', borderRadius: '3px',
                      transition: 'all 0.18s',
                    }}
                  >Mettre à jour</button>
                )}
              </div>
            )
          })}
        </div>
      )}
      {modal?.open && (
        <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(26,18,8,0.5)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#FDFAF5', border:'1px solid #EDE5D4', borderRadius:'8px', padding:'2rem', width:'400px', boxShadow:'0 20px 60px rgba(26,18,8,0.2)' }}>
            <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.3rem', color:'#1A1208', marginBottom:'1.5rem' }}>Mouvement de stock</h3>
            <div style={{ marginBottom:'1rem' }}>
              <div style={{ fontSize:'0.62rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'#C4B090', marginBottom:'0.5rem' }}>Type</div>
              <div style={{ display:'flex', gap:'0.4rem' }}>
                {(['ENTREE','SORTIE','AJUSTEMENT'] as const).map(t => (
                  <button key={t} onClick={() => setModal({...modal, type:t})} style={{ flex:1, padding:'0.5rem', background: modal.type === t ? '#1A1208' : '#F0EBE0', color: modal.type === t ? 'white' : '#8A7B68', border:`1px solid ${modal.type === t ? '#1A1208' : '#EDE5D4'}`, cursor:'pointer', fontSize:'0.68rem', fontFamily:'Jost,sans-serif', borderRadius:'3px', letterSpacing:'0.06em' }}>{t}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:'1rem' }}>
              <div style={{ fontSize:'0.62rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'#C4B090', marginBottom:'0.5rem' }}>Quantité</div>
              <input type="number" min="1" value={mvtQte} onChange={e => setMvtQte(parseInt(e.target.value, 10) || 1)} style={{ width:'100%', padding:'0.7rem', border:'1px solid #EDE5D4', fontFamily:'Jost,sans-serif', fontSize:'0.88rem', outline:'none', borderRadius:'3px' }} />
            </div>
            <div style={{ marginBottom:'1.5rem' }}>
              <div style={{ fontSize:'0.62rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'#C4B090', marginBottom:'0.5rem' }}>Raison (optionnel)</div>
              <input type="text" placeholder="Ex: Réception fournisseur, Casse..." value={mvtRaison} onChange={e => setMvtRaison(e.target.value)} style={{ width:'100%', padding:'0.7rem', border:'1px solid #EDE5D4', fontFamily:'Jost,sans-serif', fontSize:'0.88rem', outline:'none', borderRadius:'3px' }} />
            </div>
            <div style={{ display:'flex', gap:'0.8rem' }}>
              <button onClick={() => setModal(null)} style={{ flex:1, padding:'0.75rem', background:'none', border:'1px solid #EDE5D4', cursor:'pointer', fontFamily:'Jost,sans-serif', fontSize:'0.72rem', color:'#8A7B68', borderRadius:'3px' }}>Annuler</button>
              <button onClick={enregistrerMouvement} style={{ flex:2, padding:'0.75rem', background:'#1A1208', color:'white', border:'none', cursor:'pointer', fontFamily:'Jost,sans-serif', fontSize:'0.72rem', letterSpacing:'0.1em', textTransform:'uppercase', borderRadius:'3px' }}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </ErpPage>
  )
}
