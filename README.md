# Nuances Parfums — ERP & E-commerce

> Plateforme Next.js unifiée avec vitrine publique, tunnel de commande, API métier et back-office ERP.

## Stack technique
| Technologie | Version exacte | Usage |
|---|---:|---|
| next | `14.2.15` | Framework web App Router |
| react | `^18.3.1` | UI |
| react-dom | `^18.3.1` | rendu React |
| typescript | `^5` | typage |
| prisma | `^5.22.0` | migrations/outils DB |
| @prisma/client | `^5.22.0` | ORM runtime |
| next-auth | `^4.24.7` | authentification ERP (credentials + JWT) |
| bcryptjs | `^2.4.3` | hash/verify mots de passe |
| zustand | `^4.5.5` | state panier vitrine |
| zod | `^3.23.8` | validation schémas |
| react-hook-form | `^7.53.2` | formulaires |
| @hookform/resolvers | `^3.3.4` | intégration RHF + Zod |
| @anthropic-ai/sdk | `^0.39.0` | chatbot IA |
| resend | `^4.8.0` | envoi emails |
| @react-pdf/renderer | `^3.4.4` | présent mais non exploité (PDF actuel en HTML) |
| recharts | `^2.13.3` | graphiques ERP |
| @tanstack/react-table | `^8.20.5` | présent, peu exploité |
| tailwindcss | `^4.2.1` | styles utilitaires |
| @tailwindcss/postcss | `^4.2.1` | plugin PostCSS |
| postcss | `^8.5.6` | pipeline CSS |
| autoprefixer | `^10.4.27` | préfixes CSS |
| tailwindcss-animate | `^1.0.7` | animations utilitaires |
| class-variance-authority | `^0.7.0` | variantes UI |
| clsx | `^2.1.1` | classes conditionnelles |
| tailwind-merge | `^2.5.4` | fusion classes Tailwind |
| date-fns | `^3.6.0` | dates/statistiques |
| lucide-react | `^0.460.0` | icônes |
| critters | `^0.0.23` | optimisation CSS critique |
| radix UI packages | versions `^1.x/^2.x` | composants dialog/label/menus/tabs/toast |

## Structure du projet
Arborescence réelle de `src/` (fichiers présents actuellement) :

```txt
src/
  app/
    (public)/
      layout.tsx
      page.tsx
      a-propos/page.tsx
      boutique/page.tsx
      boutique/[slug]/page.tsx
      boutique/BoutiqueFilters.tsx
      commande/page.tsx
      commande/confirmation/page.tsx
      contact/page.tsx
    (erp)/
      layout.tsx
      dashboard/page.tsx
      commandes/page.tsx
      commandes/[id]/page.tsx
      clients/page.tsx
      clients/[id]/page.tsx
      produits/page.tsx
      produits/nouveau/page.tsx
      produits/[id]/page.tsx
      stock/page.tsx
      livraisons/page.tsx
      finances/page.tsx
      finances/factures/page.tsx
      parametres/page.tsx
      erp/...(doublons/redirects et variantes client-side)
    api/
      auth/[...nextauth]/route.ts
      chatbot/route.ts
      categories/route.ts
      clients/route.ts
      clients/[id]/route.ts
      commandes/route.ts
      commandes/suivi/route.ts
      commandes/[id]/route.ts
      commandes/[id]/statut/route.ts
      commandes/[id]/facture/route.ts
      livraisons/route.ts
      livraisons/[id]/route.ts
      produits/route.ts
      produits/[param]/route.ts
      factures/route.ts
      factures/[id]/pdf/route.ts
      stock/route.ts
      stock/alertes/route.ts
      stock/mouvement/route.ts
      stock/volumetrie/route.ts
      stats/dashboard/route.ts
      stats/produits/route.ts
      stats/ventes/route.ts
    globals.css
    layout.tsx
    loading.tsx
    error.tsx
    not-found.tsx
    login/page.tsx
    providers.tsx
  components/
    erp/
    ui/
    vitrine/
  hooks/
  lib/
  store/
  types/
```

Descriptions :
- `src/app/(public)` : vitrine, boutique, checkout, pages marketing.
- `src/app/(erp)` : back-office (avec coexistence de pages serveur et pages client dupliquées sous `/erp/erp/...`).
- `src/app/api` : endpoints REST/JSON.
- `src/components/vitrine` : UI front public.
- `src/components/erp` : UI/tableaux/actions ERP.
- `src/components/ui` : primitives UI réutilisables.
- `src/lib` : auth, prisma, email, utils, validations, rate-limit.
- `src/store` : store Zustand panier.

