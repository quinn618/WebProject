const wrapper = document.getElementById("authWrapper");
const goToSignup = document.getElementById("goToSignup");
const goToLogin = document.getElementById("goToLogin");

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
