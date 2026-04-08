"use client"

import { useEffect, useState } from 'react'
import { ErpPage, ErpPagination, ErpTable } from '@/components/erp/ErpPage'

type Tab = 'parfums' | 'matieres' | 'flacons' | 'echantillons'

interface MatierePremiere {
  id: string
  nom: string
  description?: string
  stockMl: number
  unite: string       // "ml" | "unité"
  isDefault: boolean
  seuilAlerte: number
  updatedAt: string
}

interface StockKilo {
  id: string
  produitId: string
  stockMlTotal: number
  stockKgTotal: number
  updatedAt: string
  produit: { id: string; nom: string; slug: string }
}

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
  const [stocksKilo, setStocksKilo] = useState<StockKilo[]>([])
  const [kiloModal, setKiloModal] = useState<{ open: boolean; stockKilo: StockKilo; type: 'ENTREE' | 'SORTIE' | 'AJUSTEMENT' } | null>(null)
  const [mvtKiloQte, setMvtKiloQte] = useState(100)
  const [mvtKiloRaison, setMvtKiloRaison] = useState('')
  const [matieres, setMatieres] = useState<MatierePremiere[]>([])
  const [flaconsQte, setFlaconsQte] = useState<Record<string, number>>({})
  const [editingFlacon, setEditingFlacon] = useState<string | null>(null)
  const [modal, setModal] = useState<{
    open: boolean
    produitId: string
    taille: string
    type: 'ENTREE' | 'SORTIE' | 'AJUSTEMENT'
  } | null>(null)
  const [matiereModal, setMatiereModal] = useState<{
    open: boolean
    matiere: MatierePremiere
    type: 'ENTREE' | 'SORTIE' | 'AJUSTEMENT'
  } | null>(null)
  const [nouvelleMatiereForm, setNouvelleMatiereForm] = useState<{ open: boolean; nom: string; description: string; stockMl: string; seuilAlerte: string; unite: string }>({ open: false, nom: '', description: '', stockMl: '', seuilAlerte: '500', unite: 'ml' })
  const [mvtQte, setMvtQte] = useState(1)
  const [mvtRaison, setMvtRaison] = useState('')
  const [mvtMatiereQte, setMvtMatiereQte] = useState(100)
  const [mvtMatiereRaison, setMvtMatiereRaison] = useState('')

  const fetchMatieres = () =>
    fetch('/api/matieres').then(r => r.json()).then(d => setMatieres(Array.isArray(d) ? d : [])).catch(() => {})

  const fetchStocksKilo = () =>
    fetch('/api/stock/kilo').then(r => r.json()).then(d => setStocksKilo(Array.isArray(d) ? d : [])).catch(() => {})

  useEffect(() => {
    // Seed les 4 articles par défaut (idempotent)
    fetch('/api/stock/defaults', { method: 'POST' })
      .then(() => fetchMatieres())
      .catch(() => fetchMatieres())

    fetch('/api/stock')
      .then(r => r.json())
      .then(d => setStocks(Array.isArray(d) ? d : []))
      .catch(() => setStocks([]))
    fetchStocksKilo()
    const saved = typeof window !== 'undefined' ? localStorage.getItem('nuances_flacons') : null
    if (saved) try { setFlaconsQte(JSON.parse(saved)) } catch { /* ignore */ }
  }, [])

  const saveFlacon = (ref: string, qte: number) => {
    const updated = { ...flaconsQte, [ref]: qte }
    setFlaconsQte(updated)
    if (typeof window !== 'undefined') localStorage.setItem('nuances_flacons', JSON.stringify(updated))
    setEditingFlacon(null)
  }

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PER = 20

  const parfums = stocks
  const alertes = parfums.filter(s => s.quantite <= (s.seuilAlerte || 5))

  const filteredKilo = stocksKilo.filter(s =>
    s.produit.nom.toLowerCase().includes(search.toLowerCase())
  )
  const filteredMatieres = matieres.filter(m =>
    m.nom.toLowerCase().includes(search.toLowerCase())
  )
  const paginatedKilo = filteredKilo.slice((page - 1) * PER, page * PER)
  const paginatedMatieres = filteredMatieres.slice((page - 1) * PER, page * PER)

  const enregistrerMouvementKilo = async () => {
    if (!kiloModal) return
    await fetch('/api/stock/kilo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        produitId: kiloModal.stockKilo.produitId,
        stockMl: mvtKiloQte,
        type: kiloModal.type,
      }),
    })
    fetchStocksKilo()
    setKiloModal(null)
    setMvtKiloQte(100)
    setMvtKiloRaison('')
  }

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

  const enregistrerMouvementMatiere = async () => {
    if (!matiereModal) return
    await fetch(`/api/matieres/${matiereModal.matiere.id}/mouvement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: matiereModal.type, quantiteMl: mvtMatiereQte, raison: mvtMatiereRaison }),
    })
    fetchMatieres()
    setMatiereModal(null)
    setMvtMatiereQte(100)
    setMvtMatiereRaison('')
  }

  const creerMatiere = async () => {
    const { nom, description, stockMl, seuilAlerte, unite } = nouvelleMatiereForm
    if (!nom.trim()) return
    await fetch('/api/matieres', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom: nom.trim(), description, stockMl: Number(stockMl) || 0, seuilAlerte: Number(seuilAlerte) || 500, unite }),
    })
    fetchMatieres()
    setNouvelleMatiereForm({ open: false, nom: '', description: '', stockMl: '', seuilAlerte: '500', unite: 'ml' })
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
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            placeholder="Rechercher…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{
              padding: '0.38rem 0.9rem', fontSize: '0.78rem',
              border: '1px solid #EDE5D4', background: '#FDFAF5',
              color: '#1A1208', outline: 'none', width: '200px',
              fontFamily: 'Jost,sans-serif', borderRadius: '3px',
            }}
          />
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
        </div>
      }
    >
      <div style={{ display: 'flex', gap: 0, marginBottom: '1.5rem', borderBottom: '1px solid #EDE5D4' }}>
        {[
          { key: 'parfums' as Tab, label: '💧 Parfums' },
          { key: 'matieres' as Tab, label: '🧪 Matières premières' },
          { key: 'flacons' as Tab, label: '🧴 Flacons & Emballages' },
          { key: 'echantillons' as Tab, label: '📦 Échantillons' },
        ].map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => { setTab(t.key); setPage(1); }}
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
        <ErpTable
          headers={['Produit', 'Stock essence (ml)', 'Stock (kg)', 'État', 'Mise à jour', 'Mouvement']}
          footer={<ErpPagination page={page} total={filteredKilo.length} perPage={PER} onPage={setPage} />}
        >
          {filteredKilo.length === 0 && (
            <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#C4B090', fontSize: '0.82rem' }}>
              {search ? 'Aucun résultat' : 'Aucun stock d\'essence enregistré — créez un produit avec un stock initial.'}
            </td></tr>
          )}
          {paginatedKilo.map((s) => {
            const seuil = 100 // seuil par défaut: 100ml
            const color = s.stockMlTotal <= seuil ? '#8B3A3A' : s.stockMlTotal <= seuil * 3 ? '#B8860B' : '#2E7D52'
            const bg = s.stockMlTotal <= seuil ? '#FAEAEA' : s.stockMlTotal <= seuil * 3 ? '#FFF8E6' : '#E4F2EB'
            const pct = Math.min(100, (s.stockMlTotal / Math.max(seuil * 10, 100)) * 100)
            return (
              <tr
                key={s.id}
                style={{ borderBottom: '1px solid #F0EBE0', transition: 'background 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAF7F2' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#1A1208', fontWeight: 500 }}>{s.produit.nom}</div>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ width: '80px', height: '5px', background: '#EDE5D4', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg,${color},${color}99)`, borderRadius: '3px', transition: 'width 0.6s ease' }} />
                    </div>
                    <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#1A1208' }}>
                      {s.stockMlTotal.toLocaleString('fr-FR')} ml
                    </span>
                  </div>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span style={{ fontSize: '0.82rem', color: '#8A7B68' }}>{s.stockKgTotal.toFixed(3)} kg</span>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span style={{ background: bg, color, padding: '0.18rem 0.55rem', fontSize: '0.62rem', borderRadius: '3px', fontWeight: 500 }}>
                    {s.stockMlTotal <= seuil ? '⚠ Bas' : s.stockMlTotal <= seuil * 3 ? '~ Moyen' : '✓ OK'}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span style={{ fontSize: '0.72rem', color: '#C4B090' }}>
                    {s.updatedAt ? new Date(s.updatedAt).toLocaleDateString('fr-FR') : '—'}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ display:'flex', gap:'0.3rem' }}>
                    <button onClick={() => { setKiloModal({ open:true, stockKilo:s, type:'ENTREE' }); setMvtKiloQte(100) }} style={{ fontSize:'0.62rem', background:'#E4F2EB', color:'#2E7D52', border:'1px solid #B8DFC8', padding:'0.18rem 0.45rem', cursor:'pointer', borderRadius:'3px' }}>+ Entrée</button>
                    <button onClick={() => { setKiloModal({ open:true, stockKilo:s, type:'SORTIE' }); setMvtKiloQte(100) }} style={{ fontSize:'0.62rem', background:'#FAEAEA', color:'#8B3A3A', border:'1px solid #DFB8B8', padding:'0.18rem 0.45rem', cursor:'pointer', borderRadius:'3px' }}>− Sortie</button>
                    <button onClick={() => { setKiloModal({ open:true, stockKilo:s, type:'AJUSTEMENT' }); setMvtKiloQte(Math.round(s.stockMlTotal)) }} style={{ fontSize:'0.62rem', background:'#F4EFF9', color:'#7A5C9B', border:'1px solid #C8B4E0', padding:'0.18rem 0.45rem', cursor:'pointer', borderRadius:'3px' }}>≡ Ajust.</button>
                  </div>
                </td>
              </tr>
            )
          })}
        </ErpTable>
      )}

      {tab === 'matieres' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.78rem', color: '#8A7B68', margin: 0 }}>
              Alcool et autres matières consommées automatiquement lors des ventes.<br/>
              <span style={{ color: '#C4B090', fontSize: '0.72rem' }}>30ml → 11ml parfum + 19ml alcool · 50ml → 18ml + 32ml · 100ml → 33ml + 67ml</span>
            </p>
            <button
              type="button"
              onClick={() => setNouvelleMatiereForm(f => ({ ...f, open: !f.open }))}
              style={{ padding: '0.45rem 1rem', background: '#1A1208', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontFamily: 'Jost,sans-serif', letterSpacing: '0.08em', borderRadius: '3px' }}
            >+ Nouvelle matière</button>
          </div>

          {nouvelleMatiereForm.open && (
            <div style={{ background: '#FDFAF5', border: '1px solid #EDE5D4', borderRadius: '6px', padding: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 120px 120px', gap: '0.8rem', marginBottom: '1rem' }}>
                {[
                  { label: 'Nom *', key: 'nom', placeholder: 'ex: Bouchons' },
                  { label: 'Description', key: 'description', placeholder: 'optionnel' },
                ].map(f => (
                  <div key={f.key}>
                    <div style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C4B090', marginBottom: '0.4rem' }}>{f.label}</div>
                    <input
                      type="text"
                      value={(nouvelleMatiereForm as unknown as Record<string, string>)[f.key]}
                      onChange={e => setNouvelleMatiereForm(fm => ({ ...fm, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      style={{ width: '100%', padding: '0.6rem', border: '1px solid #EDE5D4', borderRadius: '3px', fontFamily: 'Jost,sans-serif', fontSize: '0.83rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
                <div>
                  <div style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C4B090', marginBottom: '0.4rem' }}>Unité</div>
                  <select
                    value={nouvelleMatiereForm.unite}
                    onChange={e => setNouvelleMatiereForm(fm => ({ ...fm, unite: e.target.value }))}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #EDE5D4', borderRadius: '3px', fontFamily: 'Jost,sans-serif', fontSize: '0.83rem', outline: 'none', background: 'white' }}
                  >
                    <option value="ml">ml</option>
                    <option value="unité">unité</option>
                  </select>
                </div>
                {[
                  { label: `Stock initial (${nouvelleMatiereForm.unite})`, key: 'stockMl', placeholder: '0' },
                  { label: `Seuil alerte (${nouvelleMatiereForm.unite})`, key: 'seuilAlerte', placeholder: nouvelleMatiereForm.unite === 'unité' ? '10' : '500' },
                ].map(f => (
                  <div key={f.key}>
                    <div style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C4B090', marginBottom: '0.4rem' }}>{f.label}</div>
                    <input
                      type="number"
                      min="0"
                      value={(nouvelleMatiereForm as unknown as Record<string, string>)[f.key]}
                      onChange={e => setNouvelleMatiereForm(fm => ({ ...fm, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      style={{ width: '100%', padding: '0.6rem', border: '1px solid #EDE5D4', borderRadius: '3px', fontFamily: 'Jost,sans-serif', fontSize: '0.83rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button type="button" onClick={creerMatiere} style={{ padding: '0.6rem 1.2rem', background: 'linear-gradient(135deg,#C4960A,#A07808)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontFamily: 'Jost,sans-serif', letterSpacing: '0.1em', borderRadius: '3px' }}>Créer</button>
                <button type="button" onClick={() => setNouvelleMatiereForm(f => ({ ...f, open: false }))} style={{ padding: '0.6rem 1rem', background: 'none', border: '1px solid #EDE5D4', cursor: 'pointer', fontSize: '0.72rem', color: '#8A7B68', borderRadius: '3px' }}>Annuler</button>
              </div>
            </div>
          )}

          <ErpTable
            headers={['Article', 'Stock', 'Seuil alerte', 'État', 'Mise à jour', 'Mouvement']}
            footer={<ErpPagination page={page} total={filteredMatieres.length} perPage={PER} onPage={setPage} />}
          >
            {filteredMatieres.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#C4B090', fontSize: '0.82rem' }}>
                {search ? 'Aucun résultat' : 'Aucune matière première enregistrée.'}
              </td></tr>
            )}
            {paginatedMatieres.map(m => {
              const unite = m.unite || 'ml'
              const pct = Math.min(100, (m.stockMl / Math.max(m.seuilAlerte * 3, 1)) * 100)
              const enAlerte = m.stockMl <= m.seuilAlerte
              const color = enAlerte ? '#8B3A3A' : m.stockMl <= m.seuilAlerte * 2 ? '#B8860B' : '#2E7D52'
              const bg = enAlerte ? '#FAEAEA' : m.stockMl <= m.seuilAlerte * 2 ? '#FFF8E6' : '#E4F2EB'
              const icon = m.nom.toLowerCase().includes('alcool') ? '🧪'
                : m.nom.toLowerCase().includes('flacon') ? '🧴' : '📦'
              return (
                <tr key={m.id} style={{ borderBottom: '1px solid #F0EBE0' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAF7F2' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1rem' }}>{icon}</span>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#1A1208', fontWeight: 500 }}>
                          {m.nom}
                          {m.isDefault && <span style={{ marginLeft: '0.4rem', fontSize: '0.58rem', background: 'rgba(196,150,10,0.12)', color: '#C4960A', padding: '0.1rem 0.4rem', borderRadius: '3px', fontWeight: 500 }}>DÉFAUT</span>}
                        </div>
                        {m.description && <div style={{ fontSize: '0.7rem', color: '#C4B090' }}>{m.description}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <div style={{ width: '80px', height: '5px', background: '#EDE5D4', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg,${color},${color}99)`, borderRadius: '3px' }} />
                      </div>
                      <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#1A1208' }}>
                        {m.stockMl.toLocaleString('fr-FR')} {unite}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ fontSize: '0.78rem', color: '#8A7B68' }}>{m.seuilAlerte.toLocaleString('fr-FR')} {unite}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ background: bg, color, padding: '0.18rem 0.55rem', fontSize: '0.62rem', borderRadius: '3px', fontWeight: 500 }}>
                      {enAlerte ? '⚠ Bas' : m.stockMl <= m.seuilAlerte * 2 ? '~ Moyen' : '✓ OK'}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ fontSize: '0.72rem', color: '#C4B090' }}>{new Date(m.updatedAt).toLocaleDateString('fr-FR')}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button onClick={() => { setMatiereModal({ open: true, matiere: m, type: 'ENTREE' }); setMvtMatiereQte(unite === 'unité' ? 10 : 100) }} style={{ fontSize: '0.62rem', background: '#E4F2EB', color: '#2E7D52', border: '1px solid #B8DFC8', padding: '0.18rem 0.45rem', cursor: 'pointer', borderRadius: '3px' }}>+ Entrée</button>
                      <button onClick={() => { setMatiereModal({ open: true, matiere: m, type: 'SORTIE' }); setMvtMatiereQte(unite === 'unité' ? 1 : 100) }} style={{ fontSize: '0.62rem', background: '#FAEAEA', color: '#8B3A3A', border: '1px solid #DFB8B8', padding: '0.18rem 0.45rem', cursor: 'pointer', borderRadius: '3px' }}>− Sortie</button>
                      <button onClick={() => { setMatiereModal({ open: true, matiere: m, type: 'AJUSTEMENT' }); setMvtMatiereQte(m.stockMl) }} style={{ fontSize: '0.62rem', background: '#F4EFF9', color: '#7A5C9B', border: '1px solid #C8B4E0', padding: '0.18rem 0.45rem', cursor: 'pointer', borderRadius: '3px' }}>≡ Ajust.</button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {matieres.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#C4B090', fontSize: '0.82rem' }}>
                  Aucune matière première — cliquez sur «+ Nouvelle matière» pour en ajouter.
                </td>
              </tr>
            )}
          </ErpTable>
        </div>
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
      {kiloModal?.open && (
        <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(26,18,8,0.5)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#FDFAF5', border:'1px solid #EDE5D4', borderRadius:'8px', padding:'2rem', width:'420px', boxShadow:'0 20px 60px rgba(26,18,8,0.2)' }}>
            <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.3rem', color:'#1A1208', marginBottom:'0.4rem' }}>{kiloModal.stockKilo.produit.nom}</h3>
            <p style={{ fontSize:'0.72rem', color:'#C4B090', marginBottom:'1.5rem' }}>Stock actuel : {kiloModal.stockKilo.stockMlTotal.toLocaleString('fr-FR')} ml</p>
            <div style={{ marginBottom:'1rem' }}>
              <div style={{ fontSize:'0.62rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'#C4B090', marginBottom:'0.5rem' }}>Type</div>
              <div style={{ display:'flex', gap:'0.4rem' }}>
                {(['ENTREE','SORTIE','AJUSTEMENT'] as const).map(t => (
                  <button key={t} onClick={() => setKiloModal({...kiloModal, type:t})} style={{ flex:1, padding:'0.5rem', background: kiloModal.type === t ? '#1A1208' : '#F0EBE0', color: kiloModal.type === t ? 'white' : '#8A7B68', border:`1px solid ${kiloModal.type === t ? '#1A1208' : '#EDE5D4'}`, cursor:'pointer', fontSize:'0.68rem', fontFamily:'Jost,sans-serif', borderRadius:'3px' }}>{t}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:'1rem' }}>
              <div style={{ fontSize:'0.62rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'#C4B090', marginBottom:'0.5rem' }}>
                {kiloModal.type === 'AJUSTEMENT' ? 'Nouveau stock (ml)' : 'Quantité (ml)'}
              </div>
              <input type="number" min="0" value={mvtKiloQte} onChange={e => setMvtKiloQte(parseFloat(e.target.value)||0)} style={{ width:'100%', padding:'0.7rem', border:'1px solid #EDE5D4', fontFamily:'Jost,sans-serif', fontSize:'0.88rem', outline:'none', borderRadius:'3px' }} />
            </div>
            <div style={{ marginBottom:'1.5rem' }}>
              <div style={{ fontSize:'0.62rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'#C4B090', marginBottom:'0.5rem' }}>Raison (optionnel)</div>
              <input type="text" placeholder="Ex: Réception fournisseur..." value={mvtKiloRaison} onChange={e => setMvtKiloRaison(e.target.value)} style={{ width:'100%', padding:'0.7rem', border:'1px solid #EDE5D4', fontFamily:'Jost,sans-serif', fontSize:'0.88rem', outline:'none', borderRadius:'3px' }} />
            </div>
            <div style={{ display:'flex', gap:'0.8rem' }}>
              <button onClick={() => setKiloModal(null)} style={{ flex:1, padding:'0.75rem', background:'none', border:'1px solid #EDE5D4', cursor:'pointer', fontFamily:'Jost,sans-serif', fontSize:'0.72rem', color:'#8A7B68', borderRadius:'3px' }}>Annuler</button>
              <button onClick={enregistrerMouvementKilo} style={{ flex:2, padding:'0.75rem', background:'#1A1208', color:'white', border:'none', cursor:'pointer', fontFamily:'Jost,sans-serif', fontSize:'0.72rem', letterSpacing:'0.1em', textTransform:'uppercase', borderRadius:'3px' }}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
      {matiereModal?.open && (
        <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(26,18,8,0.5)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#FDFAF5', border:'1px solid #EDE5D4', borderRadius:'8px', padding:'2rem', width:'420px', boxShadow:'0 20px 60px rgba(26,18,8,0.2)' }}>
            <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.3rem', color:'#1A1208', marginBottom:'0.4rem' }}>{matiereModal.matiere.nom}</h3>
            <p style={{ fontSize:'0.72rem', color:'#C4B090', marginBottom:'1.5rem' }}>
              Stock actuel : {matiereModal.matiere.stockMl.toLocaleString('fr-FR')} {matiereModal.matiere.unite || 'ml'}
            </p>
            <div style={{ marginBottom:'1rem' }}>
              <div style={{ fontSize:'0.62rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'#C4B090', marginBottom:'0.5rem' }}>Type</div>
              <div style={{ display:'flex', gap:'0.4rem' }}>
                {(['ENTREE','SORTIE','AJUSTEMENT'] as const).map(t => (
                  <button key={t} onClick={() => setMatiereModal({...matiereModal, type:t})} style={{ flex:1, padding:'0.5rem', background: matiereModal.type === t ? '#1A1208' : '#F0EBE0', color: matiereModal.type === t ? 'white' : '#8A7B68', border:`1px solid ${matiereModal.type === t ? '#1A1208' : '#EDE5D4'}`, cursor:'pointer', fontSize:'0.68rem', fontFamily:'Jost,sans-serif', borderRadius:'3px' }}>{t}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:'1rem' }}>
              <div style={{ fontSize:'0.62rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'#C4B090', marginBottom:'0.5rem' }}>
                {matiereModal.type === 'AJUSTEMENT' ? 'Nouveau stock' : 'Quantité'} ({matiereModal.matiere.unite || 'ml'})
              </div>
              <input
                type="number"
                min="0"
                step={matiereModal.matiere.unite === 'unité' ? '1' : '10'}
                value={mvtMatiereQte}
                onChange={e => setMvtMatiereQte(parseFloat(e.target.value) || 0)}
                style={{ width:'100%', padding:'0.7rem', border:'1px solid #EDE5D4', fontFamily:'Jost,sans-serif', fontSize:'0.88rem', outline:'none', borderRadius:'3px' }}
              />
            </div>
            <div style={{ marginBottom:'1.5rem' }}>
              <div style={{ fontSize:'0.62rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'#C4B090', marginBottom:'0.5rem' }}>Raison (optionnel)</div>
              <input type="text" placeholder="Ex: Réception fournisseur..." value={mvtMatiereRaison} onChange={e => setMvtMatiereRaison(e.target.value)} style={{ width:'100%', padding:'0.7rem', border:'1px solid #EDE5D4', fontFamily:'Jost,sans-serif', fontSize:'0.88rem', outline:'none', borderRadius:'3px' }} />
            </div>
            <div style={{ display:'flex', gap:'0.8rem' }}>
              <button onClick={() => setMatiereModal(null)} style={{ flex:1, padding:'0.75rem', background:'none', border:'1px solid #EDE5D4', cursor:'pointer', fontFamily:'Jost,sans-serif', fontSize:'0.72rem', color:'#8A7B68', borderRadius:'3px' }}>Annuler</button>
              <button onClick={enregistrerMouvementMatiere} style={{ flex:2, padding:'0.75rem', background:'#1A1208', color:'white', border:'none', cursor:'pointer', fontFamily:'Jost,sans-serif', fontSize:'0.72rem', letterSpacing:'0.1em', textTransform:'uppercase', borderRadius:'3px' }}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </ErpPage>
  )
}
