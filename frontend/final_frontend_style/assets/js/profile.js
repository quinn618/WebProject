/* ── Upload Modal ── */
function openModal() {
  document.getElementById("uploadModal").classList.add("open");
}
function closeModal() {
  document.getElementById("uploadModal").classList.remove("open");
}
function handleOverlayClick(e) {
  if (e.target === document.getElementById("uploadModal")) closeModal();
}

const LS_USERS_KEY = "gc_users";
const LS_SESSION_KEY = "gc_session";

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

function getCurrentUser() {
  const userId = getSessionUserId();
  if (!userId) return null;
  return readUsers().find((u) => u.id === userId) || null;
}

function updateCurrentUser(patch) {
  const userId = getSessionUserId();
  if (!userId) return null;
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) return null;
  users[idx] = { ...users[idx], ...patch, updatedAt: new Date().toISOString() };
  writeUsers(users);
  return users[idx];
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function passwordMeetsPolicy(password) {
  const p = String(password || "");
  if (p.length < 8) return false;
  if (/\s/.test(p)) return false;
  if (!/[a-z]/.test(p)) return false;
  if (!/[A-Z]/.test(p)) return false;
  if (!/[0-9]/.test(p)) return false;
  if (!/[^A-Za-z0-9]/.test(p)) return false;
  return true;
}

function getSafeValue(id) {
  const el = document.getElementById(id);
  return el ? el.value || "" : "";
}

let initialSnapshot = null;
let pendingAvatarDataUrl = null;

function normalizeUsername(value) {
  return String(value || "")
    .trim()
    .replace(/^@/, "");
}

function snapshotFromForm() {
  return {
    name: getSafeValue("editName").trim(),
    username: normalizeUsername(getSafeValue("editUsername")),
    major: getSafeValue("editMajor"),
    yearLevel: getSafeValue("editYear"),
    bio: getSafeValue("editBio").trim(),
    github: getSafeValue("editGithub").trim(),
    email: getSafeValue("editEmail").trim(),
    avatarDataUrl:
      pendingAvatarDataUrl ||
      document.getElementById("editAvatarPreview")?.src ||
      "",
    currentPassword: getSafeValue("currentPassword"),
    newPassword: getSafeValue("newPassword"),
    confirmNewPassword: getSafeValue("confirmNewPassword"),
  };
}

function setSaveEnabled(enabled) {
  const btn = document.getElementById("saveProfileBtn");
  if (!btn) return;
  btn.disabled = !enabled;
  btn.style.opacity = enabled ? "1" : "0.55";
  btn.style.pointerEvents = enabled ? "auto" : "none";
}

function computeHasChanges(now) {
  if (!initialSnapshot) return false;
  const fields = [
    "name",
    "username",
    "major",
    "yearLevel",
    "bio",
    "github",
    "email",
    "avatarDataUrl",
  ];
  const baseChanged = fields.some(
    (k) => String(now[k] || "") !== String(initialSnapshot[k] || ""),
  );

  const wantsPasswordChange =
    String(now.currentPassword || "") !== "" ||
    String(now.newPassword || "") !== "" ||
    String(now.confirmNewPassword || "") !== "";

  return baseChanged || wantsPasswordChange;
}

function wireChangeTracking() {
  const ids = [
    "editName",
    "editUsername",
    "editMajor",
    "editYear",
    "editBio",
    "editGithub",
    "editEmail",
    "currentPassword",
    "newPassword",
    "confirmNewPassword",
  ];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", () => {
      const now = snapshotFromForm();
      setSaveEnabled(computeHasChanges(now));
    });
    el.addEventListener("change", () => {
      const now = snapshotFromForm();
      setSaveEnabled(computeHasChanges(now));
    });
  });
}

function hydrateProfileUIFromUser(user) {
  if (!user) return;

  const heroNameEl = document.querySelector(".hero-title-row h1");
  if (heroNameEl) heroNameEl.textContent = user.name || heroNameEl.textContent;

  const badgeEl = document.querySelector(".hero-title-row .badge-cs");
  if (badgeEl) {
    const major =
      user.major ||
      badgeEl.textContent.replace(/\s*Major\s*$/i, "").trim() ||
      "Computer Science";
    badgeEl.textContent = `${major} Major`;
  }

  const bioEl = document.querySelector(".hero-desc");
  if (bioEl && user.bio) bioEl.textContent = user.bio;

  const githubText = document.querySelector(".hero-links a:first-child span");
  if (githubText && user.github) githubText.textContent = user.github;

  if (user.avatarDataUrl) {
    document
      .querySelectorAll(".hero-avatar img, .topnav-right .avatar-sm img")
      .forEach((img) => {
        img.src = user.avatarDataUrl;
      });
  }
}

function hydrateEditFormFromUser(user) {
  if (!user) return;

  const nameEl = document.getElementById("editName");
  if (nameEl) nameEl.value = user.name || nameEl.value;

  const usernameEl = document.getElementById("editUsername");
  if (usernameEl) {
    const fallback = user.email
      ? String(user.email).split("@")[0]
      : "DevStudent";
    usernameEl.value = user.username || fallback;
  }

  const majorEl = document.getElementById("editMajor");
  if (majorEl && user.major) majorEl.value = user.major;

  const yearEl = document.getElementById("editYear");
  if (yearEl) {
    const value = user.yearLevel || user.level || "";
    if (value) yearEl.value = value;
  }

  const bioEl = document.getElementById("editBio");
  if (bioEl && user.bio) bioEl.value = user.bio;

  const githubEl = document.getElementById("editGithub");
  if (githubEl && user.github) githubEl.value = user.github;

  const emailEl = document.getElementById("editEmail");
  if (emailEl) emailEl.value = user.email || emailEl.value;

  const avatarPreview = document.getElementById("editAvatarPreview");
  if (avatarPreview && user.avatarDataUrl)
    avatarPreview.src = user.avatarDataUrl;

  pendingAvatarDataUrl = null;
}

