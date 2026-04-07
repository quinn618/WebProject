// ===== GESTION DES FILTRES =====

// Données des ressources (simulation - à remplacer par API plus tard)
const resourcesData = {
    'all': [
        {
            id: 1,
            title: "Network Layers Flashcards",
            author: "@alex_dev",
            authorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCfio7ZxNuPRGSh6frca2gv2eaktUD6Qa9HgI64rh9AQat8dWEa1C1767SoDuOhiRHoEMV55SopSvG3iRgJ2E97FdUGvUnJTzLvdJfDFhvIYwfSBFyqCWGDTfNwOMGOkX7HrnKIG8nY_eDQZkIcrxouMCKSB3oe2sEpSFo7_YQJxEkI-_9_IxR97vaQYS5kQckDBt9BqnCQyn4uXeln7yM-ohOrAgC8RYFPIww3fjHwUDu4TTRX-EIx4BVUrKlcLb6dkqRrK7npAv8",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLIvvZR-vOvY-xOhxNHqD1PEUouAwZGzq88mPm85Eohx2MiQwkrY1fWuf1yFhSXEGJSHPWPGsvmH2-M8PJp0ELg0ZSrqLFLDju2YvvlPY5AUkRMo0p6P_qbjefwUvpDx2fSHtPebXrg5i3FPHgTlOaVK4VC11To_vjp-cMdCHbpcI4WKRESFabtChQS3kRCu4K-0p80dCHHAVy5yhfzwvxu8MhzAiBwSzYcaL8EqjurLzjAiuGGm1Rn6WyqLXUiECMMEcbg7FP2bg",
            badge: "High Aura",
            badgeClass: "badge-teal",
            fileType: "PDF",
            category: "exam"
        },
        {
            id: 2,
            title: "C++ Cheat Sheet",
            author: "@sarah_codes",
            authorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLOdt_azSLBKfJ7a1qliPKwl_fDx6459gCWLtSHMdOmlIK0GTniOx4l9TojfsCvnekrhhDxLc16U0DbgpAKA61EbJPTs-2Or2HBB73Cz8vQbwu4jzfX3KTvVxvLZAXT66luZ5Dvgbjx-K4v6oFq6rPb5WbtPrt-3DaoWAGRlXK_KM2M8ap1Q7_4XoQ3Shl4s59mfURCgIw9_-Khjkz-pOXINszon82k6zJZAncvwFFXYjvDtiplZ7UrVMrmsNRLSj9whPTYLddjck",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAR78IPdijBGEU43W03I2TT7WmTNi4hdMBxDZP84tFdv3A-p5WXQ7mecquk4URc-cdE3F0wwuwHwK9Wtrti6-BEcXS3RdEmSqoZFA5mtGSin8ad1p0LXEVjqyaqGq29ZG8A4WMD63uN0UCIuXLN-zzg1AVHfSRrq8vfvJqUvR0WOGXR1tpGEjXjrvBRMSnlPRlUpE97wGpubo4KozRpSuDyHQZG28Ag7HDTe3dZmeGVJH4_TfzzXTWV0lVMtt1JstWWMBSzHkBlJb0",
            badge: "Essential",
            badgeClass: "badge-blue",
            fileType: "Image",
            category: "cheat-sheet"
        },
        {
            id: 3,
            title: "Arduino Sensor Wiring",
            author: "@iot_master",
            authorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDgVtTlvqewP0jV209SNcKhbrv1ePJvkq1UCyPquzAxX-66ePpBZgEhJRQ8juIUqVCFDsPInwx5SCG-QDtc1RDheIw8ZV4AbA9VbF51CFGH4qz4CajNnEesPQ4NywS-Xsl3VpVGGoAwWhUnmmoPcDLgr8HUCNyKnHK5Q7jU5M-YEfUYGTETue93TgDoVp_Gj5yN1uyNSFrMY7pqUKIycP87VKp18j0jc5wQxbF1Pvr6fxZwmWERHo62iwrNK5q99gctHRfGbwixD5Y",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBVzuykQeRzjDA5Kvz5wwk84lFDXqTXHGbVKgzfew5eOeTykZk3U9SPzz-43vq9zJA2OWoMvc0HVRR-ma7abWjN2WG1eLGr-FuuHwQ9K__bo6F3m04dKyo--0CtCiCfI6hjgu_ywKKrbn6yXZbexjwtG5rPF1XVQ3AMhFbXCYEXpmJJIzuq-DkhYvrxMtWoeCfSBgd3ijZU4MmGA56NwluyYdVObp26ewY0Vu5eT-TUbMB_XIE5R5vK_k2viJwqADk5FmGH9hlTOAc",
            badge: "Expert",
            badgeClass: "badge-red",
            fileType: "Diagram",
            category: "circuit"
        },
        {
            id: 4,
            title: "Advanced Data Structures",
            author: "@prof_x",
            authorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDd0ADTG0Uew2sGCpE-nV3Y7bzRnaFsC377LgKUPWl6U1Rvk3cmyM-56S-d1n72spskzBQfunsqOtRB4qZiZT1O0nvtK4Nk8X5lBZeP_S0syFtG87Ov2tNAIFs8kz2_qnoJtcU0qYoyvXC5K6ksmny08HjaKrFhAOKQyegOfaDIXrxLsPt1KnsI7GY5b7g0-935pX_uKxntMjIcaNO_Fzibt6TFmH_lgyBy3DiLmEBtY4ZVFlhbvHlV73Z1tIIluYlPoO8s2jbIaTA",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBtbeTCK0WMC4GcjbFgmjvtQ7fnMPJg9UduxYR-Z657akzWOh-xr7c_fcYCHu2u9w9SiN37xF4UkhtiyO4HtDUjqPdBjW2BVCgJF-lkfYPQA6SUdysu5yaBSa-RLWtqWIHqWc54QBKI5g18KzBBkWWa2gYxktP7x_cbFCfd3UVl6DgqvYsSfxJ3sOCX__rrtXMN9ioc_TlBROPZxBAp2s9sxvJX1eaEIRlvu9UizvzjeP6pyVTxgt-z_16SnGuenOiZzVlEGFZ56kk",
            badge: "High Aura",
            badgeClass: "badge-teal",
            fileType: "Notes",
            category: "exam"
        },
        {
            id: 5,
            title: "Cloud Infrastructure Basics",
            author: "@cloud_dev",
            authorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDe8UU4urSxyffjrgkNosKPTJ1l-zham4uhK85H0FcrqFlBZaiEH-amghjlGNKjFDZ9qIIR9huQnB9NkewbrkVCrQgHefZLy4QafXbgJgzJ4sj1iSKX7fWMuq5pcqtT1JAtrIt6hEzSoPjmB9IOqwiL2x0_wXBuxmrhBPAZHD5v4bSKhW_Z64FCGEcaVsswE6bD43TNGhPGB4a7AR8vzkfg_Xo8VkdPFj7_cv_Gvatp4fJyp8AjyHGGHSLmAQR7d8K3gcrXMheYxd0",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBvFiA7OzA1nt_tuzBZP1QRb__jOPWMHKExFN5fDTjpe3gHki0uQpzzjyHo-jyQ6B1OijA3xmEUY_zFTC9EEBDCSvmnPFewhBvQM5aOXR7AIJrvp4aG4tk6mXq7XrX8upz8a2FVLPIeV9rz08qA-fblOVdgL7-G-7ysLaEv_vXw-DnGEWZ0mpBOoHUZTjRubLEQO8Eliqq3_6bMH7vTsttTIcJTkWPWinGp7GQTSstiNQ3lPT3_JOSbxn4NMnqAp4YCJWXJWl_MKC4",
            badge: "Popular",
            badgeClass: "badge-blue",
            fileType: "Slide",
            category: "exam"
        },
        {
            id: 6,
            title: "Embedded RTOS Systems",
            author: "@real_time_guy",
            authorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAA2qT3D3rAavdXgqWdcq4IQOOP0UclzOCycaT4Z7L1M6fpotGuoxjQ5DdoW7rSWeccCW4DQlQY4Fd2CmQJ_vgjiSlLeGBQB6Vr-vAgjyjBtIKS-CCOB5ikcavAQrXM1g-AF-860EvQvhqJ3hla9rcWIh7tT585HnxAxogVzJjklyg_RIQRtQxGRKFHPyufETF9cl9D7sNABka5Rkg3bbc9w5YxwYkU7iUgS1gX8p36RRr_ZQ4a4Z1JgJtmVrTkAJlCY80aU-idPxY",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPh70gCwO5Wwm5UuchFBCpl5vwcmDEHkkV8VcQMkex64TYnflAs7y3iTFysu1CXY1r8gjTiXxXfvw4BawP1IOQMn0r2t7UzVFyA3kkU6zUpfIPEViVbPfY8sakr7wf14zbcOLoThigvwTGZj8PG-Ho5akvshvu5QqLyndeAObwn2Z-I6K6LoSbSGH3v21XXutoD-xPe6z4VR8FDyK9LaNOvpVED9cfTgM347d6nZFjcYQQNP_1yB9OEu4gsC2Wkym8E1E3QVFi7K4",
            badge: "New",
            badgeClass: "badge-teal",
            fileType: "Code",
            category: "code"
        }
    ],
    'exam': [
        // Resources de type exam (id 1, 4, 5)
    ],
    'circuit': [
        // Resources de type circuit (id 3)
    ],
    'cheat-sheet': [
        // Resources de type cheat-sheet (id 2)
    ],
    'code': [
        // Resources de type code (id 6)
    ]
};