## Pages et routes
### Vitrine publique
| URL | Description | État |
|---|---|---|
| `/` | Landing riche (hero, bestsellers, suivi, CTA) | ✅ complet |
| `/boutique` | Catalogue filtrable, recherche, panier | ✅ complet |
| `/boutique/[slug]` | Fiche produit + ajout panier + WhatsApp | ✅ complet |
| `/commande` | Tunnel commande (panier > coordonnées > validation) | ✅ complet |
| `/commande/confirmation` | Confirmation + suivi commande | ⚠️ partiel (dépend du tracking API et message générique) |
| `/a-propos` | Page institutionnelle | ⚠️ partiel (simple) |
| `/contact` | Coordonnées + liens sociaux | ⚠️ partiel (simple) |
| `/login` | Login ERP credentials | ✅ complet |

### ERP Back-office
| URL | Description | État |
|---|---|---|
| `/erp/dashboard` | KPI + canaux + dernières commandes | ✅ complet |
| `/erp/commandes` | Liste commandes (version server) | ✅ complet |
| `/erp/commandes/[id]` | Détail commande + actions statut/facture | ✅ complet |
| `/erp/vente-place` | Encaissement en boutique | ⚠️ partiel |
| `/erp/clients` | Liste clients + CA | ✅ complet |
| `/erp/clients/[id]` | Fiche client + historique | ✅ complet |
| `/erp/produits` | Listing produits + suppression | ✅ complet |
| `/erp/produits/nouveau` | Création produit | ✅ complet |
| `/erp/produits/[id]` | Édition produit | ✅ complet |
| `/erp/stock` | Stock (version server + actions modal) | ⚠️ partiel (double implémentation avec autre page client) |
| `/erp/stock/volumetrie` | volumétrie ml/kg/flacons | ✅ complet |
| `/erp/exclusivites` | gestion badges offres/exclusifs | ✅ complet |
| `/erp/livraisons` | listing livraisons | ⚠️ partiel |
| `/erp/finances` | CA mensuel + dépenses | ✅ complet |
| `/erp/finances/factures` | listing factures (implémentation fragile) | ⚠️ partiel |
| `/erp/parametres` | placeholders paramètres | ❌ vide fonctionnel |

Notes routes ERP :
- Beaucoup de routes dupliquées existent aussi sous `/erp/erp/...` (certaines redirigent, d’autres ré-implémentent en client-side), ce qui crée de l’ambiguïté.

## API Routes
| Route | Méthodes | Auth | Description |
|---|---|---|---|
| `/api/auth/[...nextauth]` | `GET`, `POST` | Non (endpoint auth) | NextAuth handler |
| `/api/chatbot` | `POST` | Non | Chat IA (rate limit) |
| `/api/categories` | `GET` | Oui | Liste catégories ERP |
| `/api/clients` | `GET`, `POST` | Oui (`POST` interdit vendeur) | CRUD client (partiel) |
| `/api/clients/[id]` | `GET`, `PUT`, `PATCH` | Oui (`PUT/PATCH` interdit vendeur) | Détail & update client |
| `/api/commandes` | `GET`, `POST` | `GET` oui, `POST` public | Liste ERP + création commande |
| `/api/commandes/suivi` | `GET` | Non | Suivi public par numéro |
| `/api/commandes/[id]` | `GET`, `PUT`, `PATCH` | Oui | Détail + update statut/note |
| `/api/commandes/[id]/statut` | `PUT` | Oui | Changement statut + restock annulation |
| `/api/commandes/[id]/facture` | `POST` | Oui | Génération facture |
| `/api/livraisons` | `GET` | Oui | Liste livraisons |
| `/api/livraisons/[id]` | `PUT`, `PATCH` | Oui | Update livraison |
| `/api/produits` | `GET`, `POST` | `GET` public, `POST` oui | Catalogue + création |
| `/api/produits/[param]` | `GET`, `PATCH`, `PUT`, `DELETE` | `GET` public, mutations oui | Détail/édition/suppression |
| `/api/factures` | `GET` | Oui | Liste factures |
| `/api/factures/[id]/pdf` | `GET` | Oui | HTML facture imprimable |
| `/api/stock` | `GET` | Oui | Liste stock |
| `/api/stock/alertes` | `GET` | Oui ou clé cron | Alertes + email |
| `/api/stock/mouvement` | `POST` | Oui (interdit vendeur) | Entrée/sortie/ajustement |
| `/api/stock/volumetrie` | `GET` | Non | Données volumétriques |
| `/api/stats/dashboard` | `GET` | Oui | KPI dashboard |
| `/api/stats/produits` | `GET` | Oui | Stats ventes par produit |
| `/api/stats/ventes` | `GET` | Oui | Série ventes hebdo |

