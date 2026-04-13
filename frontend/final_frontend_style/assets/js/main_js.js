/**
 * GhassraCore — main_js.js  (API-integrated version)
 * Loads resource cards from DocumentsAPI instead of the hardcoded array.
 * Filter chips, search, card generation, and toast logic are preserved.
 */

/* ── Shared state ── */
let currentFilter = "all";
let currentQuery  = "";
let allResources  = []; // populated from API

/* ── HTML escaping ── */
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) =>
    ch === "&" ? "&amp;" : ch === "<" ? "&lt;" : ch === ">" ? "&gt;" :
    ch === '"' ? "&quot;" : "&#39;"
  );
}

/* ── Map API response field names → the shape main_js expects ── */
function normalizeDocument(doc) {
  return {
    id:           doc.id,
    title:        doc.title         || "",
    author:       doc.author        || doc.uploader || "@unknown",
    authorAvatar: doc.author_avatar || "../assets/images/student avatar.jpg",
    image:        doc.image         || doc.preview_url || "../assets/images/document.jpg",
    description:  doc.description   || "",
    badge:        doc.badge         || "",
    badgeClass:   doc.badge_class   || "badge-blue",
    fileType:     doc.file_type     || doc.fileType || "File",
    category:     doc.category      || "document",
    action:       "download",
    downloadUrl:  doc.download_url  || doc.downloadUrl || "#",
    price:        Number(doc.price) || 0,
    date:         doc.date          || doc.created_at || "",
    filiere:      doc.filiere       || "",
    matiere:      doc.matiere       || "",
  };
}

/* ── Render ── */
function renderGrid() {
  let results = allResources.filter((r) => {
    if (currentFilter !== "all" && r.category !== currentFilter) return false;
    if (currentQuery) {
      const q = currentQuery;
      return (
        r.title.toLowerCase().includes(q)    ||
        r.author.toLowerCase().includes(q)   ||
        r.fileType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const cardsGrid = document.querySelector(".cards-grid");
  if (!cardsGrid) return;

  if (results.length === 0) {
    const msg = currentQuery
      ? `No results for "${currentQuery}"`
      : "No resources in this category yet.";
    cardsGrid.innerHTML =
      `<div style="grid-column:1/-1;text-align:center;padding:3rem;">` +
      `<span class="material-symbols-outlined" style="font-size:3rem;color:var(--outline);">search_off</span>` +
      `<p style="margin-top:1rem;color:var(--on-surface-variant);">${msg}</p></div>`;
  } else {
    cardsGrid.innerHTML = results.map(generateCard).join("");
    if (window.gcSyncPurchases) window.gcSyncPurchases();
  }
}

function generateCard(resource) {
  const safeTitle       = escapeHtml(resource.title);
  const safeAuthor      = escapeHtml(resource.author);
  const safeFileType    = escapeHtml(resource.fileType);
  const safeBadge       = escapeHtml(resource.badge);
  const safeCategory    = escapeHtml(resource.category);
  const safeDescription = escapeHtml(resource.description || "");
  const safeDownloadUrl = escapeHtml(resource.downloadUrl || "#");
  const safePrice       = escapeHtml(resource.price ?? "");
  const safeDate        = escapeHtml(resource.date || "");
  const safeFiliere     = escapeHtml(resource.filiere || "");
  const safeMatiere     = escapeHtml(resource.matiere || "");
  const isPaid = Number(resource.price) > 0;

  return (
    `<div class="resource-card" data-id="${resource.id}" data-purchase-key="res:${resource.id}" ` +
    `data-category="${safeCategory}" data-description="${safeDescription}" ` +
    `data-download="${safeDownloadUrl}" data-price="${safePrice}" data-date="${safeDate}" ` +
    `data-filiere="${safeFiliere}" data-matiere="${safeMatiere}">` +
    `<div class="card-img-wrap">` +
    `<img src="${resource.image}" alt="${safeTitle}"/>` +
    `<span class="card-badge ${resource.badgeClass}">${safeBadge}</span>` +
    `</div>` +
    `<h3 class="card-title">${safeTitle}</h3>` +
    `<div class="card-author">` +
    `<div class="author-avatar bg-purple"><img src="${resource.authorAvatar}" alt="${safeAuthor}"/></div>` +
    `<span class="author-name">${safeAuthor}</span>` +
    `</div>` +
    `<div class="card-footer">` +
    `<span class="file-type">${safeFileType}</span>` +
    `<div class="card-actions">` +
    `<button class="action-btn gc-download-btn" type="button" aria-label="Download">` +
    `<span class="material-symbols-outlined">download</span></button>` +
    (isPaid
      ? `<button class="action-btn gc-buy-btn" type="button" aria-label="Buy">` +
        `<span class="material-symbols-outlined">shopping_cart</span></button>`
      : "") +
    `</div></div></div>`
  );
}

/* ── Skeleton loader ── */
function showSkeletons(count = 4) {
  const cardsGrid = document.querySelector(".cards-grid");
  if (!cardsGrid) return;
  cardsGrid.innerHTML = Array.from({ length: count })
    .map(() =>
      `<div class="resource-card" style="opacity:0.4;pointer-events:none;">` +
      `<div class="card-img-wrap" style="background:var(--surface-variant,#e4e7ff);height:140px;border-radius:12px;"></div>` +
      `<h3 class="card-title" style="background:var(--surface-variant,#e4e7ff);height:1rem;border-radius:4px;margin-top:0.75rem;"></h3>` +
      `<div class="card-footer" style="margin-top:0.5rem;background:var(--surface-variant,#e4e7ff);height:0.75rem;border-radius:4px;"></div>` +
      `</div>`
    )
    .join("");
}

/* ── Fetch from API ── */
async function fetchDocuments(filters = {}) {
  showSkeletons();
  try {
    const res = await window.GC.DocumentsAPI.list(filters);
    const docs = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
    allResources = docs.map(normalizeDocument);
  } catch (err) {
    console.error("[GC] Failed to load documents:", err.message);
    allResources = [];
    showToast("Could not load resources. Please try again.", "error");
  }
  renderGrid();
}

/* ── Filter chips ── */
function initFilters() {
  const chips = document.querySelectorAll(".chip");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const filter = chip.getAttribute("data-filter") || "all";
      currentFilter = filter;
      chips.forEach((c) => c.classList.remove("chip-active"));
      chip.classList.add("chip-active");
      // Re-fetch with category filter for server-side filtering
      fetchDocuments({ category: filter === "all" ? undefined : filter, query: currentQuery || undefined });
    });
  });
}

