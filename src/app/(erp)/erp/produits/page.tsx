"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ErpPage, ErpPagination } from "@/components/erp/ErpPage";

type ProduitRow = {
  id: string;
  nom: string;
  prix: number;
  actif: boolean;
  categorie?: { id: string; nom: string };
  marque?: { id: string; nom: string } | null;
  stocks?: Array<{ quantite: number }>;
};

const selectStyle: React.CSSProperties = {
  padding: '0.38rem 0.7rem', fontSize: '0.78rem',
  border: '1px solid #EDE5D4', background: '#FDFAF5',
  color: '#1A1208', outline: 'none', fontFamily: 'Jost,sans-serif',
  borderRadius: '3px', cursor: 'pointer',
};

export default function ErpProduitsPage() {
  const [produits,     setProduits]     = useState<ProduitRow[]>([]);
  const [selectedIds,  setSelectedIds]  = useState<string[]>([]);
  const [search,       setSearch]       = useState('');
  const [catFilter,    setCatFilter]    = useState('');
  const [marqueFilter, setMarqueFilter] = useState('');
  const [page,         setPage]         = useState(1);
  const PER = 20;

  useEffect(() => {
    fetch("/api/produits?actif=false")
      .then(r => r.json())
      .then(d => setProduits(Array.isArray(d) ? d : []));
  }, []);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    produits.forEach(p => { if (p.categorie) map.set(p.categorie.id, p.categorie.nom); });
    return Array.from(map.entries()).map(([id, nom]) => ({ id, nom }));
  }, [produits]);

  const marques = useMemo(() => {
    const map = new Map<string, string>();
    produits.forEach(p => { if (p.marque) map.set(p.marque.id, p.marque.nom); });
    return Array.from(map.entries()).map(([id, nom]) => ({ id, nom }));
  }, [produits]);

  const resetFilters = () => { setSearch(''); setCatFilter(''); setMarqueFilter(''); setPage(1); setSelectedIds([]); };
  const anyFilter = !!(search || catFilter || marqueFilter);

  const filtered = useMemo(() => produits.filter(p => {
    if (search       && !p.nom.toLowerCase().includes(search.toLowerCase())) return false;
    if (catFilter    && p.categorie?.id !== catFilter)                        return false;
    if (marqueFilter && p.marque?.id    !== marqueFilter)                     return false;
    return true;
  }), [produits, search, catFilter, marqueFilter]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * PER, page * PER),
    [filtered, page]
  );

  const allSelected = filtered.length > 0 && selectedIds.length === filtered.length;

  const toggleSelection = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const deleteOne = async (p: ProduitRow) => {
    if (!confirm(`Supprimer "${p.nom}" ?`)) return;
    await fetch(`/api/produits/${p.id}`, { method: "DELETE" });
    setProduits(prev => prev.filter(x => x.id !== p.id));
    setSelectedIds(prev => prev.filter(x => x !== p.id));
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Supprimer ${selectedIds.length} produit(s) ?`)) return;
    await Promise.all(selectedIds.map(id => fetch(`/api/produits/${id}`, { method: "DELETE" })));
    setProduits(prev => prev.filter(x => !selectedIds.includes(x.id)));
    setSelectedIds([]);
  };

  return (
    <ErpPage
      title="Produits"
      subtitle={`${filtered.length} / ${produits.length} produits`}
      actions={
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <input
            placeholder="Rechercher…"
            value={search}
            onChange={e => { setSearch(e.target.value); setSelectedIds([]); setPage(1); }}
            style={{ ...selectStyle, width: '160px', cursor: 'text' }}
          />

          <select
            value={catFilter}
            onChange={e => { setCatFilter(e.target.value); setSelectedIds([]); setPage(1); }}
            style={selectStyle}
          >
            <option value="">Toutes catégories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>

          {marques.length > 0 && (
            <select
              value={marqueFilter}
              onChange={e => { setMarqueFilter(e.target.value); setSelectedIds([]); setPage(1); }}
              style={selectStyle}
            >
              <option value="">Toutes marques</option>
              {marques.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
            </select>
          )}

          {anyFilter && (
            <button onClick={resetFilters} style={{ fontSize: "0.7rem", color: "#8A7B68", border: "1px solid #EDE5D4", padding: "0.35rem 0.6rem", background: "transparent", cursor: "pointer", borderRadius: "3px" }}>
              ✕
            </button>
          )}

          {selectedIds.length > 0 && (
            <button onClick={deleteSelected} style={{ fontSize: "0.7rem", color: "#8B3A3A", border: "1px solid #FAEAEA", padding: "0.35rem 0.7rem", background: "#FAEAEA", cursor: "pointer", borderRadius: "3px" }}>
              Supprimer {selectedIds.length}
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
              <th style={{ padding: "0.75rem" }}>
                <input type="checkbox" checked={allSelected} onChange={e => setSelectedIds(e.target.checked ? filtered.map(p => p.id) : [])} />
              </th>
              <th style={{ padding: "0.75rem", fontWeight: 500, color: "#1A1208" }}>Nom</th>
              <th style={{ padding: "0.75rem", fontWeight: 500, color: "#1A1208" }}>Catégorie</th>
              <th style={{ padding: "0.75rem", fontWeight: 500, color: "#1A1208" }}>Marque</th>
              <th style={{ padding: "0.75rem", fontWeight: 500, color: "#1A1208" }}>Stock</th>
              <th style={{ padding: "0.75rem", fontWeight: 500, color: "#1A1208" }}>Actif</th>
              <th style={{ padding: "0.75rem", fontWeight: 500, color: "#1A1208" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "#C4B090", fontSize: "0.8rem" }}>
                  Aucun produit
                </td>
              </tr>
            )}
            {paginated.map(p => {
              const totalStock = (p.stocks || []).reduce((s, x) => s + x.quantite, 0);
              return (
                <tr key={p.id} style={{ borderBottom: "1px solid #F0EBE0" }}>
                  <td style={{ padding: "0.75rem" }}>
                    <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelection(p.id)} />
                  </td>
                  <td style={{ padding: "0.75rem", fontWeight: 500, color: "#1A1208" }}>{p.nom}</td>
                  <td style={{ padding: "0.75rem", color: "#8A7B68" }}>{p.categorie?.nom || "—"}</td>
                  <td style={{ padding: "0.75rem", color: "#8A7B68" }}>{p.marque?.nom || "—"}</td>
                  <td style={{ padding: "0.75rem", color: "#1A1208" }}>{totalStock}</td>
                  <td style={{ padding: "0.75rem" }}>
                    <span style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem", borderRadius: "3px", background: p.actif ? "#E4F2EB" : "#F0EBE0", color: p.actif ? "#2E7D52" : "#8A7B68" }}>
                      {p.actif ? "Actif" : "Inactif"}
                    </span>
                  </td>
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
