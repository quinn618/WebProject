/**
 * GhassraCore — auth_js.js  (API-integrated version)
 * Replaces all localStorage user-management with AuthAPI calls.
 * UI logic (toggle, password visibility, form layout) is unchanged.
 */

/* ── Mode toggle (login ↔ signup) ── */
const wrapper        = document.getElementById("authWrapper");
const goToSignup     = document.getElementById("goToSignup");
const goToLogin      = document.getElementById("goToLogin");

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
    btn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
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
  window.history.replaceState(
    {},
    "",
    `${window.location.pathname}?mode=${nextMode}`
  );
}

function switchToSignup(e) { e.preventDefault(); setMode("signup"); }
function switchToLogin(e)  { e.preventDefault(); setMode("login");  }

const urlParams = new URLSearchParams(window.location.search);
setMode(urlParams.get("mode"));

if (goToSignup) goToSignup.addEventListener("click", switchToSignup);
if (goToLogin)  goToLogin.addEventListener("click",  switchToLogin);

/* ── Validation helpers (unchanged from original) ── */
function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizeEmail(email));
}
function passwordMeetsPolicy(password) {
  const v = String(password || "");
  return (
    v.length >= 8 &&
    /[a-z]/.test(v) &&
    /[A-Z]/.test(v) &&
    /\d/.test(v) &&
    /[^A-Za-z0-9]/.test(v) &&
    !/\s/.test(v)
  );
}

function showAlert(el, message, { ok = false } = {}) {
  if (!el) return;
  el.textContent = message || "";
  el.classList.toggle("success", ok);
}

function setFormBusy(form, busy) {
  if (!form) return;
  form
    .querySelectorAll("button[type=submit], input, select, textarea")
    .forEach((el) => (el.disabled = busy));
}

function redirectToApp() {
  window.location.href = "main.html";
}

/* ── DOMContentLoaded ── */
document.addEventListener("DOMContentLoaded", () => {
  // If a token already exists, skip the auth screen
  if (window.GC.getToken()) {
    redirectToApp();
    return;
  }

  initPasswordToggles();

  const loginBlock       = document.getElementById("loginBlock");
  const resetBlock       = document.getElementById("resetBlock");
  const forgotPasswordLink = document.getElementById("forgotPasswordLink");
  const backToLoginLink  = document.getElementById("backToLoginLink");

  const loginForm   = document.getElementById("loginFormEl");
  const signupForm  = document.getElementById("signupFormEl");
  const loginAlert  = document.getElementById("loginAlert");
  const signupAlert = document.getElementById("signupAlert");

  /* ── Forgot-password view toggle (UI only — no dedicated endpoint yet) ── */
  function openResetView() {
    if (loginBlock) loginBlock.hidden = true;
    if (resetBlock) resetBlock.hidden = false;
    const resetEmail = document.getElementById("reset-email");
    const loginEmail = document.getElementById("login-email");
    if (resetEmail && loginEmail && !resetEmail.value)
      resetEmail.value = loginEmail.value;
    initPasswordToggles();
  }
  function closeResetView() {
    if (resetBlock) resetBlock.hidden = true;
    if (loginBlock) loginBlock.hidden = false;
  }

  if (forgotPasswordLink)
    forgotPasswordLink.addEventListener("click", (e) => {
      e.preventDefault();
      openResetView();
    });
  if (backToLoginLink)
    backToLoginLink.addEventListener("click", (e) => {
      e.preventDefault();
      closeResetView();
    });

  /* ── Login form ── */
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      showAlert(loginAlert, "");

      const email          = normalizeEmail(document.getElementById("login-email")?.value);
      const password       = document.getElementById("login-password")?.value || "";
      const instituteCode  = (document.getElementById("login-code")?.value || "").trim();

      // Client-side validation (keep UX fast)
      if (!isValidEmail(email)) {
        showAlert(loginAlert, "Please enter a valid email address.");
        return;
      }
      if (!instituteCode) {
        showAlert(loginAlert, "Institute code is required.");
        return;
      }

      setFormBusy(loginForm, true);
      try {
        const data = await window.GC.AuthAPI.login({
          email,
          password,
          institute_code: instituteCode,
        });

        // Backend should return { success, token, user }
        if (data?.success) {
          showAlert(loginAlert, "Logged in successfully. Redirecting…", { ok: true });
          setTimeout(redirectToApp, 400);
        } else {
          showAlert(loginAlert, data?.message || "Login failed. Please try again.");
        }
      } catch (err) {
        showAlert(loginAlert, err.message || "Network error. Please try again.");
      } finally {
        setFormBusy(loginForm, false);
      }
    });
  }

  /* ── Signup form ── */
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      showAlert(signupAlert, "");

      const fullName       = (document.getElementById("signup-name")?.value      || "").trim();
      const instituteName  = (document.getElementById("signup-institute")?.value || "").trim();
      const email          = normalizeEmail(document.getElementById("signup-email")?.value);
      const major          = document.getElementById("signup-major")?.value || "";
      const instituteCode  = (document.getElementById("signup-code")?.value    || "").trim();
      const level          = document.getElementById("signup-level")?.value    || "";
      const password       = document.getElementById("signup-password")?.value || "";
      const passwordConfirm = document.getElementById("signup-password-confirm")?.value || "";

      // Client-side validation
      if (!fullName)       { showAlert(signupAlert, "Full name is required.");              return; }
      if (!instituteName)  { showAlert(signupAlert, "Institute name is required.");         return; }
      if (!isValidEmail(email)) { showAlert(signupAlert, "Please enter a valid email address."); return; }
      if (!instituteCode)  { showAlert(signupAlert, "Institute code is required.");         return; }
      if (!level)          { showAlert(signupAlert, "Please select your level.");           return; }
      if (!passwordMeetsPolicy(password)) {
        showAlert(signupAlert, "Password must be 8+ chars with upper/lower/number/symbol (no spaces).");
        return;
      }
      if (password !== passwordConfirm) {
        showAlert(signupAlert, "Password confirmation does not match.");
        return;
      }

      setFormBusy(signupForm, true);
      try {
        const data = await window.GC.AuthAPI.register({
          name:              fullName,
          email,
          password,
          password_confirm:  passwordConfirm,
          institute_name:    instituteName,
          institute_code:    instituteCode,
          major,
          level,
        });

        if (data?.success) {
          showAlert(signupAlert, "Account created. Redirecting…", { ok: true });
          setTimeout(redirectToApp, 400);
        } else {
          showAlert(signupAlert, data?.message || "Registration failed. Please try again.");
        }
      } catch (err) {
        showAlert(signupAlert, err.message || "Network error. Please try again.");
      } finally {
        setFormBusy(signupForm, false);
      }
    });
  }
});
