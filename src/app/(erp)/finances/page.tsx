import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ErpPage } from "@/components/erp/ErpPage";

export const dynamic = "force-dynamic";

export default async function FinancesPage() {
  const now = new Date();
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(now, 11 - i);
    return { start: startOfMonth(d), end: endOfMonth(d), label: d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }) };
  });

  const caByMonth = await Promise.all(
    months.map(async (m) => {
      const agg = await prisma.commande.aggregate({
        where: { statut: "LIVREE", createdAt: { gte: m.start, lte: m.end } },
        _sum: { montantTotal: true },
      });
      return { ...m, ca: agg._sum.montantTotal ? Number(agg._sum.montantTotal) : 0 };
    })
  );

  const depenses = await prisma.depense.findMany({
    orderBy: { date: "desc" },
    take: 20,
  });

  return (
    <ErpPage title="Finances" subtitle="CA et dépenses">
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <div style={{
          background: "#FDFAF5",
          border: "1px solid #EDE5D4",
          borderRadius: "6px",
          padding: "1.5rem",
          overflowX: "auto",
        }}>
          <h2 style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "#1A1208",
            marginBottom: "1rem",
          }}>CA mensuel (12 derniers mois)</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #EDE5D4" }}>
                <th style={{ textAlign: "left", padding: "0.5rem", color: "#8A7B68", fontWeight: 500 }}>Mois</th>
                <th style={{ textAlign: "right", padding: "0.5rem", color: "#8A7B68", fontWeight: 500 }}>CA</th>
              </tr>
            </thead>
            <tbody>
              {caByMonth.map((m) => (
                <tr key={m.label} style={{ borderBottom: "1px solid #F0EBE0" }}>
                  <td style={{ padding: "0.5rem", fontWeight: 500, color: "#1A1208" }}>{m.label}</td>
                  <td style={{ padding: "0.5rem", textAlign: "right", color: "#C4960A" }}>{formatPrice(m.ca)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{
          background: "#FDFAF5",
          border: "1px solid #EDE5D4",
          borderRadius: "6px",
          padding: "1.5rem",
        }}>
          <h2 style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "#1A1208",
            marginBottom: "1rem",
          }}>Dernières dépenses</h2>
          {depenses.length === 0 ? (
            <p style={{ fontSize: "0.875rem", color: "#8A7B68" }}>Aucune dépense enregistrée.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #EDE5D4" }}>
                  <th style={{ textAlign: "left", padding: "0.5rem", color: "#8A7B68", fontWeight: 500 }}>Libellé</th>
                  <th style={{ textAlign: "left", padding: "0.5rem", color: "#8A7B68", fontWeight: 500 }}>Catégorie</th>
                  <th style={{ textAlign: "left", padding: "0.5rem", color: "#8A7B68", fontWeight: 500 }}>Date</th>
                  <th style={{ textAlign: "right", padding: "0.5rem", color: "#8A7B68", fontWeight: 500 }}>Montant</th>
                </tr>
              </thead>
              <tbody>
                {depenses.map((d) => (
                  <tr key={d.id} style={{ borderBottom: "1px solid #F0EBE0" }}>
                    <td style={{ padding: "0.5rem", color: "#1A1208" }}>{d.libelle}</td>
                    <td style={{ padding: "0.5rem", color: "#8A7B68" }}>{d.categorie}</td>
                    <td style={{ padding: "0.5rem", color: "#8A7B68" }}>{new Date(d.date).toLocaleDateString("fr-FR")}</td>
                    <td style={{ padding: "0.5rem", textAlign: "right", color: "#8B3A3A" }}>-{formatPrice(Number(d.montant))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </ErpPage>
  );
}
