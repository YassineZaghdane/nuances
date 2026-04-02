/**
 * Requêtes catalogue vitrine : anti-cache agressif (CDN, navigateur, onglet ERP ↔ site).
 */
export const VITRINE_FETCH_INIT: RequestInit = {
  cache: "no-store",
  credentials: "same-origin",
  headers: {
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  },
};

/** Paramètre d’URL unique pour éviter toute clé de cache partagée (Vercel / proxy). */
function bust(url: string) {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}_nc=${Date.now()}`;
}

export function urlListeProduitsComplete() {
  return bust("/api/produits");
}

export function urlsAccueilMisesEnAvant() {
  return {
    featured: bust("/api/produits?featured=true&limit=3"),
    exclusif: bust("/api/produits?exclusif=true&limit=4"),
    nouveaute: bust("/api/produits?nouveaute=true&limit=4"),
    offre: bust("/api/produits?offre=true&limit=4"),
  };
}

export function urlProduitParSlug(slug: string) {
  return bust(`/api/produits/${encodeURIComponent(slug)}`);
}

export function urlListeProduitsErp(limit = 100) {
  return bust(`/api/produits?limit=${limit}`);
}

/** PATCH protégé : cookies de session NextAuth obligatoires. */
export function patchProduit(id: string, body: Record<string, unknown>) {
  return fetch(`/api/produits/${id}`, {
    method: "PATCH",
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
    body: JSON.stringify(body),
  });
}
