import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginRequest, fetchCurrentUser, ApiError } from "../services/api.js";

const AuthContext = createContext(null);
const STORAGE_KEY = "denlam_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(token));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;

    fetchCurrentUser(token)
      .then((data) => {
        if (!cancelled) setUser(data?.user ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          setToken(null);
          localStorage.removeItem(STORAGE_KEY);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function login(username, password) {
    setError(null);
    setIsLoading(true);
    try {
      const data = await loginRequest(username, password);
      setToken(data.token);
      setUser(data.user ?? null);
      localStorage.setItem(STORAGE_KEY, data.token);
      return true;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Une erreur inattendue est survenue.";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  const value = useMemo(
    () => ({ user, token, isAuthenticated: Boolean(token), isLoading, error, login, logout }),
    [user, token, isLoading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé à l'intérieur de <AuthProvider>");
  return ctx;
}
