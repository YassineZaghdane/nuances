"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const STATUTS = ["CONFIRMEE", "EN_PREPARATION", "EXPEDIEE", "LIVREE", "ANNULEE"] as const;

export function DetailCommandeActions({
  commandeId,
  statut,
  hasFacture,
}: {
  commandeId: string;
  statut: string;
  hasFacture: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateStatut = async (newStatut: string) => {
    setLoading(true);
    try {
      await fetch(`/api/commandes/${commandeId}/statut`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: newStatut }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const genererFacture = async () => {
    setLoading(true);
    try {
      await fetch(`/api/commandes/${commandeId}/facture`, { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {STATUTS.filter((s) => s !== statut).map((s) => (
        <Button
          key={s}
          size="sm"
          variant="outline"
          disabled={loading}
          onClick={() => updateStatut(s)}
        >
          → {s}
        </Button>
      ))}
      {!hasFacture && (
        <Button size="sm" disabled={loading} onClick={genererFacture}>
          Générer facture
        </Button>
      )}
    </div>
  );
}
