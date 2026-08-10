import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// React Router ne fait pas défiler la page vers l'ancre (#apropos, etc.)
// automatiquement lors d'une navigation côté client — contrairement à un
// vrai <a href="#ancre">. Ce composant reproduit ce comportement, y compris
// quand on arrive depuis une autre page (ex. /creations -> /#apropos), en
// laissant le temps à la page cible de se monter avant de scroller.
export default function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");

      const timer = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 60); // laisse le temps à la page (ex. Home) de se rendre après un changement de route

      return () => clearTimeout(timer);
    }

    // Pas d'ancre : on remonte en haut de la nouvelle page (comportement standard)
    window.scrollTo({ top: 0 });
  }, [location.pathname, location.hash]);

  return null;
}
