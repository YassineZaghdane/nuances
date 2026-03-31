import { prisma } from "@/lib/prisma";
import { StockActions } from "@/components/erp/StockActions";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  const stocks = await prisma.stock.findMany({
    include: { produit: true },
    orderBy: [{ produit: { nom: "asc" } }, { taille: "asc" }],
  });

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold text-dark">Stock</h1>
      <div className="rounded-xl border border-warm/20 bg-cream overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-beige border-b border-warm/20">
            <tr>
              <th className="p-3 font-medium text-dark">Produit</th>
              <th className="p-3 font-medium text-dark">Taille</th>
              <th className="p-3 font-medium text-dark">Quantité</th>
              <th className="p-3 font-medium text-dark">Seuil alerte</th>
              <th className="p-3 font-medium text-dark">Statut</th>
              <th className="p-3 font-medium text-dark"></th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((s) => {
              const isAlert = s.quantite <= s.seuilAlerte;
              const pct = s.seuilAlerte > 0 ? Math.min(100, (s.quantite / (s.seuilAlerte * 2)) * 100) : 100;
              return (
                <tr key={s.id} className="border-b border-warm/10 hover:bg-beige/30">
                  <td className="p-3 font-medium text-dark">{s.produit.nom}</td>
                  <td className="p-3">{s.taille}</td>
                  <td className="p-3">{s.quantite}</td>
                  <td className="p-3">{s.seuilAlerte}</td>
                  <td className="p-3">
                    <div className="w-24 h-2 bg-beige rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isAlert ? "bg-red-500" : pct < 50 ? "bg-amber-500" : "bg-green-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </td>
                  <td className="p-3">
                    <StockActions stockId={s.id} produitId={s.produitId} taille={s.taille} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