Paramètres principaux (constatés dans le code) :
- `/api/produits` : `limit`, `featured`, `exclusif`, `nouveaute`, `offre`, `actif`, `search|q`, `categorieId`, `include`.
- `/api/commandes` : `page`, `limit`, `statut`, `search|q`, `ville`.
- `/api/commandes/suivi` : `numero` requis.
- `/api/livraisons` : `ville`, `statut`, `date`.
- `/api/stock/volumetrie` : `periode` (`semaine|mois|annee|tout`).
- `/api/stock/alertes` : `key` (cron secret).

## État des modules ERP
### ✅ Modules complets
- Dashboard ERP (KPI, top produits, actions rapides)
- Produits (création/édition/suppression logique)
- Clients (liste + détail + CA)
- Commandes (liste + détail + statuts + facture)
- Volumétrie stock (analytics détaillée)

### ⚠️ Modules partiels
- Vente sur place : fonctionne mais logique paiement/source hétérogène, mapping fragile.
- Livraisons : listing et update API ok, UI limitée.
- Factures : endpoints/listing présents, mais la page `factures` mélange formats de réponse (`facture` vs `commande`) et lien PDF basé sur `id` potentiellement incorrect.
- Stock : deux implémentations (`/erp/stock` server + `/erp/erp/stock` client), comportement non unifié.

### ❌ Modules manquants
- Paramètres (UI vitrine de texte, pas de gestion réelle users/seuils/config).
- Gestion utilisateurs ERP (CRUD rôles) côté UI.

## Bugs connus
1. **P1** — Routes ERP dupliquées (`/erp/...` et `/erp/erp/...`) avec comportements divergents, risque de pages incohérentes et maintenance difficile.
2. **P1** — Incohérence mapping paiements (`ESPECES` côté UI vs enum `ModePaiement`/valeurs API), source de données invalides.
3. **P1** — API `POST /api/commandes` contient des fallbacks Prisma “unknown argument” (champ `source`, `volumeMl*`) : signe de client/schema parfois désalignés.
4. **P2** — Footer dupliqué côté vitrine : footer inline massif dans `src/app/(public)/page.tsx` + composant `src/components/vitrine/Footer.tsx`.
5. **P2** — Animations “disparues/inconstantes” possibles : 2 hooks `useAnimateOnScroll` différents (`src/hooks` et `src/lib`) + beaucoup d’animations inline non centralisées.
6. **P2** — “Page commandes vide” peut se produire selon la route utilisée (version server vs version client doublon), et selon dataset.
7. **P3** — `rateLimit` en mémoire locale (pas distribué), inefficace en multi-instance.

## Schéma base de données
Models et champs clés (`prisma/schema.prisma`) :
- `User`: `id`, `email`, `password`, `nom`, `role`, `actif`, `createdAt`, `updatedAt`
- `Categorie`: `id`, `nom`, `slug`
- `Produit`: `id`, `nom`, `slug`, `description`, `notes`, `prix`, `prixAchat`, `images[]`, `actif`, `featured`, `exclusif`, `nouveaute`, `offre`, `offreLabel`, `categorieId`, timestamps
- `Stock`: `id`, `produitId`, `taille`, `volumeMl`, `quantite`, `seuilAlerte`, `prixVente`, `updatedAt`
- `StockKilo`: `id`, `produitId`, `stockKgTotal`, `stockMlTotal`, `updatedAt`
- `MouvementStock`: `id`, `produitId`, `taille`, `volumeMl`, `type`, `quantite`, `raison`, `userId`, `commandeId`, `createdAt`
- `Client`: `id`, `nom`, `telephone`, `email`, `adresse`, `ville`, `source`, `notes`, timestamps
- `Commande`: `id`, `numero`, `clientId`, `statut`, `modePaiement`, `statutPaiement`, `montantTotal`, `fraisLivraison`, `adresseLivraison`, `villeLivraison`, `notes`, `source`, timestamps
- `LigneCommande`: `id`, `commandeId`, `produitId`, `taille`, `volumeMl`, `volumeMlTotal`, `quantite`, `prixUnitaire`
- `Livraison`: `id`, `commandeId`, `livreur`, `adresse`, `ville`, `statut`, `dateEstimee`, `dateLivree`, `notes`, timestamps
- `Facture`: `id`, `numero`, `commandeId`, `montantHT`, `tva`, `montantTTC`, `pdfUrl`, `createdAt`
- `Depense`: `id`, `libelle`, `montant`, `categorie`, `date`, `userId`, `notes`

