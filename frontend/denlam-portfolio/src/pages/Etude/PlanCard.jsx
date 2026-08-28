import PhotoCarousel from "../../components/PhotoCarousel.jsx";

export default function PlanCard({ description, images }) {
  const alt = "Photo d'un plan d'agencement";

  return (
    <div className="etude-plan-card">
      <div className="detail-description">
        <p>{description}</p>
      </div>
      <PhotoCarousel images={images} alt={alt} />
    </div>
  );
}
