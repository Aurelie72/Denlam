import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchCreation, fetchCreations, resolveImageUrl, ApiError } from "../../services/api.js";
import "./CreationDetail.css";

export default function CreationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [creation, setCreation] = useState(null);
  const [siblings, setSiblings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setActiveImage(0);

    Promise.all([fetchCreation(id), fetchCreations("tous")])
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

  const images = creation?.images?.length
    ? creation.images
    : creation?.image
    ? [creation.image]
    : [];

  function goToImage(delta) {
    if (images.length === 0) return;
    setActiveImage((prev) => (prev + delta + images.length) % images.length);
  }

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

            <h2 className="detail-title">{creation.name}</h2>

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

              <div className="detail-carousel">
                <div className="carousel-main">
                  {images.length > 1 && (
                    <button
                      className="carousel-arrow carousel-arrow-left"
                      onClick={() => goToImage(-1)}
                    >
                      ‹
                    </button>
                  )}

                  <img
                    src={resolveImageUrl(images[activeImage])}
                    alt={`${creation.name} — photo ${activeImage + 1}`}
loading="eager"
   fetchpriority="high"
   decoding="async"
                  />

                  {images.length > 1 && (
                    <button
                      className="carousel-arrow carousel-arrow-right"
                      onClick={() => goToImage(1)}
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
                      >
                        <img src={resolveImageUrl(img)} alt="" loading="eager"
   fetchpriority="high"
   decoding="async"/>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
