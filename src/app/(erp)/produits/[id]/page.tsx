import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProduitForm } from "@/components/erp/ProduitForm";

export const dynamic = "force-dynamic";

export default async function EditProduitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const produit = await prisma.produit.findUnique({
    where: { id },
    include: { stocks: true },
  });
  if (!produit) notFound();
  const produitForForm = {
    id: produit.id,
    nom: produit.nom,
    slug: produit.slug,
    description: produit.description ?? undefined,
    notes: produit.notes ?? undefined,
    prix: Number(produit.prix),
    prixAchat: produit.prixAchat ? Number(produit.prixAchat) : undefined,
    images: produit.images,
    actif: produit.actif,
    featured: produit.featured,
    exclusif: produit.exclusif,
    nouveaute: produit.nouveaute,
    offre: produit.offre,
    offreLabel: produit.offreLabel ?? undefined,
    categorieId: produit.categorieId,
    stocks: produit.stocks.map((s) => ({
      taille: s.taille,
      quantite: s.quantite,
      seuilAlerte: s.seuilAlerte,
      prixVente: s.prixVente != null ? Number(s.prixVente) : undefined,
    })),
  };
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold text-dark">Modifier le produit</h1>
      <ProduitForm mode="edition" produit={produitForForm} />
    </div>
  );
}
