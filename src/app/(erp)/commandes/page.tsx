import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { CommandesFilters } from "@/components/erp/CommandesFilters";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function CommandesPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const limit = 20;
  const skip = (page - 1) * limit;

  const where: Prisma.CommandeWhereInput = {};
  if (params.statut) where.statut = params.statut as Prisma.CommandeWhereInput["statut"];
  if (params.q?.trim()) {
    where.OR = [
      { numero: { contains: params.q.trim(), mode: "insensitive" } },
      { client: { nom: { contains: params.q.trim(), mode: "insensitive" } } },
    ];
  }

  const [commandes, total] = await Promise.all([
    prisma.commande.findMany({
      where,
      include: { client: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.commande.count({ where }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold text-dark">Commandes</h1>
      <CommandesFilters statut={params.statut} q={params.q} />
      <div className="rounded-xl border border-warm/20 bg-cream overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-beige border-b border-warm/20">
            <tr>
              <th className="p-3 font-medium text-dark">Numéro</th>
              <th className="p-3 font-medium text-dark">Client</th>
              <th className="p-3 font-medium text-dark">Montant</th>
              <th className="p-3 font-medium text-dark">Statut</th>
              <th className="p-3 font-medium text-dark">Date</th>
              <th className="p-3 font-medium text-dark"></th>
            </tr>
          </thead>
          <tbody>
            {commandes.map((c) => (
              <tr key={c.id} className="border-b border-warm/10 hover:bg-beige/30">
                <td className="p-3 font-medium">
                  <Link href={`/erp/commandes/${c.id}`} className="text-gold hover:underline">
                    {c.numero}
                  </Link>
                </td>
                <td className="p-3 text-dark">{c.client.nom}</td>
                <td className="p-3 text-gold">{formatPrice(Number(c.montantTotal))}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded ${c.statut === "LIVREE" ? "bg-green-100 text-green-800" : c.statut === "ANNULEE" ? "bg-red-100 text-red-800" : "bg-beige text-dark"}`}>
                    {c.statut}
                  </span>
                </td>
                <td className="p-3 text-muted">{new Date(c.createdAt).toLocaleDateString("fr-FR")}</td>
                <td className="p-3">
                  <Link href={`/erp/commandes/${c.id}`} className="text-gold hover:underline text-xs">
                    Détail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center text-sm text-muted">
        <span>{(page - 1) * limit + 1}-{Math.min(page * limit, total)} sur {total}</span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link href={`/erp/commandes?page=${page - 1}${params.statut ? `&statut=${params.statut}` : ""}${params.q ? `&q=${params.q}` : ""}`} className="text-gold hover:underline">
              Précédent
            </Link>
          )}
          {page * limit < total && (
            <Link href={`/erp/commandes?page=${page + 1}${params.statut ? `&statut=${params.statut}` : ""}${params.q ? `&q=${params.q}` : ""}`} className="text-gold hover:underline">
              Suivant
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
