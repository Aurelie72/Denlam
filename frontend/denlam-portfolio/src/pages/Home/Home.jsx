import { useState } from "react";
import { Link } from "react-router-dom";
import {FaLinkedin} from "react-icons/fa";
import "./Home.css";
import crea from "../../assets/creadenlam.webp"
import eeta from "../../assets/eetadenlam.webp"
import portrait from "../../assets/portraitapropos.webp"
import cv from "../../assets/iconcv.png"
import cvthomas from "../../assets/CVthomas.pdf"


// hero et contact restent des textes statiques pour l'instant.
import hero from "../../content/settings/hero.json";
import contact from "../../content/settings/contact.json";

import { sendContactMessage, ApiError } from "../../services/api.js";
import { usePageMeta } from "../../hooks/usePageMeta.js";

// La section "À propos" est désormais statique (plus gérée depuis /admin) :
// modifie directement le nom, la photo et le texte ci-dessous/plus bas.
const ABOUT_NAME = "Thomas André";


const initialForm = { name: "", email: "", phone: "", message: "", consent: false };

export default function Home() {
   usePageMeta(
     null,
     "Denlam — Thomas André, menuisier-agenceur et designer d'objets sur mesure en Sarthe, Pays de la Loire. Étude, agencement, créations uniques."
   );
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errorMessage, setErrorMessage] = useState(null);

  function handleChange(e) {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    try {
      await sendContactMessage(form);
      setStatus("sent");
      setForm(initialForm);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    }
  }

  return (
    <>
    <h1 className="seo-tagline">ETUDE | AGENCEMENT | MENUISERIE | DESIGN | CREATIONS | SARTHE | PAYS DE LA LOIRE</h1>
      <section id="etude" className="hero">
        <Link to="/etude" className="hero-card">
          <span className="hero-card-media" aria-hidden="true">
        <img src={eeta} alt="" width="700" height="700" loading="eager" fetchpriority="high" decoding="async" />
          </span>
          <h2>{hero.card1_label}</h2>
        </Link>
        <Link to="/creations" className="hero-card">
          <span className="hero-card-media" aria-hidden="true">
           <img src={crea} alt="" width="700" height="700" loading="eager" fetchPriority="high" decoding="async" />
          </span>
          <h2>{hero.card2_label}</h2>
        </Link>
      </section>
      <section id="apropos" className="about">
        <div className="about-inner">
<img className="about-portrait" src={portrait} alt={`Portrait de ${ABOUT_NAME}`} width="760" height="480" loading="lazy" decoding="async" />
<div className="about-text">
  <h2>{ABOUT_NAME}</h2>

  <p>
    Picqué par le dessin dès les années collège, c’est tout naturellement que je
    m’oriente vers les Arts Appliqués. En parallèle, je développe une véritable
    appétence pour le travail de la matière, au fil de journées entières passées
    à façonner, souder, démonter, comprendre — guidé par l’œil aguerri de mon
    grand-père.   Une formation post-bac en Design viendra confirmer mes choix et nourrir mon
    goût pour l’art, la création et l’expérimentation. Mes créations se situent
    au croisement de l’art et du design.
  </p>

  <p className="indent">
    Elles naissent souvent d’une découverte visuelle : un objet, un rebus, une
    matière qui révèle une qualité inattendue. J’aime imaginer des choses.
  </p>

  <p className="indent">
    Je commence toujours par coucher l’idée sur le papier, en la dessinant ou en
    l’écrivant. À ce moment-là, je n’ai pas encore une vision précise du résultat
    final ; je laisse l’intuition ouvrir la voie.
  </p>

  <p className="indent">
    J’expérimente toujours avec l’idée que l’objet peut marcher, en me fixant
    comme seule contrainte l’usage : imaginer un objet qui trouve sa place, qui
    sert, qui vit, qui se différencie.
  </p>
</div>
        </div>
      </section>

      <section id="contact" className="contact">
        <div className="contact-form-wrap">
          <h2>Un projet, une question ?</h2>
          <br />
          <p className="form-required-note">* champ obligatoire</p>
          <form className="form" onSubmit={handleSubmit}>
            <div className="input-field">
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder=" "
                autoComplete="off"
                value={form.name}
                onChange={handleChange}
              />
              <label htmlFor="name">Nom *</label>
            </div>

            <div className="input-field">
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder=" "
                pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
   title="Adresse email invalide (exemple : nom@domaine.com)"
                autoComplete="off"
                value={form.email}
                onChange={handleChange}
              />
              <label htmlFor="email">Email *</label>
            </div>

            <div className="input-field">
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder=" "
                autoComplete="off"
                value={form.phone}
                onChange={handleChange}
              />
              <label htmlFor="phone">Numéro de téléphone</label>
            </div>

            <div className="input-field">
              <textarea
                id="message"
                name="message"
                cols="30"
                rows="6"
                minLength={10}
                required
                placeholder=" "
                value={form.message}
                onChange={handleChange}
              />
              <label htmlFor="message">Votre message *</label>
            </div>

            <label className="container-checkbox">
              En cochant cette case, je consens à ce que mes informations
              soient utilisées afin de me contacter
              <input
                type="checkbox"
                name="consent"
                required
                checked={form.consent}
                onChange={handleChange}
              />
              <span className="checkmark" />
            </label>

            <button className="btn" type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Envoi…" : "Envoyer"}
            </button>

            {status === "sent" && (
              <p className="form-feedback success">
                Votre message a bien été envoyé, merci !
              </p>
            )}

            {status === "error" && (
              <p className="form-feedback error">
                {errorMessage || "Une erreur est survenue, réessaie dans un instant."}
              </p>
            )}
          </form>
        </div>

        <div className="coordonnees">
          <h2>Mes Coordonnées</h2>
          <p>{contact.address_line1}</p>
          <p>{contact.address_line2}</p>
          <a href={`tel:${contact.phone.replace(/\D/g, "")}`} className="phone-link">
  {contact.phone}
</a>
          <a href={`mailto:${contact.email}`} className="email-link">
  {contact.email}
</a>


          <div className="reseaux">
            {/* {contact.instagram && (
              <a href={contact.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
                <FaInstagram />
              </a>
            )} */}
            {contact.linkedin && (
              <a href={contact.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <FaLinkedin />
              </a>
            )}
<a
  href={cvthomas}
  className="cv-icon"
  target="_blank"
  aria-label="Télécharger mon CV (PDF, nouvel onglet)"
  rel="noopener noreferrer"
>
  <img src={cv} alt="Télécharger mon CV" />
</a>
            {/* {contact.facebook && (
              <a href={contact.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
                <FaFacebook />
              </a>
            )} */}
          </div>
        </div>
      </section>
    </>
  );
}
