import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { ErpPage } from "@/components/erp/ErpPage";

export const dynamic = "force-dynamic";

export default async function LivraisonsPage() {
  const livraisons = await prisma.livraison.findMany({
    include: { commande: { include: { client: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <ErpPage title="Livraisons" subtitle={`${livraisons.length} livraisons`}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={{
          background: "#FDFAF5",
          border: "1px solid #EDE5D4",
          borderRadius: "6px",
          overflow: "hidden",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#FAF7F2", borderBottom: "1px solid #EDE5D4" }}>
                <th style={{ padding: "0.75rem", fontWeight: 500, color: "#1A1208" }}>Commande</th>
                <th style={{ padding: "0.75rem", fontWeight: 500, color: "#1A1208" }}>Client</th>
                <th style={{ padding: "0.75rem", fontWeight: 500, color: "#1A1208" }}>Ville</th>
                <th style={{ padding: "0.75rem", fontWeight: 500, color: "#1A1208" }}>Statut</th>
                <th style={{ padding: "0.75rem", fontWeight: 500, color: "#1A1208" }}>Livreur</th>
                <th style={{ padding: "0.75rem", fontWeight: 500, color: "#1A1208" }}></th>
              </tr>
            </thead>
            <tbody>
              {livraisons.map((l) => (
                <tr key={l.id} style={{ borderBottom: "1px solid #F0EBE0" }}>
                  <td style={{ padding: "0.75rem" }}>
                    <Link
                      href={`/erp/commandes/${l.commande.id}`}
                      style={{ color: "#C4960A", fontWeight: 500, textDecoration: "none" }}
                    >
                      {l.commande.numero}
                    </Link>
                  </td>
                  <td style={{ padding: "0.75rem", color: "#1A1208" }}>{l.commande.client.nom}</td>
                  <td style={{ padding: "0.75rem" }}>{l.ville}</td>
                  <td style={{ padding: "0.75rem" }}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        background: l.statut === "LIVREE" ? "#E4F2EB" : l.statut === "EN_COURS" ? "#FFF8E6" : "#F0EBE0",
                        color: l.statut === "LIVREE" ? "#1B5E3B" : l.statut === "EN_COURS" ? "#B8860B" : "#1A1208",
                      }}
                    >
                      {l.statut}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem", color: "#8A7B68" }}>{l.livreur ?? "—"}</td>
                  <td style={{ padding: "0.75rem" }}>
                    <Link
                      href={`/erp/commandes/${l.commande.id}`}
                      style={{ color: "#C4960A", fontSize: "0.75rem", textDecoration: "none" }}
                    >
                      Voir commande
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ErpPage>
  );
}