/* ── Search ── */
function initSearch() {
  const searchInput = document.querySelector(".search-input");
  const searchBtn   = document.querySelector(".btn-find");

  function performSearch() {
    const q = searchInput ? searchInput.value.toLowerCase().trim() : "";
    currentQuery = q;
    fetchDocuments({
      category: currentFilter === "all" ? undefined : currentFilter,
      query:    q || undefined,
    });
    if (q) showToast(`Searching for "${q}"…`, "info");
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      if (!searchInput.value) {
        currentQuery = "";
        fetchDocuments({ category: currentFilter === "all" ? undefined : currentFilter });
      }
    });
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") performSearch();
    });
  }

  if (searchBtn) searchBtn.addEventListener("click", performSearch);
}

/* ── Toast (kept local for pages that load main_js before shared.js) ── */
function showToast(message, type) {
  if (window.showToast && window.showToast !== showToast) {
    return window.showToast(message, type);
  }
  type = type || "info";
  document.querySelectorAll(".custom-toast").forEach((t) => t.remove());

  const toast       = document.createElement("div");
  toast.className   = "custom-toast toast-" + type;
  const icon        = type === "success" ? "check_circle" : type === "error" ? "error" : "info";
  const borderColor = type === "success" ? "#4caf50" : type === "error" ? "#f76a80" : "#3d57bb";
  toast.innerHTML   = `<span class="material-symbols-outlined">${icon}</span><span>${message}</span>`;
  toast.style.cssText =
    "position:fixed;bottom:100px;right:20px;background:white;" +
    "padding:12px 20px;border-radius:12px;display:flex;align-items:center;" +
    `gap:10px;box-shadow:0 4px 20px rgba(0,0,0,0.15);z-index:1000;` +
    `animation:slideInRight 0.3s ease;font-family:"Be Vietnam Pro",sans-serif;` +
    `font-size:0.875rem;border-left:4px solid ${borderColor};`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = "slideOutRight 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* ── Dynamic animation styles ── */
const dynamicStyle = document.createElement("style");
dynamicStyle.textContent =
  "@keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}" +
  "@keyframes slideOutRight{from{transform:translateX(0);opacity:1}to{transform:translateX(100%);opacity:0}}" +
  "@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}" +
  ".chip{cursor:pointer;transition:all 0.2s ease;}" +
  ".resource-card{animation:fadeIn 0.4s ease;}";
document.head.appendChild(dynamicStyle);

/* ── Init ── */
document.addEventListener("DOMContentLoaded", () => {
  fetchDocuments(); // 1. load all docs from API
  initFilters();    // 2. wire chip clicks
  initSearch();     // 3. wire search
  // Notifications handled globally in shared.js
});
