import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { StatsChart } from '@/components/erp/StatsChart'

async function getData() {
  const now = new Date()
  const debut = new Date(now.getFullYear(), now.getMonth(), 1)
  const debutSemaine = new Date(now.getTime() - 7 * 86400000)

  const [
    caMois, caSemaine,
    cmdMois, cmdAttente,
    cmdLivreesMois,
    clients, alertes,
    derniers, topProduits,
  ] = await Promise.all([
    prisma.commande.aggregate({
      where: { statut: { in: ['LIVREE','EXPEDIEE'] }, createdAt: { gte: debut } },
      _sum: { montantTotal: true }
    }),
    prisma.commande.aggregate({
      where: { statut: { in: ['LIVREE','EXPEDIEE'] }, createdAt: { gte: debutSemaine } },
      _sum: { montantTotal: true }
    }),
    prisma.commande.count({ where: { createdAt: { gte: debut } } }),
    prisma.commande.count({ where: { statut: 'EN_ATTENTE' } }),
    prisma.commande.count({ where: { statut: { in: ['LIVREE','EXPEDIEE'] }, createdAt: { gte: debut } } }),
    prisma.client.count(),
    prisma.stock.count({ where: { quantite: { lte: 5 } } }),
    prisma.commande.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { nom: true } },
        lignes: { select: { quantite: true } }
      }
    }),
    prisma.ligneCommande.groupBy({
      by: ['produitId'],
      _sum: { quantite: true },
      orderBy: { _sum: { quantite: 'desc' } },
      take: 5,
    }).then(async rows => {
      const ids = rows.map(r => r.produitId)
      const prods = await prisma.produit.findMany({
        where: { id: { in: ids } },
        select: { id: true, nom: true }
      })
      return rows.map(r => ({
        nom: prods.find(p => p.id === r.produitId)?.nom || '—',
        qte: r._sum.quantite || 0,
      }))
    }),
  ])

  // Stats par canal — avec try/catch au cas où source n'existe pas encore
  let venteBoutique: { _sum: { montantTotal: number | null }, _count: number } = { _sum: { montantTotal: null }, _count: 0 }
  let venteEnLigne: { _sum: { montantTotal: number | null }, _count: number } = { _sum: { montantTotal: null }, _count: 0 }
  let venteWhatsapp: { _sum: { montantTotal: number | null }, _count: number } = { _sum: { montantTotal: null }, _count: 0 }
  let venteInstagram: { _sum: { montantTotal: number | null }, _count: number } = { _sum: { montantTotal: null }, _count: 0 }

  try {
    const [vB, vW, vI, vS] = await Promise.all([
      prisma.commande.aggregate({
        where: { source: 'BOUTIQUE',  statut: { in: ['LIVREE','EXPEDIEE'] }, createdAt: { gte: debut } },
        _sum: { montantTotal: true }, _count: true,
      }),
      prisma.commande.aggregate({
        where: { source: 'WHATSAPP',  statut: { in: ['LIVREE','EXPEDIEE'] }, createdAt: { gte: debut } },
        _sum: { montantTotal: true }, _count: true,
      }),
      prisma.commande.aggregate({
        where: { source: 'INSTAGRAM', statut: { in: ['LIVREE','EXPEDIEE'] }, createdAt: { gte: debut } },
        _sum: { montantTotal: true }, _count: true,
      }),
      prisma.commande.aggregate({
        where: { source: 'SITE_WEB',  statut: { in: ['LIVREE','EXPEDIEE'] }, createdAt: { gte: debut } },
        _sum: { montantTotal: true }, _count: true,
      }),
    ])
    venteBoutique  = vB as { _sum: { montantTotal: number | null }, _count: number }
    venteWhatsapp  = vW as { _sum: { montantTotal: number | null }, _count: number }
    venteInstagram = vI as { _sum: { montantTotal: number | null }, _count: number }
    venteEnLigne   = vS as { _sum: { montantTotal: number | null }, _count: number }
  } catch {
    // source pas encore dans le schema → on ignore
  }

  return {
    caMois, caSemaine, cmdMois, cmdAttente, cmdLivreesMois,
    clients, alertes, derniers, topProduits,
    venteBoutique, venteEnLigne, venteWhatsapp, venteInstagram,
  }
}

