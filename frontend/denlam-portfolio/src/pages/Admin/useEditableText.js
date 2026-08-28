import { useEffect, useState } from "react";
import { ApiError } from "../../services/api.js";

/**
 * Factorise le pattern répété dans Admin.jsx pour les blocs de texte
 * éditables (intro Étude, intro Créations) : charge une valeur au montage,
 * gère la sauvegarde, l'état de chargement/enregistrement, les erreurs et
 * la confirmation visuelle "Enregistré."
 *
 * const etude = useEditableText(fetchEtudeSettings, updateEtudeSettings, token);
 * etude.value, etude.setValue, etude.isLoading, etude.isSaving,
 * etude.error, etude.saved, etude.handleSubmit
 */
export function useEditableText(fetchFn, updateFn, token) {
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchFn()
      .then((data) => setValue(data.description || ""))
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Erreur de chargement.",
        ),
      )
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(newValue) {
    setValue(newValue);
    setSaved(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      const updated = await updateFn(value, token);
      setValue(updated.description || "");
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Erreur lors de l'enregistrement.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return {
    value,
    isLoading,
    isSaving,
    error,
    saved,
    handleChange,
    handleSubmit,
  };
}
