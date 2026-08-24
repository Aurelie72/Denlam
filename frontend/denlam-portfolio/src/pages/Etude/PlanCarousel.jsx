import { useState } from "react";
import { resolveImageUrl } from "../../services/api.js";

export default function PlanCarousel({ images, alt = "" }) {
  const [activeIndex, setActiveIndex] = useState(0);

  function goTo(delta) {
    if (images.length === 0) return;
    setActiveIndex((prev) => (prev + delta + images.length) % images.length);
  }

  if (!images || images.length === 0) return null;

  return (
    <div className="detail-carousel">
      <div className="carousel-main">
        {images.length > 1 && (
          <button className="carousel-arrow carousel-arrow-left" onClick={() => goTo(-1)} aria-label="Photo précédente">
            ‹
          </button>
        )}
        <img
          src={resolveImageUrl(images[activeIndex])}
          alt={images.length > 1 ? `${alt} — photo ${activeIndex + 1}` : alt}
          loading="eager"
          decoding="async"
        />
        {images.length > 1 && (
          <button className="carousel-arrow carousel-arrow-right" onClick={() => goTo(1)} aria-label="Photo suivante">
            ›
          </button>
        )}
      </div>

      {images.length > 1 && (
        <div className="carousel-thumbs">
          {images.map((img, i) => (
            <button
              key={img + i}
              className={i === activeIndex ? "thumb active" : "thumb"}
              onClick={() => setActiveIndex(i)}
              aria-label={`Voir la photo ${i + 1}`}
            >
              <img src={resolveImageUrl(img)} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}