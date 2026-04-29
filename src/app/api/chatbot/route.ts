import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import prisma from '@/lib/prisma'
import { rateLimit } from '@/lib/rateLimit'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

type ChatMsg = { role: 'user' | 'assistant'; content: string }
type QuickOption = { label: string; value: string }
type Cta = { label: string; href: string }
type ParsedNeed = {
  recipient?: 'self' | 'gift'
  families: string[]
  occasion?: 'daily' | 'office' | 'soiree' | 'date' | 'summer' | 'winter'
  budgetMax?: number
}

function parseNeed(messages: ChatMsg[]): ParsedNeed {
  const userText = messages
    .filter(m => m.role === 'user')
    .map(m => m.content.toLowerCase())
    .join(' ')

  const families: string[] = []
  const has = (re: RegExp) => re.test(userText)

  if (has(/\bfrais|fraiche|fresh|agrum|citron|bergamot|marine|propre\b/)) families.push('frais')
  if (has(/\bfloral|fleur|rose|jasmin|iris|violette\b/)) families.push('floral')
  if (has(/\bbois|boise|cedre|santal|vetiver|oud\b/)) families.push('boise')
  if (has(/\borient|ambre|vanill|epice|musc|sensuel\b/)) families.push('oriental')

  let occasion: ParsedNeed['occasion']
  if (has(/\bbureau|travail|professionnel\b/)) occasion = 'office'
  else if (has(/\bsoir|mariage|event|occasion speciale|fete\b/)) occasion = 'soiree'
  else if (has(/\brendez[- ]?vous|date\b/)) occasion = 'date'
  else if (has(/\bete|chaleur|summer\b/)) occasion = 'summer'
  else if (has(/\bhiver|winter|froid\b/)) occasion = 'winter'
  else if (has(/\bquotidien|tous les jours|journalier\b/)) occasion = 'daily'

  let recipient: ParsedNeed['recipient']
  if (has(/\bcadeau|offrir|pour mon ami|pour ma femme|pour mon mari|pour ma soeur|pour mon frere\b/)) recipient = 'gift'
  else if (has(/\bpour moi|moi-meme|moi même|je cherche\b/)) recipient = 'self'

  const budgetMatch = userText.match(/(\d{2,4})\s*(dt|dinar|dinars)?/)
  const budgetMax = budgetMatch ? Number(budgetMatch[1]) : undefined

  return { recipient, families, occasion, budgetMax }
}

function askNextQuestion(need: ParsedNeed): string | null {
  if (!need.recipient) {
    return "Parfait. C'est pour vous ou pour un cadeau ?"
  }
  if (need.families.length === 0) {
    return 'Vous aimez plutôt quel style : frais, floral, boisé ou oriental ?'
  }
  if (!need.occasion) {
    return "C'est pour quelle occasion principale : quotidien, bureau ou soirée ?"
  }
  if (!need.budgetMax) {
    return 'Quel budget maximum souhaitez-vous (en DT) ?'
  }
  return null
}

