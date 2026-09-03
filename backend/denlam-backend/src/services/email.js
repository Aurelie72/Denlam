import { Resend } from "resend";

let client = null;

function getClient() {
  if (client) return client;
  if (!process.env.RESEND_API_KEY) return null;
  client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

// Envoie une notification email à chaque nouveau message du formulaire de
// contact, via Resend (API HTTPS — contrairement au SMTP classique, jamais
// bloqué par les hébergeurs gratuits comme Render). N'échoue jamais
// bruyamment : si l'envoi rate, le message reste quand même enregistré en
// base et visible dans /admin.
export async function sendContactNotification(message) {
  const resend = getClient();
  if (!resend) {
    console.warn(
      "[email] RESEND_API_KEY non configuré (.env) — notification non envoyée.",
    );
    return;
  }

  const to = process.env.MAIL_TO;
  if (!to) {
    console.warn(
      "[email] MAIL_TO non configuré (.env) — notification non envoyée.",
    );
    return;
  }

  const from = process.env.MAIL_FROM || "Site Denlam <contact@denlam.fr>";
  const phoneLine = message.phone ? `Téléphone : ${message.phone}` : null;

  try {
    await resend.emails.send({
      from,
      to,
      replyTo: message.email,
      subject: `Nouveau message de ${message.name} — site Denlam`,
      text: [
        `Nom : ${message.name}`,
        `Email : ${message.email}`,
        phoneLine,
        "",
        message.message,
      ]
        .filter(Boolean)
        .join("\n"),
      html: `
        <p><strong>Nom :</strong> ${escapeHtml(message.name)}</p>
        <p><strong>Email :</strong> ${escapeHtml(message.email)}</p>
        ${message.phone ? `<p><strong>Téléphone :</strong> ${escapeHtml(message.phone)}</p>` : ""}
        <p><strong>Message :</strong></p>
        <p>${escapeHtml(message.message).replace(/\n/g, "<br>")}</p>
      `,
    });
  } catch (err) {
    console.error("[email] échec de l'envoi de la notification :", err.message);
  }
}

function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
