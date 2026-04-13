/**
 * GhassraCore — Documents API
 * Matches: backend/api/documents/
 *   ├── list.php
 *   ├── detail.php
 *   ├── upload.php
 *   └── download.php
 *
 * These are the core "resource cards" consumed by main.js and notes.js.
 */

const DocumentsAPI = (() => {
  const { apiFetch } = window.GC;

  /**
   * GET /documents/list.php
   * Fetch all published documents, with optional filters.
   *
   * @param {{
   *   category?: string,   – e.g. "exam" | "document" | "cheat-sheet" | "code"
   *   query?: string,      – free-text search term
   *   filiere?: string,
   *   matiere?: string,
   *   page?: number,
   *   limit?: number,
   * }} [filters]
   *
   * Expected response:
   *   {
   *     success: true,
   *     data: Array<DocumentItem>,
   *     total: number,
   *     page: number,
   *     limit: number,
   *   }
   *
   * DocumentItem shape (mirrors the resourcesData objects in main_js.js):
   *   {
   *     id: number|string,
   *     title: string,
   *     author: string,         – display name / @handle
   *     author_avatar?: string, – URL to avatar image
   *     image?: string,         – preview image URL
   *     description: string,
   *     badge?: string,
   *     badge_class?: string,   – CSS class for badge colour
   *     file_type: string,      – "PDF" | ".C" | "Image" …
   *     category: string,
   *     download_url?: string,
   *     price: number,          – 0 = free
   *     date: string,           – ISO date string
   *     filiere?: string,
   *     matiere?: string,
   *   }
   */
  async function list(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category) params.set("category", filters.category);
    if (filters.query)    params.set("q",        filters.query);
    if (filters.filiere)  params.set("filiere",  filters.filiere);
    if (filters.matiere)  params.set("matiere",  filters.matiere);
    if (filters.page)     params.set("page",     filters.page);
    if (filters.limit)    params.set("limit",    filters.limit);

    const qs = params.toString();
    return apiFetch(`/documents/list.php${qs ? "?" + qs : ""}`);
  }

  /**
   * GET /documents/detail.php?id={id}
   * Fetch the full details of a single document.
   *
   * @param {number|string} id
   *
   * Expected response:
   *   { success: true, data: DocumentItem }
   */
  async function detail(id) {
    return apiFetch(`/documents/detail.php?id=${encodeURIComponent(id)}`);
  }

  /**
   * POST /documents/upload.php
   * Upload a new document (multipart/form-data).
   * Sends raw FormData — do NOT set Content-Type; the browser sets it
   * with the correct boundary automatically.
   *
   * @param {FormData} formData  – must contain:
   *   - file: File
   *   - title: string
   *   - description: string
   *   - category: string
   *   - filiere?: string
   *   - matiere?: string
   *   - price?: number          – omit or 0 for free
   *   - preview_image?: File    – optional thumbnail
   *
   * Expected response:
   *   { success: true, message: string, data: DocumentItem }
   */
  async function upload(formData) {
    const { apiFetch: _apiFetch, getToken } = window.GC;

    // Override Content-Type: let the browser set multipart boundary
    const headers = {};
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const url = `${window.GC.config.BASE_URL}/documents/upload.php`;
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
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

  /**
   * GET /documents/download.php?id={id}
   * Request a signed/authorized download URL for a document.
   * For free docs this always works. For paid docs the backend checks
   * whether the user has a verified purchase.
   *
   * @param {number|string} id
   *
   * Expected response:
   *   { success: true, download_url: string }
   *
   * Usage: open the returned URL in a new tab to trigger the browser download.
   */
  async function download(id) {
    return apiFetch(
      `/documents/download.php?id=${encodeURIComponent(id)}`
    );
  }

  return { list, detail, upload, download };
})();

window.GC.DocumentsAPI = DocumentsAPI;
