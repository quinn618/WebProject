/**
 * GhassraCore — notes.js  (API-integrated version)
 * Loads user's uploaded notes from DocumentsAPI with category=personal (or owned).
 * Search filtering preserved; works on static cards OR API-rendered cards.
 */

document.addEventListener("DOMContentLoaded", async () => {
  const input      = document.getElementById("searchInput");
  const grid       = document.querySelector(".notes-grid, .cards-grid");
  const emptyState = document.getElementById("emptyState");

  /* ── Client-side search (works on both static and API-rendered cards) ── */
  function runSearch() {
    if (!input) return;
    const query = input.value.toLowerCase().trim();
    let visible = 0;

    document.querySelectorAll(".note-card").forEach((card) => {
      const title = card.querySelector("h3")?.textContent?.toLowerCase() || "";
      const desc  = card.querySelector("p")?.textContent?.toLowerCase()  || "";
      const match = title.includes(query) || desc.includes(query);
      card.style.display = match ? "flex" : "none";
      if (match) visible++;
    });

    if (emptyState) emptyState.style.display = visible === 0 ? "block" : "none";
  }

  if (input) input.addEventListener("input", runSearch);

  /* ── Load notes from API ── */
  if (!grid) return; // static page — search only mode, nothing more to do

  try {
    // Request documents uploaded by the current user (adjust filter as your backend expects)
    const res = await window.GC.DocumentsAPI.list({ category: "my-notes" });
    const docs = Array.isArray(res?.data) ? res.data : [];

    if (docs.length === 0) {
      if (emptyState) emptyState.style.display = "block";
      return;
    }

    grid.innerHTML = docs.map((doc) => {
      const price   = Number(doc.price) || 0;
      const isFree  = price <= 0;
      const safeTitle = (doc.title || "").replace(/</g, "&lt;");
      const safeDesc  = (doc.description || "").replace(/</g, "&lt;");

      return `
        <div class="note-card"
          data-id="${doc.id}"
          data-download="${doc.download_url || "#"}"
          data-price="${price}"
          data-date="${doc.date || doc.created_at || ""}"
          data-filiere="${doc.filiere || ""}"
          data-matiere="${doc.matiere || ""}"
          data-category="${doc.category || ""}"
          data-type="${doc.file_type || ""}"
          data-owned="false"
          style="display:flex;">
          <div class="note-thumb gc-note-thumb">
            <img src="${doc.image || doc.preview_url || "../assets/images/document.jpg"}"
                 alt="${safeTitle}" class="gc-thumb-img"/>
          </div>
          <div class="note-body">
            <div class="note-meta">
              ${doc.file_type ? `<span class="meta-tag">${doc.file_type}</span>` : ""}
              ${doc.category  ? `<span class="note-tag">${doc.category}</span>`  : ""}
            </div>
            <h3>${safeTitle}</h3>
            <p>${safeDesc}</p>
            <div class="note-footer">
              <span class="note-price">${isFree ? "Free" : `${price} TND`}</span>
              <div class="note-actions">
                <button class="view-btn" type="button" aria-label="View">View</button>
                <button class="action-btn gc-download-btn" type="button" aria-label="Download">
                  <span class="material-symbols-outlined">download</span>
                </button>
                ${!isFree
                  ? `<button class="action-btn gc-buy-btn" type="button" aria-label="Buy">
                       <span class="material-symbols-outlined">shopping_cart</span>
                       <span class="gc-btn-label">Buy</span>
                     </button>`
                  : ""}
              </div>
            </div>
          </div>
        </div>`;
    }).join("");

    if (window.gcSyncPurchases) window.gcSyncPurchases();
  } catch (err) {
    console.error("[GC notes] Could not load notes:", err.message);
    if (emptyState) {
      emptyState.style.display  = "block";
      emptyState.textContent    = "Could not load notes. Please refresh.";
    }
  }
});
