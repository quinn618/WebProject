// ==================== earnings.js ====================

async function loadEarnings() {
  try {
    const [profileResp, earningsResp] = await Promise.all([
      apiRequest("/profile/get.php"),
      apiRequest("/profile/earnings.php"),
    ]);

    const user = profileResp.data || {};
    const payload = earningsResp.data || {};
    const docs = payload.documents || [];

    // Sidebar sold count
    document
      .querySelectorAll("#soldCount")
      .forEach((el) => (el.textContent = user.sold_count || 0));

    // Balance card
    const balanceEl = document.querySelector(".balance-amount");
    if (balanceEl)
      balanceEl.innerHTML = `${parseFloat(payload.total_earned || 0).toFixed(2)} <span>TND</span>`;

    const container = document.querySelector(".earnings-list");
    if (!container) return;

    if (docs.length === 0) {
      container.innerHTML =
        '<p style="color:#888;text-align:center;padding:2rem;">No documents uploaded yet.</p>';
      return;
    }

    container.innerHTML = docs
      .map((doc) => {
        const date = new Date(doc.date_upload).toLocaleDateString("fr-FR");
        return `<div class="earnings-item">
        <div class="earnings-info">
          <div class="earnings-doc-icon">
            <span class="material-symbols-outlined">description</span>
          </div>
          <div class="earnings-details">
            <h4>${doc.titre}</h4>
            <span class="earnings-meta">
              Prix: ${parseFloat(doc.prix || 0).toFixed(2)} DT ·
              Ventes: ${doc.sales_count || 0} ·
              Filière: ${doc.filiere_nom || ""} ·
              Publié: ${date}
            </span>
          </div>
        </div>
        <div class="earnings-earned">
          <span class="earnings-amount">${parseFloat(doc.total_earned || 0).toFixed(2)} DT</span>
        </div>
      </div>`;
      })
      .join("");
  } catch (err) {
    console.error("Earnings error:", err.message);
  }
}

// Aliases for inline scripts
window.loadEarnings = loadEarnings;
window.refreshSoldCount = async function () {
  try {
    const resp = await apiRequest("/profile/get.php");
    const user = resp.data || {};
    document
      .querySelectorAll("#soldCount")
      .forEach((el) => (el.textContent = user.sold_count || 0));
  } catch {}
};

document.addEventListener("DOMContentLoaded", function () {
  if (!localStorage.getItem("token")) {
    window.location.href = "auth.html";
    return;
  }
  loadEarnings();
});
