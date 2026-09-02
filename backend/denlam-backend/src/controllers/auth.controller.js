import jwt from "jsonwebtoken";
import User from "../models/User.js";

function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

export async function login(req, res) {
  const { username, password } = req.body;

  // Vérification explicite du type : empêche qu'un objet (au lieu d'une
  // chaîne) soit glissé dans la requête pour tenter de manipuler la
  // vérification du mot de passe.
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    !username ||
    !password
  ) {
    return res
      .status(400)
      .json({ message: "Nom d'utilisateur et mot de passe requis." });
  }

  const user = await User.findOne({ username: username.trim().toLowerCase() });
  if (!user)
    return res.status(401).json({ message: "Identifiants incorrects." });

  const valid = await user.comparePassword(password);
  if (!valid)
    return res.status(401).json({ message: "Identifiants incorrects." });

  const token = signToken(user);
  res.json({ token, user });
}

export async function me(req, res) {
  res.json({ user: req.user });
}
