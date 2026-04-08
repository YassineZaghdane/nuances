import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const stocks = await prisma.stockKilo.findMany({
    include: { produit: { select: { id: true, nom: true, slug: true } } },
    orderBy: { produit: { nom: "asc" } },
  });

  return NextResponse.json(stocks);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { produitId, stockMl, type } = (await req.json()) as {
      produitId: string;
      stockMl: number;
      type: "ENTREE" | "SORTIE" | "AJUSTEMENT";
    };

    if (!produitId || stockMl == null) {
      return NextResponse.json(
        { error: "Champs requis: produitId, stockMl" },
        { status: 400 }
      );
    }

    const ml = Number(stockMl);
    if (!Number.isFinite(ml) || ml < 0) {
      return NextResponse.json({ error: "stockMl invalide" }, { status: 400 });
    }

    const existing = await prisma.stockKilo.findUnique({ where: { produitId } });
    const actuelMl = existing?.stockMlTotal ?? 0;

    let nouveauMl: number;
    if (type === "ENTREE") {
      nouveauMl = actuelMl + ml;
    } else if (type === "SORTIE") {
      nouveauMl = Math.max(0, actuelMl - ml);
    } else {
      // AJUSTEMENT
      nouveauMl = ml;
    }

    const stockKilo = await prisma.stockKilo.upsert({
      where: { produitId },
      update: {
        stockMlTotal: nouveauMl,
        stockKgTotal: nouveauMl / 1000,
      },
      create: {
        produitId,
        stockMlTotal: nouveauMl,
        stockKgTotal: nouveauMl / 1000,
      },
    });

    return NextResponse.json({ stockKilo });
  } catch (error) {
    console.error("[POST /api/stock/kilo]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
