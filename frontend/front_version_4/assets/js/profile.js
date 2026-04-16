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
  if (!data.success) throw new Error(data.error);
  return data.data;
}

// ==================== LOAD PROFILE ====================

async function loadProfile() {
  try {
    const user = await apiRequest("/profile/get.php");

    // Fill in profile info
    document
      .querySelectorAll(".hero-title-row h1")
      .forEach((el) => (el.textContent = user.name));
    document
      .querySelectorAll(".sidenav-profile h3")
      .forEach(
        (el) =>
          (el.textContent = "@" + user.name.replace(/\s+/g, "_").toLowerCase()),
      );
    document
      .querySelectorAll(".sidenav-profile p")
      .forEach((el) => (el.textContent = user.filiere + " Major"));
    document
      .querySelectorAll(".hero-desc")
      .forEach((el) => (el.textContent = user.bio || "No bio provided."));

    // Update stat cards from profile data
    const docsCountEl = document.getElementById("stat-docs-count");
    const auraEl = document.getElementById("stat-aura-points");
    const soldEl = document.getElementById("soldCount");

    if (docsCountEl) docsCountEl.textContent = user.documents_count || 0;
    if (auraEl) auraEl.textContent = user.aura_points || 0;
    if (soldEl) soldEl.textContent = user.sold_count || 0;

    // Pre-fill edit form
    const editName = document.getElementById("editName");
    const editBio = document.getElementById("editBio");
    const editMajor = document.getElementById("editMajor");

    if (editName) editName.value = user.name || "";
    if (editBio) editBio.value = user.bio || "";
    if (editMajor) editMajor.value = user.filiere || "";

    // Save to localStorage
    localStorage.setItem("user", JSON.stringify(user));
  } catch (err) {
    console.log("Profile error:", err.message);
  }
}

// ==================== LOAD PURCHASES HISTORY ====================