// Remplir les catégories
resourcesData.exam = resourcesData.all.filter(r => r.category === 'exam');
resourcesData.circuit = resourcesData.all.filter(r => r.category === 'circuit');
resourcesData['cheat-sheet'] = resourcesData.all.filter(r => r.category === 'cheat-sheet');
resourcesData.code = resourcesData.all.filter(r => r.category === 'code');

// État actuel du filtre
let currentFilter = 'all';

// Fonction pour générer une carte HTML
function generateCard(resource) {
    return `
        <div class="resource-card" data-id="${resource.id}">
            <div class="card-img-wrap">
                <img src="${resource.image}" alt="${resource.title}"/>
                <span class="card-badge ${resource.badgeClass}">${resource.badge}</span>
            </div>
            <h3 class="card-title">${resource.title}</h3>
            <div class="card-author">
                <div class="author-avatar bg-purple">
                    <img src="${resource.authorAvatar}" alt="${resource.author}"/>
                </div>
                <span class="author-name">${resource.author}</span>
            </div>
            <div class="card-footer">
                <span class="file-type">${resource.fileType}</span>
                <button class="action-btn" aria-label="Download" onclick="handleDownload(${resource.id})">
                    <span class="material-symbols-outlined">download</span>
                </button>
            </div>
        </div>
    `;
}

