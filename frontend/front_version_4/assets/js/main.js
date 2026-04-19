// ==================== COLOR PALETTE ====================
const letterColors = {
  A: "#FF6B6B",
  B: "#4ECDC4",
  C: "#45B7D1",
  D: "#FFA07A",
  E: "#98D8C8",
  F: "#F7DC6F",
  G: "#BB8FCE",
  H: "#85C1E2",
  I: "#F8B88B",
  J: "#52B788",
  K: "#D4A5FF",
  L: "#FF9E64",
  M: "#9F8FEF",
  N: "#6BCB77",
  O: "#FF6B9D",
  P: "#A8E6CF",
  Q: "#FFD3B6",
  R: "#FFAAA5",
  S: "#FF8B94",
  T: "#7FCDBB",
  U: "#C5FAD5",
  V: "#80ED99",
  W: "#FFB703",
  X: "#FB5607",
  Y: "#FFBE0B",
  Z: "#8338EC",
};
function getLetterColor(l) {
  return letterColors[l.toUpperCase()] || "#3d57bb";
}
function generateFirstLetterAvatar(title) {
  const l = (title || "?").charAt(0).toUpperCase();
  return `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;
    background:${getLetterColor(l)};font-size:3.5rem;font-weight:700;color:white;
    font-family:'Plus Jakarta Sans',sans-serif;">${l}</div>`;
}

// ==================== STATE ====================
let resourcesData = [];
let currentFilter = "all";
let currentQuery = "";

// ==================== LOAD DOCUMENTS ====================
async function loadDocuments() {
  try {
    const filiere = currentFilter === "all" ? "" : currentFilter;
    // resp = { success, data:[...], total, page, limit }
    const resp = await apiRequest(
      `/documents/list.php?filiere=${encodeURIComponent(filiere)}&q=${encodeURIComponent(currentQuery)}`,
    );
    const docs = resp.data || [];

    resourcesData = docs.map((doc) => ({
      id: doc.id,
      title: doc.title || doc.titre || "Untitled",
      // list.php already returns author as "@slug" string
      author: doc.author || "@unknown",
      badge: doc.badge || (doc.is_paid ? "Paid" : "Free"),
      badgeClass:
        doc.badge_class || (doc.is_paid ? "badge-teal" : "badge-blue"),
      fileType: doc.file_type || "PDF",
      category: doc.category || "document",
      price: parseFloat(doc.price || 0),
      is_paid: !!doc.is_paid,
      is_owned: !!doc.is_owned,
      is_purchased: !!doc.is_purchased,
      can_download: !!doc.can_download,
      matiere: doc.matiere || "",
      filiere: doc.filiere || "",
    }));

    renderGrid();
  } catch (err) {
    showToast("Erreur de chargement : " + err.message, "error");
    console.error(err);
  }
}

