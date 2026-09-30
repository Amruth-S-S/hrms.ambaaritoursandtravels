const PRODUCTION_API_URL = "https://hrms-backend-ambaaritoursandtravels.vercel.app";

// NEXT_PUBLIC_API_URL wins when set. Otherwise use the local API on localhost and the deployed API everywhere else.
function defaultApiUrl() {
  if (typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    return "http://localhost:8000";
  }
  return PRODUCTION_API_URL;
}

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || defaultApiUrl()).replace(/\/$/, "");
const TOKEN_KEY = "hrms_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  window.localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  if (typeof window !== "undefined") window.localStorage.removeItem(TOKEN_KEY);
}

function readDetail(detail) {
  if (!detail) return null;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((e) => {
        const field = (e.loc || []).filter((x) => x !== "body").join(".");
        const msg = (e.msg || "").replace(/^Value error, /, "");
        return field ? `${field}: ${msg}` : msg;
      })
      .join("; ");
  }
  return JSON.stringify(detail);
}

/**
 * Call the HRMS API.
 * options: { method, body (JSON), form (FormData), params (query object), raw (return Response) }
 */
export async function api(path, { method = "GET", body, form, params, raw = false } = {}) {
  const url = new URL(`${API_URL}/api${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    });
  }
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (form) payload = form;
  else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(url, { method, headers, body: payload });
  } catch {
    throw new Error("Cannot reach the server. Check your connection and that the API is running.");
  }

  if (res.status === 401 && path !== "/auth/login") {
    clearToken();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login?expired=1";
    }
    throw new Error("Your session has ended. Please log in again.");
  }
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      message = readDetail(data.detail) || message;
    } catch {}
    throw new Error(message);
  }
  if (raw) return res;
  if (res.status === 204) return null;
  return res.json();
}

/** Authenticated URL for a stored selfie, usable in <img src>. */
export function fileUrl(id) {
  if (!id) return null;
  return `${API_URL}/api/files/${id}?token=${encodeURIComponent(getToken() || "")}`;
}

export async function downloadFile(path, params, filename) {
  const res = await api(path, { params, raw: true });
  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
