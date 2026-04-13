/**
 * GhassraCore — profile.js  (API-integrated version)
 * Replaces localStorage read/write with ProfileAPI.get() and ProfileAPI.update().
 * All UI transitions, form hydration and change-tracking logic preserved.
 */

/* ── Upload Modal ── */
function openModal()  { document.getElementById("uploadModal").classList.add("open");    }
function closeModal() { document.getElementById("uploadModal").classList.remove("open"); }
function handleOverlayClick(e) {
  if (e.target === document.getElementById("uploadModal")) closeModal();
}

/* ── Validation (unchanged) ── */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}
function passwordMeetsPolicy(password) {
  const p = String(password || "");
  return p.length >= 8 && !/\s/.test(p) &&
    /[a-z]/.test(p) && /[A-Z]/.test(p) &&
    /[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p);
}

function getSafeValue(id) {
  const el = document.getElementById(id);
  return el ? el.value || "" : "";
}

let initialSnapshot    = null;
let pendingAvatarFile  = null; // File object (API-ready) or null
let pendingAvatarPreviewUrl = null; // data-URL for <img> preview only

function normalizeUsername(value) {
  return String(value || "").trim().replace(/^@/, "");
}

function snapshotFromForm() {
  return {
    name:                getSafeValue("editName").trim(),
    username:            normalizeUsername(getSafeValue("editUsername")),
    major:               getSafeValue("editMajor"),
    year_level:          getSafeValue("editYear"),
    bio:                 getSafeValue("editBio").trim(),
    github:              getSafeValue("editGithub").trim(),
    email:               getSafeValue("editEmail").trim(),
    avatarPreviewSrc:    pendingAvatarPreviewUrl ||
                         document.getElementById("editAvatarPreview")?.src || "",
    currentPassword:     getSafeValue("currentPassword"),
    newPassword:         getSafeValue("newPassword"),
    confirmNewPassword:  getSafeValue("confirmNewPassword"),
  };
}

function setSaveEnabled(enabled) {
  const btn = document.getElementById("saveProfileBtn");
  if (!btn) return;
  btn.disabled               = !enabled;
  btn.style.opacity          = enabled ? "1" : "0.55";
  btn.style.pointerEvents    = enabled ? "auto" : "none";
}

function computeHasChanges(now) {
  if (!initialSnapshot) return false;
  const fields = ["name", "username", "major", "year_level", "bio", "github", "email"];
  const baseChanged = fields.some((k) => String(now[k] || "") !== String(initialSnapshot[k] || ""));
  const avatarChanged = now.avatarPreviewSrc !== initialSnapshot.avatarPreviewSrc;
  const wantsPasswordChange =
    String(now.currentPassword || "") !== "" ||
    String(now.newPassword      || "") !== "" ||
    String(now.confirmNewPassword || "") !== "";
  return baseChanged || avatarChanged || wantsPasswordChange;
}

function wireChangeTracking() {
  const ids = [
    "editName", "editUsername", "editMajor", "editYear",
    "editBio", "editGithub", "editEmail",
    "currentPassword", "newPassword", "confirmNewPassword",
  ];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    ["input", "change"].forEach((ev) =>
      el.addEventListener(ev, () => setSaveEnabled(computeHasChanges(snapshotFromForm())))
    );
  });
}

/* ── Hydrate profile UI ── */
function hydrateProfileUIFromUser(user) {
  if (!user) return;

  const heroNameEl = document.querySelector(".hero-title-row h1");
  if (heroNameEl) heroNameEl.textContent = user.name || heroNameEl.textContent;

  const badgeEl = document.querySelector(".hero-title-row .badge-cs");
  if (badgeEl) {
    const major = user.major || badgeEl.textContent.replace(/\s*Major\s*$/i, "").trim() || "Computer Science";
    badgeEl.textContent = `${major} Major`;
  }

  const bioEl = document.querySelector(".hero-desc");
  if (bioEl && user.bio) bioEl.textContent = user.bio;

  const githubText = document.querySelector(".hero-links a:first-child span");
  if (githubText && user.github) githubText.textContent = user.github;

  const avatarUrl = user.avatar_url || user.avatarDataUrl;
  if (avatarUrl) {
    document.querySelectorAll(".hero-avatar img, .topnav-right .avatar-sm img")
      .forEach((img) => { img.src = avatarUrl; });
  }
}

function hydrateEditFormFromUser(user) {
  if (!user) return;

  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el && value !== undefined && value !== null) el.value = value;
  };

  set("editName",     user.name);
  set("editUsername", user.username || (user.email ? user.email.split("@")[0] : "DevStudent"));
  set("editMajor",    user.major);
  set("editYear",     user.year_level || user.yearLevel || user.level || "");
  set("editBio",      user.bio);
  set("editGithub",   user.github);
  set("editEmail",    user.email);

  const avatarPreview = document.getElementById("editAvatarPreview");
  const avatarUrl     = user.avatar_url || user.avatarDataUrl;
  if (avatarPreview && avatarUrl) avatarPreview.src = avatarUrl;

  pendingAvatarFile       = null;
  pendingAvatarPreviewUrl = null;
}

