import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Non autorisé" }, { status: 401 });

  const stocks = await prisma.stock.findMany({
    include: { produit: true },
    orderBy: [{ produit: { nom: "asc" } }, { taille: "asc" }],
  });

  return Response.json(
    stocks.map((s) => ({
      ...s,
      produit: {
        id: s.produit.id,
        nom: s.produit.nom,
        slug: s.produit.slug,
      },
    }))
  );
}
