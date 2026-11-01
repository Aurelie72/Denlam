import PhotoCarousel from "../../components/PhotoCarousel.jsx";

// Détecte les adresses commençant par http://, https:// ou www.
const URL_REGEX = /((?:https?:\/\/|www\.)[^\s<]+)/gi;

// Transforme un texte en morceaux de texte + liens cliquables.
// Pas de dangerouslySetInnerHTML : React échappe tout, donc aucun risque d'injection.
function linkify(text) {
  return text.split(URL_REGEX).map((part, i) => {
    // Les morceaux d'indice impair sont les adresses trouvées par la regex
    if (i % 2 === 0) return part;

    // On sort la ponctuation de fin (point, virgule, parenthèse…) du lien
    const trailing = part.match(/[.,;:!?)]+$/)?.[0] ?? "";
    const url = trailing ? part.slice(0, -trailing.length) : part;
    const href = url.startsWith("www.") ? `https://${url}` : url;

    return (
      <span key={i}>
        <a href={href} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
        {trailing}
      </span>
    );
  });
}

export default function PlanCard({ description, images, zoomable = false, frameless = false }) {
  const alt = "Photo d'un plan d'agencement";

  return (
    <div className="etude-plan-card">
      <div className="detail-description">
        <p>{linkify(description)}</p>
      </div>
      <PhotoCarousel images={images} alt={alt} zoomable={zoomable} frameless={frameless} />
    </div>
  );
}