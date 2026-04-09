import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Non autorisé' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const periode = searchParams.get('periode') || 'semaine' // jour | semaine | mois

  const now = new Date()
  let debut: Date
  let points: { label: string; debut: Date; fin: Date }[] = []

  if (periode === 'jour') {
    // 30 derniers jours
    debut = new Date(now)
    debut.setDate(debut.getDate() - 29)
    debut.setHours(0, 0, 0, 0)

    for (let i = 0; i < 30; i++) {
      const d = new Date(debut)
      d.setDate(d.getDate() + i)
      const fin = new Date(d)
      fin.setHours(23, 59, 59, 999)
      points.push({
        label: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        debut: new Date(d),
        fin,
      })
    }
  } else if (periode === 'semaine') {
    // 12 dernières semaines
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i * 7)
      // Lundi de la semaine
      const lundi = new Date(d)
      const day = lundi.getDay()
      const diff = day === 0 ? -6 : 1 - day
      lundi.setDate(lundi.getDate() + diff)
      lundi.setHours(0, 0, 0, 0)
      const dimanche = new Date(lundi)
      dimanche.setDate(dimanche.getDate() + 6)
      dimanche.setHours(23, 59, 59, 999)

      const weekNum = getWeekNumber(lundi)
      points.push({
        label: `S${weekNum}`,
        debut: new Date(lundi),
        fin: new Date(dimanche),
      })
    }
    // Dédupliquer (même semaine peut apparaître deux fois près de minuit)
    const seen = new Set<string>()
    points = points.filter(p => {
      if (seen.has(p.label)) return false
      seen.add(p.label)
      return true
    })
  } else {
    // 12 derniers mois
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const fin = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
      points.push({
        label: d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
        debut: d,
        fin,
      })
    }
  }

  // Fetch toutes les commandes dans la plage globale
  const debutGlobal = points[0].debut
  const finGlobal = points[points.length - 1].fin

  const commandes = await prisma.commande.findMany({
    where: { createdAt: { gte: debutGlobal, lte: finGlobal } },
    select: {
      createdAt: true,
      montantTotal: true,
      statut: true,
    },
  })

  const result = points.map(({ label, debut, fin }) => {
    const inPeriode = commandes.filter(
      c => c.createdAt >= debut && c.createdAt <= fin
    )
    const livrees = inPeriode.filter(c =>
      c.statut === 'LIVREE' || c.statut === 'EXPEDIEE'
    )
    const ca = livrees.reduce((s, c) => s + Number(c.montantTotal), 0)
    const nbCommandes = inPeriode.length
    const nbLivrees = livrees.length
    const panierMoyen = nbLivrees > 0 ? ca / nbLivrees : 0

    return {
      label,
      ca: Math.round(ca * 100) / 100,
      commandes: nbCommandes,
      panierMoyen: Math.round(panierMoyen * 100) / 100,
    }
  })

  return Response.json(result)
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}
