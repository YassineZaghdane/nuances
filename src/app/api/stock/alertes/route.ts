export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { envoyerAlerteStock } from '@/lib/email'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const cronKey = searchParams.get('key')
    const isCron  = cronKey === process.env.CRON_SECRET_KEY

    if (!isCron) {
      const session = await getServerSession(authOptions)
      if (!session) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
      }
    }

    const stocks = await prisma.stock.findMany({
      include: {
        produit: { select: { nom: true, actif: true } }
      }
    })

    const alertes = stocks
      .filter(s => s.produit.actif && s.quantite <= s.seuilAlerte)
      .map(s => ({
        produitNom:  s.produit.nom,
        taille:      s.taille,
        quantite:    s.quantite,
        seuilAlerte: s.seuilAlerte,
      }))

    if (alertes.length === 0) {
      return NextResponse.json({
        message: 'Aucune alerte stock',
        alertes: [],
        emailEnvoye: false,
      })
    }

    const emailResult = await envoyerAlerteStock(alertes)

    return NextResponse.json({
      message: `${alertes.length} alerte${alertes.length > 1 ? 's' : ''} trouvée${alertes.length > 1 ? 's' : ''}`,
      emailEnvoye: emailResult.success,
      alertes,
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error('[GET /api/stock/alertes]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
