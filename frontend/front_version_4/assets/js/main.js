const API_BASE = "../backend/api";

// ==================== API CALLS ====================

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

// ==================== STATE ====================

let resourcesData = { all: [] };
let currentFilter = "all";
let currentQuery = "";

// ==================== LOAD DOCUMENTS FROM API ====================

async function loadDocuments() {
  try {
    const filiere = currentFilter === "all" ? "" : currentFilter;
    const docs = await apiRequest(
      `/documents/list.php?filiere=${filiere}&q=${currentQuery}`,
    );

    // Adapter le format API au format attendu par generateCard()
    resourcesData.all = docs.map(function (doc) {
      return {
        id: doc.id,
        title: doc.title,
        author: "@" + doc.author_name.replace(/\s+/g, "_").toLowerCase(),
        authorAvatar: "../assets/images/student avatar.jpg",
        image: "../assets/images/document.jpg",
        badge: doc.type === "paid" ? "Premium" : "Free",
        badgeClass: doc.type === "paid" ? "badge-teal" : "badge-blue",
        fileType: "PDF",
        category: doc.matiere,
        action: doc.type === "paid" ? "buy" : "download",
        price: doc.price,
        type: doc.type,
      };
    });

    renderGrid();
  } catch (err) {
    showToast("Erreur de chargement : " + err.message, "error");
    console.error(err);
  }
}

// ==================== RENDER ====================

function renderGrid() {
  let results = resourcesData.all.filter(function (resource) {
    if (currentFilter === "all") return true;
    return resource.category === currentFilter;
  });

  if (currentQuery !== "") {
    results = results.filter(function (resource) {
      return (
        resource.title.toLowerCase().includes(currentQuery) ||
        resource.author.toLowerCase().includes(currentQuery) ||
        resource.fileType.toLowerCase().includes(currentQuery)
      );
    });
  }

  const cardsGrid = document.querySelector(".cards-grid");
  if (!cardsGrid) return;

  if (results.length === 0) {
    const msg = currentQuery
      ? 'No results for "' + currentQuery + '"'
      : "No resources in this category yet.";
    cardsGrid.innerHTML =
      '<div style="grid-column:1/-1;text-align:center;padding:3rem;">' +
      '<span class="material-symbols-outlined" ' +
      'style="font-size:3rem;color:var(--outline);">search_off</span>' +
      '<p style="margin-top:1rem;color:var(--on-surface-variant);">' +
      msg +
      "</p>" +
      "</div>";
  } else {
    cardsGrid.innerHTML = results.map(generateCard).join("");
  }
}

// ==================== GENERATE CARD ====================

function generateCard(resource) {
  const iconMap = {
    download: "download",
    view: "visibility",
    buy: "shopping_cart",
  };
  const icon = iconMap[resource.action] || "download";

  const priceTag =
    resource.type === "paid"
      ? '<span class="price-tag">' +
        parseFloat(resource.price).toFixed(2) +
        " DT</span>"
      : '<span class="price-tag free">Gratuit</span>';

  return (
    '<div class="resource-card" data-id="' +
    resource.id +
    '">' +
    '<div class="card-img-wrap">' +
    '<img src="' +
    resource.image +
    '" alt="' +
    resource.title +
    '"/>' +
    '<span class="card-badge ' +
    resource.badgeClass +
    '">' +
    resource.badge +
    "</span>" +
    "</div>" +
    '<h3 class="card-title">' +
    resource.title +
    "</h3>" +
    '<div class="card-author">' +
    '<div class="author-avatar bg-purple">' +
    '<img src="' +
    resource.authorAvatar +
    '" alt="' +
    resource.author +
    '"/>' +
    "</div>" +
    '<span class="author-name">' +
    resource.author +
    "</span>" +
    "</div>" +
    '<div class="card-footer">' +
    '<span class="file-type">' +
    resource.fileType +
    "</span>" +
    priceTag +
    '<button class="action-btn" aria-label="' +
    resource.action +
    '" ' +
    'onclick="handleAction(' +
    resource.id +
    ')">' +
    '<span class="material-symbols-outlined">' +
    icon +
    "</span>" +
    "</button>" +
    "</div>" +
    "</div>"
  );
}