/* ── Edit profile view toggle ── */
function openEditProfile() {
  document.getElementById("profileView").style.display = "none";
  const ep = document.getElementById("editProfileView");
  ep.style.display   = "block";
  ep.style.opacity   = "0";
  ep.style.transform = "translateX(2rem)";
  requestAnimationFrame(() => {
    ep.style.transition = "opacity 0.3s, transform 0.3s";
    ep.style.opacity    = "1";
    ep.style.transform  = "translateX(0)";
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
  hydrateEditFormFromUser(window._gcCurrentUser);
  initialSnapshot = snapshotFromForm();
  setSaveEnabled(false);
}
function closeEditProfile() {
  const ep = document.getElementById("editProfileView");
  ep.style.transition = "opacity 0.25s, transform 0.25s";
  ep.style.opacity    = "0";
  ep.style.transform  = "translateX(2rem)";
  setTimeout(() => {
    ep.style.display = "none";
    document.getElementById("profileView").style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 250);
}

/* ── Avatar preview ── */
function previewAvatar(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    showToast("Image is too large (max 5MB).", "warning", "var(--error)");
    e.target.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = (ev) => {
    document.getElementById("editAvatarPreview").src = ev.target.result;
    pendingAvatarPreviewUrl = ev.target.result;
    pendingAvatarFile       = file; // real File for FormData upload
    setSaveEnabled(computeHasChanges(snapshotFromForm()));
  };
  reader.readAsDataURL(file);
}

/* ── Save profile (API call) ── */
async function saveProfile() {
  const now = snapshotFromForm();
  if (!computeHasChanges(now)) { setSaveEnabled(false); return; }

  if (!now.name) {
    showToast("Display name is required.", "warning", "var(--error)");
    return;
  }
  if (!now.email || !isValidEmail(now.email)) {
    showToast("Please enter a valid email.", "warning", "var(--error)");
    return;
  }

  const wantsPasswordChange =
    String(now.currentPassword    || "") !== "" ||
    String(now.newPassword        || "") !== "" ||
    String(now.confirmNewPassword || "") !== "";

  if (wantsPasswordChange) {
    if (!now.currentPassword || !now.newPassword || !now.confirmNewPassword) {
      showToast("Fill current + new + confirm password.", "warning", "var(--error)");
      return;
    }
    if (!passwordMeetsPolicy(now.newPassword)) {
      showToast("New password does not meet the policy.", "warning", "var(--error)");
      return;
    }
    if (now.newPassword !== now.confirmNewPassword) {
      showToast("New password confirmation does not match.", "warning", "var(--error)");
      return;
    }
  }

  const saveBtn = document.getElementById("saveProfileBtn");
  if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = "Saving…"; }

  const payload = {
    name:       now.name,
    username:   now.username,
    email:      now.email,
    major:      now.major,
    year_level: now.year_level,
    bio:        now.bio,
    github:     now.github,
  };
  if (pendingAvatarFile)    payload.avatar = pendingAvatarFile;
  if (wantsPasswordChange) {
    payload.current_password      = now.currentPassword;
    payload.new_password          = now.newPassword;
    payload.new_password_confirm  = now.confirmNewPassword;
  }

  try {
    const res = await window.GC.ProfileAPI.update(payload);
    if (!res?.success) {
      showToast(res?.message || "Could not save changes.", "error", "var(--error)");
      return;
    }

    const updated = res.data || { ...window._gcCurrentUser, ...payload };
    window._gcCurrentUser = updated;
    hydrateProfileUIFromUser(updated);

    ["currentPassword", "newPassword", "confirmNewPassword"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    pendingAvatarFile       = null;
    pendingAvatarPreviewUrl = null;
    initialSnapshot         = snapshotFromForm();
    setSaveEnabled(false);
    closeEditProfile();
    setTimeout(() => showToast("Profile updated successfully!", "check_circle", "var(--secondary)"), 300);
  } catch (err) {
    showToast(err.message || "Network error. Please try again.", "error", "var(--error)");
  } finally {
    if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = "Save Changes"; }
  }
}

/* ── Toast helper ── */
function showToast(message, icon, color) {
  if (window.showToast && window.showToast !== showToast) {
    return window.showToast(message, icon);
  }
  const existing = document.getElementById("gc-toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.id = "gc-toast";
  toast.style.cssText = `
    position:fixed;bottom:5.5rem;left:50%;transform:translateX(-50%) translateY(1rem);
    background:#fff;border:1px solid var(--surface-container-high);
    box-shadow:0 8px 30px rgba(39,48,87,0.15);border-radius:var(--radius-full);
    padding:0.75rem 1.5rem;display:flex;align-items:center;gap:0.5rem;
    font-weight:600;font-size:0.875rem;color:var(--on-surface);
    z-index:9999;opacity:0;transition:opacity 0.3s,transform 0.3s;white-space:nowrap;`;
  toast.innerHTML = `<span class="material-symbols-outlined" style="color:${color};font-size:1.2rem;">${icon}</span>${message}`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity   = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
  });
  setTimeout(() => {
    toast.style.opacity   = "0";
    toast.style.transform = "translateX(-50%) translateY(1rem)";
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

/* ── Init: load profile from API ── */
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await window.GC.ProfileAPI.get();
    if (res?.success && res.data) {
      window._gcCurrentUser = res.data;
      hydrateProfileUIFromUser(res.data);
      hydrateEditFormFromUser(res.data);
    }
  } catch (err) {
    console.warn("[GC profile] Could not load profile:", err.message);
  }
  wireChangeTracking();
  setSaveEnabled(false);
});
