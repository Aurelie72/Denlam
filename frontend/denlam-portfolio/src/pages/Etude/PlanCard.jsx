import PlanCarousel from "./PlanCarousel.jsx";

export default function PlanCard({ description, images }) {
  // Texte alternatif dérivé de la description du plan (tronqué), utile pour
  // le SEO et les lecteurs d'écran — à défaut, une description générique.
  const alt = description
    ? description.length > 100
      ? `${description.slice(0, 100)}…`
      : description
    : "Photo d'un plan d'agencement Denlam";

  return (
    <div className="etude-plan-card">
      <div className="detail-description">
        <p>{description}</p>
      </div>
      <PlanCarousel images={images} alt={alt} />
    </div>
  );
}