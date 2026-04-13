const wrapper = document.getElementById("authWrapper");
const goToSignup = document.getElementById("goToSignup");
const goToLogin = document.getElementById("goToLogin");

const LS_USERS_KEY = "gc_users";
const LS_SESSION_KEY = "gc_session";

function ensurePasswordToggle(inputEl) {
  if (!inputEl) return;
  if (inputEl.getAttribute("type") !== "password") return;

  const wrap = inputEl.closest(".field__wrap");
  if (!wrap) return;

  inputEl.classList.add("field__input--pw");

  if (wrap.querySelector(".field__toggle")) return;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "field__toggle";
  btn.setAttribute("aria-label", "Show password");
  btn.innerHTML = '<span class="material-symbols-outlined">visibility</span>';
  btn.addEventListener("click", () => {
    const isHidden = inputEl.type === "password";
    inputEl.type = isHidden ? "text" : "password";
    btn.setAttribute(
      "aria-label",
      isHidden ? "Hide password" : "Show password",
    );
    const icon = btn.querySelector(".material-symbols-outlined");
    if (icon) icon.textContent = isHidden ? "visibility_off" : "visibility";
  });
  wrap.appendChild(btn);
}

function initPasswordToggles() {
  document
    .querySelectorAll('input.field__input[type="password"]')
    .forEach((input) => ensurePasswordToggle(input));
}

function setMode(mode) {
  if (!wrapper) return;

  const nextMode = mode === "signup" ? "signup" : "login";
  wrapper.dataset.mode = nextMode;
  document.title =
    nextMode === "signup" ? "Sign Up | Ghassra core" : "Login | Ghassra core";

  const nextUrl = `${window.location.pathname}?mode=${nextMode}`;
  window.history.replaceState({}, "", nextUrl);
}

function switchToSignup(e) {
  e.preventDefault();
  setMode("signup");
}

function switchToLogin(e) {
  e.preventDefault();
  setMode("login");
}

const urlParams = new URLSearchParams(window.location.search);
setMode(urlParams.get("mode"));