// Fonction pour afficher les ressources selon le filtre
function filterResources(filter) {
    currentFilter = filter;
    
    let filteredResources = [];
    
    switch(filter) {
        case 'all':
            filteredResources = resourcesData.all;
            break;
        case 'exam':
            filteredResources = resourcesData.exam;
            break;
        case 'circuit':
            filteredResources = resourcesData.circuit;
            break;
        case 'cheat-sheet':
            filteredResources = resourcesData['cheat-sheet'];
            break;
        case 'code':
            filteredResources = resourcesData.code;
            break;
        default:
            filteredResources = resourcesData.all;
    }
    
    const cardsGrid = document.querySelector('.cards-grid');
    if (cardsGrid) {
        cardsGrid.innerHTML = filteredResources.map(resource => generateCard(resource)).join('');
    }
    
    // Mettre à jour l'état actif des chips
    updateActiveChip(filter);
}

// Mettre à jour le style des chips
function updateActiveChip(activeFilter) {
    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
        chip.classList.remove('chip-active');
        
        const chipText = chip.textContent.toLowerCase();
        let chipValue = '';
        
        if (chipText === 'all files') chipValue = 'all';
        else if (chipText === 'exam papers') chipValue = 'exam';
        else if (chipText === 'circuit diagrams') chipValue = 'circuit';
        else if (chipText === 'cheat sheets') chipValue = 'cheat-sheet';
        else if (chipText === 'code snippets') chipValue = 'code';
        
        if (chipValue === activeFilter) {
            chip.classList.add('chip-active');
        }
    });
}

