import { useEffect, useState } from "react";
import { ApiError } from "../services/api.js";

/**
 * Factorise le pattern "charger une liste au montage, gérer chargement/
 * erreur" répété pour les créations, les messages et les plans dans
 * Admin.jsx.
 *
 * const {
 *   items: creations, setItems: setCreations,
 *   isLoading: isLoadingList, error: listError, reload: loadCreations,
 * } = useAsyncList(fetchCreations);
 */
export function useAsyncList(fetchFn) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchFn();
      setItems(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur de chargement.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // Chargement volontaire une seule fois au montage (comportement
    // identique à l'ancien code, qui n'était pas non plus réactif à un
    // changement de `token` par exemple).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { items, setItems, isLoading, error, reload: load };
}
