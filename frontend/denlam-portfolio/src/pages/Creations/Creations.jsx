import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CATEGORIES } from "./creationsData.js";
import { fetchCreations, resolveImageUrl, ApiError } from "../../services/api.js";
import "./Creations.css";

export default function Creations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "tous";

  const buttonRefs = useRef({});
  const [highlightStyle, setHighlightStyle] = useState({});

  const [creations, setCreations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchCreations(activeCategory)
      .then((data) => {
        if (!cancelled) setCreations(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Erreur de chargement.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeCategory]);

  useEffect(() => {
    function syncHighlight() {
      const btn = buttonRefs.current[activeCategory];
      if (btn) setHighlightStyle({ left: btn.offsetLeft, width: btn.offsetWidth });
    }
    syncHighlight();
    window.addEventListener("resize", syncHighlight);
    return () => window.removeEventListener("resize", syncHighlight);
  }, [activeCategory]);

  function selectCategory(key) {
    if (key === "tous") {
      setSearchParams({});
    } else {
      setSearchParams({ category: key });
    }
  }

  return (
    <>
      <section className="filters">
        <div className="filters-inner">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              ref={(el) => (buttonRefs.current[cat.key] = el)}
              className={activeCategory === cat.key ? "filter-btn active" : "filter-btn"}
              onClick={() => selectCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
          <span className="highlight" style={highlightStyle} />
        </div>
      </section>

      <section className="gallery" aria-live="polite">
        {isLoading && <p className="gallery-empty">Chargement…</p>}
        {error && <p className="gallery-empty">{error}</p>}

        {!isLoading &&
          !error &&
          creations.map((item) => (
            <Link
              className="gallery-item"
              key={item.id}
              to={`/creations/${item.id}${activeCategory !== "tous" ? `?category=${activeCategory}` : ""}`}
            >
              <div className="gallery-media">
                <img src={resolveImageUrl(item.image)} alt={item.name} loading="lazy" />
              </div>
              <p>{item.name}</p>
            </Link>
          ))}

        {!isLoading && !error && creations.length === 0 && (
          <p className="gallery-empty">Aucune création dans cette catégorie pour le moment.</p>
        )}
      </section>
    </>
  );
}
