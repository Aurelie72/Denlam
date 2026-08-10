# Denlam — Portfolio (React + Vite)

Portfolio de Thomas André, créateur d'objets design et dessinateur en
agencement. Conversion du site statique HTML/CSS/JS vers React, en
conservant l'identité visuelle d'origine (Cormorant Garamond, palette
neutre gris/blanc, cartes avec révélation au survol, champs avec label
flottant).

## Démarrer le projet

```bash
npm install
npm run dev
```

Le site est alors disponible sur http://localhost:5173.

## Structure

```
src/
  components/
    layout/        Header, Footer, Layout (structure commune à toutes les pages)
  pages/
    Home/           Hero + À propos + Contact (page d'accueil, "/")
    Creations/      Galerie filtrable ("/creations")
    NotFound/       404
public/
  admin/            Interface Decap CMS (statique, voir plus bas)
content/
  creations/        un fichier .json par création
  settings/         textes du site (hero, à propos, contact)
```

## Pages & routes

| Route        | Description                                   |
| ------------ | ---------------------------------------------- |
| `/`          | Accueil : hero, section "À propos", contact    |
| `/creations` | Galerie avec filtres par catégorie             |
| `/admin`     | Interface d'administration (Decap CMS, page statique séparée de l'app React — voir ci-dessous) |

**Note** : `/admin` n'est pas une route React Router. C'est une vraie
page HTML statique (`public/admin/index.html`), volontairement en
dehors du routing de l'app, pour ne pas mélanger l'authentification de
l'admin (gérée par Netlify Identity) avec le reste du site.

## Gestion du contenu : Decap CMS (pas de backend classique)

Le contenu éditable (créations, textes du site) n'est **pas** dans une
base de données — il vit dans des fichiers JSON versionnés avec le
code, dans `content/` :

```
content/
  creations/          un fichier .json par création (nom, catégorie, image, description)
  settings/
    hero.json          libellés des deux cartes d'accueil
    about.json          nom, bio, portrait
    contact.json        adresse, téléphone, email, réseaux sociaux
```

React les lit directement au moment du build :
- `src/pages/Creations/Creations.jsx` utilise `import.meta.glob` pour
  charger tous les fichiers de `content/creations/`.
- `src/pages/Home/Home.jsx` importe directement les fichiers de
  `content/settings/`.

**L'admin édite ce contenu via `/admin`**, une interface [Decap CMS](https://decapcms.org)
(fork actif de Netlify CMS) servie en statique depuis `public/admin/`.
Concrètement :

1. L'admin se connecte sur `tonsite.netlify.app/admin` (compte créé via
   Netlify Identity).
2. Il ajoute/modifie/supprime une création, ou édite un texte.
3. Decap commit directement le fichier JSON modifié dans le dépôt GitHub
   (via Git Gateway — pas de token à gérer côté admin).
4. Netlify détecte le nouveau commit, relance `npm run build`, republie
   le site. Les changements sont en ligne en 1 à 2 minutes.

**Pas de code à écrire pour ça** : l'interface d'admin, l'authentification
et le stockage sont entièrement gérés par la configuration dans
`public/admin/config.yml`. Pour ajouter un champ (ex. un prix sur les
créations), il suffit d'ajouter une ligne dans ce fichier — aucune
modification de composant React n'est nécessaire pour le formulaire
d'admin lui-même (juste pour l'affichage si tu veux montrer le nouveau champ).

### Tester l'admin en local

```bash
npx decap-server        # terminal 1 — simule Git Gateway en local
npm run dev              # terminal 2
```

Puis va sur http://localhost:5173/admin — `local_backend: true` dans
`config.yml` permet d'éditer sans passer par Netlify/GitHub pendant le
développement (les changements sont écrits directement dans tes
fichiers locaux).

### Mise en prod

Voir la checklist : dépôt GitHub → site Netlify connecté dessus →
Identity activé → Git Gateway activé → toi invité comme utilisateur.
Une fois fait, `/admin` fonctionne en production sans configuration
supplémentaire.

## Le formulaire de contact

Il ne fait actuellement qu'une simulation d'envoi (`setTimeout`). Pour
qu'il envoie vraiment un email, la solution la plus simple sans backend
est [Netlify Forms](https://docs.netlify.com/manage/forms/setup/)
(ajouter `data-netlify="true"` et un champ caché sur le `<form>`) ou un
service comme Formspree.

## Images

Les créations et le portrait utilisent des placeholders (picsum.photos)
par défaut. Une fois `/admin` en place, remplace-les directement depuis
l'interface d'admin (widget "Image") — les fichiers uploadés atterrissent
dans `public/images/uploads/`.
