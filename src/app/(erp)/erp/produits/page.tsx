"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ErpPage, ErpPagination } from "@/components/erp/ErpPage";

type ProduitRow = {
  id: string;
  nom: string;
  prix: number;
  actif: boolean;
  categorie?: { nom: string };
  stocks?: Array<{ quantite: number }>;
};

export default function ErpProduitsPage() {
  const [produits, setProduits] = useState<ProduitRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PER = 20;

  useEffect(() => {
    fetch("/api/produits?actif=false")
      .then((r) => r.json())
      .then((d) => setProduits(Array.isArray(d) ? d : []));
  }, []);

  const filtered = useMemo(
    () => produits.filter(p => p.nom.toLowerCase().includes(search.toLowerCase())),
    [produits, search]
  );
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PER, page * PER),
    [filtered, page]
  );

  const allSelected = useMemo(
    () => filtered.length > 0 && selectedIds.length === filtered.length,
    [filtered.length, selectedIds.length]
  );

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const deleteOne = async (p: ProduitRow) => {
    if (!confirm(`Supprimer "${p.nom}" ?`)) return;
    await fetch(`/api/produits/${p.id}`, { method: "DELETE" });
    setProduits((prev) => prev.filter((x) => x.id !== p.id));
    setSelectedIds((prev) => prev.filter((x) => x !== p.id));
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Supprimer ${selectedIds.length} produit(s) ?`)) return;
    await Promise.all(selectedIds.map((id) => fetch(`/api/produits/${id}`, { method: "DELETE" })));
    setProduits((prev) => prev.filter((x) => !selectedIds.includes(x.id)));
    setSelectedIds([]);
  };

  return (
    <ErpPage
      title="Produits"
      subtitle={`${produits.length} produits`}
      actions={
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input
            placeholder="Rechercher…"
            value={search}
            onChange={e => { setSearch(e.target.value); setSelectedIds([]); setPage(1); }}
            style={{
              padding: '0.38rem 0.9rem', fontSize: '0.78rem',
              border: '1px solid #EDE5D4', background: '#FDFAF5',
              color: '#1A1208', outline: 'none', width: '200px',
              fontFamily: 'Jost,sans-serif', borderRadius: '3px',
            }}
          />
          {selectedIds.length > 0 && (
            <button
              onClick={deleteSelected}
              style={{ fontSize: "0.7rem", color: "#8B3A3A", border: "1px solid #FAEAEA", padding: "0.35rem 0.7rem", background: "#FAEAEA", cursor: "pointer", borderRadius: "3px" }}
            >
              Supprimer {selectedIds.length} produits
            </button>
          )}
          <Link href="/erp/produits/nouveau" style={{ fontSize: "0.75rem", color: "white", background: "#1A1208", textDecoration: "none", padding: "0.45rem 0.8rem", borderRadius: "3px" }}>
            Nouveau produit
          </Link>
        </div>
      }
    >
      <div style={{ background: "#FDFAF5", border: "1px solid #EDE5D4", borderRadius: "6px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#FAF7F2", borderBottom: "1px solid #EDE5D4" }}>
              <th style={{ padding: "0.75rem" }}><input type="checkbox" checked={allSelected} onChange={(e) => setSelectedIds(e.target.checked ? filtered.map((p) => p.id) : [])} /></th>
              <th style={{ padding: "0.75rem", fontWeight: 500, color: "#1A1208" }}>Nom</th>
              <th style={{ padding: "0.75rem", fontWeight: 500, color: "#1A1208" }}>Catégorie</th>
              <th style={{ padding: "0.75rem", fontWeight: 500, color: "#1A1208" }}>Prix</th>
              <th style={{ padding: "0.75rem", fontWeight: 500, color: "#1A1208" }}>Stock total</th>
              <th style={{ padding: "0.75rem", fontWeight: 500, color: "#1A1208" }}>Actif</th>
              <th style={{ padding: "0.75rem", fontWeight: 500, color: "#1A1208" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((p) => {
              const totalStock = (p.stocks || []).reduce((s, x) => s + x.quantite, 0);
              return (
                <tr key={p.id} style={{ borderBottom: "1px solid #F0EBE0" }}>
                  <td style={{ padding: "0.75rem" }}><input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelection(p.id)} /></td>
                  <td style={{ padding: "0.75rem", fontWeight: 500, color: "#1A1208" }}>{p.nom}</td>
                  <td style={{ padding: "0.75rem", color: "#8A7B68" }}>{p.categorie?.nom || "—"}</td>
                  <td style={{ padding: "0.75rem", color: "#C4960A" }}>{Number(p.prix).toFixed(2)} DT</td>
                  <td style={{ padding: "0.75rem" }}>{totalStock}</td>
                  <td style={{ padding: "0.75rem" }}>{p.actif ? "Oui" : "Non"}</td>
                  <td style={{ padding: "0.75rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <Link href={`/erp/produits/${p.id}`} style={{ color: "#C4960A", fontSize: "0.75rem", textDecoration: "none" }}>Modifier</Link>
                    <button onClick={() => deleteOne(p)} style={{ fontSize: "0.68rem", color: "#8B3A3A", border: "1px solid #FAEAEA", padding: "0.2rem 0.55rem", background: "#FAEAEA", cursor: "pointer", borderRadius: "3px" }}>Supprimer</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ padding: '0.9rem 1.5rem', borderTop: '1px solid #EDE5D4' }}>
          <ErpPagination page={page} total={filtered.length} perPage={PER} onPage={setPage} />
        </div>
      </div>
    </ErpPage>
  );
}
