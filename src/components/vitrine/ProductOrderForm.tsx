"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";

interface ProductOrderFormProps {
  productId: string;
  productName: string;
  productSlug: string;
  productImage?: string;
  productNotes?: string;
  prix: number;
  stocks: { taille: string; quantite: number }[];
}

const TAILLE_PRIX: Record<string, number> = {
  "30ml": 0,
  "50ml": 10,
  "100ml": 20,
};

export function ProductOrderForm({
  productId,
  productName,
  productImage,
  productNotes,
  prix,
  stocks,
}: ProductOrderFormProps) {
  const [taille, setTaille] = useState(stocks[0]?.taille ?? "");
  const [quantite, setQuantite] = useState(1);
  const [adding, setAdding] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const stock = stocks.find((s) => s.taille === taille);
  const maxQty = stock?.quantite ?? 0;
  const prixFinal = prix + (TAILLE_PRIX[taille] || 0);

  const handleAdd = () => {
    if (!taille || maxQty < 1) return;
    const qty = Math.min(quantite, maxQty);
    for (let i = 0; i < qty; i++) {
      addItem({
        id: `${productId}-${taille}`,
        produitId: productId,
        nom: productName,
        taille,
        prix: prixFinal,
        image: productImage,
        notes: productNotes,
      });
    }
    openCart();
    setAdding(true);
    setTimeout(() => setAdding(false), 800);
  };

  if (stocks.length === 0) {
    return (
      <p className="mt-4 text-muted">
        Ce produit est actuellement indisponible.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-dark mb-2">
          Taille
        </label>
        <div className="flex flex-wrap gap-2">
          {stocks.map((s) => (
            <button
              key={s.taille}
              type="button"
              onClick={() => setTaille(s.taille)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                taille === s.taille
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-warm/50 hover:bg-beige"
              }`}
            >
              {s.taille} {s.quantite > 0 && `(${s.quantite} dispo)`}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-dark mb-2">
          Quantité
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuantite((q) => Math.max(1, q - 1))}
            className="h-10 w-10 rounded-lg border border-warm/50"
          >
            −
          </button>
          <span className="w-12 text-center font-medium">{quantite}</span>
          <button
            type="button"
            onClick={() =>
              setQuantite((q) => Math.min(maxQty, q + 1))
            }
            className="h-10 w-10 rounded-lg border border-warm/50"
          >
            +
          </button>
        </div>
      </div>
      <p className="text-sm text-muted">
        Prix : {prixFinal} DT {taille !== "30ml" && `(${taille})`}
      </p>
      <Button
        size="lg"
        className="w-full sm:w-auto"
        onClick={handleAdd}
        disabled={maxQty < 1 || adding}
      >
        {adding ? "✓ Ajouté" : `Ajouter au panier — ${(prixFinal * quantite).toFixed(0)} DT`}
      </Button>
    </div>
  );
}
