import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <h3>Denlam</h3>

      <nav className="footer-links">
        <a href="/mentions-legales">Mentions légales</a>
        <br />
        <a href="/confidentialité">Confidentialité</a>
        <br />
        <a href="/admin">Espace Admin</a>
      </nav>

      <p className="copy">© {new Date().getFullYear()} Denlam — Tous droits réservés</p>
    </footer>
  );
}
