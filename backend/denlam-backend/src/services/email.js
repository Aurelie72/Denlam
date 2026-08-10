import nodemailer from "nodemailer";

// Transport SMTP générique : fonctionne avec Gmail (mot de passe
// d'application) OU n'importe quel autre SMTP (hébergeur, Brevo,
// Infomaniak, OVH...) — il suffit de renseigner les bonnes variables
// dans .env. Voir .env.example pour le détail des deux cas.
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) {
    return null; // email non configuré — on ne bloque pas le reste de l'app
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465, // true pour le port 465, false pour 587/25
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });

  return transporter;
}

// Envoie une notification au client à chaque nouveau message de contact.
// N'importe quelle erreur ici est volontairement avalée par l'appelant
// (voir messages.controller.js) : un souci d'email ne doit jamais faire
// échouer l'enregistrement du message en base.
export async function sendContactNotification(message) {
  const t = getTransporter();
  if (!t) {
    console.warn(
      "[email] SMTP non configuré (.env) — notification non envoyée.",
    );
    return;
  }

  const to = process.env.MAIL_TO || process.env.SMTP_USER;
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;

  await t.sendMail({
    from: `"Site Denlam" <${from}>`,
    to,
    replyTo: message.email,
    subject: `Nouveau message de ${message.name} — site Denlam`,
    text: [
      `Nom : ${message.name}`,
      `Email : ${message.email}`,
      `Téléphone : ${message.phone}`,
      "",
      message.message,
    ].join("\n"),
    html: `
      <p><strong>Nom :</strong> ${escapeHtml(message.name)}</p>
      <p><strong>Email :</strong> ${escapeHtml(message.email)}</p>
      <p><strong>Téléphone :</strong> ${escapeHtml(message.phone)}</p>
      <p><strong>Message :</strong></p>
      <p>${escapeHtml(message.message).replace(/\n/g, "<br>")}</p>
    `,
  });
}

function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
