"use client"
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

function Reveal({
  children,
  delay = 0,
  dir = "up",
  style: revealStyle,
}: {
  children: React.ReactNode;
  delay?: number;
  dir?: "up" | "left" | "right" | "scale";
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setV(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const transforms: Record<string, string> = {
    up: "translateY(40px)",
    left: "translateX(-40px)",
    right: "translateX(40px)",
    scale: "scale(0.94)",
  };

  return (
    <div
      ref={ref}
      style={{
        opacity: v ? 1 : 0,
        transform: v ? "none" : transforms[dir],
        transition: `opacity 0.85s ease ${delay}s, transform 0.85s ease ${delay}s`,
        ...revealStyle,
      }}
    >
      {children}
    </div>
  );
}

function FloatingBottle({ color, h, w, label, delay }: {
  color: string, h: number, w: number, label: string, delay: string
}) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'3px', animation:`float 4s ease-in-out ${delay} infinite` }}>
      <div style={{ width:w*0.4+'px', height:'14px', background:`linear-gradient(180deg,${color},${color}99)`, borderRadius:'3px 3px 0 0' }}/>
      <div style={{ width:w*0.25+'px', height:'8px', background:color+'88' }}/>
      <div style={{
        width:w+'px', height:h+'px',
        background:`linear-gradient(160deg,rgba(255,255,255,0.55) 0%,${color}50 50%,${color}80 100%)`,
        borderRadius:'6px 6px 4px 4px',
        boxShadow:`5px 10px 25px ${color}30, inset 2px 0 8px rgba(255,255,255,0.45)`,
        position:'relative', overflow:'hidden',
        border:`1px solid ${color}25`
      }}>
        <div style={{ position:'absolute', top:0, left:'17%', width:'13%', height:'100%', background:'rgba(255,255,255,0.3)' }}/>
        <div style={{
          position:'absolute', bottom:'18%', left:'50%', transform:'translateX(-50%)',
          width:'70%', padding:'3px 0', background:'rgba(255,255,255,0.93)', textAlign:'center'
        }}>
          <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'0.42rem', fontWeight:700, color:'#1A1208', letterSpacing:'0.12em' }}>NUANCES</div>
          <div style={{ fontSize:'0.3rem', color:'#C4960A', marginTop:'1px', fontFamily:'Jost,sans-serif' }}>{label}</div>
        </div>
      </div>
    </div>
  )
}

const STATUT_LABELS: Record<string,{label:string;color:string}> = {
  EN_ATTENTE:     { label:'Reçue, en attente de confirmation', color:'#B8860B' },
  CONFIRMEE:      { label:'Confirmée par notre équipe',        color:'#4A7A9B' },
  EN_PREPARATION: { label:'En cours de préparation',           color:'#7A5C9B' },
  EXPEDIEE:       { label:"Expédiée — en route !",             color:'#C4960A' },
  LIVREE:         { label:'Livrée avec succès',                color:'#2E7D52' },
  ANNULEE:        { label:'Annulée',                           color:'#8B3A3A' },
}

type HomeProduitCard = {
  id: string
  nom: string
  slug: string
  notes?: string
  prix: number
  featured?: boolean
  offreLabel?: string | null
}

function parseProduitList(data: unknown): HomeProduitCard[] {
  return Array.isArray(data) ? (data as HomeProduitCard[]) : []
}

