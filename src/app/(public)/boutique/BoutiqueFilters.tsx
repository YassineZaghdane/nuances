"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import type { Categorie } from "@prisma/client";

export function BoutiqueFilters({
  categories,
  defaultCategorie,
  defaultQ,
}: {
  categories: Categorie[];
  defaultCategorie?: string;
  defaultQ?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setFilter = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.push(`/boutique?${next.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setFilter("categorie", "")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            !defaultCategorie
              ? "bg-gold text-cream"
              : "bg-beige text-dark hover:bg-warm/30"
          }`}
        >
          Tous
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setFilter("categorie", c.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              defaultCategorie === c.id
                ? "bg-gold text-cream"
                : "bg-beige text-dark hover:bg-warm/30"
            }`}
          >
            {c.nom}
          </button>
        ))}
      </div>
      <div className="ml-auto w-full sm:w-64">
        <Input
          type="search"
          placeholder="Rechercher un produit..."
          defaultValue={defaultQ}
          onChange={(e) => {
            const v = e.target.value;
            const tid = setTimeout(() => setFilter("q", v), 300);
            return () => clearTimeout(tid);
          }}
        />
      </div>
    </div>
  );
}