// ==================== FILTERS ====================

function initFilters() {
  const chips = document.querySelectorAll(".chip");

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      const filter = chip.getAttribute("data-filter") || "all";

      currentFilter = filter;
      chips.forEach(function (c) {
        c.classList.remove("chip-active");
      });
      chip.classList.add("chip-active");

      // Recharger depuis l'API avec le nouveau filtre
      loadDocuments();
    });
  });
}

// ==================== SEARCH ====================

function initSearch() {
  const searchInput = document.querySelector(".search-input");
  const searchBtn = document.querySelector(".btn-find");

  function performSearch() {
    currentQuery = searchInput.value.toLowerCase().trim();
    // Recharger depuis l'API avec la nouvelle query
    loadDocuments().then(function () {
      if (currentQuery !== "") {
        const matchCount = resourcesData.all.length;
        showToast(
          matchCount > 0
            ? matchCount + " result(s) found"
            : 'No results for "' + currentQuery + '"',
          matchCount > 0 ? "success" : "info",
        );
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      if (searchInput.value === "") {
        currentQuery = "";
        loadDocuments();
      }
    });
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") performSearch();
    });
  }

  if (searchBtn) {
    searchBtn.onclick = null;
    searchBtn.addEventListener("click", performSearch);
  }
}

// ==================== HANDLE ACTION ====================

