# Déploiement Nuances Parfums

## Prérequis
- Node.js 18+
- PostgreSQL 14+
- npm 9+

## Installation
```bash
git clone [repo]
cd parfumerie
npm install
cp .env.example .env
# Remplir les variables dans .env
npm run db:push
npm run db:seed
npm run build
npm run start
```

## Variables d'environnement requises
- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- NEXT_PUBLIC_APP_URL
- NEXT_PUBLIC_WHATSAPP

## Comptes par défaut
| Rôle    | Email              | Mot de passe |
|---------|--------------------|--------------|
| Admin   | admin@nuances.tn   | admin123     |
| Vendeur | vendeur@nuances.tn | vendeur123   |

## Accès par rôle
| Page              | Admin | Vendeur |
|-------------------|-------|---------|
| /erp/dashboard    | ✅    | ❌      |
| /erp/commandes    | ✅    | ❌      |
| /erp/vente-place  | ✅    | ✅      |
| /erp/produits     | ✅    | ❌      |
| /erp/stock        | ✅    | ❌      |
| /erp/exclusivites | ✅    | ❌      |
| /erp/finances     | ✅    | ❌      |
