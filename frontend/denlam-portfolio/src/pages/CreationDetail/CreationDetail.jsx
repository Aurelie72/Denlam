import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { CATEGORIES } from "../Creations/creationsData.js";
import { fetchCreation, fetchCreations, resolveImageUrl, ApiError } from "../../services/api.js";
import "./CreationDetail.css";

export default function CreationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "tous";

  const [creation, setCreation] = useState(null);
  const [siblings, setSiblings] = useState([]); // liste utilisée pour la navigation "suivant"
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setActiveImage(0);

    Promise.all([fetchCreation(id), fetchCreations(activeCategory)])
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
  }, [id, activeCategory]);

  const nextId = useMemo(() => {
    if (siblings.length === 0) return null;
    const index = siblings.findIndex((c) => c.id === id);
    if (index === -1) return siblings[0].id;
    return siblings[(index + 1) % siblings.length].id;
  }, [siblings, id]);

  const images = creation?.images?.length ? creation.images : creation?.image ? [creation.image] : [];

  function goToImage(delta) {
    if (images.length === 0) return;
    setActiveImage((prev) => (prev + delta + images.length) % images.length);
  }

  const categoryQuery = activeCategory !== "tous" ? `?category=${activeCategory}` : "";

  return (
    <section className="creation-detail">
      {/* <div className="filters detail-filters">
        <div className="filters-inner">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.key}
              to={cat.key === "tous" ? "/creations" : `/creations?category=${cat.key}`}
              className={activeCategory === cat.key ? "filter-btn active" : "filter-btn"}
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </div> */}

      {isLoading && <p className="detail-status">Chargement…</p>}
      {error && <p className="detail-status">{error}</p>}

      {!isLoading && !error && creation && (
        <>
          <div className="detail-header">
            <button className="nav-arrow" onClick={() => navigate(-1)} aria-label="Retour à la page précédente">
              <span aria-hidden="true">←</span> Retour
            </button>

            <h1 className="detail-title">{creation.name}</h1>

            {nextId && (
              <Link className="nav-arrow nav-arrow-next" to={`/creations/${nextId}${categoryQuery}`}>
                Création suivante <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>

          <div className="detail-body">
            <div className="detail-description">
              <p className="detail-category">{creation.category}</p>
              <p>{creation.description || "Aucune description pour le moment."}</p>
            </div>

            <div className="detail-carousel">
              <div className="carousel-main">
                {images.length > 1 && (
                  <button
                    className="carousel-arrow carousel-arrow-left"
                    onClick={() => goToImage(-1)}
                    aria-label="Photo précédente"
                  >
                    ‹
                  </button>
                )}

                <img src={resolveImageUrl(images[activeImage])} alt={`${creation.name} — photo ${activeImage + 1}`} />

                {images.length > 1 && (
                  <button
                    className="carousel-arrow carousel-arrow-right"
                    onClick={() => goToImage(1)}
                    aria-label="Photo suivante"
                  >
                    ›
                  </button>
                )}
              </div>

              {images.length > 1 && (
                <div className="carousel-thumbs">
                  {images.map((img, i) => (
                    <button
                      key={img + i}
                      className={i === activeImage ? "thumb active" : "thumb"}
                      onClick={() => setActiveImage(i)}
                      aria-label={`Voir la photo ${i + 1}`}
                    >
                      <img src={resolveImageUrl(img)} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
