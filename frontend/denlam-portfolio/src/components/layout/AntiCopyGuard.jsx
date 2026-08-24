import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Dissuasion légère uniquement — ne bloque PAS les captures d'écran
// (techniquement impossible depuis un site web, voir discussion avec le
// client). Désactivé sur /admin et /login pour ne pas gêner le travail de
// l'administrateur (copier-coller de textes, identifiants, etc.).
const EXCLUDED_PREFIXES = ["/admin", "/login"];

export default function AntiCopyGuard() {
  const location = useLocation();
  const isExcluded = EXCLUDED_PREFIXES.some((p) => location.pathname.startsWith(p));

  useEffect(() => {
    if (isExcluded) {
      document.body.classList.remove("no-select");
      return;
    }

    function handleContextMenu(e) {
      e.preventDefault();
    }

    function handleKeyDown(e) {
      const key = e.key.toLowerCase();
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      const blocked =
        key === "f12" ||
        (isCtrlOrCmd && ["s", "u", "p"].includes(key)) ||
        (isCtrlOrCmd && e.shiftKey && ["i", "j", "c"].includes(key));

      if (blocked) e.preventDefault();
    }

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.body.classList.add("no-select");

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("no-select");
    };
  }, [isExcluded, location.pathname]);

  return null;
}
