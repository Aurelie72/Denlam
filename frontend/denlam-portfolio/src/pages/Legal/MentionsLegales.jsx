import contact from "../../../content/settings/contact.json";
import "./Legal.css";

export default function MentionsLegales() {
  return (
    <section className="legal-page">
      <h2 className="legal-title-main">Mentions légales</h2>

      <h2>Éditeur du site</h2>
      <p>
        Le présent site est édité par Thomas André, exerçant sous le statut de{" "}
        <mark className="legal-placeholder">[forme juridique à préciser — ex. entrepreneur individuel]</mark>.
      </p>
      <ul>
        <li>Adresse : {contact.address_line1}, {contact.address_line2}</li>
        <li>Téléphone : {contact.phone}</li>
        <li>Email : {contact.email}</li>
        <li>
          SIRET : <mark className="legal-placeholder">[à compléter]</mark>
        </li>
      </ul>

      <h2>Directeur de la publication</h2>
      <p>Thomas André.</p>

      <h2>Hébergement du site</h2>
      <p>
        Le site est hébergé par <mark className="legal-placeholder">[nom de l'hébergeur à compléter]</mark>,
        {" "}<mark className="legal-placeholder">[adresse de l'hébergeur]</mark>.
      </p>

      <h2>Hébergement des données</h2>
      <p>
        Les données transmises via le formulaire de contact et les informations du site
        (créations, textes, photos) sont hébergées sur des serveurs MongoDB Atlas, exploités
        par MongoDB Inc.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L'ensemble des contenus présents sur ce site (textes, photographies, logo, mise en
        page) est la propriété de Thomas André, sauf mention contraire, et est protégé par le
        droit d'auteur. Toute reproduction, représentation ou diffusion, totale ou partielle,
        sans autorisation préalable est interdite.
      </p>

      <h2>Liens hypertextes</h2>
      <p>
        Ce site peut contenir des liens vers des sites tiers (réseaux sociaux notamment).
        Thomas André n'exerce aucun contrôle sur ces sites et décline toute responsabilité
        quant à leur contenu.
      </p>

      <h2>Contact</h2>
      <p>
        Pour toute question relative à ces mentions légales, vous pouvez écrire à{" "}
        <a href={`mailto:${contact.email}`}>{contact.email}</a>.
      </p>
    </section>
  );
}
