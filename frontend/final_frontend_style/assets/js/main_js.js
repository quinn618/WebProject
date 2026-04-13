// contient toutes les ressouces organisées par catégorie
//resourcesData is an object and 'all','exam'... like atributes
const resourcesData = {
  // Catégorie 'all' : contient toutes les ressources sans filtre
  all: [
    {
      id: 1,
      title: "C : how to actually use pointers",
      author: "@alex_dev",
      authorAvatar: "../assets/images/student avatar.jpg",
      image: "../assets/images/code.jpg",
      description:
        "A practical pointer guide: syntax, memory, and common pitfalls.",
      badge: "High Aura",
      badgeClass: "badge-teal",
      fileType: ".C",
      category: "code",
      action: "view",
      downloadUrl: "../assets/images/code.jpg",
      price: 0,
      date: "2024-11-02",
      filiere: "Computer Science",
      matiere: "C Programming",
    },
    {
      id: 2,
      title: "C++ Cheat Sheet",
      author: "@sarah_codes",
      authorAvatar: "../assets/images/student avatar.jpg",
      image: "../assets/images/cheat-sheet.jpg",
      description: "Quick reference for STL, syntax, and core patterns.",
      badge: "Essential",
      badgeClass: "badge-blue",
      fileType: "Image",
      category: "cheat-sheet",
      action: "download",
      downloadUrl: "../assets/images/cheat-sheet.jpg",
      price: 5,
      date: "2024-10-18",
      filiere: "Computer Science",
      matiere: "C++",
    },
    {
      id: 3,
      title: "Fibre optique",
      author: "@iot_master",
      authorAvatar: "../assets/images/student avatar.jpg",
      image: "../assets/images/document.jpg",
      description: "Summary notes: basics, components, and typical use-cases.",
      badge: "Expert",
      badgeClass: "badge-red",
      fileType: "PDF",
      category: "document",
      action: "download",
      downloadUrl: "../assets/images/document.jpg",
      price: 0,
      date: "2024-09-07",
      filiere: "IoT Engineering",
      matiere: "Optical Communication",
    },
    {
      id: 4,
      title: "Advanced Data Structures exam",
      author: "@prof_x",
      authorAvatar: "../assets/images/student avatar.jpg",
      image: "../assets/images/exam.jpg",
      description: "Exam PDF with questions and solutions outline.",
      badge: "High Aura",
      badgeClass: "badge-teal",
      fileType: "PDF",
      category: "exam",
      action: "download",
      downloadUrl: "../assets/images/exam.jpg",
      price: 10,
      date: "2024-06-21",
      filiere: "Computer Science",
      matiere: "Data Structures",
    },
  ],
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, function (ch) {
    return ch === "&"
      ? "&amp;"
      : ch === "<"
        ? "&lt;"
        : ch === ">"
          ? "&gt;"
          : ch === '"'
            ? "&quot;"
            : "&#39;";
  });
}
//shared state
//every render read both of them at the same time
let currentFilter = "all";
let currentQuery = "";
//function that writes and read the code in the DOM
//The DOM is the "live" version of that file that the browser creates in its memory
function renderGrid() {
  // apply category filter
  let results = resourcesData.all.filter(function (resource) {
    if (currentFilter === "all") return true; // 'all' = keep everything
    return resource.category === currentFilter; // otherwise match category
  });
  // apply search query filter on top of category filter
  //search in titile,author and file type
  if (currentQuery !== "") {
    results = results.filter(function (resource) {
      return (
        resource.title.toLowerCase().includes(currentQuery) ||
        resource.author.toLowerCase().includes(currentQuery) ||
        resource.fileType.toLowerCase().includes(currentQuery)
      );
    });
  }

  // write the result to the DOM (.querySelector reads the live DOM)

  const cardsGrid = document.querySelector(".cards-grid");
  if (!cardsGrid) return; //stop if the grid doesn't exist yet

  if (results.length === 0) {
    // Nothing survived both filters
    const msg = currentQuery
      ? 'No results for "' + currentQuery + '"' // search had no match
      : "No resources in this category yet."; // filter had no match
    //write in the DOM a message
    cardsGrid.innerHTML =
      '<div style="grid-column:1/-1;text-align:center;padding:3rem;">' +
      '<span class="material-symbols-outlined" ' +
      'style="font-size:3rem;color:var(--outline);">search_off</span>' +
      '<p style="margin-top:1rem;color:var(--on-surface-variant);">' +
      msg +
      "</p>" +
      "</div>";
  } else {
    // REMPLACE le contenu HTML par les nouvelles cartes générées(.innerHTML)
    //you can use .appendChild() to ADD elements one by one at the end of existing content
    // .map() transforme chaque ressource en HTML en un tableau de chaines+ is the cleanest way to transform data into HTML visuals
    //.join('') transforme ce tableau de chaines en une seule chaine HTML
    cardsGrid.innerHTML = results.map(generateCard).join("");
    if (window.gcSyncPurchases) window.gcSyncPurchases();
  }
}

