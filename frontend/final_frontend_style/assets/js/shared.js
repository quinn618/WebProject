(function () {
  const LS_USERS_KEY = "gc_users";
  const LS_SESSION_KEY = "gc_session";
  const FALLBACK_PREVIEW = "../assets/images/document.jpg";

  const PUBLIC_PAGES = new Set(["index.html", "auth.html"]);

  function getCurrentPageName() {
    const path = window.location.pathname || "";
    const parts = path.split("/").filter(Boolean);
    return (parts[parts.length - 1] || "").toLowerCase();
  }

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function readUsers() {
    return readJson(LS_USERS_KEY, []);
  }

  function writeUsers(users) {
    writeJson(LS_USERS_KEY, users);
  }

  function getSessionUserId() {
    const session = readJson(LS_SESSION_KEY, null);
    return session && session.userId ? session.userId : null;
  }

  function purchasesKey(userId) {
    return `gc_purchases_${userId}`;
  }

  function loadPurchases(userId) {
    const list = readJson(purchasesKey(userId), []);
    return Array.isArray(list) ? list : [];
  }

  function savePurchases(userId, list) {
    writeJson(purchasesKey(userId), list);
  }

  function hasPurchase(userId, key) {
    if (!userId || !key) return false;
    return loadPurchases(userId).includes(String(key));
  }

  function addPurchase(userId, key) {
    if (!userId || !key) return;
    const k = String(key);
    const next = loadPurchases(userId);
    if (!next.includes(k)) next.push(k);
    savePurchases(userId, next);
  }

  function slugify(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function isImageUrl(url) {
    const u = String(url || "").toLowerCase();
    return /\.(png|jpe?g|webp|gif)(\?.*)?$/.test(u);
  }

  function applyImgFallback(img) {
    if (!img) return;
    const fallback = img.getAttribute("data-fallback") || FALLBACK_PREVIEW;
    img.addEventListener(
      "error",
      () => {
        if (!img.src || img.src.endsWith(fallback)) return;
        img.src = fallback;
      },
      { once: true },
    );
  }

  function clearSession() {
    localStorage.removeItem(LS_SESSION_KEY);
  }

  function getCurrentUser() {
    const userId = getSessionUserId();
    if (!userId) return null;
    const users = readUsers();
    return users.find((u) => u.id === userId) || null;
  }

  function updateUser(patch) {
    const userId = getSessionUserId();
    if (!userId) return null;
    const users = readUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx < 0) return null;
    users[idx] = {
      ...users[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    writeUsers(users);
    return users[idx];
  }

  function requireAuth() {
    const page = getCurrentPageName();
    if (PUBLIC_PAGES.has(page)) return;
    if (!getSessionUserId()) {
      window.location.href = "auth.html?mode=login";
    }
  }

  function toast(message, typeOrIcon, color) {
    // Supports both call styles:
    // 1) toast('msg','success')
    // 2) toast('msg','check_circle','#006b5e')

    const existing = document.getElementById("gc-toast");
    if (existing) existing.remove();

    let icon = "info";
    let tint = "#3d57bb";

    if (color) {
      icon = String(typeOrIcon || "info");
      tint = String(color);
    } else {
      const type = String(typeOrIcon || "info");
      icon =
        type === "success"
          ? "check_circle"
          : type === "error"
            ? "error"
            : type === "warning"
              ? "warning"
              : "info";
      tint =
        type === "success"
          ? "#006b5e"
          : type === "error"
            ? "#ac3149"
            : type === "warning"
              ? "#ff9800"
              : "#3d57bb";
    }

    const node = document.createElement("div");
    node.id = "gc-toast";
    node.style.cssText =
      "position:fixed;bottom:2rem;left:50%;transform:translateX(-50%) translateY(1rem);" +
      "background:#fff;border:1px solid #e4e7ff;box-shadow:0 8px 30px rgba(39,48,87,0.15);" +
      "border-radius:9999px;padding:0.75rem 1.5rem;display:flex;align-items:center;gap:0.5rem;" +
      "font-weight:600;font-size:0.875rem;color:#273057;z-index:9999;opacity:0;" +
      "transition:opacity 0.3s,transform 0.3s;white-space:nowrap;";
    node.innerHTML = `<span class="material-symbols-outlined" style="color:${tint};font-size:1.2rem;">${icon}</span>${message}`;
    document.body.appendChild(node);
    requestAnimationFrame(() => {
      node.style.opacity = "1";
      node.style.transform = "translateX(-50%) translateY(0)";
    });
    setTimeout(() => {
      node.style.opacity = "0";
      node.style.transform = "translateX(-50%) translateY(1rem)";
      setTimeout(() => node.remove(), 400);
    }, 3000);
  }

  // Only define showToast if the page doesn't already provide one.
  if (!window.showToast) window.showToast = toast;

  function ensureLogoutModal() {
    if (document.getElementById("logoutModal")) return;

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
  }

  // Global functions used by HTML onclick
  window.confirmLogout = function confirmLogout(e) {
    if (e) e.preventDefault();
    const modal = document.getElementById("logoutModal");
    if (modal) modal.classList.add("open");
  };

  window.closeLogout = function closeLogout() {
    const modal = document.getElementById("logoutModal");
    if (modal) modal.classList.remove("open");
  };

  window.handleLogoutOverlayClick = function handleLogoutOverlayClick(e) {
    const modal = document.getElementById("logoutModal");
    if (modal && e && e.target === modal) window.closeLogout();
  };

  window.doLogout = function doLogout() {
    window.closeLogout();
    clearSession();
    window.location.href = "index.html";
  };

  function syncSoldUI(user) {
    if (!user) return;
    const sold = Number.isFinite(Number(user.sold)) ? Number(user.sold) : 0;
    const counters = document.querySelectorAll("#soldCount, #soldCountStat");
    counters.forEach((el) => {
      el.textContent = String(sold);
    });
  }

  window.openSoldModal = function openSoldModal() {
    const modal = document.getElementById("soldModal");
    if (!modal) return;
    const user = getCurrentUser();
    const input = document.getElementById("soldPrice");
    if (input && user) input.value = String(Number(user.sold) || 0);
    modal.classList.add("open");
  };

  window.closeSoldModal = function closeSoldModal() {
    const modal = document.getElementById("soldModal");
    if (modal) modal.classList.remove("open");
  };

  window.handleSoldOverlayClick = function handleSoldOverlayClick(e) {
    const modal = document.getElementById("soldModal");
    if (modal && e && e.target === modal) window.closeSoldModal();
  };

  window.logSale = function logSale() {
    const user = getCurrentUser();
    if (!user) {
      toast("Please log in again.", "error");
      window.location.href = "auth.html?mode=login";
      return;
    }
    const input = document.getElementById("soldPrice");
    const raw = input ? input.value : "";
    const next = Number(raw);
    if (!Number.isFinite(next) || next < 0) {
      toast("Please enter a valid sold value (0 or more).", "warning");
      return;
    }

    const updated = updateUser({ sold: Math.floor(next) });
    if (updated) syncSoldUI(updated);
    window.closeSoldModal();
    toast("Sold updated.", "check_circle", "#006b5e");
  };

  // Notifications (per-user)
  function notificationsKey(userId) {
    return `gc_notifications_${userId}`;
  }

  function defaultNotifications() {
    return [
      {
        id: "n1",
        title: "Welcome to Ghassra Core",
        message: "Tip: click any note to focus on it.",
        time: "Now",
        read: false,
        icon: "info",
      },
      {
        id: "n2",
        title: "Uploads",
        message: "Remember to add a title + description to your notes.",
        time: "Today",
        read: false,
        icon: "upload_file",
      },
    ];
  }

  function loadNotifications(userId) {
    const list = readJson(notificationsKey(userId), null);
    if (Array.isArray(list)) return list;
    const seeded = defaultNotifications();
    writeJson(notificationsKey(userId), seeded);
    return seeded;
  }

  function saveNotifications(userId, list) {
    writeJson(notificationsKey(userId), list);
  }

  function getUnreadCount(list) {
    return list.filter((n) => !n.read).length;
  }

  function getNotificationButton() {
    return document.querySelector('.icon-btn[aria-label="Notifications"]');
  }

  function updateNotificationBadge(list) {
    const btn = getNotificationButton();
    if (!btn) return;

    btn.querySelectorAll(".gc-notif-badge").forEach((b) => b.remove());
    const count = getUnreadCount(list);
    if (count <= 0) return;

    const badge = document.createElement("span");
    badge.className = "gc-notif-badge";
    badge.textContent = count > 9 ? "9+" : String(count);
    btn.style.position = "relative";
    btn.appendChild(badge);
  }

  function ensureNotificationPanel() {
    if (document.getElementById("gcNotificationPanel")) return;

    const panel = document.createElement("div");
    panel.id = "gcNotificationPanel";
    panel.className = "gc-notification-panel";
    panel.innerHTML = `
      <div class="gc-notif-header">
        <h3>Notifications</h3>
        <button class="gc-notif-close" type="button" aria-label="Close">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="gc-notif-list" role="list"></div>
      <div class="gc-notif-footer">
        <button class="gc-notif-markall" type="button">Mark all as read</button>
      </div>
    `;
    document.body.appendChild(panel);

    const overlay = document.createElement("div");
    overlay.id = "gcNotificationOverlay";
    overlay.className = "gc-notification-overlay";
    document.body.appendChild(overlay);
  }

  function renderNotifications(userId, list) {
    const container = document.querySelector(
      "#gcNotificationPanel .gc-notif-list",
    );
    if (!container) return;

    if (!list.length) {
      container.innerHTML = `<div class="gc-notif-empty">No notifications yet</div>`;
      return;
    }

    container.innerHTML = list
      .map(
        (n) => `
        <div class="gc-notif-item ${n.read ? "read" : "unread"}" data-id="${n.id}" role="listitem">
          <span class="material-symbols-outlined gc-notif-icon">${n.icon || "info"}</span>
          <div class="gc-notif-content">
            <div class="gc-notif-title">${n.title}</div>
            <div class="gc-notif-message">${n.message}</div>
            <div class="gc-notif-time">${n.time}</div>
            ${
              !n.read
                ? `<button class="gc-notif-markread" type="button" data-id="${n.id}">
                     <span class="material-symbols-outlined">done</span>
                     Mark as read
                   </button>`
                : `<div class="gc-notif-read">Read</div>`
            }
          </div>
        </div>
      `,
      )
      .join("");
  }

  function openNotificationPanel(userId, list) {
    const panel = document.getElementById("gcNotificationPanel");
    const overlay = document.getElementById("gcNotificationOverlay");
    if (!panel || !overlay) return;
    renderNotifications(userId, list);
    panel.classList.add("open");
    overlay.classList.add("open");
  }

  function closeNotificationPanel() {
    document.getElementById("gcNotificationPanel")?.classList.remove("open");
    document.getElementById("gcNotificationOverlay")?.classList.remove("open");
  }

  function initNotifications(user) {
    const btn = getNotificationButton();
    if (!btn || !user) return;

    ensureNotificationPanel();
    let list = loadNotifications(user.id);
    updateNotificationBadge(list);

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      list = loadNotifications(user.id);
      const panel = document.getElementById("gcNotificationPanel");
      if (panel?.classList.contains("open")) closeNotificationPanel();
      else openNotificationPanel(user.id, list);
    });

    document.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;

      if (
        target.closest("#gcNotificationOverlay") ||
        target.closest(".gc-notif-close")
      ) {
        closeNotificationPanel();
        return;
      }
      if (target.closest(".gc-notif-markall")) {
        list = loadNotifications(user.id).map((n) => ({ ...n, read: true }));
        saveNotifications(user.id, list);
        renderNotifications(user.id, list);
        updateNotificationBadge(list);
        return;
      }

      const markBtn = target.closest(".gc-notif-markread");
      if (markBtn) {
        const id = markBtn.getAttribute("data-id");
        list = loadNotifications(user.id).map((n) =>
          n.id === id ? { ...n, read: true } : n,
        );
        saveNotifications(user.id, list);
        renderNotifications(user.id, list);
        updateNotificationBadge(list);
      }
    });
  }

  // Note focus modal
  function ensureNoteFocusModal() {
    if (document.getElementById("gcNoteFocus")) return;
    const overlay = document.createElement("div");
    overlay.id = "gcNoteFocus";
    overlay.className = "modal-overlay gc-note-focus";
    overlay.onclick = (e) => {
      if (e.target === overlay) closeNoteFocus();
    };
    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" style="max-width:56rem;">
        <div class="modal-header">
          <div>
            <h2 class="gc-note-title" style="font-size:1.1rem;font-family:'Plus Jakarta Sans',sans-serif;">Note</h2>
            <p class="gc-note-sub" style="font-size:0.8rem;color:var(--on-surface-variant, #545d86);"></p>
          </div>
          <button class="modal-close" type="button" onclick="closeNoteFocus()" aria-label="Close">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="gc-note-body" style="padding:0 2rem 1.5rem;">
          <div class="gc-note-grid">
            <div class="gc-note-preview">
              <img class="gc-note-img" alt="Note preview" />
            </div>
            <div class="gc-note-details">
              <div class="gc-note-cta">
                <div class="gc-note-price" aria-label="Price"></div>
                <div class="gc-note-cta-actions">
                  <button class="gc-note-buy" type="button">Buy</button>
                  <a class="gc-note-download" href="#" target="_blank" rel="noopener">Download</a>
                </div>
              </div>
              <p class="gc-note-desc"></p>
              <div class="gc-note-info" aria-label="Details">
                <div class="gc-note-info-row"><span class="k">Download</span><a class="v gc-note-location" href="#" target="_blank" rel="noopener">—</a></div>
                <div class="gc-note-info-row"><span class="k">Date</span><span class="v gc-note-date"></span></div>
                <div class="gc-note-info-row"><span class="k">Filière</span><span class="v gc-note-filiere"></span></div>
                <div class="gc-note-info-row"><span class="k">Matière</span><span class="v gc-note-matiere"></span></div>
              </div>
              <div class="gc-note-meta"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  window.gcTogglePassword = function gcTogglePassword(inputId, buttonEl) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const makeVisible = input.type === "password";
    input.type = makeVisible ? "text" : "password";
    if (buttonEl) {
      const icon = buttonEl.querySelector(".material-symbols-outlined");
      if (icon)
        icon.textContent = makeVisible ? "visibility_off" : "visibility";
      buttonEl.setAttribute(
        "aria-label",
        makeVisible ? "Hide password" : "Show password",
      );
    }
  };

  window.closeNoteFocus = function closeNoteFocus() {
    document.getElementById("gcNoteFocus")?.classList.remove("open");
    document.body.classList.remove("gc-modal-open");
  };

  function openNoteFocus(data) {
    ensureNoteFocusModal();
    const overlay = document.getElementById("gcNoteFocus");
    if (!overlay) return;

    const userId = getSessionUserId();
    const purchaseKey = String(data.purchaseKey || "").trim();
    const owned = String(data.owned || "") === "true" || data.owned === true;

    const titleEl = overlay.querySelector(".gc-note-title");
    const subEl = overlay.querySelector(".gc-note-sub");
    const imgEl = overlay.querySelector(".gc-note-img");
    const descEl = overlay.querySelector(".gc-note-desc");
    const metaEl = overlay.querySelector(".gc-note-meta");
    const priceEl = overlay.querySelector(".gc-note-price");
    const downloadEl = overlay.querySelector(".gc-note-download");
    const buyBtn = overlay.querySelector(".gc-note-buy");
    const locationEl = overlay.querySelector(".gc-note-location");
    const dateEl = overlay.querySelector(".gc-note-date");
    const filiereEl = overlay.querySelector(".gc-note-filiere");
    const matiereEl = overlay.querySelector(".gc-note-matiere");

    if (titleEl) titleEl.textContent = data.title || "Note";
    if (subEl)
      subEl.textContent = data.uploader ? `Uploaded by ${data.uploader}` : "";
    const previewUrl =
      String(data.image || "").trim() ||
      (isImageUrl(data.downloadUrl)
        ? String(data.downloadUrl || "").trim()
        : "") ||
      FALLBACK_PREVIEW;
    if (imgEl) {
      imgEl.src = previewUrl;
      imgEl.style.display = "block";
      imgEl.setAttribute("data-fallback", FALLBACK_PREVIEW);
      applyImgFallback(imgEl);
    }
    if (descEl) descEl.textContent = data.description || "";

    const rawPrice = Number(data.price);
    const isFree = !Number.isFinite(rawPrice) || rawPrice <= 0;
    if (priceEl)
      priceEl.textContent = isFree ? "Free" : `${Math.round(rawPrice)} TND`;

    const purchased =
      owned || (userId && purchaseKey && hasPurchase(userId, purchaseKey));

    const link = String(data.downloadUrl || "").trim();
    const usable = link && link !== "#";
    const requiresPurchase = !isFree && !purchased;
    const enabled = usable && !requiresPurchase;
    const applyDownloadLink = (el) => {
      if (!el) return;
      el.classList.toggle("disabled", !enabled);
      el.setAttribute("aria-disabled", String(!enabled));
      el.href = enabled ? link : "#";
      el.onclick = (e) => {
        if (!enabled) {
          e.preventDefault();
          if (requiresPurchase) {
            toast("Please buy this note to download.", "warning");
          } else {
            toast("Download is not available in this demo yet.", "info");
          }
        }
      };
    };
    applyDownloadLink(downloadEl);
    applyDownloadLink(locationEl);
    if (locationEl) locationEl.textContent = usable ? link : "—";

    if (buyBtn) {
      const shouldShowBuy = !isFree && !purchased;
      buyBtn.style.display = shouldShowBuy ? "inline-flex" : "none";
      buyBtn.disabled = !shouldShowBuy;
      buyBtn.onclick = () => {
        if (isFree) {
          toast("This note is free.", "info");
          return;
        }
        if (!userId) {
          toast("Please log in again.", "error");
          window.location.href = "auth.html?mode=login";
          return;
        }
        if (!purchaseKey) {
          toast("Could not identify this note to purchase.", "error");
          return;
        }
        addPurchase(userId, purchaseKey);
        toast("Purchase completed. Download unlocked.", "success");
        // Refresh the modal actions in-place
        openNoteFocus({ ...data, owned: true });
      };
    }

    if (dateEl) dateEl.textContent = data.date || "—";
    if (filiereEl) filiereEl.textContent = data.filiere || "—";
    if (matiereEl) matiereEl.textContent = data.matiere || "—";

    if (metaEl) {
      const parts = [];
      if (data.type)
        parts.push(`<span class="gc-note-pill">${data.type}</span>`);
      if (data.category)
        parts.push(`<span class="gc-note-pill">${data.category}</span>`);
      if (data.badge)
        parts.push(`<span class="gc-note-pill">${data.badge}</span>`);
      metaEl.innerHTML = parts.join("");
    }

    overlay.classList.add("open");
    document.body.classList.add("gc-modal-open");
  }

  function extractResourceCardData(card) {
    const title = card.querySelector(".card-title")?.textContent?.trim() || "";
    const uploader =
      card.querySelector(".author-name")?.textContent?.trim() || "";
    const type = card.querySelector(".file-type")?.textContent?.trim() || "";
    const badge = card.querySelector(".card-badge")?.textContent?.trim() || "";
    const image =
      card.querySelector(".card-img-wrap img")?.getAttribute("src") || "";
    const category = card.getAttribute("data-category") || "";
    const description =
      card.getAttribute("data-description") ||
      card.querySelector(".card-desc")?.textContent?.trim() ||
      "";
    const downloadUrl = card.getAttribute("data-download") || "";
    const price = card.getAttribute("data-price") || "";
    const date = card.getAttribute("data-date") || "";
    const filiere = card.getAttribute("data-filiere") || "";
    const matiere = card.getAttribute("data-matiere") || "";
    const id = card.getAttribute("data-id") || "";
    const purchaseKey =
      card.getAttribute("data-purchase-key") || (id ? `res:${id}` : "");
    return {
      title,
      uploader,
      type,
      badge,
      image,
      category,
      description,
      downloadUrl,
      price,
      date,
      filiere,
      matiere,
      purchaseKey,
      owned: false,
    };
  }

  function extractNoteCardData(card, user) {
    const title =
      card.querySelector("h3")?.textContent?.trim() ||
      card.querySelector(".note-body h3")?.textContent?.trim() ||
      "";
    const description =
      card.querySelector("p")?.textContent?.trim() ||
      card.querySelector(".note-body p")?.textContent?.trim() ||
      "";

    const type =
      card.getAttribute("data-type") ||
      card.querySelector(".meta-tag")?.textContent?.trim() ||
      "";

    const category =
      card.getAttribute("data-category") ||
      card.querySelector(".note-tag")?.textContent?.trim() ||
      "";
    const downloadUrl = card.getAttribute("data-download") || "";
    const priceAttr = card.getAttribute("data-price") || "";
    const priceFromUi =
      card.querySelector(".note-price")?.textContent?.trim() || "";
    const price = priceAttr || priceFromUi.replace(/[^0-9.]/g, "");
    const date = card.getAttribute("data-date") || "";
    const filiere = card.getAttribute("data-filiere") || user?.major || "";
    const matiere = card.getAttribute("data-matiere") || "";
    const uploader =
      card.getAttribute("data-uploader") || (user ? user.name || "You" : "");
    const image =
      card.querySelector(".note-thumb img")?.getAttribute("src") ||
      card.querySelector(".gc-note-thumb img")?.getAttribute("src") ||
      "";

    const id = card.getAttribute("data-id") || "";
    const purchaseKey =
      card.getAttribute("data-purchase-key") ||
      (id ? `note:${id}` : `note:${slugify(title)}`);
    const owned = card.getAttribute("data-owned") === "true";
    return {
      title,
      uploader,
      type,
      category,
      description,
      image,
      badge: "",
      downloadUrl,
      price,
      date,
      filiere,
      matiere,
      purchaseKey,
      owned,
    };
  }

  function setButtonOwned(btn) {
    if (!btn) return;
    btn.disabled = true;
    btn.classList.add("gc-owned");
    btn.setAttribute("aria-disabled", "true");
    const icon = btn.querySelector(".material-symbols-outlined");
    if (icon) icon.textContent = "check_circle";
    const label = btn.querySelector(".gc-btn-label");
    if (label) label.textContent = "Owned";
  }

  function setButtonDisabled(btn, disabled) {
    if (!btn) return;
    btn.disabled = !!disabled;
    btn.classList.toggle("disabled", !!disabled);
    btn.setAttribute("aria-disabled", String(!!disabled));
  }

  function syncCardPurchaseState(card, data, userId) {
    if (!card || !data) return;
    const price = Number(data.price);
    const isFree = !Number.isFinite(price) || price <= 0;
    const usable =
      String(data.downloadUrl || "").trim() && data.downloadUrl !== "#";
    const purchased =
      data.owned === true ||
      String(data.owned || "") === "true" ||
      (userId && data.purchaseKey && hasPurchase(userId, data.purchaseKey));

    const downloadBtn = card.querySelector(".gc-download-btn");
    const buyBtn = card.querySelector(".gc-buy-btn");

    // Download is allowed if free/owned/purchased and we have a usable link
    setButtonDisabled(downloadBtn, !usable || (!isFree && !purchased));

    // Buy button only matters for paid items
    if (buyBtn) {
      if (isFree) {
        buyBtn.style.display = "none";
      } else if (purchased) {
        setButtonOwned(buyBtn);
      } else {
        buyBtn.style.display = "inline-flex";
        setButtonDisabled(buyBtn, false);
      }
    }
  }

  window.gcSyncPurchases = function gcSyncPurchases() {
    const userId = getSessionUserId();
    const user = getCurrentUser();
    document.querySelectorAll(".resource-card").forEach((card) => {
      syncCardPurchaseState(card, extractResourceCardData(card), userId);
    });
    document.querySelectorAll(".note-card").forEach((card) => {
      syncCardPurchaseState(card, extractNoteCardData(card, user), userId);
    });
  };

  function handleBuyFromCard(card, data) {
    const userId = getSessionUserId();
    const price = Number(data.price);
    const isFree = !Number.isFinite(price) || price <= 0;
    if (isFree) {
      toast("This note is free.", "info");
      return;
    }
    if (!userId) {
      toast("Please log in again.", "error");
      window.location.href = "auth.html?mode=login";
      return;
    }
    if (!data.purchaseKey) {
      toast("Could not identify this note to purchase.", "error");
      return;
    }
    if (hasPurchase(userId, data.purchaseKey)) {
      toast("Already owned.", "info");
    } else {
      addPurchase(userId, data.purchaseKey);
      toast("Purchase completed.", "success");
    }
    syncCardPurchaseState(card, { ...data, owned: true }, userId);
  }

  function handleDownloadFromCard(card, data) {
    const userId = getSessionUserId();
    const link = String(data.downloadUrl || "").trim();
    const usable = link && link !== "#";
    const price = Number(data.price);
    const isFree = !Number.isFinite(price) || price <= 0;
    const purchased =
      data.owned === true ||
      (userId && data.purchaseKey && hasPurchase(userId, data.purchaseKey));

    if (!usable) {
      toast("Download is not available in this demo yet.", "info");
      return;
    }
    if (!isFree && !purchased) {
      toast("Please buy this note first.", "warning");
      return;
    }
    window.open(link, "_blank", "noopener");
    toast("Download started.", "success");
  }

  function initNoteFocus(user) {
    ensureNoteFocusModal();

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") window.closeNoteFocus();
    });

    document.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;

      const buyClick = target.closest(".gc-buy-btn");
      if (buyClick) {
        const card = buyClick.closest(".resource-card, .note-card");
        if (!card) return;
        if (card.classList.contains("resource-card")) {
          handleBuyFromCard(card, extractResourceCardData(card));
        } else {
          handleBuyFromCard(card, extractNoteCardData(card, user));
        }
        return;
      }

      const dlClick = target.closest(".gc-download-btn");
      if (dlClick) {
        const card = dlClick.closest(".resource-card, .note-card");
        if (!card) return;
        if (card.classList.contains("resource-card")) {
          handleDownloadFromCard(card, extractResourceCardData(card));
        } else {
          handleDownloadFromCard(card, extractNoteCardData(card, user));
        }
        return;
      }

      // Resource cards (main.html)
      const resourceCard = target.closest(".resource-card");
      if (resourceCard) {
        if (target.closest(".action-btn")) return; // keep download/view logic unchanged
        openNoteFocus(extractResourceCardData(resourceCard));
        return;
      }

      // Note cards (notes.html/profile.html)
      const noteCard = target.closest(".note-card");
      if (noteCard) {
        const button = target.closest("button");
        if (button) {
          const isNotesOpen = button.classList.contains("view-btn");
          const isProfilePreview =
            button.classList.contains("action-btn") &&
            button.getAttribute("aria-label") === "Preview";
          if (!isNotesOpen && !isProfilePreview) return;
        }
        openNoteFocus(extractNoteCardData(noteCard, user));
      }
    });
  }

  function hydrateUserUI(user) {
    if (!user) return;

    // Sold count
    syncSoldUI(user);

    // Avatar
    if (user.avatarDataUrl) {
      document
        .querySelectorAll(
          ".avatar-sm img, .avatar-ring img, .hero-avatar img, .sidenav-profile img, .avatar-md img",
        )
        .forEach((img) => {
          img.src = user.avatarDataUrl;
        });
    }
  }

  function normalizeSoldModalText() {
    const modal = document.getElementById("soldModal");
    if (!modal) return;
    const title = modal.querySelector(".modal-header h2");
    const subtitle = modal.querySelector(".modal-header p");
    const label = modal.querySelector(".form-label");
    const submit = modal.querySelector(".btn-submit");

    if (title) title.textContent = "Set Sold";
    if (subtitle) subtitle.textContent = "Update your sold value anytime.";
    if (label) label.textContent = "Sold";
    if (submit) submit.textContent = "Save";
  }

  document.addEventListener("DOMContentLoaded", () => {
    requireAuth();

    const user = getCurrentUser();
    hydrateUserUI(user);
    ensureLogoutModal();
    normalizeSoldModalText();
    initNotifications(user);
    initNoteFocus(user);

    // Ensure thumbnails never stay blank
    document
      .querySelectorAll("img.gc-thumb-img, img.gc-note-img")
      .forEach(applyImgFallback);

    // Sync download/buy buttons state (and keep it available for dynamic renders)
    window.gcSyncPurchases?.();
  });
})();
