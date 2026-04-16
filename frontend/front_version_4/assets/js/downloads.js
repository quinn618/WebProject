const API_BASE = "../backend/api";

// ==================== API ====================

async function apiRequest(endpoint, method = "GET", body = null) {
  const token = localStorage.getItem("token");
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: "Bearer " + token }),
    },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(API_BASE + endpoint, options);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || data.message);
  return data.data;
}

// ==================== LOAD PURCHASES HISTORY ====================

async function loadPurchases() {
  try {
    const user = await apiRequest("/profile/get.php");
    const purchases = await apiRequest("/purchases/history.php");

    // Update sold count
    const soldCountEl = document.getElementById("soldCount");
    if (soldCountEl) soldCountEl.textContent = user.sold_count || 0;

    // Update section count
    const countEl = document.querySelector(".section-count");
    if (countEl) countEl.textContent = `${purchases.length || 0} files`;

    // Display purchases
    const container = document.querySelector(".items-list");
    if (!container) return;

    if (!purchases || purchases.length === 0) {
      container.innerHTML =
        '<p style="color:#888;text-align:center;padding:2rem;">No downloads yet.</p>';
      return;
    }

    container.innerHTML = purchases
      .map((p) => {
        const date = new Date(p.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        return `
          <div class="download-item">
            <div class="item-left">
              <div class="item-icon" style="background:rgba(176,190,255,0.3);color:var(--primary);">
                <span class="material-symbols-outlined">description</span>
              </div>
              <div class="item-details">
                <h4>${p.title}</h4>
                <div class="item-meta">
                  <span><span class="material-symbols-outlined">calendar_today</span> ${date}</span>
                  <span><span class="material-symbols-outlined">database</span> ${p.filiere}</span>
                  <span class="meta-tag">${p.matiere}</span>
                </div>
              </div>
            </div>
            <button class="download-btn" onclick="downloadDocument(${p.document_id})">
              <span class="material-symbols-outlined">download</span>
              Download
            </button>
          </div>
        `;
      })
      .join("");
  } catch (err) {
    console.log("Purchases error:", err.message);
  }
}

// ==================== DOWNLOAD HANDLER ====================

async function downloadDocument(docId) {
  try {
    const token = localStorage.getItem("token");
    const link = `${API_BASE}/documents/download.php?id=${docId}&dl=1&token=${token}`;
    window.open(link, "_blank");
  } catch (err) {
    console.log("Download error:", err.message);
  }
}

// ==================== SEARCH ====================

function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  searchInput.addEventListener("input", function (e) {
    const query = e.target.value.toLowerCase();
    const items = document.querySelectorAll(".download-item");
    items.forEach((item) => {
      const title = item.querySelector("h4").textContent.toLowerCase();
      item.style.display = title.includes(query) ? "" : "none";
    });
  });
}

// ==================== INIT ====================

document.addEventListener("DOMContentLoaded", function () {
  if (!localStorage.getItem("token")) {
    window.location.href = "auth.html";
    return;
  }

  loadPurchases();
  setupSearch();
});
