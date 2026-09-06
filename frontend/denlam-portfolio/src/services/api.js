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
export function fetchCreations() {
  return request("/creations");
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

export function reorderCreations(ids, token) {
  return request("/creations/reorder", { method: "PUT", body: { ids }, token });
}

// ---- Messages de contact -------------------------------------------------
export function sendContactMessage(payload) {
  return request("/messages", { method: "POST", body: payload });
}

export function fetchMessages(token) {
  return request("/messages", { token });
}

export function toggleMessageRead(id, token) {
  return request(`/messages/${id}/read`, { method: "PATCH", token });
}

export function deleteMessage(id, token) {
  return request(`/messages/${id}`, { method: "DELETE", token });
}

// ---- Étude & Agencement ---------------------------------------------------
export function fetchEtudePlans() {
  return request("/etude/plans");
}

export function addEtudePlan(formData, token) {
  return request("/etude/plans", {
    method: "POST",
    body: formData,
    token,
    isFormData: true,
  });
}

export function updateEtudePlan(id, formData, token) {
  return request(`/etude/plans/${id}`, {
    method: "PUT",
    body: formData,
    token,
    isFormData: true,
  });
}

export function deleteEtudePlan(id, token) {
  return request(`/etude/plans/${id}`, { method: "DELETE", token });
}

export function reorderEtudePlans(ids, token) {
  return request("/etude/plans/reorder", {
    method: "PUT",
    body: { ids },
    token,
  });
}

// Télécharge un export complet de la base (créations, plans, messages) au
// format JSON, directement dans le navigateur — pas de fetch générique via
// request() ici, car on doit gérer un fichier téléchargeable, pas du JSON
// à parser normalement.
export async function downloadBackup(token) {
  const response = await fetch(`${API_URL}/backup`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new ApiError(
      "Erreur lors du téléchargement de la sauvegarde.",
      response.status,
    );
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `denlam-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export { ApiError, API_URL };

export function resolveImageUrl(path) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  const origin = API_URL.replace(/\/api\/?$/, "");
  return `${origin}${path}`;
}
