/**
 * @module SuiviCommande
 * @description API publique — données limitées, pas d'auth
 */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const CANCELLABLE = ["EN_ATTENTE", "CONFIRMEE"] as const;

export const dynamic = "force-dynamic";

const COMMANDE_SELECT = {
  numero: true,
  statut: true,
  montantTotal: true,
  fraisLivraison: true,
  createdAt: true,
  adresseLivraison: true,
  villeLivraison: true,
  lignes: {
    select: {
      taille: true,
      quantite: true,
      prixUnitaire: true,
      produit: { select: { nom: true } },
    },
  },
} as const;

function serialize(commande: {
  numero: string; statut: string; montantTotal: unknown; fraisLivraison: unknown;
  createdAt: Date; adresseLivraison: string | null; villeLivraison: string | null;
  lignes: Array<{ taille: string; quantite: number; prixUnitaire: unknown; produit: { nom: string } | null }>;
}) {
  return {
    ...commande,
    montantTotal: Number(commande.montantTotal),
    fraisLivraison: Number(commande.fraisLivraison ?? 0),
    createdAt: commande.createdAt.toISOString(),
    lignes: commande.lignes.map((l) => ({
      taille: l.taille,
      quantite: l.quantite,
      prixUnitaire: Number(l.prixUnitaire),
      produit: l.produit,
    })),
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id     = searchParams.get("id")?.trim();
    const numero = searchParams.get("numero")?.trim().toUpperCase();

    if (!id && !numero) {
      return NextResponse.json({ error: "Paramètre requis: id ou numero" }, { status: 400 });
    }

    let commande = null;
    if (id) {
      // Try by DB id first, fallback to numero (in case someone passes the numero as id)
      commande = await prisma.commande.findUnique({ where: { id }, select: COMMANDE_SELECT });
      if (!commande) {
        commande = await prisma.commande.findUnique({ where: { numero: id.toUpperCase() }, select: COMMANDE_SELECT });
      }
    } else if (numero) {
      commande = await prisma.commande.findUnique({ where: { numero }, select: COMMANDE_SELECT });
    }

    if (!commande) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    return NextResponse.json(serialize(commande));
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[GET /api/commandes/suivi]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Paramètre requis: id" }, { status: 400 });

    const commande = await prisma.commande.findUnique({
      where: { id },
      include: { lignes: true },
    });

    if (!commande) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

    if (!CANCELLABLE.includes(commande.statut as typeof CANCELLABLE[number])) {
      return NextResponse.json(
        { error: "Cette commande ne peut plus être annulée" },
        { status: 409 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Restore stock for each order line
      for (const ligne of commande.lignes) {
        await tx.stock.updateMany({
          where: { produitId: ligne.produitId, taille: ligne.taille },
          data: { quantite: { increment: ligne.quantite } },
        });
        await tx.mouvementStock.create({
          data: {
            produitId: ligne.produitId,
            taille: ligne.taille,
            type: "ENTREE",
            quantite: ligne.quantite,
            raison: `Annulation client — commande ${commande.numero}`,
          },
        });
      }
      await tx.commande.update({
        where: { id },
        data: { statut: "ANNULEE" },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[POST /api/commandes/suivi]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
