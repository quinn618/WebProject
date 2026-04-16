// XAMPP API Configuration (updated in api.js)
// Import: const API_BASE = 'http://localhost/backend/api';

// ==================== LOGIN ====================

async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("login-email")?.value.trim() || "";
  const password = document.getElementById("login-password")?.value || "";
  const instituteCode =
    document.getElementById("login-code")?.value.trim() || "";
  const btn =
    document.getElementById("loginBtn") ||
    document.querySelector("#loginForm button");

  if (!email || !password || !instituteCode) {
    showAuthError("login", "Veuillez remplir tous les champs");
    return;
  }

  setLoading(btn, true);

  try {
    const result = await Auth.login(email, password, instituteCode);

    localStorage.setItem("token", result.token);
    localStorage.setItem("user", JSON.stringify(result));

    showAuthSuccess("login", "Connexion réussie ! Redirection...");
    setTimeout(() => {
      window.location.href = "main.html";
    }, 1200);
  } catch (err) {
    showAuthError("login", err.message || "Erreur de connexion");
  } finally {
    setLoading(btn, false);
  }
}

// ==================== REGISTER ====================

async function handleRegister(e) {
  e.preventDefault();

  const name = document.getElementById("signup-name")?.value.trim() || "";
  const email = document.getElementById("signup-email")?.value.trim() || "";
  const instituteCode =
    document.getElementById("signup-code")?.value.trim() || "";
  const password = document.getElementById("signup-password")?.value || "";
  const confirm =
    document.getElementById("signup-confirm")?.value ||
    document.getElementById("signup-password")?.value ||
    "";
  const btn =
    document.getElementById("signupBtn") ||
    document.querySelector("#signupForm button");

  if (!name || !email || !instituteCode || !password) {
    showAuthError("signup", "Veuillez remplir tous les champs");
    return;
  }

  if (confirm && password !== confirm) {
    showAuthError("signup", "Les mots de passe ne correspondent pas");
    return;
  }

  if (password.length < 6) {
    showAuthError("signup", "Mot de passe trop court (min. 6 caractères)");
    return;
  }

  setLoading(btn, true);

  try {
    const result = await Auth.register(
      name,
      email,
      password,
      confirm || password,
      instituteCode,
    );

    localStorage.setItem("token", result.token);
    localStorage.setItem("user", JSON.stringify(result));

    showAuthSuccess("signup", "Compte créé avec succès ! Redirection...");
    setTimeout(() => {
      window.location.href = "main.html";
    }, 1200);
  } catch (err) {
    showAuthError("signup", err.message || "Erreur lors de l'inscription");
  } finally {
    setLoading(btn, false);
  }
}

// ==================== HELPERS ====================

function setLoading(btn, loading) {
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? "Chargement..." : btn.dataset.label || "Envoyer";
}

function showAuthError(form, message) {
  clearAuthMessages(form);
  const el = document.createElement("div");
  el.className = "auth-error";
  el.textContent = message;
  el.style.cssText =
    "color:#f76a80;background:#fff0f2;border:1px solid #f76a80;" +
    "border-radius:8px;padding:10px 14px;font-size:0.875rem;margin-top:10px;";
  const formEl = document.getElementById(form + "Form");
  if (formEl) formEl.appendChild(el);
}

function showAuthSuccess(form, message) {
  clearAuthMessages(form);
  const el = document.createElement("div");
  el.className = "auth-success";
  el.textContent = message;
  el.style.cssText =
    "color:#1D9E75;background:#E1F5EE;border:1px solid #1D9E75;" +
    "border-radius:8px;padding:10px 14px;font-size:0.875rem;margin-top:10px;";
  const formEl = document.getElementById(form + "Form");
  if (formEl) formEl.appendChild(el);
}

function clearAuthMessages(form) {
  const formEl = document.getElementById(form + "Form");
  if (!formEl) return;
  formEl
    .querySelectorAll(".auth-error, .auth-success")
    .forEach((el) => el.remove());
}

function setMode(mode) {
  const wrapper = document.getElementById("authWrapper");
  if (!wrapper) return;
  const nextMode = mode === "signup" ? "signup" : "login";
  wrapper.dataset.mode = nextMode;
  document.title =
    nextMode === "signup" ? "Sign Up | Ghassra Core" : "Login | Ghassra Core";
  window.history.replaceState(
    {},
    "",
    `${window.location.pathname}?mode=${nextMode}`,
  );
}

function switchToSignup(e) {
  e?.preventDefault?.();
  setMode("signup");
}
function switchToLogin(e) {
  e?.preventDefault?.();
  setMode("login");
}

// ==================== INIT ====================

document.addEventListener("DOMContentLoaded", function () {
  // If already logged in → redirect
  if (localStorage.getItem("token")) {
    window.location.href = "main.html";
    return;
  }

  // Mode switching
  const goToSignup = document.getElementById("goToSignup");
  const goToLogin = document.getElementById("goToLogin");
  if (goToSignup) goToSignup.addEventListener("click", switchToSignup);
  if (goToLogin) goToLogin.addEventListener("click", switchToLogin);

  // Set initial mode from URL
  const urlParams = new URLSearchParams(window.location.search);
  setMode(urlParams.get("mode"));

  // Form handlers
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  if (loginForm) loginForm.addEventListener("submit", handleLogin);
  if (signupForm) signupForm.addEventListener("submit", handleRegister);

  // Save button labels for loading state
  document.querySelectorAll('button[id$="Btn"]').forEach((btn) => {
    btn.dataset.label = btn.textContent;
  });
});
