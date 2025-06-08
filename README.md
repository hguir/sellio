# Sellio - Plateforme E-commerce

Sellio est une plateforme qui permet aux commerçants de créer facilement leurs boutiques en ligne à partir de templates personnalisables.

## Fonctionnalités

- Création de boutique en ligne avec templates personnalisables
- Gestion des produits et des stocks
- Panier d'achat et système de commande
- Interface administrateur pour les commerçants
- Interface client pour les acheteurs

## Prérequis

- Node.js 18+
- PostgreSQL
- Compte Stripe (pour les paiements)

## Installation

1. Cloner le repository :
```bash
git clone https://github.com/votre-username/sellio.git
cd sellio
```

2. Installer les dépendances :
```bash
npm install
```

3. Configurer les variables d'environnement :
Créez un fichier `.env` à la racine du projet avec les variables suivantes :
```
DATABASE_URL="postgresql://user:password@localhost:5432/sellio"
NEXTAUTH_SECRET="votre-secret-ici"
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="votre-cle-stripe-secrete"
STRIPE_PUBLISHABLE_KEY="votre-cle-stripe-publique"
```

4. Initialiser la base de données :
```bash
npx prisma migrate dev
```

5. Lancer le serveur de développement :
```bash
npm run dev
```

## Structure du Projet

- `/app` - Routes et composants Next.js
- `/components` - Composants React réutilisables
- `/lib` - Utilitaires et configurations
- `/prisma` - Schéma de base de données et migrations
- `/public` - Fichiers statiques

## Technologies Utilisées

- Next.js 14
- TypeScript
- Prisma
- PostgreSQL
- TailwindCSS
- NextAuth.js
- Stripe

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## Licence

MIT 