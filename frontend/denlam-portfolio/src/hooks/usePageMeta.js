import { useEffect } from "react";

const SITE_NAME = "Denlam";
const DEFAULT_DESCRIPTION =
  "Denlam — Étude, agencement, menuiserie, design et créations sur mesure. Sarthe, Pays de la Loire.";

function setMetaDescription(content) {
  let tag = document.querySelector('meta[name="description"]');
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", "description");
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setOgTag(property, content) {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setCanonical(url) {
  let tag = document.querySelector('link[rel="canonical"]');
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", "canonical");
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", url);
}

/**
 * Définit le <title> et la meta description (+ Open Graph + canonique) de
 * la page courante. À appeler dans chaque page avec un titre/description
 * propre.
 *
 * usePageMeta("Créations", "Découvrez mes créations sur mesure...")
 */
export function usePageMeta(title, description = DEFAULT_DESCRIPTION) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} — ${SITE_NAME}`
      : `${SITE_NAME} — Objets & Agencement`;
    document.title = fullTitle;
    setMetaDescription(description);
    setOgTag("og:title", fullTitle);
    setOgTag("og:description", description);
    setOgTag("og:url", window.location.href);
    setCanonical(window.location.origin + window.location.pathname);
  }, [title, description]);
}
