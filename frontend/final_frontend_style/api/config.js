/**
 * GhassraCore — API Configuration
 * Centralizes the base URL and shared request helpers.
 * Change BASE_URL once here; every module picks it up automatically.
 */

const API_CONFIG = {
  BASE_URL: "http://localhost/Ghassra/backend/api",
  TIMEOUT_MS: 10_000,
};

/**
 * Read the JWT token stored after login.
 * @returns {string|null}
 */
function getToken() {
  return localStorage.getItem("gc_token");
}

/**
 * Persist the JWT token received from the backend.
 * @param {string} token
 */
function setToken(token) {
  localStorage.setItem("gc_token", token);
}

/**
 * Remove the token on logout.
 */
function clearToken() {
  localStorage.removeItem("gc_token");
}

/**
 * Build the Authorization header when a token exists.
 * @returns {Record<string, string>}
 */
function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Core fetch wrapper.
 * - Attaches Content-Type + Authorization headers automatically.
 * - Throws a structured error `{ status, message, data }` on non-2xx.
 *
 * @param {string}  path     – path relative to BASE_URL (e.g. "/auth/login.php")
 * @param {object}  [opts]   – fetch options override (method, body, etc.)
 * @returns {Promise<any>}   – parsed JSON response body
 */
async function apiFetch(path, opts = {}) {
  const url = `${API_CONFIG.BASE_URL}${path}`;

  const headers = {
    "Content-Type": "application/json",
    ...authHeaders(),
    ...(opts.headers ?? {}),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...opts,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let data;
    const contentType = response.headers.get("Content-Type") ?? "";
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const message =
        (typeof data === "object" && data?.message) ||
        `HTTP ${response.status}`;
      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      const timeout = new Error("Request timed out");
      timeout.status = 408;
      throw timeout;
    }
    throw err;
  }
}

// Expose globally so every other module can import without bundler
window.GC = window.GC || {};
window.GC.config = API_CONFIG;
window.GC.getToken = getToken;
window.GC.setToken = setToken;
window.GC.clearToken = clearToken;
window.GC.apiFetch = apiFetch;
