/**
 * @module SuiviCommande
 * @description API publique — données limitées, pas d'auth
 */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const numero = searchParams.get("numero");

    if (!numero?.trim()) {
      return NextResponse.json({ error: "Numéro requis" }, { status: 400 });
    }

    const commande = await prisma.commande.findUnique({
      where: { numero: numero.trim().toUpperCase() },
      select: {
        numero: true,
        statut: true,
        montantTotal: true,
        createdAt: true,
        villeLivraison: true,
        lignes: {
          select: {
            taille: true,
            quantite: true,
            prixUnitaire: true,
            produit: { select: { nom: true } },
          },
        },
      },
    });

    if (!commande) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    return NextResponse.json({
      ...commande,
      montantTotal: Number(commande.montantTotal),
      lignes: commande.lignes.map((l) => ({
        taille: l.taille,
        quantite: l.quantite,
        prixUnitaire: Number(l.prixUnitaire),
        produit: l.produit,
      })),
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[GET /api/commandes/suivi]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
