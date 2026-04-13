/* ── Upload Modal ── */
function openModal() {
  document.getElementById('uploadModal').classList.add('open');
}
function closeModal() {
  document.getElementById('uploadModal').classList.remove('open');
}
function handleOverlayClick(e) {
  if (e.target === document.getElementById('uploadModal')) closeModal();
}

/* ── Edit Profile Page View ── */
function openEditProfile() {
  document.getElementById('profileView').style.display = 'none';
  const ep = document.getElementById('editProfileView');
  ep.style.display = 'block';
  ep.style.opacity = '0';
  ep.style.transform = 'translateX(2rem)';
  requestAnimationFrame(() => {
    ep.style.transition = 'opacity 0.3s, transform 0.3s';
    ep.style.opacity = '1';
    ep.style.transform = 'translateX(0)';
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function closeEditProfile() {
  const ep = document.getElementById('editProfileView');
  ep.style.transition = 'opacity 0.25s, transform 0.25s';
  ep.style.opacity = '0';
  ep.style.transform = 'translateX(2rem)';
  setTimeout(() => {
    ep.style.display = 'none';
    document.getElementById('profileView').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 250);
}
function previewAvatar(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    document.getElementById('editAvatarPreview').src = ev.target.result;
  };
  reader.readAsDataURL(file);
}
function saveProfile() {
  const name     = document.getElementById('editName').value.trim();
  const username = document.getElementById('editUsername').value.trim();
  const bio      = document.getElementById('editBio').value.trim();
  const github   = document.getElementById('editGithub').value.trim();
  const major    = document.getElementById('editMajor').value;

  if (name)     document.querySelector('.hero-title-row h1').textContent = name;
  if (username) document.querySelector('.sidenav-profile h3').textContent = '@' + username.replace(/^@/, '');
  if (bio)      document.querySelector('.hero-desc').textContent = bio;
  if (major)    document.querySelector('.sidenav-profile p').textContent = major + ' Major';
  if (github)   document.querySelector('.hero-links a span:last-child').textContent = github;

  const avatarSrc = document.getElementById('editAvatarPreview').src;
  document.querySelectorAll('.hero-avatar img, .sidenav-profile .avatar-md img, .topnav-right .avatar-sm img')
    .forEach(img => img.src = avatarSrc);

  closeEditProfile();
  setTimeout(() => showToast('Profile updated successfully!', 'check_circle', 'var(--secondary)'), 300);
}

/* ── Logout Modal ── */
function confirmLogout(e) {
  e.preventDefault();
  document.getElementById('logoutModal').classList.add('open');
}
function closeLogout() {
  document.getElementById('logoutModal').classList.remove('open');
}
function handleLogoutOverlayClick(e) {
  if (e.target === document.getElementById('logoutModal')) closeLogout();
}
function doLogout() {
  closeLogout();
  showToast('Logging you out…', 'logout', 'var(--error)');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1500);
}

/* ── Sold Modal ── */
function openSoldModal() {
  document.getElementById('soldModal').classList.add('open');
}
function closeSoldModal() {
  document.getElementById('soldModal').classList.remove('open');
}
function handleSoldOverlayClick(e) {
  if (e.target === document.getElementById('soldModal')) closeSoldModal();
}
function logSale() {
  const amount = parseInt(document.getElementById('soldPrice').value);
  if (!amount || amount < 1) {
    showToast('Please enter a valid number.', 'warning', 'var(--error)');
    return;
  }

  const sidebar = document.getElementById('soldCount');
  const stat    = document.getElementById('soldCountStat');
  const current = parseInt(sidebar.textContent);
  sidebar.textContent = current + amount;
  stat.textContent    = current + amount;

  document.getElementById('soldPrice').value = '';

  closeSoldModal();
  showToast('Sale logged successfully!', 'check_circle', 'var(--secondary)');
}

/* ── Toast helper ── */
function showToast(message, icon, color) {
  const existing = document.getElementById('gc-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'gc-toast';
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
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(1rem)';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}