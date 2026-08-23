import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchCreations,
  fetchCreationsSettings,
  resolveImageUrl,
  ApiError
} from "../../services/api.js";
import "./Creations.css";

export default function Creations() {
  const [description, setDescription] = useState("");
  const [creations, setCreations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger description
  useEffect(() => {
    fetchCreationsSettings()
      .then((data) => setDescription(data.description || ""))
      .catch(() => {});
  }, []);

  // Charger toutes les créations (sans filtre)
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchCreations("tous")
      .then((data) => {
        if (!cancelled) setCreations(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof ApiError ? err.message : "Erreur de chargement.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <div className="creations-intro">
        <p>{description}</p>
      </div>

      <section className="gallery" aria-live="polite">
        {isLoading && <p className="gallery-empty">Chargement…</p>}
        {error && <p className="gallery-empty">{error}</p>}

        {!isLoading &&
          !error &&
          creations.map((item) => (
<Link className="gallery-item" key={item.id} to={`/creations/${item.id}`}>
  <div className="gallery-media">
    <img src={resolveImageUrl(item.image)} alt={item.name} loading="lazy" decoding="async" />

    <div className="gallery-title">{item.name}</div>
  </div>
</Link>
          ))}

        {!isLoading && !error && creations.length === 0 && (
          <p className="gallery-empty">Aucune création pour le moment.</p>
        )}
      </section>
    </>
  );
}
