import { ProduitForm } from "@/components/erp/ProduitForm";

export const dynamic = "force-dynamic";

export default async function ErpProduitsNouveauPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold text-dark">Nouveau produit</h1>
      <ProduitForm mode="creation" />
    </div>
  );
}
