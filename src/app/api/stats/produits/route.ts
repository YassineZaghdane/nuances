import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Non autorisé" }, { status: 401 });

  const lignes = await prisma.ligneCommande.findMany({
    where: {
      commande: { statut: "LIVREE" },
    },
    include: { produit: true },
  });

  const byProduct = new Map<string, { nom: string; quantite: number; montant: number }>();
  for (const l of lignes) {
    const key = l.produitId;
    const existing = byProduct.get(key);
    const qty = l.quantite;
    const montant = Number(l.prixUnitaire) * qty;
    if (existing) {
      existing.quantite += qty;
      existing.montant += montant;
    } else {
      byProduct.set(key, { nom: l.produit.nom, quantite: qty, montant });
    }
  }

  const data = Array.from(byProduct.entries()).map(([id, v]) => ({
    produitId: id,
    nom: v.nom,
    quantite: v.quantite,
    montant: v.montant,
  }));

  return Response.json(data);
}
