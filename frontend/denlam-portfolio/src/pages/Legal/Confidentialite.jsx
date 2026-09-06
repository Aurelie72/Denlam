import contact from "../../content/settings/contact.json";
import "./Legal.css";

export default function Confidentialite() {
  return (
    <section className="legal-page">
      <h2 className="legal-title-main">Politique de confidentialité</h2>
      

      <h2>Responsable du traitement</h2>
      <p>
        Le responsable du traitement des données collectées sur ce site est Thomas André,
        joignable à <a href={`mailto:${contact.email}`}>{contact.email}</a>.
      </p>

      <h2>Données collectées</h2>
      <p>
        Le formulaire de contact du site collecte les données suivantes, uniquement lorsque
        vous choisissez de les transmettre volontairement :
      </p>
      <ul>
        <li>Nom</li>
        <li>Adresse email</li>
        <li>Numéro de téléphone</li>
        <li>Contenu du message</li>
      </ul>
      <p>Aucune autre donnée personnelle n'est collectée automatiquement (pas de cookies de suivi, pas d'outil d'analyse d'audience à ce jour).</p>

      <h2>Finalité du traitement</h2>
      <p>
        Ces données sont utilisées exclusivement pour répondre à votre demande de contact.
        Elles ne sont ni revendues, ni transmises à des tiers, ni utilisées à des fins de
        prospection commerciale.
      </p>

      <h2>Base légale</h2>
      <p>
        Le traitement repose sur votre consentement, recueilli via la case à cocher du
        formulaire de contact au moment de l'envoi.
      </p>

      <h2>Destinataires des données</h2>
            <p>
              Seul Thomas André, en tant qu'administrateur du site, a accès aux messages reçus. Les
              données sont hébergées sur des serveurs MongoDB Atlas (MongoDB Inc.).
            </p>
            <p>
              L'envoi de l'email de notification, lors de la réception d'un message, est réalisé par
              l'intermédiaire du service Resend (Resend, Inc.), qui traite à cette fin votre nom,
              votre adresse email et le contenu de votre message, uniquement le temps nécessaire à
              la transmission de la notification.
            </p>
      
            <h2>Vos droits</h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi
              Informatique et Libertés, vous disposez d'un droit d'accès, de rectification,
              d'effacement et d'opposition concernant vos données personnelles. Vous pouvez exercer
              ces droits en écrivant à <a href={`mailto:${contact.email}`}>{contact.email}</a>.
            </p>
            <p>
              Vous disposez également du droit d'introduire une réclamation auprès de la CNIL
              (Commission Nationale de l'Informatique et des Libertés) si vous estimez que vos
              droits ne sont pas respectés.
            </p>
      
            <h2>Sécurité</h2>
            <p>
              Le site utilise une connexion chiffrée (HTTPS) et des mesures raisonnables sont mises
              en œuvre pour protéger vos données contre l'accès non autorisé, la perte ou
              l'altération.
            </p>
      
            <h2>Cookies</h2>
            <p>
              Ce site n'utilise pas de cookies de suivi publicitaire ou d'analyse d'audience à ce
              jour. Si cela venait à changer, cette politique serait mise à jour en conséquence.
            </p>
          </section>
        );
      }
      