// ==========================================================================
// Client API centralisé. Toutes les requêtes vers le backend passent par ici.
// URL configurée via VITE_API_URL (voir .env).
// ==========================================================================

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(
  path,
  { method = "GET", body, token, isFormData = false } = {},
) {
  const headers = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Impossible de joindre le serveur. Vérifie que le backend est démarré et que VITE_API_URL est correctement configuré.",
      0,
    );
  }

  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  const data = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    throw new ApiError(
      data?.message || "Une erreur est survenue.",
      response.status,
    );
  }

  return data;
}

// ---- Auth -------------------------------------------------------------
export function loginRequest(username, password) {
  return request("/auth/login", {
    method: "POST",
    body: { username, password },
  });
}

export function fetchCurrentUser(token) {
  return request("/auth/me", { token });
}

// ---- Créations ----------------------------------------------------------
export function fetchCreations(category) {
  const query = category && category !== "tous" ? `?category=${category}` : "";
  return request(`/creations${query}`);
}

export function fetchCreation(id) {
  return request(`/creations/${id}`);
}

export function createCreation(payload, token) {
  const isFormData = payload instanceof FormData;
  return request("/creations", {
    method: "POST",
    body: payload,
    token,
    isFormData,
  });
}

export function updateCreation(id, payload, token) {
  const isFormData = payload instanceof FormData;
  return request(`/creations/${id}`, {
    method: "PUT",
    body: payload,
    token,
    isFormData,
  });
}

export function deleteCreation(id, token) {
  return request(`/creations/${id}`, { method: "DELETE", token });
}

// ---- Réglages du site (section À propos) -------------------------------
export function fetchAbout() {
  return request("/settings/about");
}

export function updateAbout(payload, token) {
  const isFormData = payload instanceof FormData;
  return request("/settings/about", {
    method: "PUT",
    body: payload,
    token,
    isFormData,
  });
}

export { ApiError, API_URL };

// Les images uploadées sont stockées en base sous forme de chemin relatif
// (ex. "/uploads/xxx.jpg"), servi par le BACKEND — pas le frontend. Cette
// fonction reconstruit l'URL complète pour que <img src=...> pointe au bon
// endroit (http://localhost:5000/uploads/xxx.jpg et non :5173/uploads/...).
export function resolveImageUrl(path) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path; // déjà une URL complète (ex. picsum)
  const origin = API_URL.replace(/\/api\/?$/, "");
  return `${origin}${path}`;
}
