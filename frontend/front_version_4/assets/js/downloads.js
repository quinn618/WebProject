const apiRequest = window.apiRequest;

// ==================== downloads.js ====================

async function loadPurchases() {
  try {
    const [profileResp, purchasesResp] = await Promise.all([
      apiRequest("/profile/get.php"),
      apiRequest("/purchases/history.php"),
    ]);

    const user = profileResp.data || {};
    const purchases = purchasesResp.data || [];

    // Update sold count in sidebar
    document
      .querySelectorAll("#soldCount")
      .forEach((el) => (el.textContent = user.sold_count || 0));

    // Update section count
    const countEl = document.querySelector(".section-count");
    if (countEl) countEl.textContent = `${purchases.length} files`;

    const container = document.querySelector(".items-list");
    if (!container) return;

    if (purchases.length === 0) {
      container.innerHTML =
        '<p style="color:#888;text-align:center;padding:2rem;">No downloads yet.</p>';
      return;
    }

    container.innerHTML = purchases
      .map((p) => {
        const date = new Date(
          p.purchased_at || p.created_at,
        ).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        // dl=1 triggers direct file stream; t= sends token so PHP can verify auth
        const dlUrl = `${window.API_BASE}/documents/download.php?id=${p.document_id}&dl=1&t=${encodeURIComponent(localStorage.getItem("token"))}`;
        return `<div class="download-item">
        <div class="item-left">
          <div class="item-icon" style="background:rgba(176,190,255,0.3);color:var(--primary);">
            <span class="material-symbols-outlined">description</span>
          </div>
          <div class="item-details">
            <h4>${p.document_title || p.title || "Document"}</h4>
            <div class="item-meta">
              <span><span class="material-symbols-outlined">calendar_today</span> ${date}</span>
              <span>${p.filiere || ""}</span>
              <span class="meta-tag">${p.matiere || ""}</span>
            </div>
          </div>
        </div>
        <a href="${dlUrl}" target="_blank" class="download-btn">
          <span class="material-symbols-outlined">download</span>
          Download
        </a>
      </div>`;
      })
      .join("");
  } catch (err) {
    console.error("Purchases error:", err.message);
  }
}

// Aliases used by inline scripts in HTML pages
window.loadDownloads = loadPurchases;
window.refreshSoldCount = async function () {
  try {
    const resp = await apiRequest("/profile/get.php");
    const user = resp.data || {};
    document
      .querySelectorAll("#soldCount")
      .forEach((el) => (el.textContent = user.sold_count || 0));
  } catch {}
};

function setupSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;
  input.addEventListener("input", function () {
    const q = input.value.toLowerCase();
    document.querySelectorAll(".download-item").forEach((item) => {
      const title = item.querySelector("h4")?.textContent.toLowerCase() || "";
      item.style.display = title.includes(q) ? "" : "none";
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  if (!localStorage.getItem("token")) {
    window.location.href = "auth.html";
    return;
  }
  loadPurchases();
  setupSearch();
});
