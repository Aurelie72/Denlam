import Message from "../models/Message.js";
import { sendContactNotification } from "../services/email.js";

// POST /api/messages — public (soumission du formulaire de contact)
export async function createMessage(req, res) {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    return res
      .status(400)
      .json({ message: "Tous les champs sont obligatoires." });
  }

  const doc = await Message.create({ name, email, phone, message });

  // L'email est un "bonus" : s'il échoue (SMTP mal configuré, panne...),
  // le message reste bien enregistré et visible dans /admin.
  sendContactNotification(doc).catch((err) => {
    console.error("[email] échec de l'envoi de la notification :", err.message);
  });

  res.status(201).json({ message: "Message envoyé avec succès.", id: doc.id });
}

// GET /api/messages — protégé (admin)
export async function listMessages(req, res) {
  const messages = await Message.find().sort({ createdAt: -1 });
  res.json(messages);
}

// PATCH /api/messages/:id/read — protégé (marquer comme lu/non lu)
export async function toggleRead(req, res) {
  const doc = await Message.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Message introuvable." });

  doc.read = !doc.read;
  await doc.save();
  res.json(doc);
}

// DELETE /api/messages/:id — protégé
export async function deleteMessage(req, res) {
  const doc = await Message.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: "Message introuvable." });
  res.status(204).send();
}
