const API_BASE = '../backend/api';

// ==================== API ====================

async function apiRequest(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);

    const res  = await fetch(API_BASE + endpoint, options);
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
}

// ==================== MODE SWITCH ====================

const wrapper    = document.getElementById('authWrapper');
const goToSignup = document.getElementById('goToSignup');
const goToLogin  = document.getElementById('goToLogin');

function setMode(mode) {
    if (!wrapper) return;
    const nextMode = mode === 'signup' ? 'signup' : 'login';
    wrapper.dataset.mode = nextMode;
    document.title = nextMode === 'signup' ? 'Sign Up | Ghassra Core' : 'Login | Ghassra Core';
    window.history.replaceState({}, '', `${window.location.pathname}?mode=${nextMode}`);
}

function switchToSignup(e) { e.preventDefault(); setMode('signup'); }
function switchToLogin(e)  { e.preventDefault(); setMode('login');  }

const urlParams = new URLSearchParams(window.location.search);
setMode(urlParams.get('mode'));

if (goToSignup) goToSignup.addEventListener('click', switchToSignup);
if (goToLogin)  goToLogin.addEventListener('click',  switchToLogin);

// ==================== LOGIN ====================

async function handleLogin(e) {
    e.preventDefault();

    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn      = document.getElementById('loginBtn');

    if (!email || !password) {
        showAuthError('login', 'Veuillez remplir tous les champs');
        return;
    }

    setLoading(btn, true);

    try {
        const result = await apiRequest('/auth/login.php', 'POST', { email, password });

        localStorage.setItem('token', result.token);
        localStorage.setItem('user',  JSON.stringify(result.user));

        showAuthSuccess('login', 'Connexion réussie ! Redirection...');
        setTimeout(function() { window.location.href = 'main.html'; }, 1200);

    } catch (err) {
        showAuthError('login', err.message);
    } finally {
        setLoading(btn, false);
    }
}

// ==================== REGISTER ====================

async function handleRegister(e) {
    e.preventDefault();

    const name     = document.getElementById('signupName').value.trim();
    const email    = document.getElementById('signupEmail').value.trim();
    const filiere  = document.getElementById('signupFiliere').value;
    const password = document.getElementById('signupPassword').value;
    const confirm  = document.getElementById('signupConfirm').value;
    const btn      = document.getElementById('signupBtn');

    if (!name || !email || !filiere || !password || !confirm) {
        showAuthError('signup', 'Veuillez remplir tous les champs');
        return;
    }

    if (password !== confirm) {
        showAuthError('signup', 'Les mots de passe ne correspondent pas');
        return;
    }

    if (password.length < 6) {
        showAuthError('signup', 'Mot de passe trop court (min. 6 caractères)');
        return;
    }

    setLoading(btn, true);

    try {
        const result = await apiRequest('/auth/register.php', 'POST', {
            name, email, filiere, password
        });

        localStorage.setItem('token', result.token);
        localStorage.setItem('user',  JSON.stringify(result.user));

        showAuthSuccess('signup', 'Compte créé avec succès ! Redirection...');
        setTimeout(function() { window.location.href = 'main.html'; }, 1200);

    } catch (err) {
        showAuthError('signup', err.message);
    } finally {
        setLoading(btn, false);
    }
}

// ==================== HELPERS ====================

function setLoading(btn, loading) {
    if (!btn) return;
    btn.disabled    = loading;
    btn.textContent = loading ? 'Chargement...' : btn.dataset.label || btn.textContent;
}

function showAuthError(form, message) {
    clearAuthMessages(form);
    const el       = document.createElement('div');
    el.className   = 'auth-error';
    el.textContent = message;
    el.style.cssText =
        'color:#f76a80;background:#fff0f2;border:1px solid #f76a80;' +
        'border-radius:8px;padding:10px 14px;font-size:0.875rem;margin-top:10px;';
    const formEl = document.getElementById(form + 'Form');
    if (formEl) formEl.appendChild(el);
}

function showAuthSuccess(form, message) {
    clearAuthMessages(form);
    const el       = document.createElement('div');
    el.className   = 'auth-success';
    el.textContent = message;
    el.style.cssText =
        'color:#1D9E75;background:#E1F5EE;border:1px solid #1D9E75;' +
        'border-radius:8px;padding:10px 14px;font-size:0.875rem;margin-top:10px;';
    const formEl = document.getElementById(form + 'Form');
    if (formEl) formEl.appendChild(el);
}

function clearAuthMessages(form) {
    const formEl = document.getElementById(form + 'Form');
    if (!formEl) return;
    formEl.querySelectorAll('.auth-error, .auth-success').forEach(el => el.remove());
}

// ==================== INIT ====================

document.addEventListener('DOMContentLoaded', function() {

    // Si déjà connecté → rediriger
    if (localStorage.getItem('token')) {
        window.location.href = 'main.html';
        return;
    }

    const loginForm  = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm)  loginForm.addEventListener('submit',  handleLogin);
    if (signupForm) signupForm.addEventListener('submit', handleRegister);

    // Sauvegarder le label des boutons pour le restaurer après loading
    document.querySelectorAll('button[id$="Btn"]').forEach(function(btn) {
        btn.dataset.label = btn.textContent;
    });
});