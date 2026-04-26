import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { MarqueForm } from "@/components/erp/MarqueForm";

export const dynamic = "force-dynamic";

export default async function ErpMarqueEditPage({ params }: { params: { id: string } }) {
  const marque = await prisma.marque.findUnique({
    where: { id: params.id },
    select: { id: true, nom: true, slug: true, description: true },
  });

  if (!marque) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold text-dark">Modifier la marque</h1>
      <MarqueForm mode="edition" marque={marque} />
    </div>
  );
}
