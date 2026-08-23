import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <h3>Denlam</h3>
      <div className="footer-links">
        <Link to="/mentions-legales">Mentions légales</Link>
        <Link to="/confidentialite">Politique de confidentialité</Link>
        <Link to="/admin">Espace Admin</Link>
      </div>
      <p className="copy">© {new Date().getFullYear()} Denlam — Tous droits réservés</p>
      <Link to="/admin" className="copy">Conception du site par Aurélie Beaufils</Link>
    </footer>
  );
}
