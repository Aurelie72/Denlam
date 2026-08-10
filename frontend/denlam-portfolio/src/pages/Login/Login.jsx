import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Login.css";

export default function Login() {
  const { login, error, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await login(username, password);
    if (ok) {
      const redirectTo = location.state?.from?.pathname || "/admin";
      navigate(redirectTo, { replace: true });
    }
  }

  return (
    <section className="login">
      <div className="login-card">
        <h2 className="visually-hidden">Se connecter</h2>
        <form className="form" onSubmit={handleSubmit}>
          <div className="input-field">
            <input
              type="text"
              id="username"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <label htmlFor="username">Nom d'utilisateur</label>
          </div>

          <div className="input-field">
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                required
                autoComplete="current-password"
                className="input-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="eye-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            <label htmlFor="password" className="input-label">
              Mot de passe
            </label>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button className="btn" type="submit" disabled={isLoading}>
            {isLoading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </section>
  );
}
