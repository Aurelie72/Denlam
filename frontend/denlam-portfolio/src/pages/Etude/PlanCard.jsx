import PlanCarousel from "./PlanCarousel.jsx";

export default function PlanCard({ description, images }) {
  return (
    <div className="etude-plan-card">
      <div className="detail-description">
        <p>{description}</p>
      </div>
      <PlanCarousel images={images} />
    </div>
  );
}
