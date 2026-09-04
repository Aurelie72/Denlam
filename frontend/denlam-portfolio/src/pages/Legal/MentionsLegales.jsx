import contact from "../../../content/settings/contact.json";
import "./Legal.css";

export default function MentionsLegales() {
  return (
    <section className="legal-page">
      <h2 className="legal-title-main">Mentions légales</h2>

      <h2>Éditeur du site</h2>
      <p>
        Le présent site est édité par Thomas André, exerçant sous le statut d'auto-entrepeneur
        
      </p>
      <ul>
        <li>Adresse : {contact.address_line1}, {contact.address_line2}</li>
        <li>Téléphone : {contact.phone}</li>
        <li>Email : {contact.email}</li>
        <li>
          SIRET : 97971983800018
        </li>
      </ul>

      <h2>Directeur de la publication</h2>
            <p>Thomas André.</p>
      
            <h2>Hébergement du site</h2>
            <p>
              Le site est hébergé par Netlify, Inc. — 512 2nd
              Street, Suite 200, San Francisco, CA 94107, États-Unis.
            </p>
            <p>
              La partie technique du site (traitement des demandes, connexion à la base de données)
              est hébergée par Render Services, Inc. — 525 Brannan Street, Suite 300, San Francisco,
              CA 94107, États-Unis.
            </p>
      
            <h2>Hébergement des données</h2>
            <p>
              Les informations du site (créations, textes, messages reçus via le formulaire de
              contact) sont hébergées sur des serveurs MongoDB Atlas, exploités par MongoDB Inc.
            </p>
            <p>
              Les photographies du site sont hébergées et optimisées par Cloudinary Ltd.
            </p>
            <p>
              Les emails de notification envoyés lors de la réception d'un message de contact
              transitent par le service Resend (Resend, Inc.).
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
      