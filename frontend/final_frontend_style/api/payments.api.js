/**
 * GhassraCore — Payments API
 * Matches: backend/api/payments/
 *   ├── initiate.php
 *   └── verify.php
 *
 * Handles the "Buy" flow: initiate a payment intent → redirect to
 * payment gateway → verify the result on return.
 */

const PaymentsAPI = (() => {
  const { apiFetch } = window.GC;

  /**
   * POST /payments/initiate.php
   * Create a payment intent for a document purchase.
   *
   * @param {{
   *   document_id: number|string,  – ID of the document being bought
   *   amount?: number,             – amount in TND (usually read from backend)
   *   return_url?: string,         – URL the gateway should redirect back to
   * }} payload
   *
   * Expected response (example using Konnect / Flouci / etc.):
   *   {
   *     success: true,
   *     payment_url: string,   – redirect the user here
   *     payment_ref: string,   – reference to store for verify step
   *   }
   *
   * Typical usage:
   *   const { payment_url, payment_ref } = await PaymentsAPI.initiate({ document_id: 42 });
   *   sessionStorage.setItem('gc_payment_ref', payment_ref);
   *   window.location.href = payment_url;
   */
  async function initiate(payload) {
    return apiFetch("/payments/initiate.php", {
      method: "POST",
      body: JSON.stringify({
        document_id: payload.document_id,
        amount:      payload.amount      ?? undefined,
        return_url:  payload.return_url  ?? window.location.href,
      }),
    });
  }

  /**
   * POST /payments/verify.php
   * Confirm the payment result after the gateway redirects back.
   * Call this on the return page before showing a success message.
   *
   * @param {{
   *   payment_ref: string,   – the reference from initiate step
   *   document_id?: number,  – optional: helps backend update purchase record
   * }} payload
   *
   * Expected response:
   *   {
   *     success: true,
   *     verified: boolean,
   *     message: string,
   *     purchase?: { document_id: number, ... }
   *   }
   *
   * On verified === true, the document is now "purchased" server-side.
   * The frontend should then call PurchasesAPI.history() to refresh the
   * owned-documents list.
   */
  async function verify(payload) {
    return apiFetch("/payments/verify.php", {
      method: "POST",
      body: JSON.stringify({
        payment_ref:  payload.payment_ref,
        document_id:  payload.document_id ?? undefined,
      }),
    });
  }

  /**
   * Convenience: reads the stored payment_ref from sessionStorage,
   * calls verify(), then clears the ref.
   *
   * @param {{ document_id?: number }} [opts]
   * @returns {Promise<object>}
   */
  async function verifyFromSession(opts = {}) {
    const ref = sessionStorage.getItem("gc_payment_ref");
    if (!ref) {
      throw Object.assign(new Error("No pending payment reference found"), {
        status: 400,
      });
    }
    const result = await verify({
      payment_ref: ref,
      document_id: opts.document_id,
    });
    sessionStorage.removeItem("gc_payment_ref");
    return result;
  }

  return { initiate, verify, verifyFromSession };
})();

window.GC.PaymentsAPI = PaymentsAPI;
