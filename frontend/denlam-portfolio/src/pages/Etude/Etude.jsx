import { useEffect, useState } from "react";
import { fetchEtudePlans, ApiError } from "../../services/api.js";
import { usePageMeta } from "../../hooks/usePageMeta.js";
import { ETUDE_INTRO } from "../../content/introTexts.js";
import PlanCard from "./PlanCard.jsx";
import "./Etude.css";
const relevesImage = new URL("../../assets/relevés.webp", import.meta.url).href;

const TABS = [
  { key: "conseils", label: "Conseils" },
  { key: "releves", label: "Relevés" },
  { key: "plan", label: "Plans" },
];

const CONSEILS_CONTENT = {
  description:
    "Chaque projet commence par une rencontre.  Je me déplace chez vous lors d'un rendez-vous privilégié pour écouter vos attentes et comprendre votre projet. Lors de cet échange, je vous oriente et vous conseille sur les meilleures solutions techniques et esthétiques. Nous choisissons ensemble les matériaux les plus adaptés à vos goûts pour donner vie à un intérieur qui vous ressemble.",
  images: ["https://picsum.photos/seed/etude-conseils/700/500"],
};

const RELEVES_CONTENT = {
  description:
    "Le relevé est la première étape essentielle de votre projet.  Je me déplace directement chez vous pour prendre les dimensions exactes de votre espace. Ce rendez-vous technique est le moment idéal pour anticiper toutes les contraintes de votre intérieur : j'analyse l'état de vos murs supports et j'étudie l'emplacement de vos réseaux (eau, air, électricité) afin de garantir la faisabilité de votre futur agencement.",
  images: [relevesImage],
  frameless: true,
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
                <PlanCard
                  key={plan.id}
                  description={plan.description}
                  images={plan.images}
                  zoomable
                />
              ))}
          </>
        )}
      </div>
    </section>
  );
}