export default function HomePage() {
  const [isMobile, setIsMobile] = useState(false)
  const [productos, setProductos] = useState<HomeProduitCard[]>([])
  const [exclusifs, setExclusifs] = useState<HomeProduitCard[]>([])
  const [nouveautes, setNouveautes] = useState<HomeProduitCard[]>([])
  const [offres, setOffres] = useState<HomeProduitCard[]>([])
  const [suiviNumero, setSuiviNumero] = useState('')
  const [suiviLoading, setSuiviLoading] = useState(false)
  const [suiviError, setSuiviError] = useState('')
  const [suiviResult, setSuiviResult] = useState<null | {
    numero: string
    statut: string
    montantTotal: number
    villeLivraison?: string | null
    createdAt: string
    lignes?: Array<{ taille: string; quantite: number; prixUnitaire: number; produit?: { nom: string } | null }>
  }>(null)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    Promise.all([
      fetch('/api/produits?featured=true&limit=3', { cache: 'no-store' }).then(
        (r) => r.json()
      ),
      fetch('/api/produits?exclusif=true&limit=4', { cache: 'no-store' }).then(
        (r) => r.json()
      ),
      fetch('/api/produits?nouveaute=true&limit=4', { cache: 'no-store' }).then(
        (r) => r.json()
      ),
      fetch('/api/produits?offre=true&limit=4', { cache: 'no-store' }).then(
        (r) => r.json()
      ),
    ])
      .then(([feat, excl, nouv, offr]) => {
        setProductos(parseProduitList(feat).slice(0, 3))
        setExclusifs(parseProduitList(excl).slice(0, 4))
        setNouveautes(parseProduitList(nouv).slice(0, 4))
        setOffres(parseProduitList(offr).slice(0, 4))
      })
      .catch(() => {
        setProductos([])
        setExclusifs([])
        setNouveautes([])
        setOffres([])
      })
  }, [])

  const handleSuivi = async () => {
    if (!suiviNumero.trim()) return
    setSuiviLoading(true)
    setSuiviError('')
    setSuiviResult(null)
    try {
      const res = await fetch(`/api/commandes/suivi?numero=${suiviNumero.trim().toUpperCase()}`)
      if (!res.ok) throw new Error('Introuvable')
      setSuiviResult(await res.json())
    } catch {
      setSuiviError('Numéro introuvable. Vérifiez votre email de confirmation.')
    } finally {
      setSuiviLoading(false)
    }
  }

  return (
    <>
      <main style={{ fontFamily:'Jost,sans-serif', background:'#FDFAF5', overflowX:'hidden' }}>

        {/* ════ HERO ════ */}
        <section style={{
          minHeight:'100vh', display:'grid',
          gridTemplateColumns: isMobile ? '1fr' : '52% 48%', paddingTop:'76px', overflow:'hidden'
        }}>
          {/* Gauche sombre */}
          <div style={{
            background:'linear-gradient(140deg,#1A1208 0%,#2C1E10 60%,#3D2A14 100%)',
            display:'flex', flexDirection:'column', justifyContent:'center',
            padding:'8% 7%', position:'relative', overflow:'hidden'
          }}>
            <div style={{
              position:'absolute', top:'-15%', left:'-8%',
              fontFamily:'Cormorant Garamond,serif', fontSize:'22rem',
              fontWeight:700, color:'rgba(196,150,10,0.04)',
              lineHeight:1, pointerEvents:'none', userSelect:'none'
            }}>N</div>

            <Reveal delay={0}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.8rem', marginBottom:'2rem' }}>
                <div style={{ width:'36px', height:'1px', background:'#C4960A' }}/>
                <span style={{ fontSize:'0.63rem', letterSpacing:'0.42em', textTransform:'uppercase', color:'#C4960A' }}>Luxury in Every Drop</span>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <h1 style={{
                fontFamily:'Cormorant Garamond,serif',
                fontSize:'clamp(3.2rem,5.5vw,6.5rem)',
                fontWeight:300, lineHeight:1.05, color:'white', marginBottom:'1.6rem'
              }}>
                Deux univers.<br/>Une même<br/>
                <em style={{ fontStyle:'italic', background:'linear-gradient(135deg,#C4960A,#E8C96A)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>exigence.</em>
              </h1>
            </Reveal>

            <Reveal delay={0.28}>
              <p style={{ fontSize:'0.92rem', lineHeight:1.85, color:'rgba(255,255,255,0.52)', fontWeight:300, maxWidth:'400px', marginBottom:'2.5rem' }}>
                Représentant officiel V.o Aromatiques en Tunisie.<br/>
                Extraits purs — Classiques & Niche.
              </p>
            </Reveal>

            <Reveal delay={0.42}>
              <div style={{ display:'flex', gap:'1rem', marginBottom:'4rem', flexWrap:'wrap' }}>
                <Link href="/boutique" style={{
                  background:'linear-gradient(135deg,#C4960A,#A07808)', color:'white',
                  padding:'0.95rem 2.2rem', fontSize:'0.72rem', fontWeight:500,
                  letterSpacing:'0.2em', textTransform:'uppercase', textDecoration:'none',
                  boxShadow:'0 8px 28px rgba(196,150,10,0.38)', transition:'all 0.3s'
                }}>Découvrir</Link>
                <Link href="/boutique" style={{
                  background:'transparent', color:'rgba(255,255,255,0.65)',
                  padding:'0.95rem 2.2rem', fontSize:'0.72rem', fontWeight:400,
                  letterSpacing:'0.2em', textTransform:'uppercase', textDecoration:'none',
                  border:'1px solid rgba(255,255,255,0.18)', transition:'all 0.3s'
                }}>Collection Niche</Link>
              </div>
            </Reveal>

            <Reveal delay={0.56}>
              <div style={{ display:'flex', gap:'3rem', paddingTop:'2rem', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
                {[['12.6k','Abonnés'],['100%','Extrait Pur'],['2','Univers']].map(([n,l]) => (
                  <div key={l}>
                    <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'2.6rem', fontWeight:300, color:'white', lineHeight:1 }}>{n}</div>
                    <div style={{ fontSize:'0.6rem', color:'rgba(255,255,255,0.32)', letterSpacing:'0.18em', textTransform:'uppercase', marginTop:'0.4rem' }}>{l}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Droite claire avec flacons */}
          <div style={{
            background:'linear-gradient(160deg,#F5EFE0 0%,#EDE5D4 50%,#D4C4A8 100%)',
            display:'flex', alignItems:'center', justifyContent:'center',
            position:'relative', overflow:'hidden'
          }}>
            {/* Cercles déco */}
            {[{s:240,t:'8%',r:'6%',op:0.15,spd:'22s'},{s:140,t:'55%',l:'5%',op:0.1,spd:'16s'}].map((c,i)=>(
              <div key={i} style={{
                position:'absolute',
                width:c.s, height:c.s, borderRadius:'50%',
                border:'1px solid rgba(196,150,10,0.3)',
                top:c.t, right:(c as {r?: string}).r, left:(c as {l?: string}).l,
                animation:`spin ${c.spd} linear infinite ${i%2?'reverse':''}`
              }}/>
            ))}

            <div style={{ display:'flex', gap:'1.8rem', alignItems:'flex-end', position:'relative', zIndex:2 }}>
              <FloatingBottle color="#C4960A" h={100} w={58} label="AMBRE" delay="0s"/>
              <FloatingBottle color="#8B6914" h={130} w={72} label="NICHE" delay="0.4s"/>
              <FloatingBottle color="#B8A070" h={88} w={52} label="SOL" delay="0.8s"/>
            </div>

            {/* Badge */}
            <Reveal delay={0.5} dir="scale">
              <div style={{
                position:'absolute', bottom:'10%', right:'8%',
                background:'rgba(26,18,8,0.9)', backdropFilter:'blur(14px)',
                padding:'1.1rem 1.6rem', border:'1px solid rgba(196,150,10,0.28)',
                boxShadow:'0 14px 40px rgba(26,18,8,0.22)',
                animation:'float 5s ease-in-out 1s infinite'
              }}>
                <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.4rem', color:'#C4960A', textAlign:'center' }}>✿</div>
                <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'0.8rem', color:'white', letterSpacing:'0.12em', textAlign:'center', marginTop:'0.3rem' }}>Exclusif Tunisie</div>
                <div style={{ fontSize:'0.58rem', color:'#C4960A', letterSpacing:'0.15em', textTransform:'uppercase', textAlign:'center', marginTop:'0.2rem' }}>V.o Aromatiques</div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ════ DEUX UNIVERS ════ */}
        <section style={{ padding:'9% 6%', background:'#F5EFE0' }}>
          <Reveal>
            <div style={{ textAlign:'center', marginBottom:'4.5rem' }}>
              <span style={{ fontSize:'0.65rem', letterSpacing:'0.38em', textTransform:'uppercase', color:'#C4960A', display:'block', marginBottom:'1.2rem' }}>Notre Signature</span>
              <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(2.2rem,4vw,4.5rem)', fontWeight:300, color:'#1A1208', lineHeight:1.1 }}>Deux univers.<br/>Une même exigence.</h2>
            </div>
          </Reveal>

          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:'1.5rem', maxWidth:'820px', margin:'0 auto' }}>
            {[
              { titre:'Classiques', sub:'Élégants · Intemporels · Accessibles', dark:false, items:[['30 ML','20 DT'],['50 ML','30 DT'],['100 ML','50 DT']], slogan:"L'élégance au quotidien." },
              { titre:'Niche', sub:'Collection Privée · Raffinés · Intenses', dark:true, items:[['30 ML','30 DT'],['50 ML','50 DT'],['100 ML','100 DT']], slogan:"L'élégance sur mesure." },
            ].map((col,i) => (
              <Reveal key={col.titre} delay={i*0.18} dir={i===0?'left':'right'}>
                <div style={{
                  background: col.dark ? '#1A1208' : 'white',
                  padding:'3.5rem 2.8rem',
                  borderTop:'3px solid #C4960A',
                  boxShadow: col.dark ? '0 8px 40px rgba(26,18,8,0.18)' : '0 8px 40px rgba(26,18,8,0.06)'
                }}>
                  <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'2rem', fontWeight:300, color:col.dark?'white':'#1A1208', marginBottom:'0.4rem' }}>{col.titre}</h3>
                  <p style={{ fontSize:'0.65rem', color:'#C4960A', letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:'2.2rem' }}>{col.sub}</p>
                  {col.items.map(([ml,prix]) => (
                    <div key={ml} style={{ display:'flex', justifyContent:'space-between', padding:'0.85rem 0', borderBottom:`1px solid ${col.dark?'rgba(255,255,255,0.07)':'#EDE5D4'}` }}>
                      <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.05rem', color:col.dark?'white':'#1A1208' }}>{ml}</span>
                      <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.2rem', color:'#C4960A' }}>{prix}</span>
                    </div>
                  ))}
                  <p style={{ marginTop:'1.8rem', fontSize:'0.8rem', color:col.dark?'rgba(255,255,255,0.38)':'#8A7B68', fontStyle:'italic', fontFamily:'Cormorant Garamond,serif' }}>{col.slogan}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {(productos.length > 0 || nouveautes.length > 0 || offres.length > 0 || exclusifs.length > 0) && (
          <nav
            aria-label="Accès rapide aux mises en avant"
            style={{
              padding:'0.85rem 6%',
              background:'#FDFAF5',
              borderBottom:'1px solid rgba(196,150,10,0.1)',
              position:'sticky',
              top:'76px',
              zIndex:30,
              display:'flex',
              flexWrap:'wrap',
              gap:'0.45rem',
              justifyContent:'center',
              alignItems:'center',
            }}
          >
            {[
              { id:'accueil-bestsellers', label:'Bestsellers', show: productos.length > 0 },
              { id:'accueil-nouveautes', label:'Nouveautés', show: nouveautes.length > 0 },
              { id:'accueil-offres', label:'Offres', show: offres.length > 0 },
              { id:'accueil-exclusifs', label:'Exclusifs', show: exclusifs.length > 0 },
            ].filter((i) => i.show).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior:'smooth', block:'start' })}
                style={{
                  padding:'0.42rem 1rem',
                  fontSize:'0.68rem',
                  fontFamily:'Jost,sans-serif',
                  letterSpacing:'0.12em',
                  textTransform:'uppercase',
                  background:'white',
                  color:'#1A1208',
                  border:'1px solid rgba(26,18,8,0.12)',
                  cursor:'pointer',
                  borderRadius:'3px',
                  transition:'all 0.2s',
                }}
              >{item.label}</button>
            ))}
          </nav>
        )}

        {/* ════ BESTSELLERS ════ */}
        <section id="accueil-bestsellers" style={{ padding:'9% 6%', background:'#FDFAF5', scrollMarginTop:'92px' }}>
          <Reveal>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'3.5rem' }}>
              <div>
                <span style={{ fontSize:'0.65rem', letterSpacing:'0.38em', textTransform:'uppercase', color:'#C4960A', display:'block', marginBottom:'0.8rem' }}>Nos Incontournables</span>
                <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(2rem,3.5vw,3.5rem)', fontWeight:300, color:'#1A1208' }}>Bestsellers</h2>
              </div>
              <Link href="/boutique?badge=featured" style={{ fontSize:'0.74rem', color:'#8A7B68', textDecoration:'none', letterSpacing:'0.1em' }}>Voir tout →</Link>
            </div>
          </Reveal>

          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(240px, 1fr))', gap:'1.2rem', alignItems:'stretch' }}>
            {productos.length === 0 ? (
              [...Array(3)].map((_,i) => (
                <div key={i} style={{ height:'400px', background:'linear-gradient(90deg,#EDE5D4,#F5EFE0,#EDE5D4)', backgroundSize:'200%', animation:'shimmer 1.5s infinite' }}/>
              ))
            ) : productos.map((p,i) => (
              <Reveal key={p.id} delay={i*0.14} dir="scale" style={{ height:'100%', display:'flex', flexDirection:'column', minHeight:0 }}>
                <Link href={`/boutique/${p.slug}`} style={{ textDecoration:'none', color:'inherit', display:'flex', flexDirection:'column', height:'100%', flex:1, minHeight:0 }}>
                  <div
                    style={{ background:'#F5EFE0', border:'1px solid #EDE5D4', borderRadius:'6px', overflow:'hidden', display:'flex', flexDirection:'column', height:'100%', cursor:'pointer', transition:'box-shadow 0.3s, transform 0.3s', transform:'translateY(0)', boxShadow:'none' }}
                    onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.transform='translateY(-4px)'; el.style.boxShadow='0 12px 40px rgba(196,150,10,0.15)' }}
                    onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.transform='translateY(0)'; el.style.boxShadow='none' }}
                  >
                    <div style={{ height:'220px', background:'linear-gradient(135deg,#F5EFE0,#EDE5D4)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
                      {p.featured && <div style={{ position:'absolute', top:'1rem', left:'1rem', background:'#C4960A', color:'white', fontSize:'0.55rem', letterSpacing:'0.12em', textTransform:'uppercase', padding:'0.22rem 0.65rem', zIndex:2 }}>Bestseller</div>}
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'3px' }}>
                        <div style={{ width:'24px', height:'14px', background:'linear-gradient(180deg,#C4960A,#8B6914)', borderRadius:'3px 3px 0 0' }}/>
                        <div style={{ width:'15px', height:'8px', background:'#C4960A88' }}/>
                        <div style={{ width:'60px', height:'95px', background:'linear-gradient(160deg,rgba(255,255,255,0.55),#D4B89670,#C4960A55)', borderRadius:'6px 6px 4px 4px', boxShadow:'5px 8px 22px rgba(196,150,10,0.22), inset 2px 0 8px rgba(255,255,255,0.4)', position:'relative', overflow:'hidden', border:'1px solid rgba(196,150,10,0.18)' }}>
                          <div style={{ position:'absolute', top:0, left:'17%', width:'13%', height:'100%', background:'rgba(255,255,255,0.32)' }}/>
                          <div style={{ position:'absolute', bottom:'18%', left:'50%', transform:'translateX(-50%)', width:'70%', padding:'3px 0', background:'rgba(255,255,255,0.93)', textAlign:'center' }}>
                            <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'0.42rem', fontWeight:700, color:'#1A1208', letterSpacing:'0.1em' }}>NUANCES</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ padding:'1.2rem', display:'flex', flexDirection:'column', flex:1, gap:'0.5rem' }}>
                      <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.15rem', fontWeight:400, color:'#1A1208', margin:0, minHeight:'2.6rem', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{p.nom}</h3>
                      <p style={{ fontSize:'0.72rem', color:'#8A7B68', margin:0, lineHeight:1.5, height:'2.16rem', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{p.notes || '\u00A0'}</p>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'auto', paddingTop:'0.8rem', borderTop:'1px solid #F0EBE0' }}>
                        <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.3rem', color:'#C4960A' }}>Dès {Number(p.prix).toFixed(0)} DT</span>
                        <span style={{ fontSize:'0.65rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'#1A1208', border:'1px solid rgba(26,18,8,0.18)', padding:'0.3rem 0.7rem' }}>Voir</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {nouveautes.length > 0 && (
          <section id="accueil-nouveautes" style={{ padding:'9% 6%', background:'#F5EFE0', scrollMarginTop:'92px' }}>
            <Reveal>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'3.5rem' }}>
                <div>
                  <span style={{ fontSize:'0.65rem', letterSpacing:'0.38em', textTransform:'uppercase', color:'#4A7A9B', display:'block', marginBottom:'0.8rem' }}>Tout juste arrivés</span>
                  <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(2rem,3.5vw,3.5rem)', fontWeight:300, color:'#1A1208' }}>Nouveautés</h2>
                </div>
                <Link href="/boutique?badge=nouveaute" style={{ fontSize:'0.74rem', color:'#8A7B68', textDecoration:'none', letterSpacing:'0.1em' }}>Voir tout →</Link>
              </div>
            </Reveal>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(240px, 1fr))', gap:'1.2rem', alignItems:'stretch' }}>
              {nouveautes.map((p,i) => (
                <Reveal key={p.id} delay={i*0.12} dir="scale" style={{ height:'100%', display:'flex', flexDirection:'column', minHeight:0 }}>
                  <Link href={`/boutique/${p.slug}`} style={{ textDecoration:'none', color:'inherit', display:'flex', flexDirection:'column', height:'100%', flex:1, minHeight:0 }}>
                    <div
                      style={{ background:'white', border:'1px solid #E4EDF2', borderRadius:'6px', overflow:'hidden', display:'flex', flexDirection:'column', height:'100%', cursor:'pointer', transition:'box-shadow 0.3s, transform 0.3s', transform:'translateY(0)', boxShadow:'none' }}
                      onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.transform='translateY(-4px)'; el.style.boxShadow='0 12px 36px rgba(74,122,155,0.12)' }}
                      onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.transform='translateY(0)'; el.style.boxShadow='none' }}
                    >
                      <div style={{ height:'220px', background:'linear-gradient(135deg,#EEF5FA,#E4EDF2)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
                        <div style={{ position:'absolute', top:'1rem', left:'1rem', background:'#4A7A9B', color:'white', fontSize:'0.55rem', letterSpacing:'0.12em', textTransform:'uppercase', padding:'0.22rem 0.65rem', zIndex:2 }}>Nouveauté</div>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'3px' }}>
                          <div style={{ width:'24px', height:'14px', background:'linear-gradient(180deg,#4A7A9B,#355d78)', borderRadius:'3px 3px 0 0' }}/>
                          <div style={{ width:'15px', height:'8px', background:'#4A7A9B55' }}/>
                          <div style={{ width:'60px', height:'95px', background:'linear-gradient(160deg,rgba(255,255,255,0.55),#B8C9D670,#4A7A9B40)', borderRadius:'6px 6px 4px 4px', boxShadow:'5px 8px 22px rgba(74,122,155,0.15), inset 2px 0 8px rgba(255,255,255,0.4)', position:'relative', overflow:'hidden', border:'1px solid rgba(74,122,155,0.2)' }}>
                            <div style={{ position:'absolute', top:0, left:'17%', width:'13%', height:'100%', background:'rgba(255,255,255,0.32)' }}/>
                            <div style={{ position:'absolute', bottom:'18%', left:'50%', transform:'translateX(-50%)', width:'70%', padding:'3px 0', background:'rgba(255,255,255,0.93)', textAlign:'center' }}>
                              <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'0.42rem', fontWeight:700, color:'#1A1208', letterSpacing:'0.1em' }}>NUANCES</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style={{ padding:'1.2rem', display:'flex', flexDirection:'column', flex:1, gap:'0.5rem' }}>
                        <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.15rem', fontWeight:400, color:'#1A1208', margin:0, minHeight:'2.6rem', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{p.nom}</h3>
                        <p style={{ fontSize:'0.72rem', color:'#8A7B68', margin:0, lineHeight:1.5, height:'2.16rem', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{p.notes || '\u00A0'}</p>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'auto', paddingTop:'0.8rem', borderTop:'1px solid #E4EDF2' }}>
                          <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.3rem', color:'#4A7A9B' }}>Dès {Number(p.prix).toFixed(0)} DT</span>
                          <span style={{ fontSize:'0.65rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'#1A1208', border:'1px solid rgba(26,18,8,0.18)', padding:'0.3rem 0.7rem' }}>Voir</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {offres.length > 0 && (
          <section id="accueil-offres" style={{ padding:'9% 6%', background:'#F4FAF6', scrollMarginTop:'92px' }}>
            <Reveal>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'3.5rem' }}>
                <div>
                  <span style={{ fontSize:'0.65rem', letterSpacing:'0.38em', textTransform:'uppercase', color:'#2E7D52', display:'block', marginBottom:'0.8rem' }}>Profitez-en</span>
                  <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(2rem,3.5vw,3.5rem)', fontWeight:300, color:'#1A1208' }}>Offres du moment</h2>
                </div>
                <Link href="/boutique?badge=offre" style={{ fontSize:'0.74rem', color:'#8A7B68', textDecoration:'none', letterSpacing:'0.1em' }}>Voir tout →</Link>
              </div>
            </Reveal>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(240px, 1fr))', gap:'1.2rem', alignItems:'stretch' }}>
              {offres.map((p,i) => (
                <Reveal key={p.id} delay={i*0.12} dir="scale" style={{ height:'100%', display:'flex', flexDirection:'column', minHeight:0 }}>
                  <Link href={`/boutique/${p.slug}`} style={{ textDecoration:'none', color:'inherit', display:'flex', flexDirection:'column', height:'100%', flex:1, minHeight:0 }}>
                    <div
                      style={{ background:'white', border:'1px solid rgba(46,125,82,0.2)', borderRadius:'6px', overflow:'hidden', display:'flex', flexDirection:'column', height:'100%', cursor:'pointer', transition:'box-shadow 0.3s, transform 0.3s', transform:'translateY(0)', boxShadow:'none' }}
                      onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.transform='translateY(-4px)'; el.style.boxShadow='0 12px 36px rgba(46,125,82,0.12)' }}
                      onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.transform='translateY(0)'; el.style.boxShadow='none' }}
                    >
                      <div style={{ height:'220px', background:'linear-gradient(135deg,#E8F5EC,#D4EBDD)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
                        <div style={{ position:'absolute', top:'1rem', left:'1rem', display:'flex', flexDirection:'column', gap:'0.25rem', zIndex:2 }}>
                          <div style={{ background:'#2E7D52', color:'white', fontSize:'0.55rem', letterSpacing:'0.12em', textTransform:'uppercase', padding:'0.22rem 0.65rem' }}>Offre</div>
                          {p.offreLabel ? (
                            <div style={{ background:'rgba(255,255,255,0.95)', color:'#1A1208', fontSize:'0.55rem', letterSpacing:'0.08em', padding:'0.2rem 0.55rem', border:'1px solid rgba(46,125,82,0.35)' }}>{p.offreLabel}</div>
                          ) : null}
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'3px' }}>
                          <div style={{ width:'24px', height:'14px', background:'linear-gradient(180deg,#2E7D52,#1e5236)', borderRadius:'3px 3px 0 0' }}/>
                          <div style={{ width:'15px', height:'8px', background:'#2E7D5244' }}/>
                          <div style={{ width:'60px', height:'95px', background:'linear-gradient(160deg,rgba(255,255,255,0.55),#B8DCC570,#2E7D5238)', borderRadius:'6px 6px 4px 4px', boxShadow:'5px 8px 22px rgba(46,125,82,0.12), inset 2px 0 8px rgba(255,255,255,0.4)', position:'relative', overflow:'hidden', border:'1px solid rgba(46,125,82,0.18)' }}>
                            <div style={{ position:'absolute', top:0, left:'17%', width:'13%', height:'100%', background:'rgba(255,255,255,0.32)' }}/>
                            <div style={{ position:'absolute', bottom:'18%', left:'50%', transform:'translateX(-50%)', width:'70%', padding:'3px 0', background:'rgba(255,255,255,0.93)', textAlign:'center' }}>
                              <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'0.42rem', fontWeight:700, color:'#1A1208', letterSpacing:'0.1em' }}>NUANCES</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style={{ padding:'1.2rem', display:'flex', flexDirection:'column', flex:1, gap:'0.5rem' }}>
                        <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.15rem', fontWeight:400, color:'#1A1208', margin:0, minHeight:'2.6rem', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{p.nom}</h3>
                        <p style={{ fontSize:'0.72rem', color:'#8A7B68', margin:0, lineHeight:1.5, height:'2.16rem', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{p.notes || '\u00A0'}</p>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'auto', paddingTop:'0.8rem', borderTop:'1px solid rgba(46,125,82,0.12)' }}>
                          <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.3rem', color:'#2E7D52' }}>Dès {Number(p.prix).toFixed(0)} DT</span>
                          <span style={{ fontSize:'0.65rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'#1A1208', border:'1px solid rgba(26,18,8,0.18)', padding:'0.3rem 0.7rem' }}>Voir</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {exclusifs.length > 0 && (
          <section id="accueil-exclusifs" style={{ padding:'8% 6%', background:'#1A1208', scrollMarginTop:'92px' }}>
            <Reveal>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'3rem' }}>
                <div>
                  <span style={{ fontSize:'0.65rem', letterSpacing:'0.38em', textTransform:'uppercase', color:'#C4960A', display:'block', marginBottom:'0.8rem' }}>Collection privée</span>
                  <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(2rem,3.5vw,3.5rem)', fontWeight:300, color:'white' }}>Nos Exclusivités</h2>
                </div>
                <Link href="/boutique?badge=exclusif" style={{ fontSize:'0.74rem', color:'rgba(255,255,255,0.4)', textDecoration:'none', letterSpacing:'0.1em' }}>Voir tout →</Link>
              </div>
            </Reveal>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:'1.2rem', alignItems:'stretch' }}>
              {exclusifs.map((p,i) => (
                <Reveal key={p.id} delay={i*0.1} style={{ height:'100%', display:'flex', flexDirection:'column', minHeight:0 }}>
                  <Link href={`/boutique/${p.slug}`} style={{ textDecoration:'none', display:'flex', flexDirection:'column', height:'100%', flex:1, minHeight:0 }}>
                    <div
                      style={{
                        background:'rgba(255,255,255,0.05)',
                        border:'1px solid rgba(196,150,10,0.2)',
                        borderRadius:'6px',
                        padding:'1.5rem',
                        display:'flex',
                        flexDirection:'column',
                        gap:'0.6rem',
                        height:'100%',
                        cursor:'pointer',
                        transition:'all 0.3s',
                        transform:'translateY(0)',
                        boxShadow:'none',
                      }}
                      onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.transform='translateY(-4px)'; el.style.boxShadow='0 12px 40px rgba(196,150,10,0.15)' }}
                      onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.transform='translateY(0)'; el.style.boxShadow='none' }}
                    >
                      <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.8rem', color:'rgba(196,150,10,0.2)', marginBottom:'0.1rem' }}>✿</div>
                      <div style={{ fontSize:'0.55rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'#C4960A', marginBottom:'0.1rem' }}>Exclusif</div>
                      <h3 style={{
                        fontFamily:'Cormorant Garamond,serif',
                        fontSize:'1.2rem',
                        fontWeight:400,
                        color:'white',
                        margin:0,
                        whiteSpace:'nowrap',
                        overflow:'hidden',
                        textOverflow:'ellipsis',
                      }}>{p.nom}</h3>
                      <p style={{
                        fontSize:'0.75rem',
                        color:'rgba(255,255,255,0.55)',
                        margin:0,
                        lineHeight:1.6,
                        display:'-webkit-box',
                        WebkitLineClamp:3,
                        WebkitBoxOrient:'vertical',
                        overflow:'hidden',
                        flex:1,
                      }}>{p.notes || '\u00A0'}</p>
                      <div style={{ marginTop:'auto', paddingTop:'0.8rem' }}>
                        <span style={{ color:'#C4960A', fontSize:'1rem', fontWeight:500 }}>
                          Dès {Number(p.prix).toFixed(0)} DT
                        </span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* ════ BANNIÈRE SOL DE JANEIRO ════ */}
        <section style={{ position:'relative', minHeight:'520px', display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', overflow:'hidden' }}>
          {/* Visuel coloré gauche */}
          <div style={{
            background:'linear-gradient(140deg,#1A0A2E 0%,#3D1050 40%,#7A1545 70%,#C42048 100%)',
            display:'flex', alignItems:'center', justifyContent:'center',
            padding:'6%', position:'relative', overflow:'hidden'
          }}>
            {[{c:'#FF6B9D',s:100,t:'15%',l:'8%'},{c:'#C44BC4',s:130,t:'45%',l:'38%'},{c:'#FF9B4A',s:70,t:'25%',l:'62%'},{c:'#FFD700',s:85,t:'62%',l:'15%'}].map((b,i)=>(
              <div key={i} style={{ position:'absolute', width:b.s, height:b.s, borderRadius:'50%', background:b.c, top:b.t, left:b.l, opacity:0.22, filter:'blur(18px)', animation:`float ${4+i}s ease-in-out ${i*0.4}s infinite` }}/>
            ))}
            <div style={{ display:'flex', gap:'0.9rem', alignItems:'flex-end', position:'relative', zIndex:2 }}>
              {[{c:'#FF9B4A',l:'40',h:108},{c:'#FF6B9D',l:'62',h:128},{c:'#C44BC4',l:'59',h:122},{c:'#FF8C5A',l:'68',h:112},{c:'#FFD700',l:'71',h:102}].map((f,i)=>(
                <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', animation:`float 4s ease-in-out ${i*0.18}s infinite` }}>
                  <div style={{ width:'34px', height:'22px', background:'white', borderRadius:'10px 10px 0 0', boxShadow:`0 -4px 10px ${f.c}40` }}/>
                  <div style={{ width:'40px', height:f.h+'px', background:`linear-gradient(180deg,${f.c}CC,${f.c})`, borderRadius:'4px 4px 8px 8px', boxShadow:`0 10px 28px ${f.c}45`, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
                    <div style={{ position:'absolute', top:0, left:'14%', width:'14%', height:'100%', background:'rgba(255,255,255,0.28)' }}/>
                    <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.2rem', fontWeight:700, color:'white', textShadow:'0 2px 6px rgba(0,0,0,0.28)' }}>{f.l}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ position:'absolute', bottom:'8%', left:'50%', transform:'translateX(-50%)', fontFamily:'Cormorant Garamond,serif', fontSize:'0.82rem', fontStyle:'italic', color:'rgba(255,255,255,0.5)', whiteSpace:'nowrap' }}>Disponible chez Nuances Parfums</div>
          </div>

          {/* Texte droite */}
          <div style={{ background:'#1A1208', display:'flex', flexDirection:'column', justifyContent:'center', padding:'8%' }}>
            <Reveal dir="right">
              <span style={{ fontSize:'0.62rem', letterSpacing:'0.38em', textTransform:'uppercase', color:'#FF9B4A', display:'block', marginBottom:'1.2rem' }}>Nouveauté</span>
              <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(2rem,3.8vw,3.8rem)', fontWeight:300, color:'white', lineHeight:1.1, marginBottom:'1.2rem' }}>
                SOL de Janeiro<br/>
                <em style={{ fontStyle:'italic', background:'linear-gradient(135deg,#FF9B4A,#FFD700)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>disponible chez nous</em>
              </h2>
              <p style={{ fontSize:'0.88rem', lineHeight:1.85, color:'rgba(255,255,255,0.52)', fontWeight:300, marginBottom:'2.2rem' }}>
                Des fragrances colorées, vibrantes et inoubliables.<br/>Maintenant disponibles chez Nuances Parfums, Nabeul.
              </p>
              <Link href="/boutique" style={{ background:'linear-gradient(135deg,#FF9B4A,#C44BC4)', color:'white', padding:'0.95rem 2.2rem', fontSize:'0.72rem', fontWeight:500, letterSpacing:'0.2em', textTransform:'uppercase', textDecoration:'none', display:'inline-block', boxShadow:'0 8px 28px rgba(255,155,74,0.35)' }}>Découvrir</Link>
            </Reveal>
          </div>
        </section>

        {/* ════ MAISONS DE LUXE ════ */}
        <section style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', background:'#F5EFE0', minHeight:'540px' }}>
          {/* Visuel flacons */}
          <div style={{ background:'linear-gradient(160deg,#D4B896,#C4960A15)', display:'flex', alignItems:'center', justifyContent:'center', padding:'8%', position:'relative' }}>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr', gap:'1.2rem', position:'relative', zIndex:2 }}>
              {[{m:'GIVENCHY',n:'Irrésistible',c:'#E8D5C0'},{m:'CHANEL',n:'Gabrielle',c:'#F0E6D8'},{m:'DIOR',n:'Hypnotique',c:'#DDD0BE'},{m:'ARMANI',n:'My Way',c:'#E8D0B8'}].map((f,i)=>(
                <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'3px', animation:`float ${4+i*0.5}s ease-in-out ${i*0.25}s infinite` }}>
                  <div style={{ width:'48px', height:'72px', background:`linear-gradient(160deg,rgba(255,255,255,0.65),${f.c})`, borderRadius:'5px 5px 9px 9px', boxShadow:'3px 7px 18px rgba(139,105,20,0.18), inset 2px 0 7px rgba(255,255,255,0.45)', border:'1px solid rgba(139,105,20,0.1)', position:'relative', overflow:'hidden' }}>
                    <div style={{ position:'absolute', top:0, left:'17%', width:'13%', height:'100%', background:'rgba(255,255,255,0.38)' }}/>
                  </div>
                  <div style={{ background:'white', padding:'4px 7px', boxShadow:'0 2px 7px rgba(0,0,0,0.09)', textAlign:'center', minWidth:'66px', border:'1px solid rgba(139,105,20,0.08)' }}>
                    <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'0.44rem', color:'#1A1208', lineHeight:1.3 }}>{f.n}</div>
                    <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'0.48rem', fontWeight:700, color:'#1A1208', letterSpacing:'0.05em' }}>{f.m}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ position:'absolute', bottom:'6%', left:'50%', transform:'translateX(-50%)', fontFamily:'Cormorant Garamond,serif', fontSize:'0.85rem', letterSpacing:'0.28em', color:'#8B6914', textTransform:'uppercase', opacity:0.55 }}>✿ NUANCES PARFUMS</div>
          </div>

          {/* Texte */}
          <div style={{ padding:'8%', display:'flex', flexDirection:'column', justifyContent:'center' }}>
            <Reveal dir="right">
              <span style={{ fontSize:'0.62rem', letterSpacing:'0.38em', textTransform:'uppercase', color:'#C4960A', display:'block', marginBottom:'1.2rem' }}>Notre Savoir-faire</span>
              <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(1.8rem,3vw,3.2rem)', fontWeight:300, color:'#1A1208', lineHeight:1.2, marginBottom:'1.4rem' }}>
                Les plus grandes<br/>maisons dans<br/>
                <em style={{ fontStyle:'italic', color:'#C4960A' }}>chaque flacon</em>
              </h2>
              <p style={{ fontSize:'0.88rem', lineHeight:1.88, color:'#8A7B68', fontWeight:300, marginBottom:'2rem' }}>
                Chanel, Dior, Givenchy, Giorgio Armani...<br/>
                Extraits fidèles, ingrédients de première qualité.
              </p>
              {['✦  Même savoir-faire. Même qualité.','✦  Deux expériences selon votre signature.','✦  Extraits purs, longue durée.'].map(t=>(
                <div key={t} style={{ display:'flex', alignItems:'center', gap:'0.8rem', marginBottom:'0.7rem', fontSize:'0.82rem', color:'#1A1208' }}>{t}</div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* ════ AVIS ════ */}
        <section style={{ padding:'9% 6%', background:'#1A1208' }}>
          <Reveal>
            <div style={{ textAlign:'center', marginBottom:'4rem' }}>
              <span style={{ fontSize:'0.65rem', letterSpacing:'0.38em', textTransform:'uppercase', color:'#C4960A', display:'block', marginBottom:'1.2rem' }}>Ils nous font confiance</span>
              <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(2rem,3.5vw,3rem)', fontWeight:300, color:'white' }}>Ce que nos clients disent</h2>
            </div>
          </Reveal>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap:'1.5rem' }}>
            {[
              { t:'"Qualité incroyable, parfum qui tient toute la journée. Je ne commande plus ailleurs."', n:'Sahar H.', v:'Tunis' },
              { t:'"Produits authentiques, livraison rapide. Équipe très professionnelle."', n:'Safa O.', v:'Sousse' },
              { t:'"Découvert via Instagram. Client fidèle depuis. Qualité exceptionnelle."', n:'Mohamed K.', v:'Nabeul' },
            ].map((a,i) => (
              <Reveal key={i} delay={i*0.14}>
                <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(196,150,10,0.18)', padding:'2.2rem 1.8rem', transition:'all 0.3s' }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(196,150,10,0.55)';(e.currentTarget as HTMLElement).style.transform='translateY(-4px)'}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(196,150,10,0.18)';(e.currentTarget as HTMLElement).style.transform='translateY(0)'}}
                >
                  <div style={{ color:'#C4960A', letterSpacing:'0.08em', marginBottom:'1.2rem' }}>★★★★★</div>
                  <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.05rem', fontStyle:'italic', lineHeight:1.75, color:'rgba(255,255,255,0.75)', marginBottom:'1.5rem', fontWeight:300 }}>{a.t}</p>
                  <div style={{ fontSize:'0.68rem', letterSpacing:'0.14em', textTransform:'uppercase', color:'#D4B896' }}>— {a.n}, {a.v}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ════ CTA FINAL ════ */}
        <section style={{ background:'linear-gradient(135deg,#E9DFC9,#D8C7A7)', borderTop:'1px solid #D2BE97', borderBottom:'1px solid #D2BE97', padding:'5.5% 6%', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'2rem' }}>
          <Reveal dir="left">
            <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(1.6rem,2.8vw,2.8rem)', fontWeight:400, color:'#1A1208' }}>
              Visitez notre boutique<br/>
              <span style={{ fontSize:'0.6em', color:'#5F4A30' }}>Nabeul 8000 · @nuances.parfums</span>
            </h2>
          </Reveal>
          <Reveal dir="right">
            <Link href="/commande" style={{ background:'#1A1208', color:'#F8F2E7', border:'1px solid #1A1208', padding:'1.1rem 3rem', fontSize:'0.75rem', fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', textDecoration:'none', boxShadow:'0 8px 24px rgba(26,18,8,0.2)', transition:'all 0.3s', display:'inline-block' }}>
              Commander maintenant
            </Link>
          </Reveal>
        </section>

        <section style={{ padding:'6% 6%', background:'#F5EFE0' }}>
          <Reveal>
            <div style={{ maxWidth:'560px', margin:'0 auto', textAlign:'center' }}>
              <span style={{ fontSize:'0.65rem', letterSpacing:'0.38em', textTransform:'uppercase', color:'#C4960A', display:'block', marginBottom:'1rem' }}>Suivi</span>
              <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(1.8rem,3vw,2.8rem)', fontWeight:300, color:'#1A1208', marginBottom:'0.5rem' }}>
                Suivre ma commande
              </h2>
              <p style={{ fontSize:'0.85rem', color:'#8A7B68', marginBottom:'2rem', lineHeight:1.7 }}>
                Entrez votre numéro de commande (ex : NP-2026-0001)
              </p>
              <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.5rem' }}>
                <input
                  type="text"
                  placeholder="NP-2026-XXXX"
                  value={suiviNumero}
                  onChange={e => setSuiviNumero(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleSuivi()}
                  style={{
                    flex:1, padding:'0.9rem 1.2rem',
                    border:'1px solid rgba(196,150,10,0.25)',
                    background:'white', fontFamily:'Jost,sans-serif',
                    fontSize:'0.88rem', color:'#1A1208', outline:'none',
                    letterSpacing:'0.08em',
                  }}
                />
                <button type="button" onClick={handleSuivi} disabled={suiviLoading} style={{
                  padding:'0.9rem 1.8rem',
                  background: suiviLoading ? '#C4B090' : '#1A1208',
                  color:'white', border:'none',
                  fontFamily:'Jost,sans-serif', fontSize:'0.72rem',
                  letterSpacing:'0.18em', textTransform:'uppercase',
                  cursor: suiviLoading ? 'not-allowed' : 'pointer',
                  transition:'background 0.2s',
                }}>{suiviLoading ? '…' : 'Rechercher'}</button>
              </div>

              {suiviError && (
                <div style={{ background:'#FAEAEA', color:'#8B3A3A', padding:'0.8rem 1.2rem', fontSize:'0.8rem', marginBottom:'1rem', border:'1px solid rgba(139,58,58,0.15)' }}>
                  {suiviError}
                </div>
              )}

              {suiviResult && (
                <div style={{ background:'white', border:'1px solid rgba(196,150,10,0.18)', padding:'1.8rem', textAlign:'left' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.2rem' }}>
                    <div>
                      <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.4rem', color:'#C4960A' }}>{suiviResult.numero}</div>
                      <div style={{ fontSize:'0.7rem', color:'#C4B090', marginTop:'0.2rem' }}>
                        {new Date(suiviResult.createdAt).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}
                      </div>
                    </div>
                    <span style={{
                      background:(STATUT_LABELS[suiviResult.statut]?.color||'#8A7B68')+'15',
                      color:STATUT_LABELS[suiviResult.statut]?.color||'#8A7B68',
                      padding:'0.25rem 0.7rem', fontSize:'0.68rem', fontWeight:600,
                    }}>
                      {STATUT_LABELS[suiviResult.statut]?.label||suiviResult.statut}
                    </span>
                  </div>
                  {suiviResult.lignes?.map((l,i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'0.5rem 0', borderTop:'1px solid #F0EBE0', fontSize:'0.82rem' }}>
                      <span style={{ color:'#1A1208' }}>{l.produit?.nom ?? 'Produit'} <span style={{ color:'#C4960A' }}>{l.taille}</span> × {l.quantite}</span>
                      <span style={{ color:'#1A1208' }}>{(Number(l.prixUnitaire)*l.quantite).toFixed(0)} DT</span>
                    </div>
                  ))}
                  <div style={{ display:'flex', justifyContent:'space-between', paddingTop:'0.8rem', borderTop:'2px solid #EDE5D4', marginTop:'0.5rem' }}>
                    <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1rem', color:'#1A1208' }}>Total</span>
                    <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.2rem', color:'#C4960A' }}>{Number(suiviResult.montantTotal).toFixed(0)} DT</span>
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </section>

        {/* ════ FOOTER ════ */}
        <footer style={{ background: "#120E08", padding: "5% 6% 0" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr",
              gap: "4rem",
              paddingBottom: "4rem",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "Cormorant Garamond,serif",
                  fontSize: "1.7rem",
                  letterSpacing: "0.28em",
                  color: "white",
                  textTransform: "uppercase",
                  marginBottom: "0.25rem",
                }}
              >
                ✿ NUANCES
              </div>
              <div
                style={{
                  fontSize: "0.58rem",
                  letterSpacing: "0.22em",
                  color: "#C4960A",
                  textTransform: "uppercase",
                  marginBottom: "1.4rem",
                }}
              >
                — PARFUMS —
              </div>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "rgba(255,255,255,0.3)",
                  lineHeight: 1.85,
                  fontWeight: 300,
                }}
              >
                Extraits de parfum d&apos;excellente qualité.
                <br />
                Représentant officiel V.o Aromatiques.
                <br />
                Nabeul 8000, Tunisie.
              </p>
              <a
                href="https://www.google.com/maps/place/Nuances+Parfums/@36.4547717,10.7338328,17z/data=!3m1!4b1!4m6!3m5!1s0x130299000c2e3b5f:0x8cf69e4033a7386!8m2!3d36.4547674!4d10.7364077!16s%2Fg%2F11msf5xmmr?entry=ttu&g_ep=EgoyMDI2MDMyNC4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: "1rem",
                  fontSize: "0.75rem",
                  color: "#C4960A",
                  textDecoration: "none",
                }}
              >
                Voir sur Google Maps →
              </a>
              <div
                style={{
                  marginTop: "1rem",
                  background: "#1A1208",
                  border: "1px solid rgba(196,150,10,0.25)",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    color: "#C4960A",
                    fontSize: "0.72rem",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    padding: "0.55rem 0.75rem",
                    animation: "nuanceRibbon 14s linear infinite",
                  }}
                >
                  ✿ Nuances Parfums · Nabeul 8000 · @nuances.parfums · +216 96 557 557 ·
                </div>
              </div>

              <div
                style={{
                  marginTop: "0.9rem",
                  width: "100%",
                  border: "1px solid rgba(196,150,10,0.2)",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 16px 40px rgba(26,18,8,0.12)",
                  background: "#ffffff",
                }}
              >
                <iframe
                  title="Nuances Parfums - Google Maps"
                  src="https://maps.google.com/maps?q=Nuances%20Parfums%20Nabeul&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="220"
                  style={{ border: 0, display: "block" }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
            {[
              {
                title: "Navigation",
                links: [
                  ["Collections", "/boutique"],
                  ["Classiques", "/boutique"],
                  ["Niche", "/boutique"],
                  ["À Propos", "/a-propos"],
                ],
              },
              {
                title: "Contact",
                links: [
                  ["📍 Google Maps", "https://www.google.com/maps/place/Nuances+Parfums/@36.4547717,10.7338328,17z/data=!3m1!4b1!4m6!3m5!1s0x130299000c2e3b5f:0x8cf69e4033a7386!8m2!3d36.4547674!4d10.7364077!16s%2Fg%2F11msf5xmmr?entry=ttu&g_ep=EgoyMDI2MDMyNC4wIKXMDSoASAFQAw%3D%3D"],
                  ["📸 Instagram", "https://www.instagram.com/nuances.parfums/"],
                  ["📘 Facebook", "https://www.facebook.com/profile.php?id=61584307961028"],
                  ["💬 WhatsApp", "https://wa.me/21696557557"],
                  ["📞 +216 96 557 557", "tel:+21696557557"],
                  ["🕐 Lun–Sam 9h–18h", "#"],
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4
                  style={{
                    fontSize: "0.65rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "#C4960A",
                    marginBottom: "1.4rem",
                    fontWeight: 500,
                  }}
                >
                  {col.title}
                </h4>
                <ul style={{ listStyle: "none" }}>
                  {col.links.map(([label, href]) => (
                    <li key={label} style={{ marginBottom: "0.65rem" }}>
                      <Link
                        href={href}
                        style={{
                          fontSize: "0.8rem",
                          color: "rgba(255,255,255,0.38)",
                          textDecoration: "none",
                          transition: "color 0.3s",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.color = "#C4960A";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.color =
                            "rgba(255,255,255,0.38)";
                        }}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div
            style={{
              padding: "1.5rem 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.2)" }}>
              © 2026 Nuances Parfums · Tous droits réservés
            </span>
            <span
              style={{
                fontSize: "0.68rem",
                color: "rgba(255,255,255,0.2)",
                fontStyle: "italic",
                fontFamily: "Cormorant Garamond,serif",
              }}
            >
              ✦ Excellence · Authenticité · Raffinement ✦
            </span>
          </div>
        </footer>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-11px); }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes nuanceRibbon {
            0%   { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-thumb {
            background: #C4960A;
            border-radius: 2px;
          }
        `}</style>
      </main>
    </>
  )
}
