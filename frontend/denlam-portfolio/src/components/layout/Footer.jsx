import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <p className="site-footer-brand">Denlam</p>
      <div className="footer-links">
        <Link to="/mentions-legales">Mentions légales</Link>
        <Link to="/confidentialite">Politique de confidentialité</Link>
        <Link to="/admin">Espace Admin</Link>
      </div>
      <p className="copy">© {new Date().getFullYear()} Denlam — Tous droits réservés</p>
      <a 
  href="https://portfolio-aur-lie.vercel.app/" 
  target="_blank" 
  rel="noopener noreferrer"
  className="copy"
>
  Conception du site par Aurélie Beaufils
</a>
    </footer>
  );
}
