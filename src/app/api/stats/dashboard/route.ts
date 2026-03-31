import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Non autorisé" }, { status: 401 });

  const now = new Date();
  const debutMois = startOfMonth(now);
  const finMois = endOfMonth(now);

  const [caMois, nbCommandesMois, nbClientsActifs, stocksEnAlerte] = await Promise.all([
    prisma.commande.aggregate({
      where: {
        statut: "LIVREE",
        createdAt: { gte: debutMois, lte: finMois },
      },
      _sum: { montantTotal: true },
    }),
    prisma.commande.count({
      where: { createdAt: { gte: debutMois, lte: finMois } },
    }),
    prisma.commande.groupBy({
      by: ["clientId"],
      where: { createdAt: { gte: debutMois, lte: finMois } },
    }).then((r) => r.length),
    // Select minimal pour éviter de rapatrier tous les champs produit inutilement
    prisma.stock.findMany({
      select: { quantite: true, seuilAlerte: true, produit: { select: { actif: true } } },
    }).then((stocks) => stocks.filter((s) => s.produit.actif && s.quantite <= s.seuilAlerte).length),
  ]);

  return Response.json({
    caMois: caMois._sum.montantTotal ? Number(caMois._sum.montantTotal) : 0,
    nbCommandesMois,
    nbClientsActifs,
    produitsEnAlerte: stocksEnAlerte,
  });
}
