import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STATUTS = ["EN_ATTENTE", "CONFIRMEE", "EN_PREPARATION", "EXPEDIEE", "LIVREE", "ANNULEE", "RETOURNEE"] as const;
type StatutValue = (typeof STATUTS)[number];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { statut } = body as { statut: string };
  if (!statut || !STATUTS.includes(statut as StatutValue)) {
    return Response.json({ error: "Statut invalide" }, { status: 400 });
  }

  const commande = await prisma.commande.findUnique({
    where: { id },
    include: { lignes: true },
  });
  if (!commande) return Response.json({ error: "Commande non trouvée" }, { status: 404 });

  if (statut === "ANNULEE" && commande.statut !== "ANNULEE") {
    for (const ligne of commande.lignes) {
      await prisma.stock.updateMany({
        where: {
          produitId: ligne.produitId,
          taille: ligne.taille,
        },
        data: { quantite: { increment: ligne.quantite } },
      });
      await prisma.mouvementStock.create({
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

  const updated = await prisma.commande.update({
    where: { id },
    data: { statut: statut as StatutValue },
  });

  if (statut === "LIVREE") {
    await prisma.livraison.updateMany({
      where: { commandeId: id },
      data: { statut: "LIVREE", dateLivree: new Date() },
    });
  }

  return Response.json(updated);
}
