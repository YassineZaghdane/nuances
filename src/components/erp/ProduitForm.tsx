"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Categorie { id: string; nom: string }

interface Props {
  produit?: {
    id: string; nom: string; slug: string
    description?: string; notes?: string
    prix: number; prixAchat?: number
    prix30ml?: number | null; prix50ml?: number | null; prix100ml?: number | null
    images: string[]; actif: boolean; featured: boolean
    exclusif: boolean; nouveaute: boolean
    offre: boolean; offreLabel?: string
    categorieId?: string
    stockKilo?: { stockMlTotal: number }
  }
  mode: 'creation' | 'edition'
}

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  border: '1px solid #EDE5D4',
  background: 'white',
  fontFamily: 'Jost,sans-serif',
  fontSize: '0.85rem',
  color: '#1A1208',
  outline: 'none',
  borderRadius: '3px',
  transition: 'border-color 0.2s',
}

const labelStyle = {
  display: 'block' as const,
  fontSize: '0.62rem',
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  color: '#C4B090',
  marginBottom: '0.4rem',
  fontFamily: 'Jost,sans-serif',
}

export function ProduitForm({ produit, mode }: Props) {
  const router = useRouter()
  const [categories, setCategories] = useState<Categorie[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [newImageUrl, setNewImageUrl] = useState('')

  const [form, setForm] = useState({
    nom:         produit?.nom         || '',
    slug:        produit?.slug        || '',
    description: produit?.description || '',
    notes:       produit?.notes       || '',
    prix:        produit?.prix        || 0,
    prixAchat:   produit?.prixAchat   || 0,
    images:      produit?.images      || [] as string[],
    actif:       produit?.actif       ?? true,
    featured:    produit?.featured    ?? false,
    exclusif:    produit?.exclusif    ?? false,
    nouveaute:   produit?.nouveaute   ?? false,
    offre:       produit?.offre       ?? false,
    offreLabel:  produit?.offreLabel  || '',
    categorieId: produit?.categorieId || '',
    prix30ml:    produit?.prix30ml  ?? 0,
    prix50ml:    produit?.prix50ml  ?? 0,
    prix100ml:   produit?.prix100ml ?? 0,
    stockMlInitial: produit?.stockKilo?.stockMlTotal ?? 0,
  })

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => setCategories(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [])

  // Auto-slug depuis le nom en création
  useEffect(() => {
    if (mode === 'creation' && form.nom) {
      const slug = form.nom
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      setForm(f => ({ ...f, slug }))
    }
  }, [form.nom, mode])

  const set = (key: string, value: any) =>
    setForm(f => ({ ...f, [key]: value }))

  const addImage = () => {
    const url = newImageUrl.trim()
    if (!url || form.images.length >= 5) return
    set('images', [...form.images, url])
    setNewImageUrl('')
  }

  const removeImage = (i: number) =>
    set('images', form.images.filter((_: string, j: number) => j !== i))

  const handleSubmit = async () => {
    if (!form.nom || !form.prix || !form.categorieId) {
      setError('Nom, prix et catégorie sont obligatoires.')
      return
    }
    setSaving(true)
    setError('')

    try {
      const url = mode === 'edition' && produit?.id
        ? `/api/produits/${produit.id}`
        : '/api/produits'
      const method = mode === 'edition' ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          prix:      Number(form.prix),
          prixAchat: form.prixAchat ? Number(form.prixAchat) : undefined,
          prix30ml:  form.prix30ml  ? Number(form.prix30ml)  : null,
          prix50ml:  form.prix50ml  ? Number(form.prix50ml)  : null,
          prix100ml: form.prix100ml ? Number(form.prix100ml) : null,
          stockMlInitial: undefined,
        }),
      })

      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Erreur serveur')
      }

      const created = await res.json()
      const produitId = mode === 'creation' ? created.id : produit?.id

      // Créer/mettre à jour le stock d'essence (StockKilo)
      if (produitId && form.stockMlInitial > 0) {
        await fetch('/api/stock/kilo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            produitId,
            stockMl: form.stockMlInitial,
            type: mode === 'creation' ? 'ENTREE' : 'AJUSTEMENT',
          }),
        })
      }

      setSaved(true)
      setTimeout(() => {
        router.push('/erp/produits')
        router.refresh()
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.')
    } finally {
      setSaving(false)
    }
  }

  const sectionStyle = {
    background: '#FDFAF5',
    border: '1px solid #EDE5D4',
    borderRadius: '6px',
    overflow: 'hidden' as const,
    marginBottom: '1rem',
  }

  const sectionHeaderStyle = {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #EDE5D4',
    fontFamily: 'Cormorant Garamond,serif',
    fontSize: '1.05rem',
    color: '#1A1208',
    fontWeight: 400,
  }

  const sectionBodyStyle = {
    padding: '1.5rem',
  }

  return (
    <div style={{ fontFamily: 'Jost,sans-serif', maxWidth: '820px' }}>

      {/* Erreur */}
      {error && (
        <div style={{
          background: '#FAEAEA', border: '1px solid rgba(139,58,58,0.2)',
          color: '#8B3A3A', padding: '0.8rem 1.2rem',
          fontSize: '0.82rem', marginBottom: '1rem', borderRadius: '3px',
        }}>{error}</div>
      )}

      {/* Succès */}
      {saved && (
        <div style={{
          background: '#E4F2EB', border: '1px solid rgba(46,125,82,0.2)',
          color: '#2E7D52', padding: '0.8rem 1.2rem',
          fontSize: '0.82rem', marginBottom: '1rem', borderRadius: '3px',
        }}>✓ Produit enregistré — redirection en cours…</div>
      )}

      {/* ── INFOS GÉNÉRALES ── */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>Informations générales</div>
        <div style={sectionBodyStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Nom du produit *</label>
              <input
                style={inputStyle}
                value={form.nom}
                onChange={e => set('nom', e.target.value)}
                placeholder="ex: Rose de Damas"
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#C4960A'}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#EDE5D4'}
              />
            </div>
            <div>
              <label style={labelStyle}>Slug (URL)</label>
              <input
                style={{ ...inputStyle, color: '#8A7B68' }}
                value={form.slug}
                onChange={e => set('slug', e.target.value)}
                placeholder="rose-de-damas"
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#C4960A'}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#EDE5D4'}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Catégorie *</label>
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.categorieId}
              onChange={e => set('categorieId', e.target.value)}
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Prix de vente (DT) *</label>
              <input
                style={inputStyle}
                type="number"
                min="0"
                step="0.5"
                value={form.prix}
                onChange={e => set('prix', e.target.value)}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#C4960A'}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#EDE5D4'}
              />
            </div>
            <div>
              <label style={labelStyle}>Prix d'achat (DT)</label>
              <input
                style={inputStyle}
                type="number"
                min="0"
                step="0.5"
                value={form.prixAchat}
                onChange={e => set('prixAchat', e.target.value)}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#C4960A'}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#EDE5D4'}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Notes olfactives</label>
            <input
              style={inputStyle}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="ex: Boisé · Oriental · Ambré"
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#C4960A'}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#EDE5D4'}
            />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Description complète du parfum..."
              onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = '#C4960A'}
              onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = '#EDE5D4'}
            />
          </div>
        </div>
      </div>

      {/* ── IMAGES ── */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          Images ({form.images.length}/5)
        </div>
        <div style={sectionBodyStyle}>
          {/* Miniatures existantes */}
          {form.images.length > 0 && (
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {form.images.map((img: string, i: number) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img
                    src={img}
                    alt=""
                    style={{
                      width: '80px', height: '80px',
                      objectFit: 'cover',
                      border: '1px solid #EDE5D4',
                      borderRadius: '3px',
                    }}
                  />
                  <button
                    onClick={() => removeImage(i)}
                    style={{
                      position: 'absolute', top: '-6px', right: '-6px',
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: '#8B3A3A', color: 'white',
                      border: 'none', cursor: 'pointer',
                      fontSize: '0.65rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >×</button>
                </div>
              ))}
            </div>
          )}

          {/* Ajouter une image */}
          {form.images.length < 5 && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                type="text"
                placeholder="https://... URL de l'image"
                value={newImageUrl}
                onChange={e => setNewImageUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addImage()}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#C4960A'}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#EDE5D4'}
              />
              <button
                onClick={addImage}
                disabled={!newImageUrl.trim()}
                style={{
                  padding: '0.75rem 1.2rem',
                  background: newImageUrl.trim() ? '#1A1208' : '#C4B090',
                  color: 'white', border: 'none',
                  cursor: newImageUrl.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '0.75rem', fontFamily: 'Jost,sans-serif',
                  letterSpacing: '0.1em', borderRadius: '3px',
                  transition: 'background 0.2s',
                }}
              >+ Ajouter</button>
            </div>
          )}

          {form.images.length === 0 && (
            <p style={{ fontSize: '0.75rem', color: '#C4B090', marginTop: '0.5rem' }}>
              Aucune image — le flacon CSS sera affiché par défaut.
            </p>
          )}
        </div>
      </div>

      {/* ── PRIX PAR FORMAT ── */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>Prix par format</div>
        <div style={sectionBodyStyle}>
          <p style={{ fontSize: '0.75rem', color: '#8A7B68', marginBottom: '1rem', marginTop: 0 }}>
            Prix de vente affiché sur la boutique pour chaque format.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            {[
              { label: 'Prix 30 ml (DT)', key: 'prix30ml' },
              { label: 'Prix 50 ml (DT)', key: 'prix50ml' },
              { label: 'Prix 100 ml (DT)', key: 'prix100ml' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={(form as any)[key] || ''}
                  onChange={e => set(key, parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  style={inputStyle}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#C4960A'}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#EDE5D4'}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── STOCK D'ESSENCE ── */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>Stock d'essence</div>
        <div style={sectionBodyStyle}>
          <p style={{ fontSize: '0.75rem', color: '#8A7B68', marginBottom: '1rem', marginTop: 0 }}>
            Quantité de parfum pur disponible en stock. Chaque vente déduit automatiquement la consommation
            (30ml → 11ml · 50ml → 18ml · 100ml → 33ml).
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Stock en ml</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.stockMlInitial}
                onChange={e => set('stockMlInitial', parseFloat(e.target.value) || 0)}
                placeholder="ex: 1000"
                style={inputStyle}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#C4960A'}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#EDE5D4'}
              />
            </div>
            {form.stockMlInitial > 0 && (
              <div style={{
                padding: '0.75rem 1rem',
                background: 'rgba(196,150,10,0.08)',
                border: '1px solid rgba(196,150,10,0.2)',
                borderRadius: '4px',
                fontSize: '0.78rem',
                color: '#C4960A',
                whiteSpace: 'nowrap',
              }}>
                ≈ {(form.stockMlInitial / 1000).toFixed(3)} kg
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BADGES ── */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>Badges & Mise en avant</div>
        <div style={sectionBodyStyle}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2,1fr)',
            gap: '0.8rem', marginBottom: '1rem',
          }}>
            {[
              { key: 'actif',     label: 'Produit actif',   color: '#2E7D52', bg: '#E4F2EB',  desc: 'Visible sur la boutique' },
              { key: 'featured',  label: 'Bestseller',      color: '#7A5C9B', bg: '#F4EFF9',  desc: 'Affiché en page d\'accueil' },
              { key: 'exclusif',  label: 'Exclusif',        color: '#C4960A', bg: '#FFF8E6',  desc: 'Badge doré sur la carte' },
              { key: 'nouveaute', label: 'Nouveauté',       color: '#4A7A9B', bg: '#EEF5FA',  desc: 'Badge bleu sur la carte' },
              { key: 'offre',     label: 'En promotion',    color: '#2E7D52', bg: '#E4F2EB',  desc: 'Badge vert avec label' },
            ].map(badge => (
              <div
                key={badge.key}
                onClick={() => set(badge.key, !(form as any)[badge.key])}
                style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.9rem 1rem',
                  border: `1px solid ${(form as any)[badge.key] ? badge.color : '#EDE5D4'}`,
                  background: (form as any)[badge.key] ? badge.bg : 'white',
                  borderRadius: '4px', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div>
                  <div style={{
                    fontSize: '0.82rem', color: '#1A1208',
                    fontWeight: (form as any)[badge.key] ? 600 : 400,
                    marginBottom: '0.15rem',
                  }}>{badge.label}</div>
                  <div style={{ fontSize: '0.65rem', color: '#C4B090' }}>
                    {badge.desc}
                  </div>
                </div>
                {/* Toggle */}
                <div style={{
                  width: '38px', height: '20px',
                  background: (form as any)[badge.key] ? badge.color : '#EDE5D4',
                  borderRadius: '10px', position: 'relative',
                  transition: 'background 0.25s', flexShrink: 0,
                }}>
                  <div style={{
                    position: 'absolute', top: '2px',
                    left: (form as any)[badge.key] ? '20px' : '2px',
                    width: '16px', height: '16px',
                    background: 'white', borderRadius: '50%',
                    transition: 'left 0.25s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}/>
                </div>
              </div>
            ))}
          </div>

          {/* Label offre */}
          {form.offre && (
            <div>
              <label style={labelStyle}>Label de l'offre</label>
              <input
                style={inputStyle}
                value={form.offreLabel}
                onChange={e => set('offreLabel', e.target.value)}
                placeholder="ex: -20% · Pack été · Offre spéciale"
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#C4960A'}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#EDE5D4'}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── BOUTON ENREGISTRER ── */}
      <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
        <button
          onClick={() => router.push('/erp/produits')}
          style={{
            padding: '0.9rem 1.5rem',
            background: 'none', color: '#8A7B68',
            border: '1px solid #EDE5D4',
            fontFamily: 'Jost,sans-serif', fontSize: '0.75rem',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            cursor: 'pointer', borderRadius: '3px',
          }}
        >← Annuler</button>

        <button
          onClick={handleSubmit}
          disabled={saving || saved}
          style={{
            flex: 1, padding: '0.9rem',
            background: saved
              ? '#2E7D52'
              : saving
                ? '#C4B090'
                : 'linear-gradient(135deg,#C4960A,#A07808)',
            color: 'white', border: 'none',
            fontFamily: 'Jost,sans-serif', fontSize: '0.78rem',
            letterSpacing: '0.18em', textTransform: 'uppercase',
            cursor: saving || saved ? 'not-allowed' : 'pointer',
            boxShadow: saving || saved
              ? 'none'
              : '0 6px 20px rgba(196,150,10,0.3)',
            transition: 'all 0.3s', borderRadius: '3px',
          }}
        >
          {saved    ? '✓ Enregistré'    :
           saving   ? 'Enregistrement…' :
           mode === 'edition' ? 'Enregistrer les modifications' : 'Créer le produit'}
        </button>
      </div>
    </div>
  )
}
