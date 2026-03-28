import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { envoyerAlerteStock } from "@/lib/email";

const TAILLE_ML: Record<string, number> = {
  "1ml": 1,
  "2ml": 2,
  "5ml": 5,
  "10ml": 10,
  "15ml": 15,
  "30ml": 30,
  "50ml": 50,
  "100ml": 100,
};

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

    const body = await req.json();
    const { produitId, taille, type, quantite, raison } = body as {
      produitId: string;
      taille: string;
      type: "ENTREE" | "SORTIE" | "AJUSTEMENT";
      quantite: number;
      raison?: string;
    };

    if (!produitId || !taille || !type || quantite == null) {
      return NextResponse.json(
        { error: "Champs requis: produitId, taille, type, quantite" },
        { status: 400 }
      );
    }

    const q = Number(quantite);
    if (!Number.isFinite(q) || q < 0) {
      return NextResponse.json({ error: "quantite invalide" }, { status: 400 });
    }

    const ml = TAILLE_ML[taille] ?? 0;

    const stock = await prisma.stock.findFirst({
      where: { produitId, taille },
    });

    let nouvelleQte = stock?.quantite ?? 0;
    if (type === "ENTREE") nouvelleQte += q;
    if (type === "SORTIE") nouvelleQte = Math.max(0, nouvelleQte - q);
    if (type === "AJUSTEMENT") nouvelleQte = q;

    const stockMaj = await prisma.stock.upsert({
      where: {
        produitId_taille: { produitId, taille },
      },
      update: { quantite: nouvelleQte },
      create: {
        produitId,
        taille,
        volumeMl: ml,
        quantite: nouvelleQte,
        seuilAlerte: 5,
      },
    });

    const userId = (session.user as { id?: string }).id;

    const mouvement = await prisma.mouvementStock.create({
      data: {
        produitId,
        taille,
        volumeMl: ml,
        type,
        quantite: q,
        raison: raison || null,
        userId: userId || null,
      },
    });

    if (stockMaj.quantite <= stockMaj.seuilAlerte) {
      const produit = await prisma.produit.findUnique({
        where: { id: produitId },
        select: { nom: true, actif: true },
      });
      if (produit?.actif) {
        envoyerAlerteStock([
          {
            produitNom: produit.nom,
            taille: stockMaj.taille,
            quantite: stockMaj.quantite,
            seuilAlerte: stockMaj.seuilAlerte,
          },
        ]).catch((err) => console.error("[Email alerte stock]", err));
      }
    }

    return NextResponse.json({ stock: stockMaj, mouvement });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[POST /api/stock/mouvement]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
