import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ErpPage } from "@/components/erp/ErpPage";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: { commandes: { orderBy: { createdAt: "desc" }, take: 20 } },
  });
  if (!client) notFound();

  const caTotal = await prisma.commande.aggregate({
    where: { clientId: id, statut: "LIVREE" },
    _sum: { montantTotal: true },
  });
  const ca = caTotal._sum.montantTotal ? Number(caTotal._sum.montantTotal) : 0;

  return (
    <ErpPage
      title={client.nom}
      subtitle="Fiche client"
      actions={
        <Link
          href="/erp/clients"
          style={{
            fontSize: "0.75rem",
            color: "#8A7B68",
            textDecoration: "none",
            border: "1px solid #EDE5D4",
            padding: "0.35rem 0.8rem",
            borderRadius: "3px",
          }}
        >
          ← Retour aux clients
        </Link>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <div style={{
          background: "#FDFAF5",
          border: "1px solid #EDE5D4",
          borderRadius: "6px",
          padding: "1.5rem",
        }}>
          <p style={{ fontSize: "0.875rem", color: "#8A7B68", marginBottom: "0.25rem" }}>Téléphone</p>
          <p style={{ fontWeight: 500, color: "#1A1208" }}>{client.telephone}</p>
          {client.email && (
            <>
              <p style={{ fontSize: "0.875rem", color: "#8A7B68", marginTop: "0.5rem", marginBottom: "0.25rem" }}>Email</p>
              <p style={{ color: "#1A1208" }}>{client.email}</p>
            </>
          )}
          {client.ville && (
            <>
              <p style={{ fontSize: "0.875rem", color: "#8A7B68", marginTop: "0.5rem", marginBottom: "0.25rem" }}>Ville</p>
              <p style={{ color: "#1A1208" }}>{client.ville}</p>
            </>
          )}
          {client.adresse && (
            <>
              <p style={{ fontSize: "0.875rem", color: "#8A7B68", marginTop: "0.5rem", marginBottom: "0.25rem" }}>Adresse</p>
              <p style={{ color: "#1A1208" }}>{client.adresse}</p>
            </>
          )}
          <p style={{ fontSize: "0.875rem", color: "#8A7B68", marginTop: "0.5rem", marginBottom: "0.25rem" }}>Source</p>
          <p style={{ color: "#1A1208" }}>{client.source}</p>
          <p style={{ marginTop: "1rem", fontWeight: 600, color: "#C4960A" }}>CA total : {formatPrice(ca)}</p>
        </div>
        <div>
          <h2 style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "#1A1208",
            marginBottom: "1rem",
          }}>
            Historique des commandes
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {client.commandes.map((c) => (
              <li
                key={c.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid #F0EBE0",
                }}
              >
                <Link
                  href={`/erp/commandes/${c.id}`}
                  style={{ color: "#C4960A", textDecoration: "none" }}
                >
                  {c.numero}
                </Link>
                <span style={{ fontSize: "0.875rem", color: "#8A7B68" }}>
                  {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                </span>
                <span style={{ fontWeight: 500, color: "#1A1208" }}>{formatPrice(Number(c.montantTotal))}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ErpPage>
  );
}
