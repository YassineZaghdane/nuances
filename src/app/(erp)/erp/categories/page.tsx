"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ErpPage, ErpPagination } from "@/components/erp/ErpPage";

type CategorieRow = {
  id: string;
  nom: string;
  slug: string;
  _count: { produits: number };
};

export default function ErpCategoriesPage() {
  const [categories, setCategories] = useState<CategorieRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const PER = 20;

  useEffect(() => {
    fetch("/api/categories")
      .then(r => r.json())
      .then(d => setCategories(Array.isArray(d) ? d : []));
  }, []);

  const filtered = useMemo(
    () => categories.filter(c => c.nom.toLowerCase().includes(search.toLowerCase())),
    [categories, search]
  );
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PER, page * PER),
    [filtered, page]
  );

  const allSelected = filtered.length > 0 && selectedIds.length === filtered.length;

  const toggleSelection = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const deleteOne = async (c: CategorieRow) => {
    if (!confirm(`Supprimer "${c.nom}" ?`)) return;
    setError('');
    const res = await fetch(`/api/categories/${c.id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || 'Erreur suppression');
      return;
    }
    setCategories(prev => prev.filter(x => x.id !== c.id));
    setSelectedIds(prev => prev.filter(x => x !== c.id));
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Supprimer ${selectedIds.length} catégorie(s) ?`)) return;
    setError('');
    const results = await Promise.all(
      selectedIds.map(id => fetch(`/api/categories/${id}`, { method: "DELETE" }).then(r => r.json().then(d => ({ id, ok: r.ok, error: d.error }))))
    );
    const failed = results.filter(r => !r.ok);
    if (failed.length > 0) setError(failed.map(f => f.error).join(' · '));
    const deleted = results.filter(r => r.ok).map(r => r.id);
    setCategories(prev => prev.filter(x => !deleted.includes(x.id)));
    setSelectedIds([]);
  };

  return (
    <ErpPage
      title="Catégories"
      subtitle={`${categories.length} catégorie${categories.length !== 1 ? 's' : ''}`}
      actions={
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input
            placeholder="Rechercher…"
            value={search}
            onChange={e => { setSearch(e.target.value); setSelectedIds([]); setPage(1); }}
            style={{ padding: '0.38rem 0.9rem', fontSize: '0.78rem', border: '1px solid #EDE5D4', background: '#FDFAF5', color: '#1A1208', outline: 'none', width: '200px', fontFamily: 'Jost,sans-serif', borderRadius: '3px' }}
          />
          {selectedIds.length > 0 && (
            <button
              onClick={deleteSelected}
              style={{ fontSize: "0.7rem", color: "#8B3A3A", border: "1px solid #FAEAEA", padding: "0.35rem 0.7rem", background: "#FAEAEA", cursor: "pointer", borderRadius: "3px" }}
            >
              Supprimer {selectedIds.length}
            </button>
          )}
          <Link href="/erp/categories/nouvelle" style={{ fontSize: "0.75rem", color: "white", background: "#1A1208", textDecoration: "none", padding: "0.45rem 0.8rem", borderRadius: "3px" }}>
            Nouvelle catégorie
          </Link>
        </div>
      }
    >
      {error && (
        <div style={{ background: '#FAEAEA', border: '1px solid rgba(139,58,58,0.2)', color: '#8B3A3A', padding: '0.7rem 1rem', fontSize: '0.8rem', marginBottom: '1rem', borderRadius: '3px' }}>
          {error}
        </div>
      )}
      <div style={{ background: "#FDFAF5", border: "1px solid #EDE5D4", borderRadius: "6px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#FAF7F2", borderBottom: "1px solid #EDE5D4" }}>
              <th style={{ padding: "0.75rem" }}>
                <input type="checkbox" checked={allSelected} onChange={e => setSelectedIds(e.target.checked ? filtered.map(c => c.id) : [])} />
              </th>
              <th style={{ padding: "0.75rem", fontWeight: 500, color: "#1A1208" }}>Nom</th>
              <th style={{ padding: "0.75rem", fontWeight: 500, color: "#1A1208" }}>Slug</th>
              <th style={{ padding: "0.75rem", fontWeight: 500, color: "#1A1208" }}>Produits</th>
              <th style={{ padding: "0.75rem", fontWeight: 500, color: "#1A1208" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#C4B090", fontSize: "0.8rem" }}>
                  Aucune catégorie
                </td>
              </tr>
            )}
            {paginated.map(c => (
              <tr key={c.id} style={{ borderBottom: "1px solid #F0EBE0" }}>
                <td style={{ padding: "0.75rem" }}>
                  <input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => toggleSelection(c.id)} />
                </td>
                <td style={{ padding: "0.75rem", fontWeight: 500, color: "#1A1208" }}>{c.nom}</td>
                <td style={{ padding: "0.75rem", color: "#8A7B68", fontFamily: 'monospace', fontSize: '0.78rem' }}>{c.slug}</td>
                <td style={{ padding: "0.75rem", color: "#C4960A" }}>{c._count.produits}</td>
                <td style={{ padding: "0.75rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <Link href={`/erp/categories/${c.id}`} style={{ color: "#C4960A", fontSize: "0.75rem", textDecoration: "none" }}>Modifier</Link>
                  <button onClick={() => deleteOne(c)} style={{ fontSize: "0.68rem", color: "#8B3A3A", border: "1px solid #FAEAEA", padding: "0.2rem 0.55rem", background: "#FAEAEA", cursor: "pointer", borderRadius: "3px" }}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '0.9rem 1.5rem', borderTop: '1px solid #EDE5D4' }}>
          <ErpPagination page={page} total={filtered.length} perPage={PER} onPage={setPage} />
        </div>
      </div>
    </ErpPage>
  );
}
