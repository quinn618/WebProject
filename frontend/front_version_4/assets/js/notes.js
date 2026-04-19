const apiRequest = window.apiRequest;

// ==================== STATE ====================

let allDocuments = [];
let currentQuery = "";

// ==================== LOAD ====================

async function loadMyDocuments() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.id) return;

    const docs = await apiRequest("/documents/list.php?user_id=" + user.id);
    allDocuments = docs;
    renderNotes();
  } catch (err) {
    console.error("Erreur chargement documents :", err.message);
    showEmptyState("Erreur de chargement. Réessayez plus tard.");
  }
}

// ==================== RENDER ====================

function renderNotes() {
  const container = document.querySelector(".notes-grid");
  const emptyState = document.getElementById("emptyState");
  if (!container) return;

  let results = allDocuments;

  if (currentQuery !== "") {
    results = allDocuments.filter(function (doc) {
      return (
        doc.title.toLowerCase().includes(currentQuery) ||
        doc.description.toLowerCase().includes(currentQuery) ||
        doc.matiere.toLowerCase().includes(currentQuery)
      );
    });
  }

  if (results.length === 0) {
    container.innerHTML = "";
    if (emptyState) emptyState.style.display = "block";
    return;
  }

  if (emptyState) emptyState.style.display = "none";
  container.innerHTML = results.map(generateNoteCard).join("");
}

function generateNoteCard(doc) {
  const typeLabel =
    doc.type === "paid"
      ? '<span style="color:#1D9E75;font-weight:700;">' +
        parseFloat(doc.price).toFixed(2) +
        " DT</span>"
      : '<span style="color:#3d57bb;font-weight:700;">Gratuit</span>';

  const date = new Date(doc.created_at).toLocaleDateString("fr-FR");

  return (
    '<div class="note-card" data-id="' +
    doc.id +
    '">' +
    '<div class="note-header">' +
    "<h3>" +
    doc.title +
    "</h3>" +
    '<div class="note-actions">' +
    '<button class="note-btn" onclick="editDocument(' +
    doc.id +
    ')" title="Modifier">' +
    '<span class="material-symbols-outlined">edit</span>' +
    "</button>" +
    '<button class="note-btn danger" onclick="deleteDocument(' +
    doc.id +
    ')" title="Supprimer">' +
    '<span class="material-symbols-outlined">delete</span>' +
    "</button>" +
    "</div>" +
    "</div>" +
    "<p>" +
    (doc.description || "Aucune description") +
    "</p>" +
    '<div class="note-footer">' +
    '<span class="note-meta">' +
    doc.filiere +
    " · " +
    doc.matiere +
    "</span>" +
    typeLabel +
    '<span class="note-date">' +
    date +
    "</span>" +
    "</div>" +
    "</div>"
  );
}

function showEmptyState(message) {
  const emptyState = document.getElementById("emptyState");
  if (emptyState) {
    emptyState.style.display = "block";
    emptyState.textContent = message || "Aucun document publié pour l'instant.";
  }
}

// ==================== SEARCH ====================

function initSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  input.addEventListener("input", function () {
    currentQuery = input.value.toLowerCase().trim();
    renderNotes();
  });
}

// ==================== DELETE ====================

async function deleteDocument(docId) {
  if (!confirm("Supprimer ce document définitivement ?")) return;

  try {
    await apiRequest("/documents/delete.php", "POST", { id: docId });
    allDocuments = allDocuments.filter(function (d) {
      return d.id !== docId;
    });
    renderNotes();
    showToast("Document supprimé", "success");
  } catch (err) {
    showToast("Erreur : " + err.message, "error");
  }
}

// ==================== EDIT ====================

function editDocument(docId) {
  const doc = allDocuments.find(function (d) {
    return d.id === docId;
  });
  if (!doc) return;

  // Pré-remplir le modal d'upload avec les données existantes
  document.getElementById("uploadTitle").value = doc.title || "";
  document.getElementById("uploadDescription").value = doc.description || "";
  document.getElementById("uploadFiliere").value = doc.filiere || "";
  document.getElementById("uploadMatiere").value = doc.matiere || "";
  document.getElementById("uploadType").value = doc.type || "free";
  document.getElementById("uploadPrice").value = doc.price || 0;

  // Stocker l'id pour savoir qu'on est en mode édition
  const modal = document.getElementById("uploadModal");
  if (modal) {
    modal.dataset.editId = docId;
    modal.classList.add("open");
  }
}

// ==================== TOAST ====================

function showToast(message, type) {
  type = type || "info";
  document.querySelectorAll(".custom-toast").forEach(function (t) {
    t.remove();
  });

  const toast = document.createElement("div");
  toast.className = "custom-toast toast-" + type;
  const icon =
    type === "success" ? "check_circle" : type === "error" ? "error" : "info";
  const borderColor =
    type === "success" ? "#4caf50" : type === "error" ? "#f76a80" : "#3d57bb";

  toast.innerHTML =
    '<span class="material-symbols-outlined">' +
    icon +
    "</span>" +
    "<span>" +
    message +
    "</span>";

  toast.style.cssText =
    "position:fixed;bottom:100px;right:20px;background:white;" +
    "padding:12px 20px;border-radius:12px;display:flex;align-items:center;" +
    "gap:10px;box-shadow:0 4px 20px rgba(0,0,0,0.15);z-index:1000;" +
    'animation:slideInRight 0.3s ease;font-family:"Be Vietnam Pro",sans-serif;' +
    "font-size:0.875rem;border-left:4px solid " +
    borderColor +
    ";";

  document.body.appendChild(toast);

  setTimeout(function () {
    toast.style.animation = "slideOutRight 0.3s ease";
    setTimeout(function () {
      toast.remove();
    }, 300);
  }, 3000);
}

// ==================== INIT ====================

document.addEventListener("DOMContentLoaded", function () {
  if (!localStorage.getItem("token")) {
    window.location.href = "auth.html";
    return;
  }

  loadMyDocuments();
  initSearch();
});
