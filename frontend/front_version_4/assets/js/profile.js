// ==================== LOAD PROFILE ====================
async function loadProfile() {
  try {
    const resp = await apiRequest("/profile/get.php");
    // get.php returns { success:true, data: { id, name, email, ... } }
    const u = resp.data;
    if (!u) throw new Error("No profile data returned");

    console.log("Profile data loaded:", u);

    // Hero name
    document
      .querySelectorAll(".hero-title-row h1")
      .forEach((el) => (el.textContent = u.name || "User"));
    document
      .querySelectorAll(".hero-desc")
      .forEach((el) => (el.textContent = u.bio || "No bio provided."));

    // Stat cards
    setText("stat-docs-count", u.documents_count || 0);
    setText("stat-downloads-count", u.purchases_count || 0);
    setText("stat-aura-points", u.aura_points || 0);

    // FIXED: Ensure earnings amount is properly converted to number
    const earningsAmount = parseFloat(u.sold) || 0;
    console.log("Setting earnings to:", earningsAmount);
    setText("stat-earnings-amount", earningsAmount.toFixed(2));

    // Refresh all sold counts across all pages (global function)
    if (window.refreshAllSoldCounts) {
      window.refreshAllSoldCounts();
    }

    // Pre-fill edit form
    setVal("editName", u.name || "");
    setVal("editBio", u.bio || "");
    setVal("editMajor", u.filiere || "");

    // Update sidenav profile name
    document
      .querySelectorAll(".sidenav-profile h3")
      .forEach((el) => (el.textContent = u.name || "User"));
    document
      .querySelectorAll(".sidenav-profile p")
      .forEach((el) => (el.textContent = u.filiere || "Student"));

    localStorage.setItem("user", JSON.stringify(u));
  } catch (err) {
    console.error("loadProfile error:", err.message);
  }
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

// ==================== LOAD PURCHASES ====================
async function loadPurchasesHistory() {
  try {
    const resp = await apiRequest("/purchases/history.php");
    // history.php returns { success, data: [...], total, page, limit }
    const purchases = resp.data || [];
    const container = document.querySelector(".purchases-list");
    if (!container) return;

    setText("stat-downloads-count", purchases.length);

    if (purchases.length === 0) {
      container.innerHTML =
        '<p style="color:#888;text-align:center;padding:2rem;">No purchases yet.</p>';
      return;
    }

    container.innerHTML = purchases
      .map((p) => {
        const date = new Date(
          p.purchased_at || p.created_at,
        ).toLocaleDateString("en-US");
        // Use dl=1 + t= for direct browser download (no AJAX needed)
        const dlUrl = `${window.API_BASE}/documents/download.php?id=${p.document_id}&dl=1&t=${encodeURIComponent(localStorage.getItem("token"))}`;
        return `<div class="purchase-item">
        <div class="purchase-info">
          <span class="material-symbols-outlined">description</span>
          <div>
            <h4>${p.document_title || p.title || "Document"}</h4>
            <span>${p.filiere || ""} · ${p.matiere || ""} · ${date}</span>
          </div>
        </div>
        <div class="purchase-right">
          <span class="purchase-price">${parseFloat(p.price || p.amount_paid || 0).toFixed(2)} DT</span>
          <a href="${dlUrl}" class="btn-download" target="_blank" download>
            <span class="material-symbols-outlined">download</span>
          </a>
        </div>
      </div>`;
      })
      .join("");
  } catch (err) {
    console.error("Purchases error:", err.message);
  }
}

// ==================== LOAD EARNINGS ====================
async function loadEarningsAndDocuments() {
  try {
    const resp = await apiRequest("/profile/earnings.php");
    // earnings.php returns { success, data: { documents:[...], total_earned, documents_count } }
    const payload = resp.data || {};
    const docs = payload.documents || [];

    setText(
      "stat-earnings-amount",
      parseFloat(payload.total_earned || 0).toFixed(2),
    );

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

// ==================== SAVE PROFILE ====================
async function saveProfile() {
  const name = document.getElementById("editName")?.value.trim();
  const bio = document.getElementById("editBio")?.value.trim();
  const filiere = document.getElementById("editMajor")?.value;
  if (!name) {
    showToast("Le nom est obligatoire", "error");
    return;
  }

  try {
    await apiRequest("/profile/update.php", "POST", { name, bio, filiere });
    document
      .querySelectorAll(".hero-title-row h1")
      .forEach((el) => (el.textContent = name));
    document
      .querySelectorAll(".hero-desc")
      .forEach((el) => (el.textContent = bio || ""));

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    Object.assign(user, { name, bio, filiere });
    localStorage.setItem("user", JSON.stringify(user));

    closeEditProfile();
    showToast("Profil mis à jour !", "success");
  } catch (err) {
    showToast("Erreur : " + err.message, "error");
  }
}

// ==================== UPLOAD ====================
async function handleUpload(e) {
  e.preventDefault();
  const formData = new FormData();
  formData.append(
    "title",
    document.getElementById("uploadTitle")?.value.trim() || "",
  );
  formData.append(
    "description",
    document.getElementById("uploadDescription")?.value.trim() || "",
  );
  formData.append(
    "filiere",
    document.getElementById("uploadFiliere")?.value || "",
  );
  formData.append(
    "matiere",
    document.getElementById("uploadMatiere")?.value.trim() || "",
  );
  formData.append(
    "type",
    document.getElementById("uploadType")?.value || "free",
  );
  formData.append("price", document.getElementById("uploadPrice")?.value || 0);

  const fileInput = document.getElementById("uploadFile");
  if (!fileInput?.files[0]) {
    showToast("Veuillez sélectionner un fichier PDF", "error");
    return;
  }
  formData.append("file", fileInput.files[0]);

  const btn = document.getElementById("uploadBtn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Envoi...";
  }

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(API_BASE + "/documents/upload.php", {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
      body: formData,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || data.error);

    closeModal();
    showToast("Document publié avec succès ! (+10 Aura points)", "success");
    // Refresh earnings and profile stats
    loadEarningsAndDocuments();
    loadProfile();
    // Refresh notes list if it's open
    if (window.refreshNotesList) {
      window.refreshNotesList();
    }
  } catch (err) {
    showToast("Erreur upload : " + err.message, "error");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Publier";
    }
  }
}

// ==================== MODAL UPLOAD ====================
function openModal() {
  const modal = document.getElementById("uploadModal");
  if (modal) {
    delete modal.dataset.editId;
    modal.classList.add("open");
  }
}
function closeModal() {
  document.getElementById("uploadModal")?.classList.remove("open");
}
function handleOverlayClick(e) {
  if (e.target === document.getElementById("uploadModal")) closeModal();
}

// ==================== EDIT PROFILE VIEW ====================
function openEditProfile() {
  document.getElementById("profileView").style.display = "none";
  const ep = document.getElementById("editProfileView");
  ep.style.display = "block";
  ep.style.opacity = "0";
  ep.style.transform = "translateX(2rem)";
  requestAnimationFrame(() => {
    ep.style.transition = "opacity 0.3s,transform 0.3s";
    ep.style.opacity = "1";
    ep.style.transform = "translateX(0)";
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function closeEditProfile() {
  const ep = document.getElementById("editProfileView");
  ep.style.transition = "opacity 0.25s,transform 0.25s";
  ep.style.opacity = "0";
  ep.style.transform = "translateX(2rem)";
  setTimeout(() => {
    ep.style.display = "none";
    document.getElementById("profileView").style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 250);
}

// ==================== LOGOUT ====================
function confirmLogout(e) {
  e.preventDefault();
  document.getElementById("logoutModal")?.classList.add("open");
}
function closeLogout() {
  document.getElementById("logoutModal")?.classList.remove("open");
}
function handleLogoutOverlayClick(e) {
  if (e.target === document.getElementById("logoutModal")) closeLogout();
}
function doLogout() {
  closeLogout();
  showToast("Déconnexion...", "info");
  setTimeout(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "auth.html";
  }, 1200);
}

// ==================== TOAST ====================
function showToast(message, type) {
  type = type || "info";
  document.getElementById("gc-toast")?.remove();
  const toast = document.createElement("div");
  toast.id = "gc-toast";
  const color =
    type === "success"
      ? "var(--secondary)"
      : type === "error"
        ? "var(--error)"
        : "#3d57bb";
  const icon =
    type === "success" ? "check_circle" : type === "error" ? "error" : "info";
  toast.style.cssText = `position:fixed;bottom:5.5rem;left:50%;transform:translateX(-50%) translateY(1rem);
    background:#fff;border:1px solid var(--surface-container-high);
    box-shadow:0 8px 30px rgba(39,48,87,0.15);border-radius:9999px;
    padding:0.75rem 1.5rem;display:flex;align-items:center;gap:0.5rem;
    font-weight:600;font-size:0.875rem;z-index:9999;opacity:0;
    transition:opacity 0.3s,transform 0.3s;white-space:nowrap;`;
  toast.innerHTML = `<span class="material-symbols-outlined" style="color:${color};font-size:1.2rem;">${icon}</span>${message}`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
  });
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(1rem)";
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// ==================== INIT ====================
function initializeProfile() {
  if (!localStorage.getItem("token")) {
    window.location.href = "auth.html";
    return;
  }

  loadProfile();
  loadPurchasesHistory();
  loadEarningsAndDocuments();

  document
    .getElementById("uploadForm")
    ?.addEventListener("submit", handleUpload);

  const uploadType = document.getElementById("uploadType");
  const priceWrapper = document.getElementById("priceWrapper");
  if (uploadType && priceWrapper) {
    uploadType.addEventListener("change", () => {
      priceWrapper.style.display =
        uploadType.value === "paid" ? "block" : "none";
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeProfile);
} else {
  initializeProfile();
}
