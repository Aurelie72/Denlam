import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Header.css";
import logo from "../../assets/logo.png"

const NAV_LINKS = [
    { to: "/etude", label: "Étude & Agencement", end: false },
  { to: "/creations", label: "Créations", end: false },
  { to: "/#apropos", label: "À propos", end: false },
  { to: "/#contact", label: "Contact", end: false },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="site-header">
      <NavLink to="/" className="logo" onClick={() => setIsOpen(false)}>
        <img src={logo} alt="logo denlam" />
      </NavLink>

      <button
        className="nav-toggle"
        aria-expanded={isOpen}
        aria-controls="primary-nav"
        aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        onClick={() => setIsOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav id="primary-nav" className={isOpen ? "primary-nav open" : "primary-nav"}>
        <ul>
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <NavLink to={link.to} onClick={() => setIsOpen(false)}>
                {link.label}
              </NavLink>
            </li>
          ))}
          <li>
            {/* <NavLink to="/login" className="nav-admin" onClick={() => setIsOpen(false)}>
              Admin
            </NavLink> */}
          </li>
        </ul>
      </nav>
    </header>
  );
}
