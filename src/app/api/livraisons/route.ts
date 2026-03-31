import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const ville = searchParams.get("ville");
  const statut = searchParams.get("statut");
  const date = searchParams.get("date");

  const where: Prisma.LivraisonWhereInput = {};
  if (ville) where.ville = ville;
  if (statut) where.statut = statut as Prisma.LivraisonWhereInput["statut"];
  if (date) {
    const d = new Date(date);
    const start = new Date(d.setHours(0, 0, 0, 0));
    const end = new Date(d.setHours(23, 59, 59, 999));
    where.dateEstimee = { gte: start, lte: end };
  }

  const livraisons = await prisma.livraison.findMany({
    where: Object.keys(where).length ? where : undefined,
    include: { commande: { include: { client: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const serialized = livraisons.map((l) => ({
    ...l,
    commande: {
      ...l.commande,
      montantTotal: Number(l.commande.montantTotal),
    },
  }));

  return Response.json(serialized);
}
