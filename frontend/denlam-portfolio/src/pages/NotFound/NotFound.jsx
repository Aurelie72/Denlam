import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section style={{ padding: "100px 24px", textAlign: "center" }}>
      <h2>Page introuvable</h2>
      <p style={{ margin: "16px 0", color: "var(--color-muted)" }}>
        Cette page n'existe pas ou plus.
      </p>
      <Link to="/" className="btn" style={{ textDecoration: "none" }}>
        Retour à l'accueil
      </Link>
    </section>
  );
}
