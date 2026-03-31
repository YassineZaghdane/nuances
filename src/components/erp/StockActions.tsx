"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function StockActions({ stockId, produitId, taille }: { stockId: string; produitId: string; taille: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"ENTREE" | "SORTIE" | "AJUSTEMENT">("ENTREE");
  const [quantite, setQuantite] = useState(1);
  const [raison, setRaison] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stock/mouvement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produitId, taille, type, quantite, raison: raison || undefined }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setOpen(false);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Ajuster</Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/50" onClick={() => setOpen(false)}>
          <div className="bg-cream rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-lg font-semibold text-dark mb-4">Ajuster le stock</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-muted mb-1">Type</label>
                <select value={type} onChange={(e) => setType(e.target.value as "ENTREE" | "SORTIE" | "AJUSTEMENT")} className="w-full h-10 rounded-lg border border-warm/50 px-3">
                  <option value="ENTREE">Entrée</option>
                  <option value="SORTIE">Sortie</option>
                  <option value="AJUSTEMENT">Ajustement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-muted mb-1">Quantité</label>
                <input type="number" min={1} value={quantite} onChange={(e) => setQuantite(parseInt(e.target.value, 10) || 1)} className="w-full h-10 rounded-lg border border-warm/50 px-3" />
              </div>
              <div>
                <label className="block text-sm text-muted mb-1">Raison (optionnel)</label>
                <input type="text" value={raison} onChange={(e) => setRaison(e.target.value)} className="w-full h-10 rounded-lg border border-warm/50 px-3" placeholder="Ex: Réception fournisseur" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
              <Button onClick={submit} disabled={loading}>Valider</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
