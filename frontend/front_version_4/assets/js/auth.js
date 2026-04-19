// ==================== LOGIN ====================
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("login-email")?.value.trim() || "";
  const password = document.getElementById("login-password")?.value || "";
  const instituteCode =
    document.getElementById("login-code")?.value.trim() || "";
  const btn =
    document.getElementById("loginBtn") ||
    document.querySelector("#loginForm button[type=submit]");

  if (!email || !password || !instituteCode) {
    showAuthError("login", "Veuillez remplir tous les champs");
    return;
  }
  setLoading(btn, true);
  try {
    // resp = { success, token, user: {id,name,email,...}, message }
    const resp = await Auth.login(email, password, instituteCode);
    localStorage.setItem("token", resp.token);
    localStorage.setItem("user", JSON.stringify(resp.user));
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
  const confirm = document.getElementById("signup-confirm")?.value || password;
  const btn =
    document.getElementById("signupBtn") ||
    document.querySelector("#signupForm button[type=submit]");

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
    const resp = await Auth.register(
      name,
      email,
      password,
      confirm,
      instituteCode,
    );
    localStorage.setItem("token", resp.token);
    localStorage.setItem("user", JSON.stringify(resp.user));
    showAuthSuccess("signup", "Compte créé ! Redirection...");
    setTimeout(() => {
      window.location.href = "main.html";
    }, 1200);
  } catch (err) {
    showAuthError("signup", err.message || "Erreur inscription");
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
function showAuthError(form, msg) {
  clearAuthMessages(form);
  const el = document.createElement("div");
  el.className = "auth-error";
  el.textContent = msg;
  el.style.cssText =
    "color:#f76a80;background:#fff0f2;border:1px solid #f76a80;border-radius:8px;padding:10px 14px;font-size:0.875rem;margin-top:10px;";
  document.getElementById(form + "Form")?.appendChild(el);
}
function showAuthSuccess(form, msg) {
  clearAuthMessages(form);
  const el = document.createElement("div");
  el.className = "auth-success";
  el.textContent = msg;
  el.style.cssText =
    "color:#1D9E75;background:#E1F5EE;border:1px solid #1D9E75;border-radius:8px;padding:10px 14px;font-size:0.875rem;margin-top:10px;";
  document.getElementById(form + "Form")?.appendChild(el);
}
function clearAuthMessages(form) {
  document
    .getElementById(form + "Form")
    ?.querySelectorAll(".auth-error,.auth-success")
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
  if (localStorage.getItem("token")) {
    window.location.href = "main.html";
    return;
  }

  document
    .getElementById("goToSignup")
    ?.addEventListener("click", switchToSignup);
  document
    .getElementById("goToLogin")
    ?.addEventListener("click", switchToLogin);

  setMode(new URLSearchParams(window.location.search).get("mode"));

  document.getElementById("loginForm")?.addEventListener("submit", handleLogin);
  document
    .getElementById("signupForm")
    ?.addEventListener("submit", handleRegister);

  document.querySelectorAll('button[id$="Btn"]').forEach((btn) => {
    btn.dataset.label = btn.textContent;
  });
});
