// ==================== AUTH ====================

function requireAuth() {
  if (!localStorage.getItem("token")) {
    window.location.href = "auth.html";
    return false;
  }
  return true;
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

// ==================== NAVBAR ====================

function initNavbar() {
  const user = getCurrentUser();
  if (!user.name) return;

  document
    .querySelectorAll(".navbar-username")
    .forEach((el) => (el.textContent = user.name));
  document
    .querySelectorAll(".navbar-filiere")
    .forEach((el) => (el.textContent = user.filiere || ""));

  if (user.photo) {
    document
      .querySelectorAll(".topnav-right .avatar-sm img")
      .forEach(function (img) {
        img.src = user.photo;
      });
  }
}

// ==================== LOGOUT MODAL ====================

document.addEventListener("DOMContentLoaded", () => {
  // Injecter le modal logout dans toutes les pages
  const modal = document.createElement("div");
  modal.id = "logoutModal";
  modal.className = "modal-overlay";
  modal.onclick = (e) => {
    if (e.target === modal) closeLogout();
  };
  modal.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true" style="max-width:26rem;">
            <div class="modal-header" style="border-bottom:none;padding-bottom:0;">
                <div style="display:flex;align-items:center;gap:0.75rem;">
                    <div style="width:2.5rem;height:2.5rem;border-radius:50%;background:rgba(172,49,73,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                        <span class="material-symbols-outlined" style="color:#ac3149;font-size:1.25rem;">logout</span>
                    </div>
                    <div>
                        <h2 style="font-size:1.1rem;font-family:'Plus Jakarta Sans',sans-serif;">Log out?</h2>
                        <p style="font-size:0.75rem;color:#5a6490;">You'll need to sign in again to access your account.</p>
                    </div>
                </div>
                <button class="modal-close" onclick="closeLogout()" aria-label="Close">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div class="modal-footer" style="border-top:none;padding-top:1rem;">
                <button class="btn-cancel" onclick="closeLogout()">Stay Logged In</button>
                <button onclick="doLogout()" style="flex:2;padding:1rem;background:linear-gradient(135deg,#ac3149,#f76a80);color:#fff;border:none;border-radius:9999px;font-weight:700;font-size:0.875rem;display:flex;align-items:center;justify-content:center;gap:0.5rem;cursor:pointer;">
                    <span class="material-symbols-outlined">logout</span>
                    Yes, Log Out
                </button>
            </div>
        </div>
    `;
  document.body.appendChild(modal);

  // Injecter le modal sold dans toutes les pages
  const soldModal = document.createElement("div");
  soldModal.id = "soldModal";
  soldModal.className = "modal-overlay";
  soldModal.style.display = "none";
  soldModal.onclick = (e) => {
    if (e.target === soldModal) closeSoldModal();
  };
  soldModal.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" style="max-width:26rem;">
      <div class="modal-header">
        <h2>My Sold Count</h2>
        <button class="modal-close" onclick="closeSoldModal()" aria-label="Close">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="modal-body">
        <div style="text-align:center;padding:2rem;background:#f5f7ff;border-radius:12px;margin-bottom:1.5rem;">
          <p style="color:#888;font-size:0.875rem;margin-bottom:0.5rem;">Your Current Sold Count</p>
          <h3 style="color:#006b5e;font-size:2.5rem;margin:0;font-weight:700;" id="currentSoldDisplay">0</h3>
          <p style="color:#888;font-size:0.875rem;margin-top:0.5rem;">Documents Sold</p>
        </div>
        <p style="color:#666;margin-bottom:1rem;">Log a new sale:</p>
        <input id="soldPrice" class="form-input" type="number" min="1" placeholder="Number of documents to add" style="width:100%;padding:0.75rem;border:1px solid #ddd;border-radius:8px;font-size:1rem;font-family:inherit;" />
      </div>
      <div class="modal-footer">
        <button class="btn-cancel" onclick="closeSoldModal()" style="flex:1;">Close</button>
        <button class="btn-submit" onclick="logSale()" style="flex:1;background:#006b5e;color:white;border:none;padding:0.75rem;border-radius:8px;cursor:pointer;font-weight:600;">Add Sale</button>
      </div>
    </div>
  `;
  document.body.appendChild(soldModal);

  // Init navbar, auth guard, and refresh sold counts
  initNavbar();
  window.refreshAllSoldCounts();
});

function confirmLogout(e) {
  e.preventDefault();
  document.getElementById("logoutModal").classList.add("open");
}

function closeLogout() {
  document.getElementById("logoutModal").classList.remove("open");
}

function doLogout() {
  closeLogout();
  showToast("Déconnexion en cours...", "logout", "#ac3149");
  setTimeout(function () {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "auth.html";
  }, 1200);
}

// ==================== SOLD MODAL ====================

function openSoldModal() {
  const modal = document.getElementById("soldModal");
  if (modal) {
    modal.style.display = "flex";
    setTimeout(() => modal.classList.add("open"), 10);

    // Fetch and display the real sold count from the database
    fetchAndDisplaySoldCount();
  }
}

async function fetchAndDisplaySoldCount() {
  try {
    const resp = await window.apiRequest("/profile/get.php");
    const soldCount = resp.data?.sold_count || 0;
    const displayEl = document.getElementById("currentSoldDisplay");
    if (displayEl) {
      displayEl.textContent = soldCount;
    }
  } catch (err) {
    console.error("Error fetching sold count:", err.message);
  }
}

// Global function to sync sold count across all pages
window.refreshAllSoldCounts = async function () {
  try {
    const resp = await window.apiRequest("/profile/get.php");
    const soldCount = resp.data?.sold_count || 0;

    // Update all #soldCount elements across ALL pages
    document.querySelectorAll("#soldCount").forEach((el) => {
      el.textContent = soldCount;
    });

    // Update the modal display if it exists
    const displayEl = document.getElementById("currentSoldDisplay");
    if (displayEl) {
      displayEl.textContent = soldCount;
    }
  } catch (err) {
    console.error("Error refreshing sold counts:", err.message);
  }
};

function closeSoldModal() {
  const modal = document.getElementById("soldModal");
  if (modal) {
    modal.classList.remove("open");
    setTimeout(() => (modal.style.display = "none"), 300);
  }
}

function handleSoldOverlayClick(e) {
  if (e.target === document.getElementById("soldModal")) closeSoldModal();
}

async function logSale() {
  const amount = parseInt(document.getElementById("soldPrice").value);
  if (!amount || amount < 1) {
    showToast("Please enter a valid number.", "warning", "#ac3149");
    return;
  }

  try {
    // POST the new sale amount to the backend
    const resp = await window.apiRequest("/profile/add-sold.php", "POST", {
      amount,
    });

    if (!resp.success) {
      showToast(
        "Error: " + (resp.message || "Unknown error"),
        "error",
        "#ac3149",
      );
      return;
    }

    const newSoldCount = resp.data?.sold_count || 0;

    // Update ALL sold count displays across ALL pages
    document.querySelectorAll("#soldCount").forEach((el) => {
      el.textContent = newSoldCount;
    });

    // Also update the modal display with the fresh value
    const displayEl = document.getElementById("currentSoldDisplay");
    if (displayEl) {
      displayEl.textContent = newSoldCount;
    }

    document.getElementById("soldPrice").value = "";
    showToast(
      "Sale logged successfully! Your sold count is now " + newSoldCount,
      "check_circle",
      "#006b5e",
    );
  } catch (err) {
    showToast("Erreur : " + err.message, "error", "#ac3149");
  }
}

// ==================== TOAST ====================

function showToast(message, icon, color) {
  const existing = document.getElementById("gc-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "gc-toast";
  toast.style.cssText =
    "position:fixed;bottom:2rem;left:50%;transform:translateX(-50%) translateY(1rem);" +
    "background:#fff;border:1px solid #e4e7ff;box-shadow:0 8px 30px rgba(39,48,87,0.15);" +
    "border-radius:9999px;padding:0.75rem 1.5rem;display:flex;align-items:center;" +
    "gap:0.5rem;font-weight:600;font-size:0.875rem;color:#273057;" +
    "z-index:9999;opacity:0;transition:opacity 0.3s,transform 0.3s;white-space:nowrap;";

  toast.innerHTML =
    '<span class="material-symbols-outlined" style="color:' +
    color +
    ';font-size:1.2rem;">' +
    icon +
    "</span>" +
    message;

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(1rem)";
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// ==================== ANIMATIONS ====================

const sharedStyle = document.createElement("style");
sharedStyle.textContent =
  "@keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}" +
  "@keyframes slideOutRight{from{transform:translateX(0);opacity:1}to{transform:translateX(100%);opacity:0}}" +
  "@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}";
document.head.appendChild(sharedStyle);
