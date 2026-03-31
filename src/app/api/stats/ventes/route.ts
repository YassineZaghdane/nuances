import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek, subWeeks } from "date-fns";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Non autorisé" }, { status: 401 });

  const nbSemaines = 8;
  const result: { semaine: string; montant: number; anneePrecedente: number }[] = [];

  for (let i = 0; i < nbSemaines; i++) {
    const fin = endOfWeek(new Date(), { weekStartsOn: 1 });
    const debut = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
    const finSemaine = endOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
    const debutAnneePrecedente = startOfWeek(subWeeks(new Date(), i + 52), { weekStartsOn: 1 });
    const finAnneePrecedente = endOfWeek(subWeeks(new Date(), i + 52), { weekStartsOn: 1 });

    const [ceMois, n1] = await Promise.all([
      prisma.commande.aggregate({
        where: {
          statut: "LIVREE",
          createdAt: { gte: debut, lte: finSemaine },
        },
        _sum: { montantTotal: true },
      }),
      prisma.commande.aggregate({
        where: {
          statut: "LIVREE",
          createdAt: { gte: debutAnneePrecedente, lte: finAnneePrecedente },
        },
        _sum: { montantTotal: true },
      }),
    ]);

    result.unshift({
      semaine: `S${i + 1}`,
      montant: ceMois._sum.montantTotal ? Number(ceMois._sum.montantTotal) : 0,
      anneePrecedente: n1._sum.montantTotal ? Number(n1._sum.montantTotal) : 0,
    });
  }

  return Response.json(result);
}
