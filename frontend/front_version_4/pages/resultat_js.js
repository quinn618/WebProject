// resultat_js.js - Version avec API

document.addEventListener('DOMContentLoaded', function() {
  
  const API_BASE_URL = 'https://votre-api.com/api'; // Remplacez par votre API
  
  async function fetchSectionData(sectionType) {
    try {
      const response = await fetch(`${API_BASE_URL}/resources?type=${sectionType}`);
      const data = await response.json();
      return renderResources(data);
    } catch (error) {
      console.error('Erreur API:', error);
      return '<div class="error-message">Erreur de chargement</div>';
    }
  }
  
  function renderResources(resources) {
    // Générer le HTML à partir des données
    return `
      <div class="results-grid">
        ${resources.map(resource => `
          <div class="result-card">
            <div class="card-header">
              <div class="card-icon">
                <span class="material-symbols-outlined">${resource.icon}</span>
              </div>
              <div>
                <h3 class="card-title">${resource.title}</h3>
                <p class="card-meta">Uploaded by <span class="author-name">${resource.author}</span></p>
              </div>
            </div>
            <p class="card-description">${resource.description}</p>
            <div class="card-tags">
              ${resource.tags.map(tag => `<span class="tag ${tag.class}">${tag.text}</span>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  // Configuration des sections
  const sections = {
    'all-files-section': {
      linkId: 'all_files',
      title: 'All Files',
      count: '124',
      type: 'all'
    },
    'exam-papers-section': {
      linkId: 'exam_papers',
      title: 'Exam Papers',
      count: '42',
      type: 'exam'
    },
    'cheat-sheets-section': {
      linkId: 'cheat_sheets',
      title: 'Cheat Sheets',
      count: '31',
      type: 'cheat'
    },
    'code-snippets-section': {
      linkId: 'code_snippets',
      title: 'Code Snippets',
      count: '56',
      type: 'code'
    }
  };
  
  async function showSection(sectionId, section, activeLink) {
    // Cacher toutes les sections
    document.querySelectorAll('.content-section').forEach(s => {
      s.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.classList.add('active');
      targetSection.innerHTML = '<div class="loading-placeholder">Chargement...</div>';
      
      // Charger les données depuis l'API
      const content = await fetchSectionData(section.type);
      targetSection.innerHTML = content;
    }
    
    // Mettre à jour l'UI
    document.getElementById('current-filter').innerHTML = `"${section.title}"`;
    document.getElementById('nbre_document_trouver').textContent = section.count;
    
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.classList.remove('active');
    });
    activeLink.classList.add('active');
  }
  
  // Ajouter les événements
  for (const [sectionId, section] of Object.entries(sections)) {
    const linkElement = document.getElementById(section.linkId);
    if (linkElement) {
      const parentLink = linkElement.closest('.sidebar-link');
      parentLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(sectionId, section, parentLink);
      });
    }
  }
  
});
// ===== NOTIFICATIONS SYSTEM =====

// Données des notifications
let notifications = [
  {
    id: 1,
    title: "New Resource Available!",
    message: "C++ Advanced Memory Management guide has been added.",
    time: "5 min ago",
    read: false,
    icon: "description"
  },
  {
    id: 2,
    title: "Your download is ready",
    message: "STL Cheat Sheet has been downloaded 100+ times.",
    time: "1 hour ago",
    read: false,
    icon: "download"
  },
  {
    id: 3,
    title: "New comment on your post",
    message: "@prof_x commented on your resource: 'Great work!'",
    time: "3 hours ago",
    read: true,
    icon: "chat"
  },
  {
    id: 4,
    title: "Exam season is coming!",
    message: "New exam papers for 2024 have been uploaded.",
    time: "1 day ago",
    read: true,
    icon: "school"
  },
  {
    id: 5,
    title: "Resource approved",
    message: "Your uploaded cheat sheet has been approved by moderators.",
    time: "2 days ago",
    read: true,
    icon: "check_circle"
  }
];

// Fonction pour sauvegarder les notifications
function saveNotifications() {
  localStorage.setItem('notifications', JSON.stringify(notifications));
}

// Fonction pour charger les notifications sauvegardées
function loadNotifications() {
  const saved = localStorage.getItem('notifications');
  if (saved) {
    notifications = JSON.parse(saved);
  }
  updateNotificationBadge();
}

// Compter les notifications non lues
function getUnreadCount() {
  return notifications.filter(n => !n.read).length;
}

// Mettre à jour le badge de notification
function updateNotificationBadge() {
  const iconBtn = document.querySelector('.icon-btn');
  if (!iconBtn) return;
  
  const unreadCount = getUnreadCount();
  const existingBadge = iconBtn.querySelector('.notification-badge');
  
  if (existingBadge) {
    existingBadge.remove();
  }
  
  if (unreadCount > 0) {
    const badge = document.createElement('span');
    badge.className = 'notification-badge';
    badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
    iconBtn.style.position = 'relative';
    iconBtn.appendChild(badge);
  }
}

// Créer le panneau de notifications
function createNotificationPanel() {
  // Vérifier si le panneau existe déjà
  if (document.querySelector('.notification-panel')) return;
  
  const panel = document.createElement('div');
  panel.className = 'notification-panel';
  panel.innerHTML = `
    <div class="notification-header">
      <h3>Notifications</h3>
      <button class="close-notifications">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="notifications-list"></div>
    <div class="notification-footer">
      <button class="mark-all-read">Mark all as read</button>
    </div>
  `;
  
  document.body.appendChild(panel);
  
  // Overlay pour fermer en cliquant à l'extérieur
  const overlay = document.createElement('div');
  overlay.className = 'notification-overlay';
  document.body.appendChild(overlay);
  
  return panel;
}

// Afficher les notifications
function renderNotifications() {
  const panel = document.querySelector('.notification-panel');
  if (!panel) return;
  
  const listContainer = panel.querySelector('.notifications-list');
  if (!listContainer) return;
  
  if (notifications.length === 0) {
    listContainer.innerHTML = `
      <div style="text-align: center; padding: 3rem;">
        <span class="material-symbols-outlined" style="font-size: 3rem; color: var(--outline);">notifications_off</span>
        <p style="margin-top: 1rem; color: var(--on-surface-variant);">No notifications yet</p>
      </div>
    `;
    return;
  }
  
  listContainer.innerHTML = notifications.map(notification => `
    <div class="notification-item ${notification.read ? '' : 'unread'}" data-id="${notification.id}">
      <div class="notification-icon">
        <span class="material-symbols-outlined">${notification.icon}</span>
      </div>
      <div class="notification-content">
        <div class="notification-title">${notification.title}</div>
        <div class="notification-message">${notification.message}</div>
        <div class="notification-time">${notification.time}</div>
        ${!notification.read ? `<button class="mark-read-btn" data-id="${notification.id}">Mark as read</button>` : ''}
      </div>
    </div>
  `).join('');
  
  // Ajouter les événements pour marquer comme lu
  document.querySelectorAll('.mark-read-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      markAsRead(id);
    });
  });
  
  // Ajouter les événements pour cliquer sur une notification
  document.querySelectorAll('.notification-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (!e.target.classList.contains('mark-read-btn')) {
        const id = parseInt(item.dataset.id);
        markAsRead(id);
        closeNotificationPanel();
        // Rediriger ou ouvrir le contenu lié à la notification
        console.log(`Notification ${id} clicked`);
      }
    });
  });
}

// Marquer une notification comme lue
function markAsRead(id) {
  const notification = notifications.find(n => n.id === id);
  if (notification && !notification.read) {
    notification.read = true;
    saveNotifications();
    renderNotifications();
    updateNotificationBadge();
  }
}

// Marquer toutes les notifications comme lues
function markAllAsRead() {
  notifications.forEach(n => {
    n.read = true;
  });
  saveNotifications();
  renderNotifications();
  updateNotificationBadge();
}

// Ouvrir le panneau de notifications
function openNotificationPanel() {
  let panel = document.querySelector('.notification-panel');
  if (!panel) {
    panel = createNotificationPanel();
  }
  
  const overlay = document.querySelector('.notification-overlay');
  
  renderNotifications();
  panel.classList.add('open');
  if (overlay) overlay.classList.add('active');
}

// Fermer le panneau de notifications
function closeNotificationPanel() {
  const panel = document.querySelector('.notification-panel');
  const overlay = document.querySelector('.notification-overlay');
  
  if (panel) panel.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
}

// Ajouter une nouvelle notification
function addNotification(title, message, icon = 'notifications') {
  const newNotification = {
    id: Date.now(),
    title: title,
    message: message,
    time: 'Just now',
    read: false,
    icon: icon
  };
  
  notifications.unshift(newNotification);
  saveNotifications();
  updateNotificationBadge();
  
  // Si le panneau est ouvert, le rafraîchir
  const panel = document.querySelector('.notification-panel');
  if (panel && panel.classList.contains('open')) {
    renderNotifications();
  }
}

// Initialiser le système de notifications
function initNotifications() {
  loadNotifications();
  createNotificationPanel();
  
  // Événement pour le bouton de notification
  const notificationBtn = document.querySelector('.icon-btn');
  if (notificationBtn) {
    notificationBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const panel = document.querySelector('.notification-panel');
      if (panel && panel.classList.contains('open')) {
        closeNotificationPanel();
      } else {
        openNotificationPanel();
      }
    });
  }
  
  // Fermer avec le bouton close
  document.addEventListener('click', (e) => {
    if (e.target.closest('.close-notifications')) {
      closeNotificationPanel();
    }
    if (e.target.closest('.mark-all-read')) {
      markAllAsRead();
    }
  });
  
  // Fermer en cliquant sur l'overlay
  const overlay = document.querySelector('.notification-overlay');
  if (overlay) {
    overlay.addEventListener('click', closeNotificationPanel);
  }
  
  // Exemple d'ajout automatique de notification (optionnel)
  // Décommentez pour tester
  // setTimeout(() => {
  //   addNotification('Welcome!', 'Bienvenue sur Ghassra Core !', 'celebration');
  // }, 2000);
}

// Appeler l'initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
  initNotifications();
});