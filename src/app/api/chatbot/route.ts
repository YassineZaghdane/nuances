import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import prisma from '@/lib/prisma'
import { rateLimit } from '@/lib/rateLimit'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(req: Request) {
  const ip =
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    'unknown'
  if (!rateLimit(ip, 10, 60000)) {
    return NextResponse.json(
      { message: 'Trop de messages. Patientez une minute.' },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages requis' },
        { status: 400 }
      )
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { message: 'Bonjour ! Je suis Nour, votre conseillère parfum. Comment puis-je vous aider ?' },
      )
    }

    const produits = await prisma.produit.findMany({
      where: { actif: true },
      select: {
        nom: true,
        notes: true,
        description: true,
        prix: true,
        exclusif: true,
        nouveaute: true,
        categorie: { select: { nom: true } },
        stocks: {
          where: { quantite: { gt: 0 } },
          select: { taille: true }
        }
      },
      orderBy: { featured: 'desc' },
      take: 30,
    })

    const catalogue = produits
      .filter(p => p.stocks.length > 0)
      .map(p => {
        const tailles = p.stocks.map(s => s.taille).join(', ')
        const tags = [
          p.exclusif  ? 'EXCLUSIF'  : '',
          p.nouveaute ? 'NOUVEAUTÉ' : '',
        ].filter(Boolean).join(', ')
        return `• ${p.nom} | ${p.notes || ''} | Dès ${Number(p.prix).toFixed(0)} DT | Formats: ${tailles}${tags ? ` | ${tags}` : ''}`
      })
      .join('\n')

    const systemPrompt = `Tu es Nour, conseillère parfum virtuelle de Nuances Parfums, parfumerie de luxe à Nabeul, Tunisie.

TON RÔLE : Aider les clients à trouver leur fragrance idéale.

TON STYLE :
- Chaleureux, expert, élégant
- UNE question à la fois maximum
- Réponses courtes (2-3 phrases max)
- Utilise des métaphores poétiques pour les senteurs

CATALOGUE DISPONIBLE :
${catalogue}

PROCESSUS :
1. Accueil chaleureux
2. Pour soi ou cadeau ?
3. Préférences olfactives (frais/oriental/floral/boisé/épicé)
4. Occasion (quotidien/soirée/bureau)
5. Budget approximatif
6. Recommande 2-3 parfums maximum
7. Oriente vers /boutique pour commander

RÈGLES :
- Recommande UNIQUEMENT les produits du catalogue ci-dessus
- Reste focalisé sur le conseil parfum
- Si commande souhaitée → rediriger vers /boutique`

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role:    m.role    as 'user' | 'assistant',
        content: m.content as string,
      })),
    })

    const text = response.content[0].type === 'text'
      ? response.content[0].text
      : 'Je n\'ai pas pu répondre. Réessayez.'

    return NextResponse.json({ message: text })
  } catch (error: unknown) {
    console.error('[POST /api/chatbot]', error)
    return NextResponse.json(
      { message: 'Une erreur est survenue. Réessayez dans un instant.' },
      { status: 500 }
    )
  }
}
