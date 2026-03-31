"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const STATUTS = ["EN_ATTENTE", "CONFIRMEE", "EN_PREPARATION", "EXPEDIEE", "LIVREE", "ANNULEE"];

export function CommandesFilters({ statut, q }: { statut?: string; q?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(q ?? "");

  const setFilter = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete("page");
      router.push(`/erp/commandes?${next.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex gap-2 flex-wrap">
        <Button variant={!statut ? "default" : "outline"} size="sm" onClick={() => setFilter("statut", "")}>
          Tous
        </Button>
        {STATUTS.map((s) => (
          <Button key={s} variant={statut === s ? "default" : "outline"} size="sm" onClick={() => setFilter("statut", s)}>
            {s}
          </Button>
        ))}
      </div>
      <div className="flex gap-2 flex-1 min-w-[200px]">
        <Input placeholder="Numéro ou nom client..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setFilter("q", search)} />
        <Button size="sm" onClick={() => setFilter("q", search)}>Rechercher</Button>
      </div>
    </div>
  );
}