// ==================== RENDER ====================
function renderGrid() {
  let results = resourcesData.filter((r) => {
    const categoryMatch =
      currentFilter === "all" || r.category === currentFilter;
    const queryMatch =
      !currentQuery ||
      r.title.toLowerCase().includes(currentQuery) ||
      r.author.toLowerCase().includes(currentQuery) ||
      r.matiere.toLowerCase().includes(currentQuery);
    return categoryMatch && queryMatch;
  });

  const grid = document.querySelector(".cards-grid");
  if (!grid) return;

  if (results.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;">
      <span class="material-symbols-outlined" style="font-size:3rem;color:var(--outline);">search_off</span>
      <p style="margin-top:1rem;color:var(--on-surface-variant);">No resources found.</p></div>`;
    return;
  }
  grid.innerHTML = results.map(generateCard).join("");

  // Add click handlers to cards (excluding action button clicks)
  document.querySelectorAll(".resource-card").forEach((card) => {
    card.addEventListener("click", function (e) {
      // Don't trigger if clicking the action button
      if (e.target.closest(".action-btn")) return;
      const docId = this.getAttribute("data-id");
      const doc = resourcesData.find((d) => d.id == docId);
      if (doc) showDocumentDetails(doc);
    });
  });
}

// ==================== SHOW DOCUMENT DETAILS ====================
function showDocumentDetails(doc) {
  const details = `
    <div style="font-size:0.95rem;line-height:1.6;color:var(--on-surface);">
      <p><strong>Title:</strong> ${doc.title}</p>
      <p><strong>Author:</strong> ${doc.author}</p>
      <p><strong>Subject:</strong> ${doc.matiere || "N/A"}</p>
      <p><strong>Field:</strong> ${doc.filiere || "N/A"}</p>
      <p><strong>Type:</strong> ${doc.fileType}</p>
      <p><strong>Price:</strong> ${doc.is_paid ? doc.price.toFixed(2) + " DT" : "Free"}</p>
    </div>
  `;
  showToast(details, "info");
}

// ==================== GENERATE CARD ====================
function generateCard(r) {
  // Determine action label and icon
  let actionIcon, actionLabel;
  if (r.can_download) {
    actionIcon = "download";
    actionLabel = "download";
  } else {
    actionIcon = "shopping_cart";
    actionLabel = "buy";
  }

  const priceTag = r.is_paid
    ? `<span class="price-tag">${r.price.toFixed(2)} DT</span>`
    : `<span class="price-tag free">Gratuit</span>`;

  return `<div class="resource-card" data-id="${r.id}" style="cursor:pointer;transition:all 0.2s ease;">
    <div class="card-img-wrap">
      ${generateFirstLetterAvatar(r.title)}
      <span class="card-badge ${r.badgeClass}">${r.badge}</span>
    </div>
    <h3 class="card-title">${r.title}</h3>
    <div class="card-author">
      <div class="author-avatar bg-purple">
        <img src="../assets/images/student avatar.jpg" alt="${r.author}"/>
      </div>
      <span class="author-name">${r.author}</span>
    </div>
    <div class="card-footer">
      <span class="file-type">${r.fileType}</span>
      ${priceTag}
      <button class="action-btn" title="${actionLabel}" onclick="handleAction(${r.id})">
        <span class="material-symbols-outlined">${actionIcon}</span>
      </button>
    </div>
  </div>`;
}

// ==================== FILTERS ====================
function initFilters() {
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", function () {
      currentFilter = chip.getAttribute("data-filter") || "all";
      document
        .querySelectorAll(".chip")
        .forEach((c) => c.classList.remove("chip-active"));
      chip.classList.add("chip-active");
      loadDocuments();
    });
  });
}

// ==================== SEARCH ====================
function initSearch() {
  const input = document.querySelector(".search-input");
  const btn = document.querySelector(".btn-find");
  function doSearch() {
    currentQuery = (input?.value || "").toLowerCase().trim();
    loadDocuments();
  }
  input?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") doSearch();
  });
  input?.addEventListener("input", () => {
    if (!input.value) {
      currentQuery = "";
      loadDocuments();
    }
  });
  btn?.addEventListener("click", doSearch);
}

// ==================== HANDLE ACTION ====================
async function handleAction(resourceId) {
  const r = resourcesData.find((x) => x.id === resourceId);
  if (!r) return;

  const token = localStorage.getItem("token");
  if (!token) {
    showToast("Connectez-vous pour continuer", "error");
    setTimeout(() => {
      window.location.href = "auth.html";
    }, 1500);
    return;
  }

  // ── DOWNLOAD ──────────────────────────────────────────────────────────────
  if (r.can_download) {
    try {
      showToast("Préparation du téléchargement...", "info");
      // Step 1: Ask the API for a signed download URL (sends Authorization header)
      const resp = await apiRequest(`/documents/download.php?id=${r.id}`);
      const dlUrl = resp.download_url;
      if (!dlUrl || dlUrl === "#") throw new Error("Lien indisponible");
      // Step 2: Open the direct stream URL in a new tab
      window.open(dlUrl, "_blank");
      showToast(`Téléchargement démarré : "${r.title}"`, "success");
    } catch (err) {
      showToast("Erreur téléchargement : " + err.message, "error");
    }
    return;
  }

  // ── BUY ──────────────────────────────────────────────────────────────────
  try {
    showToast(
      `Achat en cours : "${r.title}" (${r.price.toFixed(2)} DT)...`,
      "info",
    );

    // Step 1: create pending transaction
    const initResp = await apiRequest("/payments/initiate.php", "POST", {
      document_id: r.id,
    });
    const initData = initResp.data || initResp;
    const payRef =
      initData.payment_ref || (initData.data && initData.data.payment_ref);
    if (!payRef) throw new Error("Référence de paiement manquante");

    // Step 2: confirm & transfer funds
    await apiRequest("/payments/verify.php", "POST", {
      payment_ref: payRef,
      document_id: r.id,
    });

    showToast(
      "Paiement validé ! Vous pouvez maintenant télécharger. (+15 Aura au vendeur)",
      "success",
    );

    // Reload cards so the button switches from buy→download
    loadDocuments();
  } catch (err) {
    showToast("Erreur paiement : " + err.message, "error");
  }
}

// ==================== TOAST ====================
function showToast(message, type) {
  type = type || "info";
  document.querySelectorAll(".custom-toast").forEach((t) => t.remove());
  const toast = document.createElement("div");
  toast.className = "custom-toast";
  const icon =
    type === "success" ? "check_circle" : type === "error" ? "error" : "info";
  const color =
    type === "success" ? "#4caf50" : type === "error" ? "#f76a80" : "#3d57bb";
  toast.innerHTML = `<span class="material-symbols-outlined">${icon}</span><span>${message}</span>`;
  toast.style.cssText = `position:fixed;bottom:100px;right:20px;background:white;
    padding:12px 20px;border-radius:12px;display:flex;align-items:center;
    gap:10px;box-shadow:0 4px 20px rgba(0,0,0,0.15);z-index:1000;
    animation:slideInRight 0.3s ease;font-family:"Be Vietnam Pro",sans-serif;
    font-size:0.875rem;border-left:4px solid ${color};max-width:380px;`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = "slideOutRight 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ==================== ANIMATIONS ====================
const dynamicStyle = document.createElement("style");
dynamicStyle.textContent =
  "@keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}" +
  "@keyframes slideOutRight{from{transform:translateX(0);opacity:1}to{transform:translateX(100%);opacity:0}}" +
  ".price-tag{font-size:0.8rem;font-weight:700;color:#1D9E75;background:#E1F5EE;padding:2px 8px;border-radius:8px;}" +
  ".price-tag.free{color:#3d57bb;background:#eef0fb;}";
document.head.appendChild(dynamicStyle);

// ==================== INIT ====================
document.addEventListener("DOMContentLoaded", function () {
  if (!localStorage.getItem("token")) {
    window.location.href = "auth.html";
    return;
  }
  loadDocuments();
  initFilters();
  initSearch();
});
