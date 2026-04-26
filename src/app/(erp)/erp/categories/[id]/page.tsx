import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { CategorieForm } from "@/components/erp/CategorieForm";

export const dynamic = "force-dynamic";

export default async function ErpCategorieEditPage({ params }: { params: { id: string } }) {
  const categorie = await prisma.categorie.findUnique({
    where: { id: params.id },
    select: { id: true, nom: true, slug: true },
  });

  if (!categorie) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold text-dark">Modifier la catégorie</h1>
      <CategorieForm mode="edition" categorie={categorie} />
    </div>
  );
}