if (goToSignup) goToSignup.addEventListener("click", switchToSignup);
if (goToLogin) goToLogin.addEventListener("click", switchToLogin);

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(LS_USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeUsers(users) {
  localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
}

function setSession(userId) {
  localStorage.setItem(LS_SESSION_KEY, JSON.stringify({ userId }));
}

function getSessionUserId() {
  try {
    const session = JSON.parse(localStorage.getItem(LS_SESSION_KEY) || "null");
    return session && session.userId ? session.userId : null;
  } catch {
    return null;
  }
}

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function isValidEmail(email) {
  const value = normalizeEmail(email);
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function passwordMeetsPolicy(password) {
  const value = String(password || "");
  // >= 8 chars, at least 1 lower, 1 upper, 1 digit, 1 symbol, no spaces
  return (
    value.length >= 8 &&
    /[a-z]/.test(value) &&
    /[A-Z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value) &&
    !/\s/.test(value)
  );
}

function showAlert(el, message, { ok = false } = {}) {
  if (!el) return;
  el.textContent = message || "";
  el.classList.toggle("success", ok);
}

function redirectToApp() {
  window.location.href = "main.html";
}

document.addEventListener("DOMContentLoaded", () => {
  // If already logged in, skip auth
  if (getSessionUserId()) {
    redirectToApp();
    return;
  }

  initPasswordToggles();

  const loginBlock = document.getElementById("loginBlock");
  const resetBlock = document.getElementById("resetBlock");
  const forgotPasswordLink = document.getElementById("forgotPasswordLink");
  const backToLoginLink = document.getElementById("backToLoginLink");
  const resetForm = document.getElementById("resetFormEl");
  const resetAlert = document.getElementById("resetAlert");

  const loginForm = document.getElementById("loginFormEl");
  const signupForm = document.getElementById("signupFormEl");
  const loginAlert = document.getElementById("loginAlert");
  const signupAlert = document.getElementById("signupAlert");

  function openResetView() {
    if (loginBlock) loginBlock.hidden = true;
    if (resetBlock) resetBlock.hidden = false;
    showAlert(resetAlert, "");

    // Convenience: prefill from login inputs if present
    const loginEmail = document.getElementById("login-email")?.value || "";
    const loginCode = document.getElementById("login-code")?.value || "";
    const resetEmail = document.getElementById("reset-email");
    const resetCode = document.getElementById("reset-code");
    if (resetEmail && !resetEmail.value) resetEmail.value = loginEmail;
    if (resetCode && !resetCode.value) resetCode.value = loginCode;
  }

  function closeResetView() {
    if (resetBlock) resetBlock.hidden = true;
    if (loginBlock) loginBlock.hidden = false;
    showAlert(resetAlert, "");
  }

  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", (e) => {
      e.preventDefault();
      openResetView();
      initPasswordToggles();
    });
  }

  if (backToLoginLink) {
    backToLoginLink.addEventListener("click", (e) => {
      e.preventDefault();
      closeResetView();
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      showAlert(loginAlert, "");

      const email = normalizeEmail(
        document.getElementById("login-email")?.value,
      );
      const password = document.getElementById("login-password")?.value || "";
      const instituteCode = (
        document.getElementById("login-code")?.value || ""
      ).trim();

      if (!isValidEmail(email)) {
        showAlert(loginAlert, "Please enter a valid email address.");
        return;
      }
      if (!passwordMeetsPolicy(password)) {
        showAlert(
          loginAlert,
          "Password must be 8+ chars with upper/lower/number/symbol (no spaces).",
        );
        return;
      }
      if (!instituteCode) {
        showAlert(loginAlert, "Institute code is required.");
        return;
      }

      const users = readUsers();
      const user = users.find(
        (u) =>
          normalizeEmail(u.email) === email &&
          String(u.instituteCode || "").toLowerCase() ===
            instituteCode.toLowerCase(),
      );
      if (!user) {
        showAlert(
          loginAlert,
          "No account found for this email + institute code.",
        );
        return;
      }
      if (String(user.password || "") !== password) {
        showAlert(loginAlert, "Incorrect password.");
        return;
      }

      setSession(user.id);
      showAlert(loginAlert, "Logged in successfully. Redirecting…", {
        ok: true,
      });
      setTimeout(redirectToApp, 400);
    });
  }

  if (resetForm) {
    resetForm.addEventListener("submit", (e) => {
      e.preventDefault();
      showAlert(resetAlert, "");

      const email = normalizeEmail(
        document.getElementById("reset-email")?.value,
      );
      const instituteCode = (
        document.getElementById("reset-code")?.value || ""
      ).trim();
      const newPassword =
        document.getElementById("reset-password")?.value || "";
      const confirm =
        document.getElementById("reset-password-confirm")?.value || "";

      if (!isValidEmail(email)) {
        showAlert(resetAlert, "Please enter a valid email address.");
        return;
      }
      if (!instituteCode) {
        showAlert(resetAlert, "Institute code is required.");
        return;
      }
      if (!passwordMeetsPolicy(newPassword)) {
        showAlert(
          resetAlert,
          "Password must be 8+ chars with upper/lower/number/symbol (no spaces).",
        );
        return;
      }
      if (newPassword !== confirm) {
        showAlert(resetAlert, "Password confirmation does not match.");
        return;
      }

      const users = readUsers();
      const idx = users.findIndex(
        (u) =>
          normalizeEmail(u.email) === email &&
          String(u.instituteCode || "").toLowerCase() ===
            instituteCode.toLowerCase(),
      );

      if (idx < 0) {
        showAlert(
          resetAlert,
          "No account found for this email + institute code.",
        );
        return;
      }

      users[idx] = {
        ...users[idx],
        password: newPassword,
        updatedAt: new Date().toISOString(),
      };
      writeUsers(users);

      closeResetView();
      showAlert(loginAlert, "Password updated. You can log in now.", {
        ok: true,
      });
    });
  }

  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      showAlert(signupAlert, "");

      const fullName = (
        document.getElementById("signup-name")?.value || ""
      ).trim();
      const instituteName = (
        document.getElementById("signup-institute")?.value || ""
      ).trim();
      const email = normalizeEmail(
        document.getElementById("signup-email")?.value,
      );
      const major = document.getElementById("signup-major")?.value || "";
      const instituteCode = (
        document.getElementById("signup-code")?.value || ""
      ).trim();
      const level = document.getElementById("signup-level")?.value || "";
      const password = document.getElementById("signup-password")?.value || "";
      const passwordConfirm =
        document.getElementById("signup-password-confirm")?.value || "";

      if (!fullName) {
        showAlert(signupAlert, "Full name is required.");
        return;
      }
      if (!instituteName) {
        showAlert(signupAlert, "Institute name is required.");
        return;
      }
      if (!isValidEmail(email)) {
        showAlert(signupAlert, "Please enter a valid email address.");
        return;
      }
      if (!instituteCode) {
        showAlert(signupAlert, "Institute code is required.");
        return;
      }
      if (!level) {
        showAlert(signupAlert, "Please select your level.");
        return;
      }
      if (!passwordMeetsPolicy(password)) {
        showAlert(
          signupAlert,
          "Password must be 8+ chars with upper/lower/number/symbol (no spaces).",
        );
        return;
      }
      if (password !== passwordConfirm) {
        showAlert(signupAlert, "Password confirmation does not match.");
        return;
      }

      const users = readUsers();
      const exists = users.some(
        (u) =>
          normalizeEmail(u.email) === email &&
          String(u.instituteCode || "").toLowerCase() ===
            instituteCode.toLowerCase(),
      );
      if (exists) {
        showAlert(
          signupAlert,
          "An account already exists for this email + institute code.",
        );
        return;
      }

      const newUser = {
        id: "u_" + Date.now(),
        name: fullName,
        instituteName,
        instituteCode,
        level,
        major,
        email,
        password,
        sold: 0,
        avatarDataUrl: null,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      writeUsers(users);
      setSession(newUser.id);
      showAlert(signupAlert, "Account created. Redirecting…", { ok: true });
      setTimeout(redirectToApp, 400);
    });
  }
});
