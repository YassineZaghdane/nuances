import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function toSlug(nom: string) {
  return nom.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { nom } = await req.json();
  if (!nom?.trim()) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

  try {
    const categorie = await prisma.categorie.update({
      where: { id: params.id },
      data: { nom: nom.trim(), slug: toSlug(nom.trim()) },
    });
    return NextResponse.json(categorie);
  } catch (e: any) {
    if (e.code === 'P2002') return NextResponse.json({ error: "Ce nom existe déjà" }, { status: 409 });
    if (e.code === 'P2025') return NextResponse.json({ error: "Catégorie introuvable" }, { status: 404 });
    throw e;
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const count = await prisma.produit.count({ where: { categorieId: params.id } });
  if (count > 0) {
    return NextResponse.json(
      { error: `Impossible : ${count} produit(s) utilisent cette catégorie` },
      { status: 409 }
    );
  }

  await prisma.categorie.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
