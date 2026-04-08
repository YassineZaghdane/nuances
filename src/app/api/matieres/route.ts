import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const matieres = await prisma.matierePremiere.findMany({
      orderBy: [{ isDefault: "desc" }, { nom: "asc" }],
    });

    return NextResponse.json(matieres);
  } catch (error) {
    console.error("[GET /api/matieres]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const role = (session.user as { role?: string })?.role;
    if (role === "VENDEUR") {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    const { nom, description, stockMl, seuilAlerte, unite } = await req.json();
    if (!nom) {
      return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
    }

    const matiere = await prisma.matierePremiere.create({
      data: {
        nom: nom.trim(),
        description: description?.trim() || null,
        stockMl: Number(stockMl) || 0,
        seuilAlerte: Number(seuilAlerte) || 500,
        unite: unite === "unité" ? "unité" : "ml",
      },
    });

    return NextResponse.json(matiere, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error & { code?: string };
    console.error("[POST /api/matieres]", err);
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Matière déjà existante" }, { status: 409 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
