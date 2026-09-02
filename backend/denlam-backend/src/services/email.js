import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) return null;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });
  return transporter;
}

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

  const phoneLine = message.phone ? `Téléphone : ${message.phone}` : null;

  await t.sendMail({
    from: `"Site Denlam" <${from}>`,
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
}

function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
