import jwt from "jsonwebtoken";
import User from "../models/User.js";

function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// POST /api/auth/login
export async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Nom d'utilisateur et mot de passe requis." });
  }

  const user = await User.findOne({ username: username.trim().toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: "Identifiants incorrects." });
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    return res.status(401).json({ message: "Identifiants incorrects." });
  }

  const token = signToken(user);
  res.json({ token, user });
}

// GET /api/auth/me
export async function me(req, res) {
  res.json({ user: req.user });
}
