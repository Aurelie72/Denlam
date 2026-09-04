# Denlam — Backend

API Node.js/Express pour le site [denlam.fr](https://denlam.fr) — portfolio et espace d'administration pour Thomas André, menuisier-agenceur et designer d'objets sur mesure (Sarthe, Pays de la Loire).

## Stack technique

- **Node.js** (ESM) + **Express**
- **MongoDB Atlas** (via Mongoose) — base de données
- **Cloudinary** — stockage et optimisation des photos
- **Resend** — envoi des emails de notification (formulaire de contact)
- **JWT** — authentification de l'espace admin
- **Sharp** — redimensionnement/compression des images avant upload
- **Helmet**, **express-rate-limit**, **express-mongo-sanitize** — sécurité

## Installation

```bash
npm install
```

Copie `.env.example` en `.env` et renseigne toutes les valeurs (voir section suivante).

```bash
npm run dev
```

Démarre le serveur en local sur `http://localhost:5000` (ou le `PORT` défini), avec rechargement automatique à chaque modification.

## Variables d'environnement

Voir `.env.example` pour la liste complète et des commentaires. Résumé :

| Variable                                                                 | Description                                                                                                                                |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `MONGODB_URI`                                                            | Chaîne de connexion MongoDB Atlas                                                                                                          |
| `JWT_SECRET`                                                             | Secret de signature des tokens — **à régénérer pour chaque nouvel environnement**, ne jamais réutiliser une valeur ayant transité ailleurs |
| `JWT_EXPIRES_IN`                                                         | Durée de validité d'un token (ex. `7d`)                                                                                                    |
| `PORT`                                                                   | Port d'écoute local (ignoré sur Render, qui gère son propre port)                                                                          |
| `CLIENT_ORIGIN`                                                          | Liste d'origines autorisées en CORS, séparées par des virgules                                                                             |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD`                                      | Identifiants utilisés par `npm run seed:admin`                                                                                             |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Identifiants Cloudinary (stockage photos)                                                                                                  |
| `RESEND_API_KEY`                                                         | Clé API Resend (envoi d'emails)                                                                                                            |
| `MAIL_TO`                                                                | Adresse qui reçoit les notifications de contact                                                                                            |
| `MAIL_FROM`                                                              | Adresse/nom affiché comme expéditeur                                                                                                       |

## Scripts disponibles

| Commande                     | Rôle                                                                                                        |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `npm run dev`                | Démarre le serveur en local avec rechargement automatique                                                   |
| `npm start`                  | Démarre le serveur (utilisé en production par Render)                                                       |
| `npm run seed:admin`         | Crée le compte admin une seule fois, à partir de `ADMIN_USERNAME`/`ADMIN_PASSWORD`                          |
| `npm run change:password`    | Met à jour le mot de passe d'un compte admin déjà existant                                                  |
| `npm run optimize:images`    | Recompresse en WebP toutes les images déjà en base (migration ponctuelle)                                   |
| `npm run migrate:cloudinary` | Transfère les images stockées localement vers Cloudinary (migration ponctuelle, déjà exécutée)              |
| `npm run backup`             | Exporte tout le contenu de la base (créations, plans, messages) dans un fichier JSON local, dans `backups/` |

## Structure du projet

```
src/
  config/       Connexion MongoDB, config Cloudinary
  controllers/  Logique métier de chaque route
  middleware/   Auth, upload/traitement d'image, rate limiting, erreurs
  models/       Schémas Mongoose (Creation, EtudePlan, Message, User, ...)
  routes/       Définition des routes Express
  scripts/      Scripts à lancer manuellement (seed, backup, migrations)
  services/     Envoi d'email (Resend)
  utils/        Fonctions partagées (fusion d'images uploadées)
server.js       Point d'entrée : middlewares globaux, montage des routes
```

## Aperçu des routes API

Toutes les routes sont préfixées par `/api`.

| Route                                                            | Accès           | Description                                                 |
| ---------------------------------------------------------------- | --------------- | ----------------------------------------------------------- |
| `POST /auth/login`                                               | Public (limité) | Connexion admin                                             |
| `GET /creations`, `GET /creations/:id`                           | Public          | Liste / détail des créations                                |
| `POST /creations`, `PUT /creations/:id`, `DELETE /creations/:id` | Protégé         | Gestion des créations                                       |
| `PUT /creations/reorder`                                         | Protégé         | Réordonner les créations                                    |
| `GET /etude/settings`, `GET /etude/plans`                        | Public          | Contenu de la page Étude                                    |
| `POST/PUT/DELETE /etude/plans/...`                               | Protégé         | Gestion des plans                                           |
| `POST /messages`                                                 | Public (limité) | Formulaire de contact                                       |
| `GET/PATCH/DELETE /messages/...`                                 | Protégé         | Gestion des messages reçus                                  |
| `GET /backup`                                                    | Protégé         | Téléchargement d'une sauvegarde JSON (bouton dans `/admin`) |

Les routes protégées attendent un header `Authorization: Bearer <token>`
(le token renvoyé par `/auth/login`).

### Exemple : créer une création (upload de photos)

```js
const formData = new FormData();
formData.append("name", "Lampe suspendue");
formData.append("description", "Fabriquée à partir de...");
fileInputs.forEach((file) => formData.append("images", file)); // plusieurs fichiers possibles

await fetch(`${API_URL}/creations`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: formData, // ne jamais fixer Content-Type manuellement avec FormData
});
```

Les photos uploadées passent automatiquement par `sharp` (redimensionnement,
conversion WebP) puis sont envoyées sur Cloudinary — la réponse contient
directement leurs URLs Cloudinary, pas des chemins locaux.

### Exemple : modifier une création (garder certaines photos, en ajouter d'autres)

```js
const formData = new FormData();
formData.append("name", "Lampe suspendue — v2");
formData.append("description", "...");
existingImageUrls.forEach((url) => formData.append("existingImages", url)); // celles à garder
newFiles.forEach((file) => formData.append("images", file)); // nouvelles photos
formData.append("focalPointX", 50); // optionnel, point de recadrage de la vignette
formData.append("focalPointY", 30);

await fetch(`${API_URL}/creations/${id}`, {
  method: "PUT",
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
});
```

### Limites d'upload

- 15 Mo max par fichier envoyé (avant compression — le fichier final stocké est bien plus léger)
- Formats acceptés : jpg, png, webp, gif

## Stockage des images

Toutes les photos sont hébergées sur **Cloudinary**, pas sur le disque du
serveur — indispensable puisque Render (plan gratuit) efface le disque à
chaque redémarrage. Le dossier local `uploads/` et sa route statique
`/uploads` dans `server.js` ne sont conservés que par précaution/historique
(vestiges d'avant la migration vers Cloudinary) ; aucune nouvelle photo n'y
transite plus depuis `npm run migrate:cloudinary`.

## Sécurité

- Rate limiting dédié sur le login et le formulaire de contact
- `express-mongo-sanitize` contre l'injection d'opérateurs MongoDB
- `helmet` pour les en-têtes de sécurité HTTP standards
- Mots de passe hashés (bcrypt), jamais stockés en clair
- Erreurs serveur (500) génériques côté client, détail complet uniquement dans les logs
- `trust proxy` configuré pour fonctionner correctement derrière le proxy de Render

## Déploiement (Render)

- **Root Directory** : `backend/denlam-backend`
- **Build Command** : `npm install`
- **Start Command** : `npm start`
- Toutes les variables d'environnement doivent être renseignées dans Render → Environment (ne jamais committer le vrai `.env`)
- Le plan gratuit de Render met le service en veille après 15 min d'inactivité (délai de 30-60s au réveil) et **bloque le SMTP sortant** — c'est pourquoi Resend (API HTTPS) est utilisé plutôt qu'un envoi SMTP classique
