import Message from "../models/Message.js";
import { sendContactNotification } from "../services/email.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createMessage(req, res) {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ message: "Nom, email et message sont obligatoires." });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: "Adresse email invalide." });
  }

  const doc = await Message.create({
    name,
    email,
    phone: phone || "",
    message,
  });

  sendContactNotification(doc).catch((err) => {
    console.error("[email] échec de l'envoi de la notification :", err.message);
  });

  res.status(201).json({ message: "Message envoyé avec succès.", id: doc.id });
}

export async function listMessages(req, res) {
  const messages = await Message.find().sort({ createdAt: -1 });
  res.json(messages);
}

export async function toggleRead(req, res) {
  const doc = await Message.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Message introuvable." });
  doc.read = !doc.read;
  await doc.save();
  res.json(doc);
}

export async function deleteMessage(req, res) {
  const doc = await Message.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: "Message introuvable." });
  res.status(204).send();
}
