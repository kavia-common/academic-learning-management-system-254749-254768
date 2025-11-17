import { getSupabaseClient } from "../supabaseClient";

/**
 * PUBLIC_INTERFACE
 * getSessionToken
 * Returns the current Supabase session access token for authenticated requests.
 */
export async function getSessionToken() {
  /** This is a public function. Retrieves current session access token. */
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data?.session?.access_token || null;
}

/**
 * Parse feature flags from REACT_APP_FEATURE_FLAGS JSON string.
 */
function getFeatureFlags() {
  const raw = process.env.REACT_APP_FEATURE_FLAGS;
  try {
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    // Fallback: allow simple truthy detection if misconfigured
    return {};
  }
}

/**
 * Returns true if backend should be used for privileged actions.
 */
function shouldUseBackend() {
  const flags = getFeatureFlags();
  const backendUrl = (process.env.REACT_APP_BACKEND_URL || "").trim();
  return Boolean(backendUrl) && Boolean(flags.use_backend);
}

/**
 * PUBLIC_INTERFACE
 * backendHealthcheck
 * Performs a health check to the backend GET /api/v1/health if backend is enabled.
 */
export async function backendHealthcheck() {
  /** This is a public function. Checks backend health and returns { ok, status }. */
  if (!shouldUseBackend()) {
    return { ok: true, status: 200 };
  }
  const base = process.env.REACT_APP_BACKEND_URL?.replace(/\/+$/, "") || "";
  const path = process.env.REACT_APP_HEALTHCHECK_PATH || "/api/v1/health";
  try {
    const res = await fetch(`${base}${path}`, { method: "GET", credentials: "include" });
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

/**
 * Internal helper to build headers including Supabase Bearer token.
 */
async function buildAuthHeaders(extra = {}) {
  const headers = { "Content-Type": "application/json", ...extra };
  const token = await getSessionToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  // CORS origin hint (not a CORS header setter, but can be useful for backend checks)
  const origin = process.env.REACT_APP_FRONTEND_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  headers["X-Client-Origin"] = origin;
  return headers;
}

/**
 * Generic backend request wrapper with JSON body, returns parsed JSON or throws on HTTP error.
 */
async function backendJson(path, { method = "GET", body, extraHeaders } = {}) {
  const base = process.env.REACT_APP_BACKEND_URL?.replace(/\/+$/, "") || "";
  const url = `${base}${path}`;
  const headers = await buildAuthHeaders(extraHeaders);
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const message = text || `Backend request failed with ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return await res.json();
  }
  return null;
}

/**
 * PUBLIC_INTERFACE
 * updateUserRole
 * Admin-only: updates a user's role via backend. Expects payload { userId, role }.
 */
export async function updateUserRole({ userId, role }) {
  /** This is a public function. Calls backend to update a user's role. */
  if (!shouldUseBackend()) {
    throw new Error("Backend integration disabled by feature flag or missing REACT_APP_BACKEND_URL.");
  }
  return backendJson("/api/v1/admin/users/role", {
    method: "POST",
    body: { userId, role },
  });
}

/**
 * PUBLIC_INTERFACE
 * gradeSubmission
 * Instructor/Admin: posts a grade for a submission.
 */
export async function gradeSubmission({ submissionId, score, feedback }) {
  /** This is a public function. Calls backend to record a grade. */
  if (!shouldUseBackend()) {
    throw new Error("Backend integration disabled by feature flag or missing REACT_APP_BACKEND_URL.");
  }
  return backendJson("/api/v1/grades", {
    method: "POST",
    body: { submissionId, score, feedback },
  });
}

/**
 * PUBLIC_INTERFACE
 * createSignedUploadUrl
 * Returns a signed URL for uploading submission content or assets.
 */
export async function createSignedUploadUrl({ fileName, contentType, scope }) {
  /** This is a public function. Requests a signed upload URL from backend. */
  if (!shouldUseBackend()) {
    throw new Error("Backend integration disabled by feature flag or missing REACT_APP_BACKEND_URL.");
  }
  return backendJson("/api/v1/uploads/sign", {
    method: "POST",
    body: { fileName, contentType, scope },
  });
}
