// ==================== STATE ====================

let allDocuments = [];
let currentQuery = "";

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

// ==================== LOAD ====================

async function loadMyDocuments() {
  try {
    console.log("Loading my documents...");
    // Use category=my-notes to get only the current user's documents
    const resp = await apiRequest("/documents/list.php?category=my-notes");
    console.log("API response:", resp);
    allDocuments = resp.data || [];
    console.log("Documents loaded:", allDocuments);

    if (!allDocuments || allDocuments.length === 0) {
      console.log("No documents found");
      renderNotes();
      return;
    }

    renderNotes();
  } catch (err) {
    console.error("Erreur chargement documents :", err.message);
    console.error("Full error:", err);
    showEmptyState("Erreur de chargement. Réessayez plus tard.");
  }
}

// Function to refresh documents (called after upload)
window.refreshNotesList = async function () {
  await loadMyDocuments();
};

// ==================== RENDER ====================

function renderNotes() {
  const container = document.querySelector(".cards-grid");
  const emptyState = document.getElementById("emptyState");

  console.log("renderNotes called");
  console.log("Container found:", container ? "YES" : "NO");
  console.log("All documents:", allDocuments);

  if (!container) {
    console.error("Container .cards-grid not found!");
    return;
  }

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

  console.log("Results to display:", results.length);

  if (results.length === 0) {
    console.log("No results, showing empty state");
    container.innerHTML = "";
    if (emptyState) {
      emptyState.style.display = "block";
    }
    return;
  }

  console.log("Rendering", results.length, "cards");
  if (emptyState) emptyState.style.display = "none";

  const cardsHTML = results.map(generateNoteCard).join("");
  console.log("Generated HTML:", cardsHTML.substring(0, 200) + "...");

  container.innerHTML = cardsHTML;

  // Add click handlers to cards (excluding action buttons)
  document.querySelectorAll(".note-card").forEach((card) => {
    card.addEventListener("click", function (e) {
      // Don't trigger if clicking edit/delete buttons
      if (e.target.closest(".note-btn")) return;
      const docId = this.getAttribute("data-id");
      const doc = allDocuments.find((d) => d.id == docId);
      if (doc) showDocumentDetails(doc);
    });
  });
}

// ==================== SHOW DOCUMENT DETAILS ====================
function showDocumentDetails(doc) {
  const details = `<strong>${doc.title}</strong><br>
    Author: ${doc.author || "@unknown"}<br>
    Subject: ${doc.matiere || "N/A"}<br>
    Field: ${doc.filiere || "N/A"}<br>
    Price: ${doc.is_paid ? doc.price.toFixed(2) + " DT" : "Free"}`;
  showToast(details, "info");
}

// ==================== GENERATE CARD ====================
function generateNoteCard(doc) {
  const fileType = doc.file_type || "PDF";
  const badgeClass = doc.is_paid ? "badge-teal" : "badge-blue";
  const badge = doc.is_paid ? "Paid" : "Free";
  const price = parseFloat(doc.price || 0);

  const priceTag = doc.is_paid
    ? `<span class="price-tag">${price.toFixed(2)} DT</span>`
    : `<span class="price-tag free">Gratuit</span>`;

  return `<div class="resource-card note-card" data-id="${doc.id}" style="cursor:pointer;">
    <div class="card-img-wrap">
      ${generateFirstLetterAvatar(doc.title)}
      <span class="card-badge ${badgeClass}">${badge}</span>
    </div>
    <h3 class="card-title">${doc.title}</h3>
    <div class="card-footer">
      <span class="file-type">${fileType}</span>
      ${priceTag}
      <div class="note-actions" style="display:flex;gap:6px;margin-left:auto;">
        <button class="note-btn" onclick="editDocument(${doc.id}); event.stopPropagation();" title="Edit" style="background:none;border:none;cursor:pointer;padding:4px;color:#3d57bb;display:flex;align-items:center;transition:all 0.2s;">
          <span class="material-symbols-outlined" style="font-size:18px;">edit</span>
        </button>
        <button class="note-btn danger" onclick="deleteDocument(${doc.id}); event.stopPropagation();" title="Delete" style="background:none;border:none;cursor:pointer;padding:4px;color:#f76a80;display:flex;align-items:center;transition:all 0.2s;">
          <span class="material-symbols-outlined" style="font-size:18px;">delete</span>
        </button>
      </div>
    </div>
  </div>`;
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

  console.log("My Notes page loading...");

  // Load documents and initialize search
  loadMyDocuments();
  initSearch();

  // Refresh sold count from shared.js if available
  if (typeof window.refreshAllSoldCounts === "function") {
    window.refreshAllSoldCounts();
  }
});
