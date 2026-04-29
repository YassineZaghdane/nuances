import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const role = (session.user as { role?: string })?.role
  if (role !== 'ADMIN') return NextResponse.json({ error: 'Accès interdit' }, { status: 403 })

  const user = await prisma.user.findUnique({ where: { id: params.id } })
  if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
  if (user.role !== 'VENDEUR') {
    return NextResponse.json({ error: 'Seuls vendeurs sont modifiables ici' }, { status: 400 })
  }

  const body = await req.json().catch(() => null) as
    | { nom?: string; email?: string; role?: string; actif?: boolean; password?: string }
    | null
  if (!body) return NextResponse.json({ error: 'Payload invalide' }, { status: 400 })

  const data: { nom?: string; email?: string; role?: 'VENDEUR'; actif?: boolean; password?: string } = {}
  if (typeof body.nom === 'string' && body.nom.trim()) data.nom = body.nom.trim()
  if (typeof body.email === 'string' && body.email.trim()) data.email = body.email.trim().toLowerCase()
  if (body.role === 'VENDEUR') data.role = body.role
  if (typeof body.actif === 'boolean') data.actif = body.actif
  if (typeof body.password === 'string' && body.password.length >= 6) data.password = await hash(body.password, 10)

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Aucune donnée à mettre à jour' }, { status: 400 })
  }

  if (data.email && data.email !== user.email) {
    const exists = await prisma.user.findUnique({ where: { email: data.email } })
    if (exists) return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 409 })
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data,
    select: { id: true, nom: true, email: true, role: true, actif: true, createdAt: true, updatedAt: true },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const role = (session.user as { role?: string })?.role
  if (role !== 'ADMIN') return NextResponse.json({ error: 'Accès interdit' }, { status: 403 })

  const user = await prisma.user.findUnique({ where: { id: params.id } })
  if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
  if (user.role !== 'VENDEUR') {
    return NextResponse.json({ error: 'Suppression autorisée uniquement pour vendeurs' }, { status: 400 })
  }

  await prisma.user.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
