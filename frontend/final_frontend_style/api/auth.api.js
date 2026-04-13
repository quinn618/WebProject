/**
 * GhassraCore — Auth API
 * Matches: backend/api/auth/
 *   ├── login.php
 *   ├── register.php
 *   └── logout.php
 *
 * Every function returns a Promise that resolves with the server's JSON
 * payload, or rejects with { status, message, data }.
 */

const AuthAPI = (() => {
  const { apiFetch, setToken, clearToken } = window.GC;

  /**
   * POST /auth/register.php
   * Register a new student account.
   *
   * @param {{
   *   name: string,
   *   email: string,
   *   password: string,
   *   password_confirm: string,
   *   institute_name: string,
   *   institute_code: string,
   *   major?: string,
   *   level: string,
   * }} payload
   *
   * Expected backend response on success:
   *   { success: true, message: string, token: string, user: {...} }
   */
  async function register(payload) {
    const data = await apiFetch("/auth/register.php", {
      method: "POST",
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        password: payload.password,
        password_confirm: payload.password_confirm,
        institute_name: payload.institute_name,
        institute_code: payload.institute_code,
        major: payload.major ?? "",
        level: payload.level,
      }),
    });

    // Persist token immediately so subsequent requests are authenticated
    if (data?.token) setToken(data.token);
    return data;
  }

  /**
   * POST /auth/login.php
   * Authenticate with email + institute code + password.
   *
   * @param {{
   *   email: string,
   *   password: string,
   *   institute_code: string,
   * }} credentials
   *
   * Expected backend response on success:
   *   { success: true, message: string, token: string, user: {...} }
   */
  async function login(credentials) {
    const data = await apiFetch("/auth/login.php", {
      method: "POST",
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
        institute_code: credentials.institute_code,
      }),
    });

    if (data?.token) setToken(data.token);
    return data;
  }

  /**
   * POST /auth/logout.php
   * Invalidate the server-side session / token.
   * The token is cleared locally regardless of server response.
   *
   * Expected backend response:
   *   { success: true, message: string }
   */
  async function logout() {
    try {
      const data = await apiFetch("/auth/logout.php", { method: "POST" });
      return data;
    } finally {
      // Always clear the local token even if the request fails
      clearToken();
    }
  }

  return { register, login, logout };
})();

window.GC.AuthAPI = AuthAPI;
