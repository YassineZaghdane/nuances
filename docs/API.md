# API Nuances Parfums

## Base URL
`http://localhost:3000/api`

## Authentification
Routes ERP protégées via session NextAuth (cookie).

---

## Produits

### GET /api/produits
| Param     | Type    | Description          |
|-----------|---------|----------------------|
| limit     | number  | Nb de résultats      |
| featured  | boolean | Bestsellers          |
| exclusif  | boolean | Exclusifs            |
| nouveaute | boolean | Nouveautés           |
| offre     | boolean | Offres               |

### PATCH /api/produits/[id]
Auth requise. Body: champs Produit partiels.

### DELETE /api/produits/[id]
Auth requise. Désactive si commandes liées.

---

## Commandes

### GET /api/commandes
Auth. Params: page, limit, statut, search.

### POST /api/commandes
Public. Body: client, lignes, modePaiement, montantTotal.

### GET /api/commandes/suivi?numero=NP-2026-0001
Public. Données limitées (pas de données client).

### PATCH /api/commandes/[id]
Auth. Body: statut, note.

---

## Stock

### POST /api/stock/mouvement
Auth. Body: produitId, taille, type, quantite, raison.

### GET /api/stock/volumetrie
Auth. Analyse kg/ml par produit et catégorie.

---

## Factures

### GET /api/factures/[id]/pdf
Auth. Retourne HTML imprimable.
