/**
 * Fabrique les 3 gestionnaires (ajouter des fichiers, retirer une photo déjà
 * enregistrée, retirer un fichier tout juste sélectionné) pour n'importe
 * quel formulaire dont l'état a la forme { existingImages, newFiles, ... }.
 * Évite de dupliquer cette logique entre le formulaire "création" et le
 * formulaire "plan" dans Admin.jsx.
 *
 * const creationImages = useImageFields(setForm);
 * <ImagePicker onAddFiles={creationImages.addFiles} ... />
 */
export function useImageFields(setForm) {
  function addFiles(files) {
    setForm((prev) => ({ ...prev, newFiles: [...prev.newFiles, ...files] }));
  }

  function removeExisting(index) {
    setForm((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== index),
    }));
  }

  function removeNewFile(index) {
    setForm((prev) => ({
      ...prev,
      newFiles: prev.newFiles.filter((_, i) => i !== index),
    }));
  }

  // Déplace une photo déjà enregistrée en première position — c'est cette
  // position 0 qui devient la "photo principale" (vignette de la galerie,
  // 1ère image du carrousel), indépendamment de l'ordre d'ajout d'origine.
  function setCoverExisting(index) {
    setForm((prev) => {
      if (index === 0) return prev;
      const arr = [...prev.existingImages];
      const [item] = arr.splice(index, 1);
      arr.unshift(item);
      return { ...prev, existingImages: arr };
    });
  }

  // Même principe pour un fichier tout juste sélectionné (utile s'il n'y a
  // aucune photo déjà enregistrée, ou pour une toute nouvelle création).
  function setCoverNewFile(index) {
    setForm((prev) => {
      if (index === 0) return prev;
      const arr = [...prev.newFiles];
      const [item] = arr.splice(index, 1);
      arr.unshift(item);
      return { ...prev, newFiles: arr };
    });
  }

  return {
    addFiles,
    removeExisting,
    removeNewFile,
    setCoverExisting,
    setCoverNewFile,
  };
}