function nextOptions(need: ParsedNeed): QuickOption[] {
  if (!need.recipient) {
    return [
      { label: 'Pour moi', value: 'pour moi meme' },
      { label: 'Pour un cadeau', value: 'pour un cadeau' },
    ]
  }
  if (need.families.length === 0) {
    return [
      { label: 'Frais', value: 'frais' },
      { label: 'Floral', value: 'floral' },
      { label: 'Boise', value: 'boise' },
      { label: 'Oriental', value: 'oriental' },
    ]
  }
  if (!need.occasion) {
    return [
      { label: 'Quotidien', value: 'quotidien' },
      { label: 'Bureau', value: 'bureau' },
      { label: 'Soiree', value: 'soiree' },
    ]
  }
  if (!need.budgetMax) {
    return [
      { label: '60 DT', value: '60 dt' },
      { label: '100 DT', value: '100 dt' },
      { label: '150 DT', value: '150 dt' },
      { label: '200 DT', value: '200 dt' },
    ]
  }
  return []
}

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
    const { messages } = body as { messages?: ChatMsg[] }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages requis' }, { status: 400 })
    }
    // Validation : max 20 messages, rôles autorisés uniquement (anti-injection)
    if (messages.length > 20) {
      return NextResponse.json({ error: 'Trop de messages' }, { status: 400 })
    }
    for (const m of messages as ChatMsg[]) {
      if (typeof m !== 'object' || !m) {
        return NextResponse.json({ error: 'Format de messages invalide' }, { status: 400 })
      }
      if (m.role !== 'user' && m.role !== 'assistant') {
        return NextResponse.json({ error: 'Rôle de message invalide' }, { status: 400 })
      }
      if (typeof m.content !== 'string' || m.content.length > 2000) {
        return NextResponse.json({ error: 'Contenu de message invalide' }, { status: 400 })
      }
    }

    const produits = await prisma.produit.findMany({
      where: { actif: true },
      select: {
        id: true,
        slug: true,
        nom: true,
        notes: true,
        description: true,
        prix: true,
        exclusif: true,
        nouveaute: true,
        featured: true,
        categorie: { select: { nom: true } },
        stocks: {
          select: { taille: true, quantite: true }
        }
      },
      orderBy: { featured: 'desc' },
      take: 80,
    })

    const catalogueRows = produits.map(p => {
      const stockTotal = p.stocks.reduce((s, st) => s + (st.quantite || 0), 0)
      const taillesEnStock = p.stocks.filter(st => (st.quantite || 0) > 0).map(st => st.taille)
      return {
        ...p,
        stockTotal,
        inStock: stockTotal > 0,
        taillesEnStock,
      }
    })

    const need = parseNeed(messages as ChatMsg[])
    const followUp = askNextQuestion(need)
    if (followUp) {
      return NextResponse.json({
        message: `Je vous accompagne pas a pas pour trouver le parfum ideal.\n${followUp}`,
        options: nextOptions(need),
      })
    }

    const scoreFamily = (text: string) => {
      let s = 0
      const lower = text.toLowerCase()
      if (need.families.includes('frais') && /frais|agrum|citron|marine|vert/.test(lower)) s += 3
      if (need.families.includes('floral') && /floral|fleur|rose|jasmin|iris/.test(lower)) s += 3
      if (need.families.includes('boise') && /bois|boise|oud|santal|cedre|vetiver/.test(lower)) s += 3
      if (need.families.includes('oriental') && /orient|ambre|vanille|epice|musc/.test(lower)) s += 3
      return s
    }

    const rankedAll = catalogueRows
      .map(p => {
        const text = `${p.nom} ${p.notes || ''} ${p.description || ''} ${p.categorie?.nom || ''}`
        let score = scoreFamily(text)
        if (need.occasion === 'office' && /frais|floral|propre|leger/.test(text.toLowerCase())) score += 2
        if (need.occasion === 'soiree' && /orient|bois|ambre|intense|oud/.test(text.toLowerCase())) score += 2
        if (need.occasion === 'summer' && /frais|agrum|marine/.test(text.toLowerCase())) score += 2
        if (need.occasion === 'winter' && /bois|orient|ambre|vanille/.test(text.toLowerCase())) score += 2
        if (need.recipient === 'gift' && p.featured) score += 1
        if (p.exclusif) score += 0.5
        if (p.nouveaute) score += 0.5

        const prix = Number(p.prix || 0)
        if (need.budgetMax) {
          if (prix <= need.budgetMax) score += 2
          else if (prix <= need.budgetMax + 15) score += 1
          else score -= 4
        }

        return { ...p, prix, score }
      })
      .filter(p => (need.budgetMax ? p.prix <= need.budgetMax + 15 : true))
      .sort((a, b) => b.score - a.score)

    const ranked = rankedAll.filter(p => p.inStock).slice(0, 3)
    const ruptureTop = rankedAll.filter(p => !p.inStock).slice(0, 2)

    if (ranked.length === 0) {
      return NextResponse.json({
        message:
          "Je ne vois pas encore de parfum adapte a ces criteres exacts. Donnez-moi un budget un peu plus flexible ou une autre famille olfactive (frais, floral, boise, oriental), et je vous propose des options immediates.",
        options: [
          { label: 'Changer la famille', value: 'je veux une autre famille' },
          { label: 'Augmenter budget a 150 DT', value: '150 dt' },
          { label: 'Augmenter budget a 200 DT', value: '200 dt' },
        ],
      })
    }

    const recoText = ranked
      .map((p, i) => {
        const hints = [p.notes, p.categorie?.nom].filter(Boolean).join(' · ')
        const formats = p.taillesEnStock.length ? ` | formats: ${p.taillesEnStock.join(', ')}` : ''
        return `${i + 1}) ${p.nom} — ${hints || 'profil elegant'} — des ${p.prix.toFixed(0)} DT${formats}`
      })
      .join('\n')

    const ruptureText = ruptureTop.length
      ? `\n\nNote stock: certains parfums proches de votre recherche sont actuellement en rupture (${ruptureTop.map(p => p.nom).join(', ')}). Je vous ai propose des alternatives disponibles maintenant.`
      : ''

    const baseMessage = `Voici mes recommandations adaptees a votre besoin (stock actuel) :\n${recoText}${ruptureText}\n\nVous pouvez commander directement ici : /boutique\nSi vous voulez, je peux vous dire lequel choisir en priorite selon "tenue", "projection" ou "cadeau".`
    const ctas: Cta[] = [
      { label: 'Voir toute la boutique', href: '/boutique' },
      ...ranked.map(p => ({ label: `Voir ${p.nom}`, href: `/boutique/${p.slug}` })),
    ]

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ message: baseMessage, ctas })
    }

    try {
      const stylePrompt = `Tu es Nour, conseillere parfum. Reformule la reponse suivante en francais simple, chaleureux, 4-7 lignes maximum, tres orientee action. Garde exactement les recommandations et /boutique.\n\n${baseMessage}`
      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 250,
        system: 'Sois concise, claire et commerciale sans inventer de produits.',
        messages: [{ role: 'user', content: stylePrompt }],
      })
      const text = response.content[0].type === 'text' ? response.content[0].text : baseMessage
      return NextResponse.json({ message: text, ctas })
    } catch {
      return NextResponse.json({ message: baseMessage, ctas })
    }
  } catch (error: unknown) {
    console.error('[POST /api/chatbot]', error)
    return NextResponse.json(
      { message: 'Une erreur est survenue. Réessayez dans un instant.' },
      { status: 500 }
    )
  }
}
