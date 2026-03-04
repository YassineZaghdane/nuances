# Nuances Parfums

Application fullstack pour la parfumerie **Nuances Parfums** (Nabeul, Tunisie) : site vitrine e-commerce + ERP de gestion.

## Stack

- **Frontend** : Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend** : Next.js API Routes
- **Base de données** : PostgreSQL + Prisma
- **Auth** : NextAuth.js (credentials, JWT)
- **Charts** : Recharts | **PDF** : @react-pdf/renderer | **Email** : Resend

## Démarrage

```bash
# Copier l'environnement
cp .env.example .env
# Renseigner DATABASE_URL (PostgreSQL) et NEXTAUTH_SECRET

# Installer les dépendances
npm install

# Créer la base et les tables
npx prisma migrate dev --name init

# (Optionnel) Données de test
npm run db:seed

# Lancer le dev
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

- **Site public** : `/`, `/boutique`, `/commande`, etc.
- **ERP** : [http://localhost:3000/erp/dashboard](http://localhost:3000/erp/dashboard)
- **Connexion ERP** : [http://localhost:3000/login](http://localhost:3000/login)  
  (après seed : `admin@nuances.tn` / `admin123`)

## Variables d'environnement

Voir `.env.example`. Obligatoires : `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.  
Optionnel : Resend (emails), Uploadthing (images produits).

## Scripts

- `npm run dev` — serveur de développement
- `npm run build` / `npm run start` — production
- `npm run db:migrate` — migrations Prisma
- `npm run db:seed` — seed (admin + catégories + produits + clients + commandes)
- `npm run db:studio` — Prisma Studio

## Structure

- `app/(public)/` — pages site vitrine
- `app/(erp)/` — pages dashboard ERP (protégées)
- `app/api/` — routes API REST
- `components/vitrine/` — composants site public
- `components/erp/` — composants ERP
- `lib/` — Prisma, auth, utils, validations
- `prisma/` — schéma et seed
