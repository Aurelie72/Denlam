# Denlam — Backend (Express + MongoDB)

API pour gérer les créations (CRUD) et l'authentification de l'admin
du portfolio Denlam. Compatible avec le frontend React déjà en place
(`src/context/AuthContext.jsx` et `src/services/api.js` y pointent).

## Démarrer

```bash
cp .env.example .env
# renseigne MONGODB_URI, JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD

npm install
npm run seed:admin   # crée le compte admin une seule fois
npm run dev           # démarre le serveur sur http://localhost:4000
```

Côté frontend, assure-toi que `.env` contient :
```
VITE_API_URL=http://localhost:4000/api
```

## Routes

### Auth

| Méthode | Route             | Accès  | Description                          |
| ------- | ------------------ | ------ | ------------------------------------- |
| POST    | `/api/auth/login`  | public | `{ username, password }` → `{ token, user }` |
| GET     | `/api/auth/me`     | privé  | Retourne l'utilisateur du token envoyé (`Authorization: Bearer <token>`) |

### Créations

| Méthode | Route                  | Accès  | Description                                  |
| ------- | ----------------------- | ------ | ---------------------------------------------- |
| GET     | `/api/creations`        | public | Liste toutes les créations (`?category=lampe` pour filtrer) |
| GET     | `/api/creations/:id`    | public | Détail d'une création                          |
| POST    | `/api/creations`        | privé  | Créer une création                             |
| PUT     | `/api/creations/:id`    | privé  | Modifier une création                          |
| DELETE  | `/api/creations/:id`    | privé  | Supprimer une création                         |

Les routes privées attendent un header `Authorization: Bearer <token>`
(le token renvoyé par `/api/auth/login`).

### Champs attendus pour créer/modifier une création

- `name` (string, requis)
- `category` (`lampe` | `mobilier` | `decoration`, requis)
- `description` (string, optionnel)
- `image` : soit un **fichier** envoyé en `multipart/form-data` (champ
  `image`), soit une **URL** envoyée en JSON (champ `image`)

Exemple avec fichier (FormData côté React) :
```js
const formData = new FormData();
formData.append("name", "Lampe suspendue");
formData.append("category", "lampe");
formData.append("image", fileInput.files[0]);

await fetch(`${API_URL}/creations`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: formData, // ne pas fixer Content-Type manuellement avec FormData
});
```

Exemple avec URL d'image (JSON) :
```js
await fetch(`${API_URL}/creations`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    name: "Lampe suspendue",
    category: "lampe",
    image: "https://exemple.com/photo.jpg",
  }),
});
```

Les images uploadées sont servies statiquement sur
`http://localhost:4000/uploads/<fichier>`.

## Structure

```
server.js                     point d'entrée (Express, connexion DB, montage des routes)
src/
  config/db.js                connexion MongoDB (mongoose)
  models/
    User.js                   admin : username, passwordHash (bcrypt), role
    Creation.js                 name, category, image, description
  middleware/
    auth.js                   vérifie le JWT, attache req.user
    upload.js                 multer : upload d'image (8 Mo max, jpg/png/webp/gif)
    errorHandler.js            404 + gestion centralisée des erreurs (validation, doublons, etc.)
    asyncHandler.js             évite les try/catch répétés dans les controllers
  controllers/
    auth.controller.js         login, me
    creations.controller.js    list, get, create, update, delete
  routes/
    auth.routes.js
    creations.routes.js
  scripts/
    seedAdmin.js                crée le compte admin depuis .env (à lancer une fois)
```

## Sécurité — à ne pas oublier avant la mise en prod

- Change `JWT_SECRET` par une chaîne longue et aléatoire (ex. `openssl rand -hex 32`).
- Change le mot de passe admin par défaut.
- Restreins `CLIENT_ORIGIN` à l'URL exacte de ton frontend déployé (pas de `*`).
- Utilise HTTPS en production (obligatoire pour ne pas faire transiter le
  token JWT en clair).
- Le endpoint `/api/auth/login` n'a pas de limitation de tentatives
  (rate limiting) — envisage `express-rate-limit` si le site est exposé
  publiquement.