async function handleAction(resourceId) {
  const resource = resourcesData.all.find(function (r) {
    return r.id === resourceId;
  });
  if (!resource) return;

  // Vérifier si connecté
  const token = localStorage.getItem("token");
  if (!token) {
    showToast("Connectez-vous pour continuer", "error");
    setTimeout(function () {
      window.location.href = "auth.html";
    }, 1500);
    return;
  }

  if (resource.action === "download") {
    // Téléchargement direct (document gratuit)
    try {
      showToast("Téléchargement en cours...", "info");
      const link = document.createElement("a");
      link.href =
        API_BASE + "/documents/download.php?id=" + resource.id + "&t=" + token;
      link.download = resource.title + ".pdf";
      link.click();
      showToast('Téléchargement démarré : "' + resource.title + '"', "success");
    } catch (err) {
      showToast("Erreur : " + err.message, "error");
    }
  } else if (resource.action === "buy") {
    // Achat d'un document payant
    try {
      showToast("Traitement du paiement...", "info");
      const result = await apiRequest("/payments/initiate.php", "POST", {
        document_id: resource.id,
      });

      // Confirmer le paiement avec la référence retournée
      await apiRequest("/payments/verify.php", "POST", {
        payment_ref: result.payment_ref,
        document_id: resource.id,
      });

      showToast("Paiement validé ! Téléchargement débloqué.", "success");
      // Recharger pour mettre à jour le bouton
      loadDocuments();
    } catch (err) {
      showToast("Erreur paiement : " + err.message, "error");
    }
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

// ==================== ANIMATIONS ====================

const dynamicStyle = document.createElement("style");
dynamicStyle.textContent =
  "@keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}" +
  "@keyframes slideOutRight{from{transform:translateX(0);opacity:1}to{transform:translateX(100%);opacity:0}}" +
  "@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}" +
  ".chip{cursor:pointer;transition:all 0.2s ease;}" +
  ".resource-card{animation:fadeIn 0.4s ease;}" +
  ".price-tag{font-size:0.8rem;font-weight:700;color:#1D9E75;background:#E1F5EE;padding:2px 8px;border-radius:8px;}" +
  ".price-tag.free{color:#3d57bb;background:#eef0fb;}";
document.head.appendChild(dynamicStyle);

// ==================== NOTIFICATIONS ====================

let notifications = [];

function saveNotifications() {
  localStorage.setItem("notifications", JSON.stringify(notifications));
}

function loadNotifications() {
  const saved = localStorage.getItem("notifications");
  if (saved) notifications = JSON.parse(saved);
}

function getUnreadCount() {
  return notifications.filter((n) => !n.read).length;
}

function updateNotificationBadge() {
  const iconBtn = document.querySelector(".icon-btn");
  if (!iconBtn) return;
  iconBtn.querySelectorAll(".notification-badge").forEach((b) => b.remove());

  const count = getUnreadCount();
  if (count > 0) {
    const badge = document.createElement("span");
    badge.className = "notification-badge";
    badge.textContent = count > 9 ? "9+" : count;
    badge.style.cssText = `
            position:absolute; top:-4px; right:-4px; background:#f76a80; color:white;
            border-radius:50%; width:18px; height:18px; font-size:10px; font-weight:700;
            display:flex; align-items:center; justify-content:center; z-index:10;
        `;
    iconBtn.style.position = "relative";
    iconBtn.appendChild(badge);
  }
}

function createNotificationPanel() {
  if (document.querySelector(".notification-panel")) return;

  const panel = document.createElement("div");
  panel.className = "notification-panel";
  panel.innerHTML = `
        <div class="panel-header">
            <h3>Notifications</h3>
            <button class="close-notifications"><span class="material-symbols-outlined">close</span></button>
        </div>
        <div class="notifications-list"></div>
        <div class="panel-footer">
            <button class="mark-all-read">Mark all as read</button>
        </div>
    `;
  document.body.appendChild(panel);

  const overlay = document.createElement("div");
  overlay.className = "notification-overlay";
  document.body.appendChild(overlay);
}

function renderNotifications() {
  const list = document.querySelector(".notifications-list");
  if (!list) return;

  if (notifications.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:3rem;color:#888;">No notifications yet</div>`;
    return;
  }

  list.innerHTML = notifications
    .map(
      (n) => `
        <div class="notification-item ${n.read ? "read" : "unread"}" data-id="${n.id}">
            <span class="material-symbols-outlined">${n.icon}</span>
            <div class="notif-content">
                <div class="notif-title">${n.title}</div>
                <div class="notif-message">${n.message}</div>
                <div class="notif-time">${n.time}</div>
                ${!n.read ? `<button class="mark-read-btn" data-id="${n.id}">Mark as read</button>` : ""}
            </div>
        </div>
    `,
    )
    .join("");
}

function openNotificationPanel() {
  const panel = document.querySelector(".notification-panel");
  const overlay = document.querySelector(".notification-overlay");
  if (!panel) return;
  renderNotifications();
  panel.style.right = "0";
  overlay.style.opacity = "1";
  overlay.style.pointerEvents = "auto";
}

function closeNotificationPanel() {
  const panel = document.querySelector(".notification-panel");
  const overlay = document.querySelector(".notification-overlay");
  if (panel) panel.style.right = "-360px";
  if (overlay) {
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";
  }
}

function markAsRead(id) {
  const notif = notifications.find((n) => n.id === id);
  if (notif) notif.read = true;
  saveNotifications();
  renderNotifications();
  updateNotificationBadge();
}

function markAllAsRead() {
  notifications.forEach((n) => (n.read = true));
  saveNotifications();
  renderNotifications();
  updateNotificationBadge();
}

function initNotifications() {
  loadNotifications();
  createNotificationPanel();
  updateNotificationBadge();

  const bellBtn = document.querySelector(".icon-btn");
  if (!bellBtn) return console.warn("Bell button not found");

  bellBtn.replaceWith(bellBtn.cloneNode(true));
  const newBellBtn = document.querySelector(".icon-btn");

  newBellBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const panel = document.querySelector(".notification-panel");
    if (panel.style.right === "0px") {
      closeNotificationPanel();
    } else {
      openNotificationPanel();
    }
  });

  document.addEventListener("click", (e) => {
    if (e.target.closest(".close-notifications")) closeNotificationPanel();
    if (e.target.closest(".mark-all-read")) markAllAsRead();

    const markBtn = e.target.closest(".mark-read-btn");
    if (markBtn) {
      e.stopPropagation();
      markAsRead(parseInt(markBtn.dataset.id));
    }
  });
}

// ==================== INIT ====================

document.addEventListener("DOMContentLoaded", function () {
  // Vérifier si l'utilisateur est connecté
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "auth.html";
    return;
  }

  loadDocuments(); // 1. charger les documents depuis l'API
  initFilters(); // 2. chips de filtrage
  initSearch(); // 3. barre de recherche
  initNotifications(); // 4. panneau de notifications
});