/* ── Edit Profile Page View ── */
function openEditProfile() {
  document.getElementById("profileView").style.display = "none";
  const ep = document.getElementById("editProfileView");
  ep.style.display = "block";
  ep.style.opacity = "0";
  ep.style.transform = "translateX(2rem)";
  requestAnimationFrame(() => {
    ep.style.transition = "opacity 0.3s, transform 0.3s";
    ep.style.opacity = "1";
    ep.style.transform = "translateX(0)";
  });
  window.scrollTo({ top: 0, behavior: "smooth" });

  const user = getCurrentUser();
  hydrateEditFormFromUser(user);
  initialSnapshot = snapshotFromForm();
  setSaveEnabled(false);
}
function closeEditProfile() {
  const ep = document.getElementById("editProfileView");
  ep.style.transition = "opacity 0.25s, transform 0.25s";
  ep.style.opacity = "0";
  ep.style.transform = "translateX(2rem)";
  setTimeout(() => {
    ep.style.display = "none";
    document.getElementById("profileView").style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 250);
}
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
    pendingAvatarDataUrl = ev.target.result;
    const now = snapshotFromForm();
    setSaveEnabled(computeHasChanges(now));
  };
  reader.readAsDataURL(file);
}
function saveProfile() {
  const user = getCurrentUser();
  if (!user) {
    showToast("Please log in again.", "error", "var(--error)");
    window.location.href = "auth.html?mode=login";
    return;
  }

  const now = snapshotFromForm();
  if (!computeHasChanges(now)) {
    setSaveEnabled(false);
    return;
  }

  if (!now.name) {
    showToast("Display name is required.", "warning", "var(--error)");
    return;
  }

  if (!now.email || !isValidEmail(now.email)) {
    showToast("Please enter a valid email.", "warning", "var(--error)");
    return;
  }

  // Email uniqueness (per institute code)
  const users = readUsers();
  const duplicate = users.find(
    (u) =>
      u.id !== user.id &&
      String(u.email).toLowerCase() === now.email.toLowerCase() &&
      String(u.instituteCode || "") === String(user.instituteCode || ""),
  );
  if (duplicate) {
    showToast(
      "This email is already used for the same institute code.",
      "warning",
      "var(--error)",
    );
    return;
  }

  // Password change (optional)
  const wantsPasswordChange =
    String(now.currentPassword || "") !== "" ||
    String(now.newPassword || "") !== "" ||
    String(now.confirmNewPassword || "") !== "";

  const patch = {
    name: now.name,
    username: now.username,
    major: now.major,
    yearLevel: now.yearLevel,
    bio: now.bio,
    github: now.github,
    email: now.email,
    avatarDataUrl: now.avatarDataUrl,
  };

  if (wantsPasswordChange) {
    if (!now.currentPassword || !now.newPassword || !now.confirmNewPassword) {
      showToast(
        "Fill current + new + confirm password.",
        "warning",
        "var(--error)",
      );
      return;
    }
    if (String(now.currentPassword) !== String(user.password)) {
      showToast("Current password is incorrect.", "warning", "var(--error)");
      return;
    }
    if (!passwordMeetsPolicy(now.newPassword)) {
      showToast(
        "New password does not meet the policy.",
        "warning",
        "var(--error)",
      );
      return;
    }
    if (now.newPassword !== now.confirmNewPassword) {
      showToast(
        "New password confirmation does not match.",
        "warning",
        "var(--error)",
      );
      return;
    }
    patch.password = now.newPassword;
  }

  const updated = updateCurrentUser(patch);
  if (!updated) {
    showToast("Could not save changes.", "error", "var(--error)");
    return;
  }

  hydrateProfileUIFromUser(updated);

  // Clear password fields after successful save
  ["currentPassword", "newPassword", "confirmNewPassword"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  pendingAvatarDataUrl = null;
  initialSnapshot = snapshotFromForm();
  setSaveEnabled(false);

  closeEditProfile();
  setTimeout(
    () =>
      showToast(
        "Profile updated successfully!",
        "check_circle",
        "var(--secondary)",
      ),
    300,
  );
}

/* ── Toast helper ── */
function showToast(message, icon, color) {
  const existing = document.getElementById("gc-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "gc-toast";
  toast.style.cssText = `
    position:fixed; bottom:5.5rem; left:50%; transform:translateX(-50%) translateY(1rem);
    background:#fff; border:1px solid var(--surface-container-high);
    box-shadow:0 8px 30px rgba(39,48,87,0.15); border-radius:var(--radius-full);
    padding:0.75rem 1.5rem; display:flex; align-items:center; gap:0.5rem;
    font-weight:600; font-size:0.875rem; color:var(--on-surface);
    z-index:9999; opacity:0; transition:opacity 0.3s, transform 0.3s;
    white-space:nowrap;
  `;
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
  }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  const user = getCurrentUser();
  hydrateProfileUIFromUser(user);
  hydrateEditFormFromUser(user);
  wireChangeTracking();
  setSaveEnabled(false);
});