const ST: Record<string, { color: string; bg: string; label: string }> = {
  EN_ATTENTE:      { color:'#B8860B', bg:'#FFF8E6', label:'En attente' },
  CONFIRMEE:       { color:'#4A7A9B', bg:'#EEF5FA', label:'Confirmée' },
  EN_PREPARATION:  { color:'#7A5C9B', bg:'#F4EFF9', label:'En prépa.' },
  EXPEDIEE:        { color:'#2E7D52', bg:'#EBF6F0', label:'Expédiée' },
  LIVREE:          { color:'#1B5E3B', bg:'#E4F2EB', label:'Livrée' },
  ANNULEE:         { color:'#8B3A3A', bg:'#FAEAEA', label:'Annulée' },
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  const role = (session.user as { role?: string })?.role || 'EMPLOYE'

  // Vendeur redirigé vers vente sur place
  if (role === 'VENDEUR') redirect('/erp/vente-place')

  const d = await getData()
  const ca          = Number(d.caMois._sum.montantTotal || 0)
  const caSem       = Number(d.caSemaine._sum.montantTotal || 0)
  const caBoutique  = Number(d.venteBoutique._sum.montantTotal || 0)
  const nbBoutique  = Number(d.venteBoutique._count || 0)
  const panierMoyen = d.cmdLivreesMois > 0 ? ca / d.cmdLivreesMois : 0
  const maxQte      = Math.max(...d.topProduits.map(p => p.qte), 1)

  const canaux = [
    {
      label: 'Sur place',
      icon: '🏪',
      ca: Number(d.venteBoutique._sum.montantTotal || 0),
      nb: d.venteBoutique._count,
      color: '#C4960A', bg: '#FFF8E6',
    },
    {
      label: 'Site web',
      icon: '🌐',
      ca: Number(d.venteEnLigne._sum.montantTotal || 0),
      nb: d.venteEnLigne._count,
      color: '#4A7A9B', bg: '#EEF5FA',
    },
    {
      label: 'WhatsApp',
      icon: '💬',
      ca: Number(d.venteWhatsapp._sum.montantTotal || 0),
      nb: d.venteWhatsapp._count,
      color: '#2E7D52', bg: '#E4F2EB',
    },
    {
      label: 'Instagram',
      icon: '📸',
      ca: Number(d.venteInstagram._sum.montantTotal || 0),
      nb: d.venteInstagram._count,
      color: '#C13584', bg: '#FCE4F3',
    },
  ]

  return (
    <div style={{ fontFamily:'Jost,sans-serif', minHeight:'100vh', background:'#F8F5F0' }}>

      {/* TOPBAR */}
      <div className="erp-topbar" style={{
        height:'60px', background:'#FDFAF5',
        borderBottom:'1px solid #EDE5D4',
        display:'flex', alignItems:'center',
        justifyContent:'space-between', padding:'0 2rem',
        position:'sticky', top:0, zIndex:50,
      }}>
        <div>
          <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.15rem', color:'#1A1208' }}>
            Dashboard
          </span>
          <span style={{ fontSize:'0.7rem', color:'#C4B090', marginLeft:'1rem' }}>
            {new Date().toLocaleDateString('fr-FR', {
              weekday:'long', day:'numeric', month:'long', year:'numeric'
            })}
          </span>
        </div>
        <div style={{ display:'flex', gap:'0.7rem' }}>
          {d.cmdAttente > 0 && (
            <Link href="/erp/commandes?statut=EN_ATTENTE" style={{
              background:'#FFF3CC', color:'#B8860B',
              border:'1px solid #E8C96A',
              padding:'0.38rem 0.9rem', fontSize:'0.7rem',
              fontFamily:'Jost,sans-serif', textDecoration:'none',
              display:'flex', alignItems:'center', gap:'0.4rem',
            }}>
              ⚡ {d.cmdAttente} en attente
            </Link>
          )}
          <Link href="/erp/commandes/nouveau" style={{
            background:'#1A1208', color:'white',
            padding:'0.38rem 1rem', fontSize:'0.7rem',
            letterSpacing:'0.1em', textTransform:'uppercase',
            textDecoration:'none', fontFamily:'Jost,sans-serif',
          }}>+ Commande</Link>
        </div>
      </div>

      <div className="erp-dashboard-content" style={{ padding:'2rem' }}>

        {/* KPI CARDS */}
        <div className="erp-kpi-grid" style={{
          display:'grid', gridTemplateColumns:'repeat(5,1fr)',
          gap:'1rem', marginBottom:'1.5rem',
        }}>
          {[
            { label:'CA ce mois',    value:`${ca.toFixed(0)} DT`,             sub:`${caSem.toFixed(0)} DT cette semaine`,                         accent:'#2E7D52', bg:'#E4F2EB' },
            { label:'Commandes',     value:d.cmdMois.toString(),             sub:`${d.cmdAttente} en attente`,                                   accent:'#B8860B', bg:'#FFF8E6' },
            { label:'Panier moyen',  value:`${panierMoyen.toFixed(0)} DT`,  sub:`${d.cmdLivreesMois} cmd livrées ce mois`,                      accent:'#7A5C9B', bg:'#F4EFF9' },
            { label:'Clients',       value:d.clients.toString(),             sub:'base totale',                                                   accent:'#4A7A9B', bg:'#EEF5FA' },
            { label:'Alertes stock', value:d.alertes.toString(),             sub:d.alertes > 0 ? 'réappro. urgent' : 'Tout est OK',              accent: d.alertes > 0 ? '#8B3A3A' : '#2E7D52', bg: d.alertes > 0 ? '#FAEAEA' : '#E4F2EB' },
          ].map((k, i) => (
            <div key={i} style={{
              background:'#FDFAF5', border:'1px solid #EDE5D4',
              borderRadius:'6px', padding:'1.4rem 1.5rem',
              position:'relative', overflow:'hidden',
            }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:k.accent }}/>
              <div style={{ fontSize:'0.6rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'#C4B090', marginBottom:'0.7rem', marginTop:'0.3rem' }}>{k.label}</div>
              <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'2.2rem', fontWeight:300, color:'#1A1208', lineHeight:1, marginBottom:'0.5rem' }}>{k.value}</div>
              <div style={{ fontSize:'0.68rem', color:k.accent, background:k.bg, display:'inline-block', padding:'0.15rem 0.5rem', borderRadius:'3px' }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* CHART VENTES */}
        <StatsChart />

        {/* RÉPARTITION CANAUX DE VENTE */}
        <div style={{
          background:'#FDFAF5', border:'1px solid #EDE5D4',
          borderRadius:'6px', overflow:'hidden', marginBottom:'1.5rem',
        }}>
          <div style={{
            padding:'1rem 1.5rem', borderBottom:'1px solid #EDE5D4',
            display:'flex', justifyContent:'space-between', alignItems:'center',
          }}>
            <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.05rem', color:'#1A1208' }}>
              Canaux de vente — ce mois
            </span>
            <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1rem', color:'#C4960A' }}>
              Total : {ca.toFixed(0)} DT
            </span>
          </div>
          <div className="erp-channels-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)' }}>
            {canaux.map((canal, i) => {
              const pct = ca > 0 ? (canal.ca / ca) * 100 : 0
              return (
                <div key={canal.label} style={{
                  padding:'1.4rem 1.5rem',
                  borderRight: i < 3 ? '1px solid #EDE5D4' : 'none',
                }}>
                  <div style={{ fontSize:'1.4rem', marginBottom:'0.5rem' }}>{canal.icon}</div>
                  <div style={{ fontSize:'0.62rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'#C4B090', marginBottom:'0.4rem' }}>{canal.label}</div>
                  <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.8rem', fontWeight:300, color:'#1A1208', lineHeight:1, marginBottom:'0.3rem' }}>
                    {canal.ca.toFixed(0)} DT
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.5rem' }}>
                    <span style={{ fontSize:'0.7rem', color:canal.color, background:canal.bg, padding:'0.12rem 0.45rem', borderRadius:'3px' }}>
                      {canal.nb} cmd
                    </span>
                    <span style={{ fontSize:'0.7rem', color:'#C4B090' }}>{pct.toFixed(0)}%</span>
                  </div>
                  <div style={{ height:'3px', background:'#EDE5D4', borderRadius:'2px', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,${canal.color},${canal.color}99)`, borderRadius:'2px' }}/>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* GRILLE PRINCIPALE */}
        <div className="erp-main-grid" style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:'1rem', alignItems:'start' }}>

          {/* DERNIÈRES COMMANDES */}
          <div className="erp-orders-card" style={{ background:'#FDFAF5', border:'1px solid #EDE5D4', borderRadius:'6px', overflow:'hidden' }}>
            <div style={{ padding:'1rem 1.5rem', borderBottom:'1px solid #EDE5D4', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.05rem', color:'#1A1208' }}>Dernières commandes</span>
              <Link href="/erp/commandes" style={{ fontSize:'0.68rem', color:'#C4960A', textDecoration:'none' }}>Voir tout →</Link>
            </div>
            <div className="erp-orders-table-wrap" style={{ overflowX: 'auto' }}>
              <table style={{ width:'100%', minWidth:'720px', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#FAF7F2' }}>
                  {['Commande','Client','Articles','Montant','Statut','Date'].map(h => (
                    <th key={h} style={{ padding:'0.65rem 1rem', textAlign:'left', fontSize:'0.6rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'#C4B090', fontWeight:500, borderBottom:'1px solid #EDE5D4' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.derniers.map(cmd => {
                  const st = ST[cmd.statut] || ST.EN_ATTENTE
                  const articles = cmd.lignes.reduce((s, l) => s + l.quantite, 0)
                  return (
                    <tr key={cmd.id} style={{ borderBottom:'1px solid #F0EBE0' }}>
                      <td style={{ padding:'0.8rem 1rem' }}>
                        <Link href={`/erp/commandes/${cmd.id}`} style={{ fontSize:'0.8rem', color:'#C4960A', textDecoration:'none', fontWeight:500 }}>{cmd.numero}</Link>
                      </td>
                      <td style={{ padding:'0.8rem 1rem' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.55rem' }}>
                          <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:'#EDE5D4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.65rem', color:'#8A7B68', fontWeight:600, flexShrink:0 }}>
                            {cmd.client.nom.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontSize:'0.8rem', color:'#1A1208' }}>{cmd.client.nom}</span>
                        </div>
                      </td>
                      <td style={{ padding:'0.8rem 1rem' }}>
                        <span style={{ fontSize:'0.78rem', color:'#8A7B68' }}>{articles}</span>
                      </td>
                      <td style={{ padding:'0.8rem 1rem' }}>
                        <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1rem', color:'#1A1208' }}>{Number(cmd.montantTotal).toFixed(0)} DT</span>
                      </td>
                      <td style={{ padding:'0.8rem 1rem' }}>
                        <span style={{ background:st.bg, color:st.color, padding:'0.18rem 0.55rem', fontSize:'0.62rem', borderRadius:'3px', fontWeight:500 }}>{st.label}</span>
                      </td>
                      <td style={{ padding:'0.8rem 1rem' }}>
                        <span style={{ fontSize:'0.72rem', color:'#C4B090' }}>{new Date(cmd.createdAt).toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit' })}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              </table>
            </div>
          </div>

          {/* COLONNE DROITE */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

            {/* Top produits */}
            <div style={{ background:'#FDFAF5', border:'1px solid #EDE5D4', borderRadius:'6px', overflow:'hidden' }}>
              <div style={{ padding:'1rem 1.5rem', borderBottom:'1px solid #EDE5D4' }}>
                <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.05rem', color:'#1A1208' }}>Top produits</span>
              </div>
              <div style={{ padding:'1rem 1.5rem' }}>
                {d.topProduits.map((p, i) => (
                  <div key={i} style={{ marginBottom:'0.9rem' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.3rem' }}>
                      <span style={{ fontSize:'0.78rem', color:'#1A1208', maxWidth:'180px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.nom}</span>
                      <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'0.95rem', color:'#C4960A' }}>{p.qte}</span>
                    </div>
                    <div style={{ height:'4px', background:'#EDE5D4', borderRadius:'2px', overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${(p.qte/maxQte)*100}%`, background: i === 0 ? 'linear-gradient(90deg,#C4960A,#E8C96A)' : 'linear-gradient(90deg,#D4B896,#C4B090)', borderRadius:'2px' }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions rapides */}
            <div style={{ background:'#FDFAF5', border:'1px solid #EDE5D4', borderRadius:'6px', overflow:'hidden' }}>
              <div style={{ padding:'1rem 1.5rem', borderBottom:'1px solid #EDE5D4' }}>
                <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.05rem', color:'#1A1208' }}>Actions rapides</span>
              </div>
              <div style={{ padding:'0.8rem' }}>
                {[
                  { href:'/erp/commandes',       label:'Gérer les commandes',  sub:`${d.cmdAttente} en attente` },
                  { href:'/erp/vente-place',      label:'Vente sur place',      sub:`${nbBoutique} cmd · ${caBoutique.toFixed(0)} DT ce mois` },
                  { href:'/erp/stock',            label:'Contrôle du stock',    sub:`${d.alertes} alertes` },
                  { href:'/erp/clients',          label:'Base clients',         sub:`${d.clients} clients` },
                  { href:'/erp/finances',         label:'Finances',             sub:`${ca.toFixed(0)} DT ce mois` },
                ].map(item => (
                  <Link key={item.href} href={item.href} style={{
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                    padding:'0.65rem 0.7rem', textDecoration:'none',
                    borderRadius:'4px', transition:'background 0.15s',
                    marginBottom:'0.1rem',
                  }}
                  >
                    <span style={{ fontSize:'0.78rem', color:'#1A1208' }}>{item.label}</span>
                    <span style={{ fontSize:'0.65rem', color:'#C4B090', background:'#F0EBE0', padding:'0.12rem 0.45rem', borderRadius:'3px' }}>{item.sub}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 1100px) {
          .erp-kpi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .erp-channels-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .erp-main-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 700px) {
          .erp-dashboard-content {
            padding: 1rem !important;
          }
          .erp-topbar {
            height: auto !important;
            padding: 0.8rem 1rem !important;
            flex-wrap: wrap !important;
            gap: 0.6rem;
          }
          .erp-kpi-grid,
          .erp-channels-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
