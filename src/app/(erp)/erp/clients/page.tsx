"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ErpPage, ErpPagination, ErpTable } from "@/components/erp/ErpPage";

const SOURCE_COLORS: Record<string, string> = {
  INSTAGRAM: "#C13584",
  WHATSAPP: "#25D366",
  BOUTIQUE: "#C4960A",
  SITE_WEB: "#4A7A9B",
};

type ClientRow = {
  id: string;
  nom: string;
  telephone: string;
  email?: string | null;
  ville?: string | null;
  source?: string | null;
  totalCommandes?: number;
  caTotal?: number;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("Tous");
  const [page, setPage] = useState(1);
  const PER = 20;

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((d) => setClients(Array.isArray(d) ? d : []))
      .catch(() => setClients([]));
  }, []);

  const sources = ["Tous", "INSTAGRAM", "WHATSAPP", "BOUTIQUE", "SITE_WEB"];
  const filtered = clients.filter((c) => {
    const matchSearch =
      c.nom?.toLowerCase().includes(search.toLowerCase()) ||
      c.telephone?.includes(search);
    const matchSource = source === "Tous" || c.source === source;
    return matchSearch && matchSource;
  });
  const paginated = filtered.slice((page - 1) * PER, page * PER);

  return (
    <ErpPage
      title="Clients"
      subtitle={`${clients.length} clients au total`}
      actions={
        <input
          placeholder="Rechercher…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{
            padding: "0.38rem 0.9rem",
            fontSize: "0.78rem",
            border: "1px solid #EDE5D4",
            background: "#FDFAF5",
            color: "#1A1208",
            outline: "none",
            width: "200px",
            fontFamily: "Jost,sans-serif",
            borderRadius: "3px",
          }}
        />
      }
    >
      <div
        style={{
          display: "flex",
          gap: "0.3rem",
          marginBottom: "1.2rem",
          flexWrap: "wrap",
        }}
      >
        {sources.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setSource(s);
              setPage(1);
            }}
            style={{
              padding: "0.35rem 0.8rem",
              fontSize: "0.68rem",
              letterSpacing: "0.06em",
              background: source === s ? "#1A1208" : "#FDFAF5",
              color: source === s ? "white" : "#8A7B68",
              border: `1px solid ${source === s ? "#1A1208" : "#EDE5D4"}`,
              cursor: "pointer",
              fontFamily: "Jost,sans-serif",
              borderRadius: "3px",
              transition: "all 0.18s",
            }}
          >
            {s === "Tous" ? "Tous" : s}
          </button>
        ))}
      </div>

      <ErpTable
        headers={[
          "Client",
          "Téléphone",
          "Ville",
          "Source",
          "Commandes",
          "CA total",
          "",
        ]}
        footer={
          <ErpPagination
            page={page}
            total={filtered.length}
            perPage={PER}
            onPage={setPage}
          />
        }
      >
        {paginated.map((c) => (
          <tr
            key={c.id}
            style={{
              borderBottom: "1px solid #F0EBE0",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#FAF7F2";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <td style={{ padding: "0.8rem 1rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.55rem",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#EDE5D4,#D4C4A8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.68rem",
                    color: "#8A7B68",
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {(c.nom || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.82rem",
                      color: "#1A1208",
                      fontWeight: 500,
                    }}
                  >
                    {c.nom}
                  </div>
                  {c.email && (
                    <div style={{ fontSize: "0.68rem", color: "#C4B090" }}>
                      {c.email}
                    </div>
                  )}
                </div>
              </div>
            </td>
            <td style={{ padding: "0.8rem 1rem" }}>
              <span
                style={{
                  fontSize: "0.78rem",
                  color: "#8A7B68",
                  fontFamily: "monospace",
                }}
              >
                {c.telephone}
              </span>
            </td>
            <td style={{ padding: "0.8rem 1rem" }}>
              <span style={{ fontSize: "0.78rem", color: "#1A1208" }}>
                {c.ville ?? "—"}
              </span>
            </td>
            <td style={{ padding: "0.8rem 1rem" }}>
              {c.source && (
                <span
                  style={{
                    fontSize: "0.62rem",
                    fontWeight: 600,
                    color: SOURCE_COLORS[c.source] ?? "#8A7B68",
                    background: `${SOURCE_COLORS[c.source] ?? "#8A7B68"}15`,
                    padding: "0.15rem 0.5rem",
                    borderRadius: "3px",
                  }}
                >
                  {c.source}
                </span>
              )}
            </td>
            <td style={{ padding: "0.8rem 1rem" }}>
              <span
                style={{
                  fontFamily: "Cormorant Garamond,serif",
                  fontSize: "1rem",
                  color: "#1A1208",
                }}
              >
                {c.totalCommandes ?? 0}
              </span>
            </td>
            <td style={{ padding: "0.8rem 1rem" }}>
              <span
                style={{
                  fontFamily: "Cormorant Garamond,serif",
                  fontSize: "1rem",
                  color: "#C4960A",
                }}
              >
                {(c.caTotal ?? 0).toFixed(0)} DT
              </span>
            </td>
            {/* <td style={{ padding: '0.8rem 1rem' }}>
              <Link href={`/erp/clients/${c.id}`} style={{
                fontSize: '0.68rem', color: '#8A7B68', textDecoration: 'none',
                border: '1px solid #EDE5D4', padding: '0.2rem 0.55rem',
                borderRadius: '3px', transition: 'all 0.18s',
              }}>
                Fiche →
              </Link>
            </td> */}
          </tr>
        ))}
      </ErpTable>
    </ErpPage>
  );
}
