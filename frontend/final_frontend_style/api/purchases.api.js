/**
 * GhassraCore — Purchases API
 * Matches: backend/api/purchases/
 *   └── history.php
 *
 * Retrieves the list of documents the authenticated user has purchased.
 * Used by shared.js to decide whether to show "Download" vs "Buy" buttons.
 */

const PurchasesAPI = (() => {
  const { apiFetch } = window.GC;

  /**
   * GET /purchases/history.php
   * Fetch the authenticated user's full purchase history.
   *
   * @param {{
   *   page?:  number,
   *   limit?: number,
   * }} [opts]
   *
   * Expected response:
   *   {
   *     success: true,
   *     data: Array<PurchaseRecord>,
   *     total: number,
   *     page: number,
   *     limit: number,
   *   }
   *
   * PurchaseRecord shape:
   *   {
   *     id: number,
   *     document_id: number,
   *     document_title: string,
   *     document_file_type?: string,
   *     amount_paid: number,       – 0 for free documents
   *     purchased_at: string,      – ISO date
   *     download_url?: string,     – pre-authorized URL (may be time-limited)
   *   }
   */
  async function history(opts = {}) {
    const params = new URLSearchParams();
    if (opts.page)  params.set("page",  opts.page);
    if (opts.limit) params.set("limit", opts.limit);

    const qs = params.toString();
    return apiFetch(`/purchases/history.php${qs ? "?" + qs : ""}`);
  }

  /**
   * Convenience: return a Set of purchased document IDs (as strings).
   * This makes O(1) "has this user bought doc X?" lookups easy:
   *
   *   const owned = await PurchasesAPI.ownedIds();
   *   if (owned.has(String(docId))) { ... }
   *
   * @returns {Promise<Set<string>>}
   */
  async function ownedIds() {
    const res = await history({ limit: 1000 }); // adjust limit per your backend
    const records = Array.isArray(res?.data) ? res.data : [];
    return new Set(records.map((r) => String(r.document_id)));
  }

  return { history, ownedIds };
})();

window.GC.PurchasesAPI = PurchasesAPI;
