import { useEffect, useRef, useState } from "react";
import { resolveImageUrl } from "../../services/api.js";

/**
 * Gère l'affichage combiné de :
 * - photos déjà enregistrées (existingImages : URLs), supprimables via une croix
 * - nouvelles photos tout juste sélectionnées (newFiles : File[]), avec un
 *   aperçu généré localement (URL.createObjectURL) et supprimables aussi
 *
 * La toute première vignette affichée (existante si elle existe, sinon
 * nouvelle) est la "photo principale" — celle utilisée comme vignette de
 * galerie et 1ère image du carrousel. Un bouton "Photo principale" sur
 * chaque autre vignette permet de la faire passer en tête, sans dépendre
 * de l'ordre d'ajout d'origine.
 *
 * Le fichier <input> permet d'ajouter d'autres photos sans perdre celles
 * déjà choisies (chaque sélection s'ajoute à la liste au lieu de la
 * remplacer).
 */
export default function ImagePicker({
  existingImages = [],
  onRemoveExisting,
  onSetCoverExisting,
  newFiles = [],
  onAddFiles,
  onRemoveNewFile,
  onSetCoverNewFile,
  inputId,
  ariaLabel = "Choisir des photos",
}) {
  const [previews, setPreviews] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    const urls = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [newFiles]);

  function handleFileInput(e) {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(Array.from(e.target.files));
    }
    e.target.value = ""; // permet de resélectionner le(s) même(s) fichier(s) si besoin
  }

  const hasImages = existingImages.length > 0 || newFiles.length > 0;
  // La photo principale est toujours la toute première de la liste
  // combinée : la 1ère "existante" s'il y en a, sinon la 1ère "nouvelle".
  const coverIsExisting = existingImages.length > 0;

  return (
    <div className="image-picker">
      {hasImages && (
        <div className="image-picker-grid">
          {existingImages.map((img, i) => {
            const isCover = coverIsExisting && i === 0;
            return (
              <div className="image-picker-thumb" key={`existing-${img}-${i}`}>
                <img src={resolveImageUrl(img)} alt="" />
                {isCover ? (
                  <span className="image-picker-cover-badge">Principale</span>
                ) : (
                  onSetCoverExisting && (
                    <button
                      type="button"
                      className="image-picker-cover-btn"
                      onClick={() => onSetCoverExisting(i)}
                    >
                      Photo principale
                    </button>
                  )
                )}
                <button
                  type="button"
                  className="image-picker-remove"
                  onClick={() => onRemoveExisting(i)}
                  aria-label="Supprimer cette photo"
                >
                  ✕
                </button>
              </div>
            );
          })}

          {newFiles.map((file, i) => {
            const isCover = !coverIsExisting && i === 0;
            return (
              <div className="image-picker-thumb" key={`new-${file.name}-${i}`}>
                {previews[i] && <img src={previews[i]} alt="" />}
                {isCover ? (
                  <span className="image-picker-cover-badge">Principale</span>
                ) : (
                  onSetCoverNewFile && (
                    <button
                      type="button"
                      className="image-picker-cover-btn"
                      onClick={() => onSetCoverNewFile(i)}
                    >
                      Photo principale
                    </button>
                  )
                )}
                <button
                  type="button"
                  className="image-picker-remove"
                  onClick={() => onRemoveNewFile(i)}
                  aria-label="Retirer cette photo"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      <button
        type="button"
        className="image-picker-add-btn"
        onClick={() => inputRef.current?.click()}
        aria-label={ariaLabel}
      >
        Sélectionner un fichier
      </button>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInput}
        aria-label={ariaLabel}
        className="visually-hidden"
      />
    </div>
  );
}
