// La liste des créations vient désormais du backend (MongoDB), via
// fetchCreations() dans Creations.jsx. Ce fichier ne garde que la liste
// des catégories de filtre affichées sur la page /creations.
export const CATEGORIES = [
  { key: "tous", label: "Tous" },
  { key: "lampe", label: "Lampes" },
  { key: "mobilier", label: "Mobilier" },
  { key: "decoration", label: "Décoration" },
];
