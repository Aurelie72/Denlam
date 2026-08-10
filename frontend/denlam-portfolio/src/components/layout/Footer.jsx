import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <h3>Denlam</h3>
      <a href="/mentions-legales">Mentions légales</a>
      <p className="copy">© {new Date().getFullYear()} Denlam — Tous droits réservés</p>
    </footer>
  );
}
