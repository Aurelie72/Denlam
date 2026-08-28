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

  return { addFiles, removeExisting, removeNewFile };
}
