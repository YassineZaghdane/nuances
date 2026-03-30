# Nuances Parfums — Plateforme E-commerce

Application fullstack Next.js 14 pour la gestion d'une parfumerie : vitrine publique + ERP interne.

## Stack technique

| Couche          | Technologie                          |
|-----------------|--------------------------------------|
| Framework       | Next.js 14 (App Router)              |
| Langage         | TypeScript                           |
| Base de données | PostgreSQL + Prisma ORM              |
| Auth            | NextAuth.js (JWT + Credentials)      |
| State           | Zustand (panier vitrine)             |
| Styling         | Inline styles + palette gold / beige |

## Structure du projet

```
parfumerie/
├── src/
│   ├── app/
│   │   ├── (public)/          # Vitrine : accueil, boutique, commande, etc.
│   │   ├── (erp)/             # ERP : layout + pages /erp/*
│   │   ├── api/               # Routes API REST
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                # Primitives (button, dialog, Badge, …)
│   │   ├── vitrine/           # Navbar, CartDrawer, ProductCard, …
│   │   └── erp/               # ErpPage, Sidebar, ProduitForm, …
│   ├── lib/                   # prisma, auth, utils, validations
│   ├── hooks/                 # useAnimateOnScroll, …
│   ├── store/                 # cart-store (Zustand)
│   └── types/                 # Types métier partagés
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
├── docs/
│   ├── API.md
│   └── DEPLOYMENT.md
├── middleware.ts              # Protection /erp/* + rôle VENDEUR
├── next.config.js
├── tsconfig.json
└── package.json
```

## Comptes de test

| Rôle    | Email              | Mot de passe |
|---------|--------------------|--------------|
| Admin   | admin@nuances.tn   | admin123     |
| Vendeur | vendeur@nuances.tn | vendeur123   |

## Accès par rôle

| Page                 | Admin | Vendeur |
|----------------------|-------|---------|
| /erp/dashboard       | ✅    | ❌ (redirect vente-place) |
| /erp/commandes       | ✅    | ❌      |
| /erp/vente-place     | ✅    | ✅      |
| /erp/clients         | ✅    | ❌      |
| /erp/produits        | ✅    | ❌      |
| /erp/stock           | ✅    | ❌      |
| /erp/exclusivites    | ✅    | ❌      |
| /erp/finances        | ✅    | ❌      |

Le middleware et la page dashboard redirigent le rôle **VENDEUR** vers `/erp/vente-place` s'il tente d'ouvrir une autre route ERP.

## Fonctionnalités vitrine

- Accueil : hero, bestsellers, exclusivités, suivi de commande, CTA
- Footer contact enrichi : Instagram, Facebook, Google Maps, téléphone + mini-carte
- Boutique : grille produits, filtres catégorie, badges (nouveauté, exclusif, offre)
- Fiche produit : tailles, prix, ajout panier
- Tunnel commande + confirmation avec numéro
- API publique `GET /api/commandes/suivi?numero=…`
- Panier persistant via Zustand (`localStorage`)

## Fonctionnalités ERP

- Dashboard (KPI, canaux vente site / boutique)
- Commandes : liste, détail, mise à jour statut / notes
- Vente sur place (caisse)
- Clients, produits (CRUD, images), exclusivités / offres
- Stock : mouvements entrée / sortie / ajustement, volumétrie
- Finances et factures (PDF HTML)

## API produits (GET)

Paramètres supportés : `limit`, `featured`, `exclusif`, `nouveaute`, `offre`, `actif`, `search` (ou `q`), `categorieId`.  
Réponse triée par `featured` desc puis `createdAt` desc.

## Protection API (mutations)

Les routes `POST` / `PATCH` / `PUT` / `DELETE` sensibles vérifient la session NextAuth.  
Le rôle **VENDEUR** reçoit `403 Accès interdit` sur les opérations réservées (produits, clients, stock, etc.).  
La création de commande publique reste sur `POST /api/commandes` sans session ERP.

> **Note :** `src/app/api/factures/route.ts` n'expose pour l'instant que `GET` (pas de `POST`).

## Sécurité et robustesse

- Rate limit en mémoire par IP (`src/lib/rateLimit.ts`)
  - `POST /api/commandes` : 20 requêtes / minute
  - `POST /api/chatbot` : 10 requêtes / minute
- Headers HTTP de sécurité dans `next.config.js` :
  - `X-DNS-Prefetch-Control`, `X-Frame-Options`, `X-Content-Type-Options`
  - `Referrer-Policy`, `Permissions-Policy`
- `NEXTAUTH_SECRET` requis dans l'environnement
- `middleware.ts` à la racine (protection ERP)

## Qualité UX / rendering

- Pages globales App Router :
  - `src/app/error.tsx`
  - `src/app/not-found.tsx`
  - `src/app/loading.tsx`
- Routes API dynamiques marquées `force-dynamic` sur les endpoints qui utilisent `request.url` / `searchParams` (commandes, suivi, stock alertes, volumétrie)

## Base de données (aperçu)

Modèles principaux (détail dans `prisma/schema.prisma`) : `User`, `Categorie`, `Produit`, `Stock`, `StockKilo`, `MouvementStock`, `Client`, `Commande`, `LigneCommande`, `Livraison`, `Facture`.

## Commandes utiles

```bash
npm install
npm run dev              # http://localhost:3000
npm run build
npm run start
npm run db:push          # synchroniser le schéma
npm run db:seed          # données de démo
npx prisma studio        # exploration DB
```

Variables d'environnement : voir `.env.example` et `docs/DEPLOYMENT.md`.

## Documentation complémentaire

- [docs/API.md](docs/API.md) — endpoints
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — déploiement
