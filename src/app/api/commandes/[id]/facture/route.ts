import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { genererNumeroFacture } from "@/lib/order-numbers";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { id } = await params;
    const commande = await prisma.commande.findUnique({
      where: { id },
      include: { client: true, lignes: { include: { produit: true } }, facture: true },
    });

    if (!commande) return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
    if (commande.facture) return NextResponse.json(commande.facture);

    const montantTTC = Number(commande.montantTotal);
    const montantHT  = montantTTC / 1.19;
    const tva        = montantTTC - montantHT;
    const numero     = await genererNumeroFacture();

    const facture = await prisma.facture.create({
      data: { numero, commandeId: id, montantHT, tva, montantTTC },
    });

    return NextResponse.json({
      ...facture,
      montantHT:  Number(facture.montantHT),
      tva:        Number(facture.tva),
      montantTTC: Number(facture.montantTTC),
    });
  } catch (error: unknown) {
    const err = error as Error & { code?: string };
    console.error("[POST /api/commandes/id/facture]", err);
    if (err.code === "P2002") return NextResponse.json({ error: "Facture déjà générée" }, { status: 409 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
