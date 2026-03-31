import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STATUTS = ["EN_ATTENTE","CONFIRMEE","EN_PREPARATION","EXPEDIEE","LIVREE","ANNULEE","RETOURNEE"] as const;
type StatutValue = (typeof STATUTS)[number];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { statut } = body as { statut: string };
    if (!statut || !STATUTS.includes(statut as StatutValue)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    // Tout dans une transaction pour atomicité (évite stock partiellement restauré)
    const updated = await prisma.$transaction(async (tx) => {
      const commande = await tx.commande.findUnique({
        where: { id },
        include: { lignes: true },
      });
      if (!commande) throw Object.assign(new Error("Commande non trouvée"), { code: "NOT_FOUND" });

      if (statut === "ANNULEE" && commande.statut !== "ANNULEE") {
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
              raison: `Annulation commande ${commande.numero}`,
              userId: (session.user as { id?: string }).id,
            },
          });
        }
      }

      const result = await tx.commande.update({
        where: { id },
        data: { statut: statut as StatutValue },
      });

      if (statut === "LIVREE") {
        await tx.livraison.updateMany({
          where: { commandeId: id },
          data: { statut: "LIVREE", dateLivree: new Date() },
        });
      }

      return result;
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const err = error as Error & { code?: string };
    console.error("[PUT /api/commandes/id/statut]", err);
    if (err.code === "NOT_FOUND") return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
    if (err.code === "P2025")     return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
