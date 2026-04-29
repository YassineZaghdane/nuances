import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const role = (session.user as { role?: string })?.role
  if (role !== 'ADMIN') return NextResponse.json({ error: 'Accès interdit' }, { status: 403 })

  const users = await prisma.user.findMany({
    where: { role: 'VENDEUR' },
    select: { id: true, nom: true, email: true, role: true, actif: true, createdAt: true, updatedAt: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const role = (session.user as { role?: string })?.role
  if (role !== 'ADMIN') return NextResponse.json({ error: 'Accès interdit' }, { status: 403 })

  const body = await req.json().catch(() => null) as
    | { nom?: string; email?: string; password?: string; role?: string; actif?: boolean }
    | null
  if (!body) return NextResponse.json({ error: 'Payload invalide' }, { status: 400 })

  const nom = (body.nom || '').trim()
  const email = (body.email || '').trim().toLowerCase()
  const password = body.password || ''
  const userRole = body.role === 'VENDEUR' ? 'VENDEUR' : null
  if (!nom || !email || password.length < 6 || !userRole) {
    return NextResponse.json({ error: 'Données invalides (nom, email, role, mot de passe >= 6)' }, { status: 400 })
  }

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 409 })

  const passwordHash = await hash(password, 10)
  const user = await prisma.user.create({
    data: {
      nom,
      email,
      password: passwordHash,
      role: userRole,
      actif: body.actif !== false,
    },
    select: { id: true, nom: true, email: true, role: true, actif: true, createdAt: true, updatedAt: true },
  })
  return NextResponse.json(user, { status: 201 })
}
