/**
 * @module CartStore
 * @description Store Zustand pour le panier client (persistant)
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  id: string;
  produitId: string;
  nom: string;
  taille: string;
  prix: number;
  quantite: number;
  image?: string;
  notes?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantite">) => void;
  removeItem: (id: string, taille: string) => void;
  updateQty: (id: string, taille: string, qty: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.produitId === item.produitId && i.taille === item.taille
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.produitId === item.produitId && i.taille === item.taille
                  ? { ...i, quantite: i.quantite + 1 }
                  : i
              ),
              isOpen: true,
            };
          }
          return {
            items: [...state.items, { ...item, quantite: 1 }],
            isOpen: true,
          };
        });
      },

      removeItem: (id, taille) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.produitId === id && i.taille === taille)
          ),
        })),

      updateQty: (id, taille, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter(
                  (i) => !(i.produitId === id && i.taille === taille)
                )
              : state.items.map((i) =>
                  i.produitId === id && i.taille === taille
                    ? { ...i, quantite: qty }
                    : i
                ),
        })),

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      total: () =>
        get().items.reduce(
          (s, i) => s + (Number(i.prix) || 0) * i.quantite,
          0
        ),
      count: () => get().items.reduce((s, i) => s + i.quantite, 0),
    }),
    {
      name: "nuances-parfums-cart",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
