import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchCreation, fetchCreations, resolveImageUrl, ApiError } from "../../services/api.js";
import { usePageMeta } from "../../hooks/usePageMeta.js";
import PhotoCarousel from "../../components/PhotoCarousel.jsx";
import "./CreationDetail.css";

export default function CreationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [creation, setCreation] = useState(null);
  const [siblings, setSiblings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  usePageMeta(
    creation?.name || "Créations",
    creation?.description || "Découvrez cette création unique signée Denlam, fabriquée sur mesure."
  );

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    Promise.all([fetchCreation(id), fetchCreations()])
      .then(([creationData, listData]) => {
        if (cancelled) return;
        setCreation(creationData);
        setSiblings(listData);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Erreur de chargement.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const nextId = useMemo(() => {
    if (siblings.length === 0) return null;
    const index = siblings.findIndex((c) => c.id === id);
    if (index === -1) return siblings[0].id;
    return siblings[(index + 1) % siblings.length].id;
  }, [siblings, id]);

  const images = useMemo(
    () => (creation?.images?.length ? creation.images : creation?.image ? [creation.image] : []),
    [creation]
  );

  useEffect(() => {
    if (!creation) return;

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "creation-jsonld";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: creation.name,
      description: creation.description,
      image: images.map((img) => resolveImageUrl(img)),
      brand: {
        "@type": "Brand",
        name: "Denlam",
      },
    });
    document.head.appendChild(script);

    return () => {
      document.getElementById("creation-jsonld")?.remove();
    };
  }, [creation, images]);

  return (
    <section className="creation-detail">
      {isLoading && <p className="detail-status">Chargement…</p>}
      {error && <p className="detail-status">{error}</p>}

      {!isLoading && !error && creation && (
        <>
          <div className="detail-header">
            <button className="nav-arrow" onClick={() => navigate(-1)} aria-label="Retour à la page précédente">
              <span aria-hidden="true">←</span>
            </button>

            <h1 className="detail-title">{creation.name}</h1>

            {nextId && (
              <Link className="nav-arrow nav-arrow-next" to={`/creations/${nextId}`} aria-label="Création suivante">
                <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>

          <div className="detail-layout">
            <div className="detail-body">
              <div className="detail-description">
                <p>{creation.description || "Aucune description pour le moment."}</p>
              </div>

              <PhotoCarousel images={images} alt={creation.name} priority />
            </div>
          </div>
        </>
      )}
    </section>
  );
}
