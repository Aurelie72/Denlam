import { useEffect, useState } from "react";
import { fetchEtudePlans, ApiError } from "../../services/api.js";
import { usePageMeta } from "../../hooks/usePageMeta.js";
import { ETUDE_INTRO } from "../../content/introTexts.js";
import PlanCard from "./PlanCard.jsx";
import "./Etude.css";

const TABS = [
  { key: "conseils", label: "Conseils" },
  { key: "releves", label: "Relevés" },
  { key: "plan", label: "Plans" },
];

const CONSEILS_CONTENT = {
  description:
    "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).",
  images: ["https://picsum.photos/seed/etude-conseils/700/500"],
};

const RELEVES_CONTENT = {
  description:
    "Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).",
  images: ["https://picsum.photos/seed/etude-releves/700/500"],
};

export default function Etude() {
  usePageMeta(
    "Étude & Agencement",
    "Étude, relevés, plans 2D et plans 3D sur autocad ou topsolid pour vos projets d'agencement intérieur sur mesure. Conseils personnalisés en Sarthe, Pays de la Loire."
  );

  const [activeTab, setActiveTab] = useState("conseils");

  const [plans, setPlans] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeTab !== "plan") return;
    let cancelled = false;
    setIsLoadingPlans(true);
    setError(null);

    fetchEtudePlans()
      .then((data) => {
        if (!cancelled) setPlans(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Erreur de chargement.");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingPlans(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  return (
    <section className="etude">
      <h1 className="visually-hidden">Étude & Agencement</h1>
      <div className="etude-intro">
        <p>{ETUDE_INTRO}</p>
      </div>

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

      <div className="etude-content">
        {activeTab === "conseils" && <PlanCard {...CONSEILS_CONTENT} />}

        {activeTab === "releves" && <PlanCard {...RELEVES_CONTENT} />}

        {activeTab === "plan" && (
          <>
            {isLoadingPlans && <p className="etude-empty">Chargement…</p>}
            {error && <p className="etude-empty">{error}</p>}

            {!isLoadingPlans && !error && plans.length === 0 && (
              <p className="etude-empty">Aucun plan pour le moment.</p>
            )}

            {!isLoadingPlans &&
              !error &&
              plans.map((plan) => (
                <PlanCard key={plan.id} description={plan.description} images={plan.images} />
              ))}
          </>
        )}
      </div>
    </section>
  );
}
