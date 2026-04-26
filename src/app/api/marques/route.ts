import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function toSlug(nom: string) {
  return nom.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const marques = await prisma.marque.findMany({
    select: { id: true, nom: true, slug: true, description: true, _count: { select: { produits: true } } },
    orderBy: { nom: "asc" },
  });

  return NextResponse.json(marques);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { nom, description } = await req.json();
  if (!nom?.trim()) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

  try {
    const marque = await prisma.marque.create({
      data: { nom: nom.trim(), slug: toSlug(nom.trim()), description: description?.trim() || null },
    });
    return NextResponse.json(marque, { status: 201 });
  } catch (e: any) {
    if (e.code === 'P2002') return NextResponse.json({ error: "Ce nom existe déjà" }, { status: 409 });
    throw e;
  }
}
