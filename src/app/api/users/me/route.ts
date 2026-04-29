import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { compare, hash } from 'bcryptjs'

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const role = (session.user as { role?: string })?.role
  const userId = (session.user as { id?: string })?.id
  if (role !== 'ADMIN' || !userId) return NextResponse.json({ error: 'Accès interdit' }, { status: 403 })

  const body = await req.json().catch(() => null) as
    | { nom?: string; email?: string; currentPassword?: string; newPassword?: string }
    | null
  if (!body) return NextResponse.json({ error: 'Payload invalide' }, { status: 400 })

  const me = await prisma.user.findUnique({ where: { id: userId } })
  if (!me) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })

  const data: { nom?: string; email?: string; password?: string } = {}
  if (typeof body.nom === 'string' && body.nom.trim()) data.nom = body.nom.trim()
  if (typeof body.email === 'string' && body.email.trim()) data.email = body.email.trim().toLowerCase()

  if (body.newPassword) {
    if (!body.currentPassword) {
      return NextResponse.json({ error: 'Mot de passe actuel requis' }, { status: 400 })
    }
    const ok = await compare(body.currentPassword, me.password)
    if (!ok) return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 400 })
    if (body.newPassword.length < 6) {
      return NextResponse.json({ error: 'Nouveau mot de passe trop court (min 6)' }, { status: 400 })
    }
    data.password = await hash(body.newPassword, 10)
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Aucune donnée à mettre à jour' }, { status: 400 })
  }
  if (data.email && data.email !== me.email) {
    const exists = await prisma.user.findUnique({ where: { email: data.email } })
    if (exists) return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 409 })
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, nom: true, email: true, role: true, actif: true },
  })
  return NextResponse.json(updated)
}