// Fonction pour générer une carte HTML à partir d'une ressource
// Prend un objet resource en paramètre et retourne une chaîne HTML

function generateCard(resource) {
  const safeTitle = escapeHtml(resource.title);
  const safeAuthor = escapeHtml(resource.author);
  const safeFileType = escapeHtml(resource.fileType);
  const safeBadge = escapeHtml(resource.badge);
  const safeCategory = escapeHtml(resource.category);
  const safeDescription = escapeHtml(resource.description || "");
  const safeDownloadUrl = escapeHtml(resource.downloadUrl || "#");
  const safePrice = escapeHtml(resource.price ?? "");
  const safeDate = escapeHtml(resource.date || "");
  const safeFiliere = escapeHtml(resource.filiere || "");
  const safeMatiere = escapeHtml(resource.matiere || "");
  const isPaid = Number(resource.price) > 0;

  return (
    '<div class="resource-card" data-id="' +
    resource.id +
    '" data-purchase-key="res:' +
    resource.id +
    '" data-category="' +
    safeCategory +
    '" data-description="' +
    safeDescription +
    '" data-download="' +
    safeDownloadUrl +
    '" data-price="' +
    safePrice +
    '" data-date="' +
    safeDate +
    '" data-filiere="' +
    safeFiliere +
    '" data-matiere="' +
    safeMatiere +
    '">' +
    '<div class="card-img-wrap">' +
    '<img src="' +
    resource.image +
    '" alt="' +
    safeTitle +
    '"/>' +
    '<span class="card-badge ' +
    resource.badgeClass +
    '">' +
    safeBadge +
    "</span>" +
    "</div>" +
    '<h3 class="card-title">' +
    safeTitle +
    "</h3>" +
    '<div class="card-author">' +
    '<div class="author-avatar bg-purple">' +
    '<img src="' +
    resource.authorAvatar +
    '" alt="' +
    safeAuthor +
    '"/>' +
    "</div>" +
    '<span class="author-name">' +
    safeAuthor +
    "</span>" +
    "</div>" +
    '<div class="card-footer">' +
    '<span class="file-type">' +
    safeFileType +
    "</span>" +
    '<div class="card-actions">' +
    '<button class="action-btn gc-download-btn" type="button" aria-label="Download">' +
    '<span class="material-symbols-outlined">download</span>' +
    "</button>" +
    (isPaid
      ? '<button class="action-btn gc-buy-btn" type="button" aria-label="Buy">' +
        '<span class="material-symbols-outlined">shopping_cart</span>' +
        "</button>"
      : "") +
    "</div>" +
    "</div>" +
    "</div>"
  );
}

function initFilters() {
  //make the chips in a list
  const chips = document.querySelectorAll(".chip");

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      // Read the filter value from the chip's data-filter attribute (e.g. "exam", "document", etc.)
      const filter = chip.getAttribute("data-filter") || "all";

      // Update shared state
      currentFilter = filter;
      // Update chip highlight
      chips.forEach(function (c) {
        c.classList.remove("chip-active");
      });
      chip.classList.add("chip-active");

      //update the grid based on the new filter
      renderGrid();
    });
  });
}

// Fonction de recherche de ressources

function initSearch() {
  const searchInput = document.querySelector(".search-input");
  const searchBtn = document.querySelector(".btn-find");

  function performSearch() {
    currentQuery = searchInput.value.toLowerCase().trim();
    //update the grid based on the new searched query
    renderGrid();
    // small pop up message to show how many results were found or an error
    if (currentQuery !== "") {
      const matchCount = resourcesData.all.filter(function (r) {
        const categoryOk =
          currentFilter === "all" || r.category === currentFilter;
        const textOk =
          r.title.toLowerCase().includes(currentQuery) ||
          r.author.toLowerCase().includes(currentQuery) ||
          r.fileType.toLowerCase().includes(currentQuery);
        return categoryOk && textOk;
      }).length;

      showToast(
        matchCount > 0
          ? matchCount + " result(s) found"
          : 'No results for "' + currentQuery + '"',
        matchCount > 0 ? "success" : "info",
      );
    }
  }
  //reset the search if the user clears the input
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      if (searchInput.value === "") {
        currentQuery = "";
        renderGrid();
      }
    });
    //allow searching by pressing enter key
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") performSearch();
    });
  }

  if (searchBtn) {
    searchBtn.onclick = null;
    searchBtn.addEventListener("click", performSearch);
  }
}
// actions handler for cards buttons (download,view..)
function handleAction(resourceId) {
  // Find the resource by id in the master array
  const resource = resourcesData.all.find(function (r) {
    return r.id === resourceId;
  });
  if (!resource) return;

  const messages = {
    download: 'Download started for "' + resource.title + '"',
    view: 'Opening "' + resource.title + '"',
  };

  showToast(messages[resource.action] || "Action triggered", "success");
  console.log(resource.action + ":", resource);
}

