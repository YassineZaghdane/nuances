import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { DetailCommandeActions } from "@/components/erp/DetailCommandeActions";

export const dynamic = "force-dynamic";

export default async function CommandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const commande = await prisma.commande.findUnique({
    where: { id },
    include: {
      client: true,
      lignes: { include: { produit: true } },
      livraison: true,
      facture: true,
    },
  });

  if (!commande) notFound();

  const statuts = ["EN_ATTENTE", "CONFIRMEE", "EN_PREPARATION", "EXPEDIEE", "LIVREE", "ANNULEE"] as const;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-dark">{commande.numero}</h1>
        <DetailCommandeActions commandeId={id} statut={commande.statut} hasFacture={!!commande.facture} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-warm/20 bg-cream p-6">
          <h2 className="font-serif text-lg font-semibold text-dark mb-4">Client</h2>
          <p className="font-medium text-dark">{commande.client.nom}</p>
          <p className="text-muted text-sm">{commande.client.telephone}</p>
          {commande.client.email && <p className="text-muted text-sm">{commande.client.email}</p>}
          <p className="text-muted text-sm mt-2">{commande.adresseLivraison}</p>
          <p className="text-muted text-sm">{commande.villeLivraison}</p>
        </div>

        <div className="rounded-xl border border-warm/20 bg-cream p-6">
          <h2 className="font-serif text-lg font-semibold text-dark mb-4">Livraison</h2>
          {commande.livraison ? (
            <>
              <p className="text-dark">Statut: {commande.livraison.statut}</p>
              {commande.livraison.livreur && <p className="text-muted text-sm">Livreur: {commande.livraison.livreur}</p>}
            </>
          ) : (
            <p className="text-muted">Aucune livraison créée</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-warm/20 bg-cream overflow-hidden">
        <h2 className="font-serif text-lg font-semibold text-dark p-6 pb-0">Lignes</h2>
        <table className="w-full text-left text-sm mt-4">
          <thead className="bg-beige border-y border-warm/20">
            <tr>
              <th className="p-3 font-medium text-dark">Produit</th>
              <th className="p-3 font-medium text-dark">Taille</th>
              <th className="p-3 font-medium text-dark">Qté</th>
              <th className="p-3 font-medium text-dark">Prix unit.</th>
              <th className="p-3 font-medium text-dark">Total</th>
            </tr>
          </thead>
          <tbody>
            {commande.lignes.map((l) => (
              <tr key={l.id} className="border-b border-warm/10">
                <td className="p-3">{l.produit.nom}</td>
                <td className="p-3">{l.taille}</td>
                <td className="p-3">{l.quantite}</td>
                <td className="p-3">{formatPrice(Number(l.prixUnitaire))}</td>
                <td className="p-3 text-gold">{formatPrice(Number(l.prixUnitaire) * l.quantite)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-6 flex justify-end">
          <p className="text-lg font-semibold text-dark">
            Total : {formatPrice(Number(commande.montantTotal))}
          </p>
        </div>
      </div>

      {commande.notes && (
        <div className="rounded-xl border border-warm/20 bg-cream p-6">
          <h2 className="font-serif text-lg font-semibold text-dark mb-2">Notes</h2>
          <p className="text-muted text-sm">{commande.notes}</p>
        </div>
      )}

      <Link href="/erp/commandes" className="text-gold hover:underline text-sm">
        ← Retour aux commandes
      </Link>
    </div>
  );
}
