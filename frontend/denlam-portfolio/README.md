# Denlam — Frontend

Site vitrine et espace d'administration pour [denlam.fr](https://denlam.fr) — React/Vite, consommant l'API du [backend Denlam](../denlam-backend).

## Identité visuelle

Police Cormorant Garamond, palette neutre gris/blanc, cartes avec révélation de contenu au survol, champs de formulaire à label flottant.

## Stack technique

- **React** + **Vite**
- **React Router** — navigation
- **ESLint** — qualité de code
- Plugins de build : `vite-plugin-image-optimizer` (compression des images statiques au build)

## Installation

```bash
npm install
```

Copie `.env.example` en `.env` (ou crée-le) avec :

```
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

Démarre le serveur de développement (par défaut sur `http://localhost:5173`).

## Scripts disponibles

| Commande          | Rôle                                                                |
| ----------------- | ------------------------------------------------------------------- |
| `npm run dev`     | Serveur de développement avec rechargement à chaud                  |
| `npm run build`   | Build de production dans `dist/`                                    |
| `npm run preview` | Sert le build de production en local, pour tester avant déploiement |
| `npm run lint`    | Vérifie la qualité du code (ESLint)                                 |

## Structure du projet

```
src/
  components/     Composants partagés (carrousel photo, layout, garde anti-copie...)
  context/        Contexte React (authentification admin)
  hooks/          Hooks partagés (métadonnées de page, chargement de listes)
  pages/          Une page par route : Home, Etude, Creations, CreationDetail,
                  Admin, Login, Legal (mentions légales, confidentialité)
  services/       Appels à l'API backend (api.js)
public/           Fichiers statiques servis tels quels (favicon, robots.txt,
                  sitemap.xml, image de partage réseaux sociaux...)
```

## Pages et routes

| Route                                   | Accès                       | Chargement                                      |
| --------------------------------------- | --------------------------- | ----------------------------------------------- |
| `/`                                     | Public                      | Immédiat                                        |
| `/etude`                                | Public                      | Immédiat                                        |
| `/creations`, `/creations/:id`          | Public                      | Immédiat                                        |
| `/login`                                | Public                      | À la demande (lazy)                             |
| `/admin`                                | Protégé (connexion requise) | À la demande (lazy), bloqué en dessous de 780px |
| `/mentions-legales`, `/confidentialite` | Public                      | À la demande (lazy)                             |

Les pages peu consultées (`/login`, `/admin`, pages légales) sont chargées à la demande via `React.lazy` — réduit ce que télécharge un visiteur qui ne va jamais sur ces pages.

## Fonctionnalités notables

- **Espace admin** : gestion des créations et plans (ajout/modification/suppression, réordonnancement, choix de la photo principale et de son point de recadrage), gestion des messages de contact, téléchargement d'une sauvegarde de la base
- **Optimisation des images** : les photos statiques du code (hero, portrait) sont compressées au build ; celles uploadées via l'admin sont automatiquement redimensionnées/converties en WebP côté backend
- **SEO** : titres/descriptions dynamiques par page, Open Graph, données structurées (Schema.org), sitemap, robots.txt
- **Accessibilité** : navigation clavier, textes alternatifs, contrastes conformes, hiérarchie de titres cohérente — audité avec WAVE
- **Sécurité** : dissuasion légère anti-copie sur les pages publiques (désactivée sur `/admin`)

## Variables d'environnement

| Variable       | Description                                            |
| -------------- | ------------------------------------------------------ |
| `VITE_API_URL` | URL de base de l'API backend (inclure `/api` à la fin) |

## Déploiement (Netlify)

- **Base directory** : `frontend/denlam-portfolio`
- **Build command** : `npm run build`
- **Publish directory** : `frontend/denlam-portfolio/dist`
- Variable d'environnement à renseigner : `VITE_API_URL` (pointant vers l'URL du backend en production)
- Domaine personnalisé (`denlam.fr`) et HTTPS (Let's Encrypt) configurés dans Netlify → Domain management
