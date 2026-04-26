import { CategorieForm } from "@/components/erp/CategorieForm";

export const dynamic = "force-dynamic";

export default function ErpCategoriesNouvellePage() {
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold text-dark">Nouvelle catégorie</h1>
      <CategorieForm mode="creation" />
    </div>
  );
}
