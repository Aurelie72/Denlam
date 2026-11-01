import { useState } from "react";
import { resolveImageUrl } from "../services/api.js";
import ImageLightbox from "./ImageLightbox.jsx";
import "./PhotoCarousel.css";

/**
 * Carrousel photo réutilisable : photo principale + flèches (si plusieurs
 * photos) + vignettes cliquables. Utilisé sur la fiche détail d'une
 * création ET sur chaque plan de la page Étude — même logique, seul le
 * contexte d'appel diffère.
 *
 * - `alt` : texte de base pour la photo principale (complété par
 *   "— N sur total" automatiquement s'il y a plusieurs photos)
 * - `priority` : true pour la photo qui doit se charger en priorité
 *   (contenu principal d'une page) — à réserver à UN seul carrousel par
 *   page, jamais à plusieurs plans empilés en même temps (voir la
 *   discussion sur fetchpriority plus tôt : en mettre partout annule le
 *   bénéfice).
 * - `zoomable` : true pour permettre d'agrandir la photo en plein écran
 *   (lightbox) au clic.
 * - `frameless` : true pour afficher la photo sans ombre ni coins arrondis.
 */
export default function PhotoCarousel({
  images,
  alt = "",
  priority = false,
  zoomable = false,
  frameless = false,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  function goTo(delta) {
    if (!images || images.length === 0) return;
    setActiveIndex((prev) => (prev + delta + images.length) % images.length);
  }

  if (!images || images.length === 0) return null;

  const mainAlt = images.length > 1 ? `${alt} — ${activeIndex + 1} sur ${images.length}` : alt;

  return (
    <div className="detail-carousel">
      <div className={frameless ? "carousel-main frameless" : "carousel-main"}>
        {images.length > 1 && (
          <button className="carousel-arrow carousel-arrow-left" onClick={() => goTo(-1)} aria-label="Photo précédente">
            ‹
          </button>
        )}

        <img
          src={resolveImageUrl(images[activeIndex])}
          alt={mainAlt}
          loading={priority ? "eager" : "lazy"}
          {...(priority ? { fetchpriority: "high" } : {})}
          decoding="async"
        />

        {zoomable && (
          <>
            <button
              type="button"
              className="carousel-zoom"
              onClick={() => setZoomOpen(true)}
              aria-label="Agrandir la photo"
            />
            <span className="carousel-zoom-hint" aria-hidden="true">
              🔍 Agrandir
            </span>
          </>
        )}

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

      {zoomable && zoomOpen && (
        <ImageLightbox
          images={images.map(resolveImageUrl)}
          index={activeIndex}
          alt={alt}
          onChange={setActiveIndex}
          onClose={() => setZoomOpen(false)}
        />
      )}
    </div>
  );
}