//the temporary pop up message

function showToast(message, type) {
  type = type || "info";

  // Remove any existing toast to avoid stacking
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

  // Auto-remove after 3 seconds:nested timer to first prepare the leave animation
  setTimeout(function () {
    toast.style.animation = "slideOutRight 0.3s ease";
    setTimeout(function () {
      toast.remove();
    }, 300);
  }, 3000);
}

const dynamicStyle = document.createElement("style");
dynamicStyle.textContent =
  "@keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}" +
  "@keyframes slideOutRight{from{transform:translateX(0);opacity:1}to{transform:translateX(100%);opacity:0}}" +
  "@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}" +
  ".chip{cursor:pointer;transition:all 0.2s ease;}" +
  ".resource-card{animation:fadeIn 0.4s ease;}";
document.head.appendChild(dynamicStyle);

// NOTIFICATIONS SYSTEM

let notifications = [
  {
    id: 1,
    title: "New Resource Available!",
    message: "C++ Advanced Memory Management guide has been added.",
    time: "5 min ago",
    read: false,
    icon: "description",
  },
  {
    id: 2,
    title: "Your upload was approved",
    message: "Network Layers Flashcards is now public.",
    time: "1 hr ago",
    read: false,
    icon: "check_circle",
  },
  {
    id: 3,
    title: "Weekly digest",
    message: "12 new resources were added this week.",
    time: "2 days ago",
    read: true,
    icon: "mail",
  },
];
// Saves it in the browser's permanent storage
function saveNotifications() {
  localStorage.setItem("notifications", JSON.stringify(notifications));
}
// Retrieves the notification string from storage and converts it back into a JavaScript array
function loadNotifications() {
  const saved = localStorage.getItem("notifications");
  if (saved) notifications = JSON.parse(saved);
}
// Uses the filter method to count how many notification objects have the 'read' property set to false
function getUnreadCount() {
  return notifications.filter((n) => !n.read).length;
}
// Handles the visual red circle (badge) on the bell icon
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
// Creates the hidden side-menu structure in the HTML
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
  // Overlay
  const overlay = document.createElement("div");
  overlay.className = "notification-overlay";
  document.body.appendChild(overlay);
}
// Refreshes the actual list of notifications inside the side panel
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
// Makes the panel visible to the user
function openNotificationPanel() {
  const panel = document.querySelector(".notification-panel");
  const overlay = document.querySelector(".notification-overlay");
  if (!panel) return;

  renderNotifications();
  panel.style.right = "0";
  overlay.style.opacity = "1";
  overlay.style.pointerEvents = "auto";
}
// Hides the panel from the user
function closeNotificationPanel() {
  const panel = document.querySelector(".notification-panel");
  const overlay = document.querySelector(".notification-overlay");
  if (panel) panel.style.right = "-360px";
  if (overlay) {
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";
  }
}
// Finds a specific notification by ID and marks it as read
function markAsRead(id) {
  const notif = notifications.find((n) => n.id === id);
  if (notif) notif.read = true;
  saveNotifications();
  renderNotifications();
  updateNotificationBadge();
}
// Sets the read property to true for every single notification in the array
function markAllAsRead() {
  notifications.forEach((n) => (n.read = true));
  saveNotifications();
  renderNotifications();
  updateNotificationBadge();
}

// ==================== INITIALIZATION ====================

function initNotifications() {
  loadNotifications();
  createNotificationPanel();
  updateNotificationBadge();

  const bellBtn = document.querySelector(".icon-btn");
  if (!bellBtn) return console.warn("Bell button not found");

  // Remove old listeners to prevent duplicates
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

  // Global click handlers
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

// Most important: initialize everything once the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  renderGrid(); // 1. draw all cards on first load
  initFilters(); // 2. wire chip clicks
  initSearch(); // 3. wire search input + Find button
  // Notifications are handled globally in shared.js
});
