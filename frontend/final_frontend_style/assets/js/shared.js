/**
 * GhassraCore — shared.js  (API-integrated version)
 * Runs on every protected page.
 * - Auth guard uses JWT token presence.
 * - User profile loaded from ProfileAPI.get().
 * - Purchase state loaded from PurchasesAPI.ownedIds().
 * - All localStorage user/purchase storage removed.
 * - Notifications, toast, logout modal, note-focus modal: unchanged UI.
 */

(function () {
  const FALLBACK_PREVIEW = "../assets/images/document.jpg";
  const PUBLIC_PAGES     = new Set(["index.html", "auth.html"]);

  /* ── Utility ── */
  function getCurrentPageName() {
    const parts = (window.location.pathname || "").split("/").filter(Boolean);
    return (parts[parts.length - 1] || "").toLowerCase();
  }

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  }
  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function isImageUrl(url) {
    return /\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(String(url || ""));
  }

  function applyImgFallback(img) {
    if (!img) return;
    const fallback = img.getAttribute("data-fallback") || FALLBACK_PREVIEW;
    img.addEventListener("error", () => {
      if (!img.src || img.src.endsWith(fallback)) return;
      img.src = fallback;
    }, { once: true });
  }

  function slugify(value) {
    return String(value || "").trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  /* ── Session (token-based) ── */
  function isLoggedIn() {
    return !!window.GC.getToken();
  }

  function requireAuth() {
    const page = getCurrentPageName();
    if (PUBLIC_PAGES.has(page)) return;
    if (!isLoggedIn()) {
      window.location.href = "auth.html?mode=login";
    }
  }

  /* ── Runtime user cache (loaded once per page) ── */
  let _currentUser    = null;
  let _ownedDocIds    = new Set(); // Set<string> of document_id values

  /**
   * Load profile + purchase data from the API.
   * Called once on DOMContentLoaded.
   */
  async function loadSessionData() {
    try {
      const profileRes = await window.GC.ProfileAPI.get();
      if (profileRes?.success) _currentUser = profileRes.data ?? null;
    } catch (e) {
      console.warn("[GC] Could not load profile:", e.message);
    }

    try {
      _ownedDocIds = await window.GC.PurchasesAPI.ownedIds();
    } catch (e) {
      console.warn("[GC] Could not load purchase history:", e.message);
    }
  }

  function getCurrentUser()  { return _currentUser; }
  function hasPurchase(docId) { return _ownedDocIds.has(String(docId)); }

  /* ── Logout ── */
  function clearSession() {
    window.GC.clearToken();
  }

  window.doLogout = async function doLogout() {
    window.closeLogout();
    try { await window.GC.AuthAPI.logout(); } catch (_) {}
    clearSession();
    window.location.href = "index.html";
  };

  /* ── Toast ── */
  function toast(message, typeOrIcon, color) {
    const existing = document.getElementById("gc-toast");
    if (existing) existing.remove();

    let icon = "info";
    let tint = "#3d57bb";

    if (color) {
      icon = String(typeOrIcon || "info");
      tint = String(color);
    } else {
      const type = String(typeOrIcon || "info");
      icon  = type === "success" ? "check_circle" : type === "error" ? "error" : type === "warning" ? "warning" : "info";
      tint  = type === "success" ? "#006b5e"      : type === "error" ? "#ac3149" : type === "warning" ? "#ff9800" : "#3d57bb";
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

  if (!window.showToast) window.showToast = toast;

  /* ── Logout modal ── */
  function ensureLogoutModal() {
    if (document.getElementById("logoutModal")) return;
    const modal = document.createElement("div");
    modal.id = "logoutModal";
    modal.className = "modal-overlay";
    modal.onclick = (e) => { if (e.target === modal) closeLogout(); };
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
      </div>`;
    document.body.appendChild(modal);
  }

  window.confirmLogout = function confirmLogout(e) {
    if (e) e.preventDefault();
    document.getElementById("logoutModal")?.classList.add("open");
  };
  window.closeLogout = function closeLogout() {
    document.getElementById("logoutModal")?.classList.remove("open");
  };
  window.handleLogoutOverlayClick = function (e) {
    const modal = document.getElementById("logoutModal");
    if (modal && e?.target === modal) window.closeLogout();
  };

  /* ── Sold counter (API-backed: profile.sold field) ── */
  function syncSoldUI(user) {
    if (!user) return;
    const sold = Number.isFinite(Number(user.sold)) ? Number(user.sold) : 0;
    document.querySelectorAll("#soldCount, #soldCountStat")
      .forEach((el) => { el.textContent = String(sold); });
  }

  /* ── Notifications (localStorage-backed, per-user) ── */
  function notificationsKey(userId) { return `gc_notifications_${userId}`; }
  function defaultNotifications() {
    return [
      { id: "n1", title: "Welcome to Ghassra Core", message: "Tip: click any note to focus on it.", time: "Now",   read: false, icon: "info" },
      { id: "n2", title: "Uploads",                 message: "Remember to add a title + description to your notes.", time: "Today", read: false, icon: "upload_file" },
    ];
  }
  function loadNotifications(userId) {
    const list = readJson(notificationsKey(userId), null);
    if (Array.isArray(list)) return list;
    const seeded = defaultNotifications();
    writeJson(notificationsKey(userId), seeded);
    return seeded;
  }
  function saveNotifications(userId, list) { writeJson(notificationsKey(userId), list); }
  function getUnreadCount(list) { return list.filter((n) => !n.read).length; }
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
      </div>`;
    document.body.appendChild(panel);
    const overlay = document.createElement("div");
    overlay.id = "gcNotificationOverlay";
    overlay.className = "gc-notification-overlay";
    document.body.appendChild(overlay);
  }
  function renderNotifications(userId, list) {
    const container = document.querySelector("#gcNotificationPanel .gc-notif-list");
    if (!container) return;
    if (!list.length) {
      container.innerHTML = `<div class="gc-notif-empty">No notifications yet</div>`;
      return;
    }
    container.innerHTML = list.map((n) => `
      <div class="gc-notif-item ${n.read ? "read" : "unread"}" data-id="${n.id}" role="listitem">
        <span class="material-symbols-outlined gc-notif-icon">${n.icon || "info"}</span>
        <div class="gc-notif-content">
          <div class="gc-notif-title">${n.title}</div>
          <div class="gc-notif-message">${n.message}</div>
          <div class="gc-notif-time">${n.time}</div>
          ${!n.read
            ? `<button class="gc-notif-markread" type="button" data-id="${n.id}"><span class="material-symbols-outlined">done</span>Mark as read</button>`
            : `<div class="gc-notif-read">Read</div>`}
        </div>
      </div>`).join("");
  }
  function openNotificationPanel(userId, list) {
    const panel   = document.getElementById("gcNotificationPanel");
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
      e.preventDefault(); e.stopPropagation();
      list = loadNotifications(user.id);
      const panel = document.getElementById("gcNotificationPanel");
      if (panel?.classList.contains("open")) closeNotificationPanel();
      else openNotificationPanel(user.id, list);
    });
    document.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (target.closest("#gcNotificationOverlay") || target.closest(".gc-notif-close")) {
        closeNotificationPanel(); return;
      }
      if (target.closest(".gc-notif-markall")) {
        list = loadNotifications(user.id).map((n) => ({ ...n, read: true }));
        saveNotifications(user.id, list);
        renderNotifications(user.id, list);
        updateNotificationBadge(list); return;
      }
      const markBtn = target.closest(".gc-notif-markread");
      if (markBtn) {
        const id = markBtn.getAttribute("data-id");
        list = loadNotifications(user.id).map((n) => n.id === id ? { ...n, read: true } : n);
        saveNotifications(user.id, list);
        renderNotifications(user.id, list);
        updateNotificationBadge(list);
      }
    });
  }

  /* ── Purchase state sync (card buttons) ── */
  function extractResourceCardData(card) {
    return {
      id:          card.getAttribute("data-id")           || "",
      purchaseKey: card.getAttribute("data-id")           || "",
      downloadUrl: card.getAttribute("data-download")     || "",
      price:       card.getAttribute("data-price")        || "",
      title:       card.querySelector(".card-title")?.textContent?.trim() || "",
      owned:       false,
    };
  }
  function extractNoteCardData(card, user) {
    const id  = card.getAttribute("data-id") || "";
    const title = card.querySelector("h3")?.textContent?.trim() || "";
    return {
      id,
      purchaseKey: id || slugify(title),
      downloadUrl: card.getAttribute("data-download") || "",
      price:       card.getAttribute("data-price")    || "",
      title,
      owned: card.getAttribute("data-owned") === "true",
    };
  }

  function setButtonOwned(btn) {
    if (!btn) return;
    btn.disabled = true;
    btn.classList.add("gc-owned");
    btn.setAttribute("aria-disabled", "true");
    const icon  = btn.querySelector(".material-symbols-outlined");
    const label = btn.querySelector(".gc-btn-label");
    if (icon)  icon.textContent  = "check_circle";
    if (label) label.textContent = "Owned";
  }
  function setButtonDisabled(btn, disabled) {
    if (!btn) return;
    btn.disabled = !!disabled;
    btn.classList.toggle("disabled", !!disabled);
    btn.setAttribute("aria-disabled", String(!!disabled));
  }

  function syncCardPurchaseState(card, data) {
    if (!card || !data) return;
    const price    = Number(data.price);
    const isFree   = !Number.isFinite(price) || price <= 0;
    const usable   = String(data.downloadUrl || "").trim() && data.downloadUrl !== "#";
    const purchased = data.owned === true ||
                      String(data.owned || "") === "true" ||
                      hasPurchase(data.id || data.purchaseKey);

    const downloadBtn = card.querySelector(".gc-download-btn");
    const buyBtn      = card.querySelector(".gc-buy-btn");

    setButtonDisabled(downloadBtn, !usable || (!isFree && !purchased));

    if (buyBtn) {
      if (isFree)       { buyBtn.style.display = "none"; }
      else if (purchased) { setButtonOwned(buyBtn); }
      else              { buyBtn.style.display = "inline-flex"; setButtonDisabled(buyBtn, false); }
    }
  }

  window.gcSyncPurchases = function gcSyncPurchases() {
    const user = _currentUser;
    document.querySelectorAll(".resource-card")
      .forEach((card) => syncCardPurchaseState(card, extractResourceCardData(card)));
    document.querySelectorAll(".note-card")
      .forEach((card) => syncCardPurchaseState(card, extractNoteCardData(card, user)));
  };

  /* ── Buy / Download card handlers (API-backed) ── */
  async function handleBuyFromCard(card, data) {
    const price  = Number(data.price);
    const isFree = !Number.isFinite(price) || price <= 0;
    if (isFree) { toast("This note is free.", "info"); return; }

    if (!isLoggedIn()) {
      toast("Please log in again.", "error");
      window.location.href = "auth.html?mode=login";
      return;
    }

    try {
      toast("Initiating payment…", "info");
      const res = await window.GC.PaymentsAPI.initiate({
        document_id: data.id || data.purchaseKey,
      });
      if (res?.payment_url) {
        // Store reference so the return page can call verify()
        sessionStorage.setItem("gc_payment_ref",    res.payment_ref);
        sessionStorage.setItem("gc_payment_doc_id", String(data.id || ""));
        window.location.href = res.payment_url;
      } else {
        toast(res?.message || "Payment could not be initiated.", "error");
      }
    } catch (err) {
      toast(err.message || "Payment error. Please try again.", "error");
    }
  }

  async function handleDownloadFromCard(card, data) {
    const link   = String(data.downloadUrl || "").trim();
    const usable = link && link !== "#";
    const price  = Number(data.price);
    const isFree = !Number.isFinite(price) || price <= 0;
    const purchased = hasPurchase(data.id || data.purchaseKey);

    if (!usable) {
      // Request a server-authorized download URL
      try {
        const res = await window.GC.DocumentsAPI.download(data.id);
        if (res?.download_url) {
          window.open(res.download_url, "_blank", "noopener");
          toast("Download started.", "success");
        } else {
          toast("Download is not available yet.", "info");
        }
      } catch (err) {
        toast(err.message || "Download failed.", "error");
      }
      return;
    }

    if (!isFree && !purchased) {
      toast("Please buy this note first.", "warning");
      return;
    }

    window.open(link, "_blank", "noopener");
    toast("Download started.", "success");
  }

  /* ── Note focus modal (UI unchanged) ── */
  function ensureNoteFocusModal() {
    if (document.getElementById("gcNoteFocus")) return;
    const overlay = document.createElement("div");
    overlay.id = "gcNoteFocus";
    overlay.className = "modal-overlay gc-note-focus";
    overlay.onclick = (e) => { if (e.target === overlay) closeNoteFocus(); };
    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" style="max-width:56rem;">
        <div class="modal-header">
          <div>
            <h2 class="gc-note-title" style="font-size:1.1rem;font-family:'Plus Jakarta Sans',sans-serif;">Note</h2>
            <p class="gc-note-sub" style="font-size:0.8rem;color:var(--on-surface-variant,#545d86);"></p>
          </div>
          <button class="modal-close" type="button" onclick="closeNoteFocus()" aria-label="Close">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="gc-note-body" style="padding:0 2rem 1.5rem;">
          <div class="gc-note-grid">
            <div class="gc-note-preview"><img class="gc-note-img" alt="Note preview"/></div>
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
      </div>`;
    document.body.appendChild(overlay);
  }

  window.gcTogglePassword = function gcTogglePassword(inputId, buttonEl) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const makeVisible = input.type === "password";
    input.type = makeVisible ? "text" : "password";
    if (buttonEl) {
      const icon = buttonEl.querySelector(".material-symbols-outlined");
      if (icon) icon.textContent = makeVisible ? "visibility_off" : "visibility";
      buttonEl.setAttribute("aria-label", makeVisible ? "Hide password" : "Show password");
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

    const docId    = data.id || data.purchaseKey || "";
    const purchased = hasPurchase(docId);
    const rawPrice = Number(data.price);
    const isFree   = !Number.isFinite(rawPrice) || rawPrice <= 0;

    overlay.querySelector(".gc-note-title").textContent = data.title || "Note";
    overlay.querySelector(".gc-note-sub").textContent   = data.uploader ? `Uploaded by ${data.uploader}` : "";

    const imgEl = overlay.querySelector(".gc-note-img");
    const previewUrl = String(data.image || "").trim() ||
      (isImageUrl(data.downloadUrl) ? String(data.downloadUrl || "").trim() : "") ||
      FALLBACK_PREVIEW;
    imgEl.src = previewUrl;
    imgEl.setAttribute("data-fallback", FALLBACK_PREVIEW);
    applyImgFallback(imgEl);

    overlay.querySelector(".gc-note-desc").textContent     = data.description || "";
    overlay.querySelector(".gc-note-price").textContent    = isFree ? "Free" : `${Math.round(rawPrice)} TND`;
    overlay.querySelector(".gc-note-date").textContent     = data.date     || "—";
    overlay.querySelector(".gc-note-filiere").textContent  = data.filiere  || "—";
    overlay.querySelector(".gc-note-matiere").textContent  = data.matiere  || "—";

    const link = String(data.downloadUrl || "").trim();
    const locationEl = overlay.querySelector(".gc-note-location");
    if (locationEl) locationEl.textContent = link && link !== "#" ? link : "—";

    const downloadEl = overlay.querySelector(".gc-note-download");
    const buyBtn     = overlay.querySelector(".gc-note-buy");
    const requiresPurchase = !isFree && !purchased;
    const usable           = link && link !== "#";
    const enabled          = usable && !requiresPurchase;

    [downloadEl, locationEl].forEach((el) => {
      if (!el) return;
      el.classList.toggle("disabled", !enabled);
      el.setAttribute("aria-disabled", String(!enabled));
      el.href = enabled ? link : "#";
      el.onclick = (e) => {
        if (!enabled) {
          e.preventDefault();
          toast(requiresPurchase ? "Please buy this note to download." : "Download unavailable.", requiresPurchase ? "warning" : "info");
        }
      };
    });

    if (buyBtn) {
      buyBtn.style.display = (!isFree && !purchased) ? "inline-flex" : "none";
      buyBtn.onclick = () => handleBuyFromCard(null, data);
    }

    const metaEl = overlay.querySelector(".gc-note-meta");
    if (metaEl) {
      const parts = [];
      if (data.type)     parts.push(`<span class="gc-note-pill">${data.type}</span>`);
      if (data.category) parts.push(`<span class="gc-note-pill">${data.category}</span>`);
      if (data.badge)    parts.push(`<span class="gc-note-pill">${data.badge}</span>`);
      metaEl.innerHTML = parts.join("");
    }

    overlay.classList.add("open");
    document.body.classList.add("gc-modal-open");
  }

  /* ── Card data extraction (unchanged from original) ── */
  function extractResourceCardDataFull(card) {
    return {
      id:          card.getAttribute("data-id")           || "",
      purchaseKey: card.getAttribute("data-id")           || "",
      title:       card.querySelector(".card-title")?.textContent?.trim() || "",
      uploader:    card.querySelector(".author-name")?.textContent?.trim() || "",
      type:        card.querySelector(".file-type")?.textContent?.trim() || "",
      badge:       card.querySelector(".card-badge")?.textContent?.trim() || "",
      image:       card.querySelector(".card-img-wrap img")?.getAttribute("src") || "",
      category:    card.getAttribute("data-category")    || "",
      description: card.getAttribute("data-description") || card.querySelector(".card-desc")?.textContent?.trim() || "",
      downloadUrl: card.getAttribute("data-download")    || "",
      price:       card.getAttribute("data-price")       || "",
      date:        card.getAttribute("data-date")        || "",
      filiere:     card.getAttribute("data-filiere")     || "",
      matiere:     card.getAttribute("data-matiere")     || "",
      owned:       false,
    };
  }
  function extractNoteCardDataFull(card, user) {
    const id    = card.getAttribute("data-id") || "";
    const title = card.querySelector("h3")?.textContent?.trim() || card.querySelector(".note-body h3")?.textContent?.trim() || "";
    return {
      id,
      purchaseKey: id || slugify(title),
      title,
      uploader:    card.getAttribute("data-uploader") || user?.name || "You",
      type:        card.getAttribute("data-type") || card.querySelector(".meta-tag")?.textContent?.trim() || "",
      category:    card.getAttribute("data-category") || card.querySelector(".note-tag")?.textContent?.trim() || "",
      description: card.querySelector("p")?.textContent?.trim() || card.querySelector(".note-body p")?.textContent?.trim() || "",
      image:       card.querySelector(".note-thumb img")?.getAttribute("src") || card.querySelector(".gc-note-thumb img")?.getAttribute("src") || "",
      badge:       "",
      downloadUrl: card.getAttribute("data-download") || "",
      price:       card.getAttribute("data-price") || card.querySelector(".note-price")?.textContent?.trim().replace(/[^0-9.]/g, "") || "",
      date:        card.getAttribute("data-date") || "",
      filiere:     card.getAttribute("data-filiere") || user?.major || "",
      matiere:     card.getAttribute("data-matiere") || "",
      owned:       card.getAttribute("data-owned") === "true",
    };
  }

  function initNoteFocus(user) {
    ensureNoteFocusModal();
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") window.closeNoteFocus(); });
    document.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;

      const buyClick = target.closest(".gc-buy-btn");
      if (buyClick) {
        const card = buyClick.closest(".resource-card, .note-card");
        if (!card) return;
        const data = card.classList.contains("resource-card")
          ? extractResourceCardDataFull(card)
          : extractNoteCardDataFull(card, user);
        handleBuyFromCard(card, data);
        return;
      }

      const dlClick = target.closest(".gc-download-btn");
      if (dlClick) {
        const card = dlClick.closest(".resource-card, .note-card");
        if (!card) return;
        const data = card.classList.contains("resource-card")
          ? extractResourceCardDataFull(card)
          : extractNoteCardDataFull(card, user);
        handleDownloadFromCard(card, data);
        return;
      }

      const resourceCard = target.closest(".resource-card");
      if (resourceCard) {
        if (target.closest(".action-btn")) return;
        openNoteFocus(extractResourceCardDataFull(resourceCard));
        return;
      }

      const noteCard = target.closest(".note-card");
      if (noteCard) {
        const button = target.closest("button");
        if (button) {
          const isOpen    = button.classList.contains("view-btn");
          const isPreview = button.classList.contains("action-btn") && button.getAttribute("aria-label") === "Preview";
          if (!isOpen && !isPreview) return;
        }
        openNoteFocus(extractNoteCardDataFull(noteCard, user));
      }
    });
  }

  /* ── Hydrate UI from loaded profile ── */
  function hydrateUserUI(user) {
    if (!user) return;
    syncSoldUI(user);

    // Avatar — prefer the API-hosted URL (avatar_url), fall back to nothing
    const avatarUrl = user.avatar_url || user.avatarDataUrl;
    if (avatarUrl) {
      document.querySelectorAll(
        ".avatar-sm img, .avatar-ring img, .hero-avatar img, .sidenav-profile img, .avatar-md img"
      ).forEach((img) => { img.src = avatarUrl; });
    }
  }

  /* ── Sold modal (updates profile on backend) ── */
  window.openSoldModal = function openSoldModal() {
    const modal = document.getElementById("soldModal");
    if (!modal) return;
    const user  = _currentUser;
    const input = document.getElementById("soldPrice");
    if (input && user) input.value = String(Number(user.sold) || 0);
    modal.classList.add("open");
  };
  window.closeSoldModal = function closeSoldModal() {
    document.getElementById("soldModal")?.classList.remove("open");
  };
  window.handleSoldOverlayClick = function (e) {
    const modal = document.getElementById("soldModal");
    if (modal && e?.target === modal) window.closeSoldModal();
  };
  window.logSale = async function logSale() {
    const input = document.getElementById("soldPrice");
    const next  = Number(input ? input.value : "");
    if (!Number.isFinite(next) || next < 0) {
      toast("Please enter a valid sold value (0 or more).", "warning");
      return;
    }
    try {
      await window.GC.ProfileAPI.update({ sold: Math.floor(next) });
      if (_currentUser) { _currentUser.sold = Math.floor(next); syncSoldUI(_currentUser); }
      window.closeSoldModal();
      toast("Sold updated.", "check_circle", "#006b5e");
    } catch (err) {
      toast(err.message || "Could not update sold value.", "error");
    }
  };

  /* ── Boot ── */
  document.addEventListener("DOMContentLoaded", async () => {
    requireAuth();
    if (!isLoggedIn()) return; // redirected already

    await loadSessionData(); // fetch profile + purchases from API

    const user = _currentUser;
    hydrateUserUI(user);
    ensureLogoutModal();
    initNotifications(user || { id: "anonymous" });
    initNoteFocus(user);

    document.querySelectorAll("img.gc-thumb-img, img.gc-note-img").forEach(applyImgFallback);
    window.gcSyncPurchases?.();
  });
})();
