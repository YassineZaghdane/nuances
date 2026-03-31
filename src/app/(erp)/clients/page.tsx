import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    include: { _count: { select: { commandes: true } } },
    orderBy: { nom: "asc" },
  });

  const withCa = await Promise.all(
    clients.map(async (c) => {
      const agg = await prisma.commande.aggregate({
        where: { clientId: c.id, statut: "LIVREE" },
        _sum: { montantTotal: true },
      });
      return { ...c, caTotal: agg._sum.montantTotal ? Number(agg._sum.montantTotal) : 0 };
    })
  );

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold text-dark">Clients</h1>
      <div className="rounded-xl border border-warm/20 bg-cream overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-beige border-b border-warm/20">
            <tr>
              <th className="p-3 font-medium text-dark">Nom</th>
              <th className="p-3 font-medium text-dark">Téléphone</th>
              <th className="p-3 font-medium text-dark">Ville</th>
              <th className="p-3 font-medium text-dark">Source</th>
              <th className="p-3 font-medium text-dark">Commandes</th>
              <th className="p-3 font-medium text-dark">CA total</th>
              <th className="p-3 font-medium text-dark"></th>
            </tr>
          </thead>
          <tbody>
            {withCa.map((c) => (
              <tr key={c.id} className="border-b border-warm/10 hover:bg-beige/30">
                <td className="p-3 font-medium text-dark">{c.nom}</td>
                <td className="p-3 text-muted">{c.telephone}</td>
                <td className="p-3">{c.ville ?? "—"}</td>
                <td className="p-3">{c.source}</td>
                <td className="p-3">{c._count.commandes}</td>
                <td className="p-3 text-gold">{formatPrice(c.caTotal)}</td>
                <td className="p-3">
                  <Link href={`/erp/clients/${c.id}`} className="text-gold hover:underline text-xs">Fiche</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