Enums :
- `Role`: `ADMIN`, `GERANT`, `EMPLOYE`, `VENDEUR`
- `TypeMouvement`: `ENTREE`, `SORTIE`, `AJUSTEMENT`
- `Source`: `INSTAGRAM`, `WHATSAPP`, `BOUCHE_A_OREILLE`, `BOUTIQUE`, `SITE_WEB`
- `StatutCommande`: `EN_ATTENTE`, `CONFIRMEE`, `EN_PREPARATION`, `EXPEDIEE`, `LIVREE`, `ANNULEE`, `RETOURNEE`
- `ModePaiement`: `CASH`, `VIREMENT`, `PAIEMENT_LIVRAISON`
- `StatutPaiement`: `EN_ATTENTE`, `PARTIEL`, `PAYE`, `REMBOURSE`
- `StatutLivraison`: `EN_ATTENTE`, `EN_COURS`, `LIVREE`, `ECHEC`
- `CatDepense`: `ACHAT_STOCK`, `LIVRAISON`, `MARKETING`, `LOYER`, `AUTRE`

## Rôles et permissions
| Rôle | Accès | Pages autorisées |
|---|---|---|
| `ADMIN` | Full ERP | Toutes les routes `/erp/*` |
| `GERANT` | Identique ADMIN côté code actuel | Toutes les routes `/erp/*` |
| `EMPLOYE` | Restreint comme vendeur dans `Sidebar` mais pas totalement bloqué API/middleware | Principalement `/erp/vente-place` dans UI |
| `VENDEUR` | Redirection middleware hors `/erp/vente-place`; mutations critiques interdites (`403`) | `/erp/vente-place` |

Sources :
- `middleware.ts` : protège `/erp/:path*`, force `VENDEUR` vers `/erp/vente-place`.
- `src/lib/auth.ts` : rôles injectés dans JWT/session.

## Variables d'environnement
| Variable | Obligatoire | Description |
|---|---|---|
| `DATABASE_URL` | Oui | connexion PostgreSQL Prisma |
| `NEXTAUTH_SECRET` | Oui | secret JWT/session |
| `NEXTAUTH_URL` | Oui | URL base NextAuth |
| `NEXT_PUBLIC_APP_URL` | Oui | URL publique app |
| `NEXT_PUBLIC_WHATSAPP` | Oui | numéro WhatsApp public |
| `RESEND_API_KEY` | Oui (emails) | provider email |
| `FROM_EMAIL` | Oui (emails) | expéditeur |
| `ADMIN_EMAIL` | Oui (alertes) | destinataire alertes admin |
| `ANTHROPIC_API_KEY` | Optionnelle | active réponses IA chatbot |
| `CRON_SECRET_KEY` | Optionnelle/recommandée | sécurise endpoint cron alertes |
| `UPLOADTHING_SECRET` | Optionnelle | non utilisée actuellement |
| `UPLOADTHING_APP_ID` | Optionnelle | non utilisée actuellement |

## Ce qui manque pour la production
### P1 — Critique (bloque le déploiement)
- Supprimer la duplication `/erp/erp/*` et garder une seule implémentation par module.
- Aligner définitivement Prisma schema/client (retirer fallbacks “unknown argument”).
- Stabiliser mapping paiements/sources côté vente sur place et API.
- Ajouter vraie stratégie de rate-limit (Redis/upstash) et sécurité distribué.

### P2 — Important (à faire avant livraison)
- Unifier stock/factures/livraisons sur une seule UI robuste.
- Corriger les incohérences de la page factures (format data + lien PDF).
- Centraliser layout/footer/animations pour éviter les régressions visuelles.
- Ajouter tests API critiques (commandes, stock, facturation).

### P3 — Nice to have (peut attendre)
- Cleanup CSS global (beaucoup de styles hérités non utilisés).
- Normaliser style (Tailwind vs inline) pour maintenance.
- Dashboard avancé (drill-down, export, filtres multi-dimensions).

## Ce qui manque pour le SaaS
- **Multi-tenant** : isolation par tenant (DB row-level ou schema par tenant), auth tenant-aware.
- **Facturation SaaS** : plans, abonnement, essais, paiements récurrents.
- **Onboarding** : setup guidé boutique, seed initial, branding.
- **Super-admin** : panel global tenants/utilisation/support.
- **Audit/Sécurité** : journal d’actions, rotation secrets, SSO, conformité.
- **Observabilité** : logs centralisés, métriques, alerting.

## Installation et démarrage
```bash
npm install
npm run dev
npm run build
npm run start
npm run lint
npm run db:push
npm run db:migrate
npm run db:seed
npm run db:studio
```

## Comptes de test
| Rôle | Email | Mot de passe | Accès principal |
|---|---|---|---|
| Admin | `admin@nuances.tn` | `admin123` | ERP complet |
| Vendeur | `vendeur@nuances.tn` | `vendeur123` | Vente sur place uniquement |