async function loadPurchasesHistory() {
  try {
    const purchases = await apiRequest("/purchases/history.php");
    const container = document.querySelector(".purchases-list");
    if (!container) return;

    // Update downloads stat card
    const downloadsCountEl = document.getElementById("stat-downloads-count");
    if (downloadsCountEl) {
      downloadsCountEl.textContent = purchases.length || 0;
    }

    if (purchases.length === 0) {
      container.innerHTML =
        '<p style="color:#888;text-align:center;padding:2rem;">No purchases yet.</p>';
      return;
    }

    container.innerHTML = purchases
      .map(function (p) {
        const date = new Date(p.created_at).toLocaleDateString("en-US");
        return (
          '<div class="purchase-item">' +
          '<div class="purchase-info">' +
          '<span class="material-symbols-outlined">description</span>' +
          "<div>" +
          "<h4>" +
          p.title +
          "</h4>" +
          "<span>" +
          p.filiere +
          " · " +
          p.matiere +
          " · " +
          date +
          "</span>" +
          "</div>" +
          "</div>" +
          '<div class="purchase-right">' +
          '<span class="purchase-price">' +
          parseFloat(p.price).toFixed(2) +
          " DT</span>" +
          '<a href="' +
          API_BASE +
          "/documents/download.php?id=" +
          p.document_id +
          "&token=" +
          localStorage.getItem("token") +
          '" ' +
          'class="btn-download" download>' +
          '<span class="material-symbols-outlined">download</span>' +
          "</a>" +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  } catch (err) {
    console.log("Purchases history error:", err.message);
  }
}

// ==================== HELPER: Map Matiere to Color ====================

function getSubjectColorClass(matiereId, matiereName) {
  // Map based on matiere_id (1-12) or name
  const matiereMap = {
    1: "subject-algo", // Algorithmes
    2: "subject-prog", // Programmation C
    3: "subject-web", // Web
    4: "subject-bdd", // BDD
    5: "subject-reseau", // Réseaux
    8: "subject-iot", // IoT
    9: "subject-micro", // Microcontrôleurs
    10: "subject-sensors", // Sensors
    11: "subject-datapython", // Data Science Python
    12: "subject-ml", // Machine Learning
    13: "subject-netsec", // Network Security
    14: "subject-crypto", // Cryptography
  };

  return matiereMap[matiereId] || "subject-algo";
}

// ==================== LOAD EARNINGS & MY DOCUMENTS ====================

async function loadEarningsAndDocuments() {
  try {
    const earnings = await apiRequest("/profile/earnings.php");
    const container = document.querySelector(".earnings-list");
    if (!container) return;

    if (!earnings.documents || earnings.documents.length === 0) {
      container.innerHTML =
        '<p style="color:#888;text-align:center;padding:2rem;">Vous n\'avez pas encore publié de documents.</p>';
      return;
    }

    // Update earnings display
    const earningsAmount = document.getElementById("stat-earnings-amount");
    if (earningsAmount) {
      earningsAmount.textContent = parseFloat(
        earnings.total_earned || 0,
      ).toFixed(2);
    }

    // Display documents with their earnings
    container.innerHTML = earnings.documents
      .map(function (doc) {
        const uploadDate = new Date(doc.date_upload).toLocaleDateString(
          "fr-FR",
        );
        const colorClass = getSubjectColorClass(doc.matiere_id);
        return (
          '<div class="earnings-item">' +
          '<div class="earnings-info">' +
          '<div class="earnings-doc-icon ' +
          colorClass +
          '">' +
          '<span class="material-symbols-outlined">description</span>' +
          "</div>" +
          '<div class="earnings-details">' +
          "<h4>" +
          doc.titre +
          "</h4>" +
          '<span class="earnings-meta">' +
          "Prix: " +
          parseFloat(doc.prix).toFixed(2) +
          " DT · " +
          "Ventes: " +
          (doc.sales_count || 0) +
          " · " +
          "Publié: " +
          uploadDate +
          "</span>" +
          "</div>" +
          "</div>" +
          '<div class="earnings-earned">' +
          '<span class="earnings-amount">' +
          parseFloat(doc.total_earned).toFixed(2) +
          " DT</span>" +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  } catch (err) {
    console.log("Earnings not loaded:", err.message);
    // This is optional, don't show error if endpoint doesn't exist
  }
}

// ==================== SAVE PROFILE ====================

async function saveProfile() {
  const name = document.getElementById("editName").value.trim();
  const bio = document.getElementById("editBio").value.trim();
  const filiere = document.getElementById("editMajor").value;

  if (!name) {
    showToast("Le nom est obligatoire", "error");
    return;
  }

  try {
    await apiRequest("/profile/update.php", "POST", { name, bio, filiere });

    // Mettre à jour le DOM immédiatement
    document
      .querySelectorAll(".hero-title-row h1")
      .forEach((el) => (el.textContent = name));
    document
      .querySelectorAll(".sidenav-profile h3")
      .forEach(
        (el) =>
          (el.textContent = "@" + name.replace(/\s+/g, "_").toLowerCase()),
      );
    document
      .querySelectorAll(".sidenav-profile p")
      .forEach((el) => (el.textContent = filiere + " Major"));
    document
      .querySelectorAll(".hero-desc")
      .forEach((el) => (el.textContent = bio || "Aucune bio renseignée."));

    // Mettre à jour localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    user.name = name;
    user.bio = bio;
    user.filiere = filiere;
    localStorage.setItem("user", JSON.stringify(user));

    closeEditProfile();
    showToast("Profil mis à jour avec succès !", "success");
  } catch (err) {
    showToast("Erreur : " + err.message, "error");
  }
}

// ==================== UPLOAD DOCUMENT ====================

async function handleUpload(e) {
  e.preventDefault();

  const formData = new FormData();
  formData.append("title", document.getElementById("uploadTitle").value.trim());
  formData.append(
    "description",
    document.getElementById("uploadDescription").value.trim(),
  );
  formData.append("filiere", document.getElementById("uploadFiliere").value);
  formData.append(
    "matiere",
    document.getElementById("uploadMatiere").value.trim(),
  );
  formData.append("type", document.getElementById("uploadType").value);
  formData.append("price", document.getElementById("uploadPrice").value || 0);

  const fileInput = document.getElementById("uploadFile");
  if (!fileInput || !fileInput.files[0]) {
    showToast("Veuillez sélectionner un fichier PDF", "error");
    return;
  }
  formData.append("file", fileInput.files[0]);

  const btn = document.getElementById("uploadBtn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Envoi en cours...";
  }

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(API_BASE + "/documents/upload.php", {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
      body: formData,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    closeModal();
    showToast("Document publié avec succès !", "success");

    // Recharger l'historique si on est sur la page profil
    loadPurchasesHistory();
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
  const modal = document.getElementById("uploadModal");
  if (modal) modal.classList.remove("open");
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
  requestAnimationFrame(function () {
    ep.style.transition = "opacity 0.3s, transform 0.3s";
    ep.style.opacity = "1";
    ep.style.transform = "translateX(0)";
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeEditProfile() {
  const ep = document.getElementById("editProfileView");
  ep.style.transition = "opacity 0.25s, transform 0.25s";
  ep.style.opacity = "0";
  ep.style.transform = "translateX(2rem)";
  setTimeout(function () {
    ep.style.display = "none";
    document.getElementById("profileView").style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 250);
}

function previewAvatar(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (ev) {
    document.getElementById("editAvatarPreview").src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

// ==================== LOGOUT ====================

function confirmLogout(e) {
  e.preventDefault();
  document.getElementById("logoutModal").classList.add("open");
}

function closeLogout() {
  document.getElementById("logoutModal").classList.remove("open");
}

function handleLogoutOverlayClick(e) {
  if (e.target === document.getElementById("logoutModal")) closeLogout();
}

function doLogout() {
  closeLogout();
  showToast("Déconnexion en cours...", "info");
  setTimeout(function () {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "auth.html";
  }, 1200);
}

// ==================== TOAST ====================

function showToast(message, type) {
  type = type || "info";
  const existing = document.getElementById("gc-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "gc-toast";

  const icon =
    type === "success" ? "check_circle" : type === "error" ? "error" : "info";
  const color =
    type === "success"
      ? "var(--secondary)"
      : type === "error"
        ? "var(--error)"
        : "#3d57bb";

  toast.style.cssText = `
        position:fixed; bottom:5.5rem; left:50%; transform:translateX(-50%) translateY(1rem);
        background:#fff; border:1px solid var(--surface-container-high);
        box-shadow:0 8px 30px rgba(39,48,87,0.15); border-radius:var(--radius-full);
        padding:0.75rem 1.5rem; display:flex; align-items:center; gap:0.5rem;
        font-weight:600; font-size:0.875rem; color:var(--on-surface);
        z-index:9999; opacity:0; transition:opacity 0.3s, transform 0.3s;
        white-space:nowrap;
    `;
  toast.innerHTML =
    '<span class="material-symbols-outlined" style="color:' +
    color +
    ';font-size:1.2rem;">' +
    icon +
    "</span>" +
    message;

  document.body.appendChild(toast);

  requestAnimationFrame(function () {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
  });

  setTimeout(function () {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(1rem)";
    setTimeout(function () {
      toast.remove();
    }, 400);
  }, 3000);
}

// ==================== INIT ====================

document.addEventListener("DOMContentLoaded", function () {
  if (!localStorage.getItem("token")) {
    window.location.href = "auth.html";
    return;
  }

  loadProfile();
  loadPurchasesHistory();
  loadEarningsAndDocuments();

  const uploadForm = document.getElementById("uploadForm");
  if (uploadForm) uploadForm.addEventListener("submit", handleUpload);

  // Afficher/masquer le champ prix selon le type
  const uploadType = document.getElementById("uploadType");
  const priceWrapper = document.getElementById("priceWrapper");
  if (uploadType && priceWrapper) {
    uploadType.addEventListener("change", function () {
      priceWrapper.style.display =
        uploadType.value === "paid" ? "block" : "none";
    });
  }
});