// Gestionnaire de téléchargement
function handleDownload(resourceId) {
    console.log(`Téléchargement de la ressource ${resourceId}`);
    // À connecter avec votre API plus tard
    showToast(`Téléchargement démarré pour la ressource #${resourceId}`, 'success');
}

// Notification toast
function showToast(message, type = 'info') {
    // Supprimer les toasts existants
    const existingToasts = document.querySelectorAll('.custom-toast');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `custom-toast toast-${type}`;
    toast.innerHTML = `
        <span class="material-symbols-outlined">
            ${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}
        </span>
        <span>${message}</span>
    `;
    
    // Styles du toast
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 20px;
        background: white;
        padding: 12px 20px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
        font-family: 'Be Vietnam Pro', sans-serif;
        font-size: 0.875rem;
        border-left: 4px solid ${type === 'success' ? '#4caf50' : type === 'error' ? '#f76a80' : '#3d57bb'};
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Ajouter les animations CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .chip {
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .cards-grid {
        transition: all 0.3s ease;
    }
    
    .resource-card {
        animation: fadeIn 0.4s ease;
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Initialisation des événements
function initFilters() {
    const chips = document.querySelectorAll('.chip');
    
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            const chipText = chip.textContent.toLowerCase();
            
            let filter = '';
            if (chipText === 'all files') filter = 'all';
            else if (chipText === 'exam papers') filter = 'exam';
            else if (chipText === 'circuit diagrams') filter = 'circuit';
            else if (chipText === 'cheat sheets') filter = 'cheat-sheet';
            else if (chipText === 'code snippets') filter = 'code';
            
            filterResources(filter);
        });
    });
}

// Recherche de ressources
function initSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.btn-find');
    
    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        
        if (query === '') {
            filterResources(currentFilter);
            return;
        }
        
        let resourcesToSearch = [];
        switch(currentFilter) {
            case 'all':
                resourcesToSearch = resourcesData.all;
                break;
            case 'exam':
                resourcesToSearch = resourcesData.exam;
                break;
            case 'circuit':
                resourcesToSearch = resourcesData.circuit;
                break;
            case 'cheat-sheet':
                resourcesToSearch = resourcesData['cheat-sheet'];
                break;
            case 'code':
                resourcesToSearch = resourcesData.code;
                break;
            default:
                resourcesToSearch = resourcesData.all;
        }
        
        const filtered = resourcesToSearch.filter(resource => 
            resource.title.toLowerCase().includes(query) ||
            resource.author.toLowerCase().includes(query) ||
            resource.fileType.toLowerCase().includes(query)
        );
        
        const cardsGrid = document.querySelector('.cards-grid');
        if (cardsGrid) {
            if (filtered.length === 0) {
                cardsGrid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                        <span class="material-symbols-outlined" style="font-size: 3rem; color: var(--outline);">search_off</span>
                        <p style="margin-top: 1rem; color: var(--on-surface-variant);">Aucun résultat trouvé pour "${query}"</p>
                    </div>
                `;
            } else {
                cardsGrid.innerHTML = filtered.map(resource => generateCard(resource)).join('');
            }
        }
        
        if (filtered.length > 0) {
            showToast(`${filtered.length} ressource(s) trouvée(s)`, 'success');
        } else {
            showToast('Aucun résultat trouvé', 'info');
        }
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

// Animation du FAB (Floating Action Button)
function initFAB() {
    const fab = document.querySelector('.fab');
    if (fab) {
        fab.addEventListener('click', () => {
            showToast('Formulaire d\'ajout de ressource (bientôt disponible)', 'info');
            // À connecter avec un modal ou une page d'upload plus tard
        });
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    initFilters();
    initSearch();
    initFAB();
    
    // Animation d'entrée pour les cartes
    const cards = document.querySelectorAll('.resource-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.05}s`;
    });
});

// Exporter les fonctions pour une utilisation globale
window.filterResources = filterResources;
window.handleDownload = handleDownload;
window.showToast = showToast;


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