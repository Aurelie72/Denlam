import { useEffect, useRef } from "react";
import "./ImageLightbox.css";

// Agrandissement plein écran d'une photo, basé sur la balise native <dialog> :
// le navigateur gère seul le piège du focus, la touche Échap et l'arrière-plan inerte.
// `images` doit contenir des URLs déjà résolues (resolveImageUrl appliqué par le parent).
export default function ImageLightbox({ images, index, alt, onChange, onClose }) {
  const dialogRef = useRef(null);
  const total = images.length;
  const hasMany = total > 1;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  useEffect(() => {
    if (!hasMany) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "ArrowLeft") onChange((index - 1 + total) % total);
      if (e.key === "ArrowRight") onChange((index + 1) % total);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasMany, index, total, onChange]);

  const requestClose = () => dialogRef.current?.close();
  const currentAlt = hasMany ? `${alt} — ${index + 1} sur ${total}` : alt;

  return (
    <dialog
      ref={dialogRef}
      className="lightbox"
      aria-label={`Agrandissement : ${alt}`}
      onClose={onClose}
    >
      <button
        type="button"
        className="lightbox-backdrop"
        tabIndex={-1}
        aria-hidden="true"
        onClick={requestClose}
      />

      <button
        type="button"
        className="lightbox-close"
        aria-label="Fermer l'agrandissement"
        onClick={requestClose}
      >
        <span aria-hidden="true">✕</span>
      </button>

      {hasMany && (
        <button
          type="button"
          className="lightbox-arrow lightbox-prev"
          aria-label="Photo précédente"
          onClick={() => onChange((index - 1 + total) % total)}
        >
          <span aria-hidden="true">‹</span>
        </button>
      )}

      <img className="lightbox-image" src={images[index]} alt={currentAlt} />

      {hasMany && (
        <button
          type="button"
          className="lightbox-arrow lightbox-next"
          aria-label="Photo suivante"
          onClick={() => onChange((index + 1) % total)}
        >
          <span aria-hidden="true">›</span>
        </button>
      )}

      {hasMany && (
        <p className="lightbox-counter" aria-live="polite">
          {index + 1} / {total}
        </p>
      )}
    </dialog>
  );
}
