/**
 * GhassraCore — Profile API
 * Matches: backend/api/profile/
 *   ├── get.php
 *   └── update.php
 *
 * Manages the logged-in user's profile data.
 * Mirrors the fields consumed by profile.js.
 */

const ProfileAPI = (() => {
  const { apiFetch } = window.GC;

  /**
   * GET /profile/get.php
   * Retrieve the full profile of the currently authenticated user.
   *
   * No parameters needed — the backend reads the user from the JWT.
   *
   * Expected response:
   *   {
   *     success: true,
   *     data: {
   *       id: string,
   *       name: string,
   *       email: string,
   *       username?: string,
   *       major?: string,
   *       year_level?: string,    – maps to profile.js "level" / "yearLevel"
   *       bio?: string,
   *       github?: string,
   *       institute_name?: string,
   *       institute_code?: string,
   *       avatar_url?: string,    – hosted URL (backend handles storage)
   *       sold?: number,          – total earnings / sold count
   *       created_at: string,
   *       updated_at?: string,
   *     }
   *   }
   */
  async function get() {
    return apiFetch("/profile/get.php");
  }

  /**
   * POST /profile/update.php
   * Update the authenticated user's profile.
   *
   * Supports two modes:
   *   1. JSON mode  — text fields only (no avatar change)
   *   2. FormData mode — when an avatar file is included
   *
   * @param {{
   *   name?: string,
   *   username?: string,
   *   email?: string,
   *   major?: string,
   *   year_level?: string,
   *   bio?: string,
   *   github?: string,
   *   avatar?: File|null,          – new avatar file (optional)
   *   current_password?: string,   – required only when changing password
   *   new_password?: string,
   *   new_password_confirm?: string,
   * }} payload
   *
   * Expected response:
   *   {
   *     success: true,
   *     message: string,
   *     data: { ...updated profile fields }
   *   }
   */
  async function update(payload) {
    const { getToken } = window.GC;
    const hasFile = payload.avatar instanceof File;

    if (hasFile) {
      // Multipart — let browser set Content-Type
      const form = new FormData();
      const textFields = [
        "name", "username", "email", "major",
        "year_level", "bio", "github",
        "current_password", "new_password", "new_password_confirm",
      ];
      textFields.forEach((key) => {
        if (payload[key] !== undefined && payload[key] !== null) {
          form.append(key, payload[key]);
        }
      });
      form.append("avatar", payload.avatar);

      const headers = {};
      const token = getToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const url = `${window.GC.config.BASE_URL}/profile/update.php`;
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: form,
      });
      const data = await response.json();
      if (!response.ok) {
        const err = new Error(data?.message ?? `HTTP ${response.status}`);
        err.status = response.status;
        err.data = data;
        throw err;
      }
      return data;
    }

    // JSON mode — text-only update
    const body = {};
    const fields = [
      "name", "username", "email", "major",
      "year_level", "bio", "github",
      "current_password", "new_password", "new_password_confirm",
    ];
    fields.forEach((key) => {
      if (payload[key] !== undefined) body[key] = payload[key];
    });

    return apiFetch("/profile/update.php", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  return { get, update };
})();

window.GC.ProfileAPI = ProfileAPI;
