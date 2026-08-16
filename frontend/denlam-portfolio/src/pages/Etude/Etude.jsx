import { useEffect, useState } from "react";
import {
  fetchEtudeSettings,
  fetchEtudePhotos,
  resolveImageUrl,
  ApiError
} from "../../services/api.js";
import "./Etude.css";

const TABS = [
  { key: "conseils", label: "Conseils" },
  { key: "releves", label: "Relevés" },
  { key: "plan", label: "Plans" },
];

export default function Etude() {
  const [description, setDescription] = useState("");
  const [activeTab, setActiveTab] = useState("conseils");
  const [photos, setPhotos] = useState([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);
  const [error, setError] = useState(null);

  // Charger description
  useEffect(() => {
    fetchEtudeSettings()
      .then((data) => setDescription(data.description || ""))
      .catch(() => {});
  }, []);

  // Charger photos selon onglet
  useEffect(() => {
    let cancelled = false;
    setIsLoadingPhotos(true);
    setError(null);

    fetchEtudePhotos(activeTab)
      .then((data) => {
        if (!cancelled) setPhotos(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof ApiError ? err.message : "Erreur de chargement.");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingPhotos(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  return (
    <section className="etude">
      <div className="etude-intro">
        <p>{description}</p>
      </div>

      {/* --- Filtres identiques à la page Créations --- */}
      <div className="filters">
        <div className="filters-inner">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? "filter-btn active" : "filter-btn"}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
          <span className="highlight"></span>
        </div>
      </div>

      {/* --- Photos --- */}
      <div className="etude-photos" aria-live="polite">
        {isLoadingPhotos && <p className="etude-empty">Chargement…</p>}
        {error && <p className="etude-empty">{error}</p>}

        {!isLoadingPhotos && !error && photos.length === 0 && (
          <p className="etude-empty">Aucune photo pour le moment dans cette catégorie.</p>
        )}

        {!isLoadingPhotos &&
          !error &&
          photos.map((photo) => (
            <div className="etude-photo" key={photo.id}>
              <img src={resolveImageUrl(photo.image)} alt="" loading="lazy" />
            </div>
          ))}
      </div>
    </section>
  );
}
