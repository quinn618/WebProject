// ===== GESTION DES FILTRES =====

// Données des ressources (simulation - à remplacer par API plus tard)

// Objet contenant toutes les ressources classées par catégorie
const resourcesData = {
    // Catégorie 'all' : contient toutes les ressources sans filtre
    'all': [
        {
            id: 1,  // Identifiant unique de la ressource
            title: "Network Layers Flashcards",  // Titre du document
            author: "@alex_dev",  // Nom de l'auteur
            authorAvatar: "https://...",  // URL de l'avatar de l'auteur
            image: "https://...",  // URL de l'image d'aperçu
            badge: "High Aura",  // Badge de qualité
            badgeClass: "badge-teal",  // Classe CSS pour le style du badge
            fileType: "PDF",  // Type de fichier
            category: "exam"  // Catégorie de la ressource
        },
        // ... autres ressources similaires
    ],
    // Ces catégories seront remplies automatiquement plus bas
    'exam': [],     // Ressources de type examen
    'circuit': [],  // Ressources de type circuit
    'cheat-sheet': [],  // Ressources de type aide-mémoire
    'code': []      // Ressources de type code
};

// Remplir les catégories automatiquement en filtrant le tableau 'all'
// .filter() crée un nouveau tableau avec les éléments qui correspondent à la condition
resourcesData.exam = resourcesData.all.filter(r => r.category === 'exam');
resourcesData.circuit = resourcesData.all.filter(r => r.category === 'circuit');
resourcesData['cheat-sheet'] = resourcesData.all.filter(r => r.category === 'cheat-sheet');
resourcesData.code = resourcesData.all.filter(r => r.category === 'code');

// État actuel du filtre (par défaut 'all' pour afficher tout)
let currentFilter = 'all';

// Fonction pour générer une carte HTML à partir d'une ressource
// Prend un objet resource en paramètre et retourne une chaîne HTML
function generateCard(resource) {
    return `
        <div class="resource-card" data-id="${resource.id}">  <!-- Conteneur principal de la carte -->
            <div class="card-img-wrap">  <!-- Zone pour l'image -->
                <img src="${resource.image}" alt="${resource.title}"/>  <!-- Image de la ressource -->
                <span class="card-badge ${resource.badgeClass}">${resource.badge}</span>  <!-- Badge (High Aura, Essential, etc.) -->
            </div>
            <h3 class="card-title">${resource.title}</h3>  <!-- Titre de la ressource -->
            <div class="card-author">  <!-- Zone auteur -->
                <div class="author-avatar bg-purple">  <!-- Avatar de l'auteur -->
                    <img src="${resource.authorAvatar}" alt="${resource.author}"/>
                </div>
                <span class="author-name">${resource.author}</span>  <!-- Nom de l'auteur -->
            </div>
            <div class="card-footer">  <!-- Pied de carte -->
                <span class="file-type">${resource.fileType}</span>  <!-- Type de fichier -->
                <button class="action-btn" aria-label="Download" onclick="handleDownload(${resource.id})">  <!-- Bouton téléchargement -->
                    <span class="material-symbols-outlined">download</span>
                </button>
            </div>
        </div>
    `;
}

// Fonction pour afficher les ressources selon le filtre sélectionné
// Prend un paramètre 'filter' qui détermine quelle catégorie afficher
function filterResources(filter) {
    currentFilter = filter;  // Mettre à jour le filtre actuel
    
    let filteredResources = [];  // Tableau qui contiendra les ressources filtrées
    
    // Switch pour choisir quelles ressources afficher selon le filtre
    switch(filter) {
        case 'all':  // Si filtre = 'all'
            filteredResources = resourcesData.all;  // Prendre toutes les ressources
            break;
        case 'exam':  // Si filtre = 'exam'
            filteredResources = resourcesData.exam;  // Prendre seulement les examens
            break;
        case 'circuit':  // Si filtre = 'circuit'
            filteredResources = resourcesData.circuit;  // Prendre seulement les circuits
            break;
        case 'cheat-sheet':  // Si filtre = 'cheat-sheet'
            filteredResources = resourcesData['cheat-sheet'];  // Prendre seulement les cheat sheets
            break;
        case 'code':  // Si filtre = 'code'
            filteredResources = resourcesData.code;  // Prendre seulement les codes
            break;
        default:  // Si filtre inconnu
            filteredResources = resourcesData.all;  // Prendre toutes les ressources par défaut
    }
    
    // Sélectionner le conteneur des cartes dans le DOM
    const cardsGrid = document.querySelector('.cards-grid');
    if (cardsGrid) {  // Si le conteneur existe
        // Remplacer le contenu HTML par les nouvelles cartes générées
        // .map() transforme chaque ressource en HTML, .join() fusionne le tout
        cardsGrid.innerHTML = filteredResources.map(resource => generateCard(resource)).join('');
    }
    
    // Mettre à jour l'état actif des chips (boutons de filtre)
    updateActiveChip(filter);
}

// Mettre à jour le style des chips (boutons de filtre)
// Prend le filtre actif en paramètre pour surligner le bon bouton
function updateActiveChip(activeFilter) {
    // Sélectionner tous les éléments avec la classe 'chip'
    const chips = document.querySelectorAll('.chip');
    
    // Boucler sur chaque chip
    chips.forEach(chip => {
        // Enlever la classe 'chip-active' de tous les chips
        chip.classList.remove('chip-active');
        
        // Récupérer le texte du chip en minuscules
        const chipText = chip.textContent.toLowerCase();
        let chipValue = '';  // Variable pour stocker la valeur du filtre
        
        // Convertir le texte du chip en valeur de filtre
        if (chipText === 'all files') chipValue = 'all';
        else if (chipText === 'exam papers') chipValue = 'exam';
        else if (chipText === 'circuit diagrams') chipValue = 'circuit';
        else if (chipText === 'cheat sheets') chipValue = 'cheat-sheet';
        else if (chipText === 'code snippets') chipValue = 'code';
        
        // Si la valeur du chip correspond au filtre actif
        if (chipValue === activeFilter) {
            chip.classList.add('chip-active');  // Ajouter la classe active
        }
    });
}

// Gestionnaire de téléchargement
// Fonction appelée quand l'utilisateur clique sur le bouton de téléchargement
function handleDownload(resourceId) {
    console.log(`Téléchargement de la ressource ${resourceId}`);  // Log dans la console
    // À connecter avec votre API plus tard
    showToast(`Téléchargement démarré pour la ressource #${resourceId}`, 'success');
}

// Notification toast (message popup temporaire)
// Affiche un message qui disparaît après quelques secondes
function showToast(message, type = 'info') {
    // Supprimer les toasts existants pour éviter les doublons
    const existingToasts = document.querySelectorAll('.custom-toast');
    existingToasts.forEach(toast => toast.remove());
    
    // Créer un nouvel élément div pour le toast
    const toast = document.createElement('div');
    toast.className = `custom-toast toast-${type}`;  // Ajouter les classes CSS
    // Remplir le contenu HTML du toast
    toast.innerHTML = `
        <span class="material-symbols-outlined">
            ${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}
        </span>
        <span>${message}</span>
    `;
    
    // Appliquer les styles CSS directement en JavaScript
    toast.style.cssText = `
        position: fixed;  /* Position fixe par rapport à la fenêtre */
        bottom: 100px;    /* Distance du bas */
        right: 20px;      /* Distance de la droite */
        background: white;
        padding: 12px 20px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 1000;    /* S'assure que le toast est au-dessus des autres éléments */
        animation: slideInRight 0.3s ease;  /* Animation d'entrée */
        font-family: 'Be Vietnam Pro', sans-serif;
        font-size: 0.875rem;
        border-left: 4px solid ${type === 'success' ? '#4caf50' : type === 'error' ? '#f76a80' : '#3d57bb'};
    `;
    
    // Ajouter le toast au body de la page
    document.body.appendChild(toast);
    
    // Programmer la disparition du toast après 3 secondes
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';  // Animation de sortie
        setTimeout(() => toast.remove(), 300);  // Supprimer l'élément après l'animation
    }, 3000);
}

// Ajouter les animations CSS dynamiquement au document
// Créer un élément <style> et y ajouter des règles CSS
const style = document.createElement('style');
style.textContent = `
    /* Animation d'entrée depuis la droite */
    @keyframes slideInRight {
        from {
            transform: translateX(100%);  /* Commence en dehors de l'écran à droite */
            opacity: 0;  /* Invisible au début */
        }
        to {
            transform: translateX(0);  /* Position finale normale */
            opacity: 1;  /* Complètement visible */
        }
    }
    
    /* Animation de sortie vers la droite */
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
    
    /* Style des chips (boutons de filtre) */
    .chip {
        cursor: pointer;  /* Curseur en forme de main */
        transition: all 0.2s ease;  /* Transition douce pour les changements */
    }
    
    /* Conteneur des cartes */
    .cards-grid {
        transition: all 0.3s ease;
    }
    
    /* Animation d'apparition des cartes */
    .resource-card {
        animation: fadeIn 0.4s ease;
    }
    
    /* Animation fadeIn (apparition progressive) */
    @keyframes fadeIn {
        from {
            opacity: 0;  /* Invisible */
            transform: translateY(20px);  /* Décalé vers le bas */
        }
        to {
            opacity: 1;  /* Visible */
            transform: translateY(0);  /* Position normale */
        }
    }
`;
document.head.appendChild(style);  // Ajouter le style au <head> du document

// Initialisation des événements des filtres
// Cette fonction est appelée quand la page est chargée
function initFilters() {
    // Sélectionner tous les éléments avec la classe 'chip'
    const chips = document.querySelectorAll('.chip');
    
    // Pour chaque chip, ajouter un écouteur d'événement 'click'
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            // Récupérer le texte du chip en minuscules
            const chipText = chip.textContent.toLowerCase();
            
            // Déterminer le filtre correspondant
            let filter = '';
            if (chipText === 'all files') filter = 'all';
            else if (chipText === 'exam papers') filter = 'exam';
            else if (chipText === 'circuit diagrams') filter = 'circuit';
            else if (chipText === 'cheat sheets') filter = 'cheat-sheet';
            else if (chipText === 'code snippets') filter = 'code';
            
            // Appliquer le filtre
            filterResources(filter);
        });
    });
}

// Fonction de recherche de ressources
function initSearch() {
    // Sélectionner la barre de recherche et le bouton
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.btn-find');
    
    // Fonction interne pour effectuer la recherche
    function performSearch() {
        // Récupérer la requête en minuscules et sans espaces au début/fin
        const query = searchInput.value.toLowerCase().trim();
        
        // Si la requête est vide, réinitialiser l'affichage
        if (query === '') {
            filterResources(currentFilter);
            return;
        }
        
        // Déterminer dans quelle catégorie chercher selon le filtre actuel
        let resourcesToSearch = [];
        switch(currentFilter) {
            case 'all': resourcesToSearch = resourcesData.all; break;
            case 'exam': resourcesToSearch = resourcesData.exam; break;
            case 'circuit': resourcesToSearch = resourcesData.circuit; break;
            case 'cheat-sheet': resourcesToSearch = resourcesData['cheat-sheet']; break;
            case 'code': resourcesToSearch = resourcesData.code; break;
            default: resourcesToSearch = resourcesData.all;
        }
        
        // Filtrer les ressources qui contiennent la requête
        // .filter() garde uniquement les éléments qui correspondent
        const filtered = resourcesToSearch.filter(resource => 
            resource.title.toLowerCase().includes(query) ||  // Vérifie si le titre contient la requête
            resource.author.toLowerCase().includes(query) ||  // Vérifie si l'auteur contient la requête
            resource.fileType.toLowerCase().includes(query)   // Vérifie si le type de fichier contient la requête
        );
        
        // Sélectionner le conteneur des cartes
        const cardsGrid = document.querySelector('.cards-grid');
        if (cardsGrid) {
            // Si aucun résultat trouvé
            if (filtered.length === 0) {
                // Afficher un message "aucun résultat"
                cardsGrid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                        <span class="material-symbols-outlined" style="font-size: 3rem; color: var(--outline);">search_off</span>
                        <p style="margin-top: 1rem; color: var(--on-surface-variant);">Aucun résultat trouvé pour "${query}"</p>
                    </div>
                `;
            } else {
                // Afficher les résultats filtrés
                cardsGrid.innerHTML = filtered.map(resource => generateCard(resource)).join('');
            }
        }
        
        // Afficher un toast avec le nombre de résultats
        if (filtered.length > 0) {
            showToast(`${filtered.length} ressource(s) trouvée(s)`, 'success');
        } else {
            showToast('Aucun résultat trouvé', 'info');
        }
    }
    
    // Ajouter l'événement de clic sur le bouton de recherche
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    // Ajouter l'événement "Entrée" dans la barre de recherche
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {  // Si la touche pressée est Entrée
                performSearch();  // Lancer la recherche
            }
        });
    }
}

// Animation du FAB (Floating Action Button)
function initFAB() {
    const fab = document.querySelector('.fab');  // Sélectionner le bouton flottant
    if (fab) {
        fab.addEventListener('click', () => {
            showToast('Formulaire d\'ajout de ressource (bientôt disponible)', 'info');
        });
    }
}

// Initialisation au chargement de la page
// 'DOMContentLoaded' est déclenché quand le HTML est complètement chargé
document.addEventListener('DOMContentLoaded', () => {
    initFilters();   // Initialiser les filtres
    initSearch();    // Initialiser la recherche
    initFAB();       // Initialiser le bouton flottant
    
    // Animation d'entrée pour les cartes existantes
    const cards = document.querySelectorAll('.resource-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.05}s`;  // Décalage progressif
    });
});

// Exporter les fonctions pour une utilisation globale
// Ces fonctions seront accessibles depuis n'importe où (console, autres scripts)
window.filterResources = filterResources;
window.handleDownload = handleDownload;
window.showToast = showToast;


// ===== NOTIFICATIONS SYSTEM =====

// Tableau contenant toutes les notifications
let notifications = [
  {
    id: 1,                           // Identifiant unique
    title: "New Resource Available!", // Titre de la notification
    message: "C++ Advanced Memory Management guide has been added.", // Message
    time: "5 min ago",               // Temps écoulé depuis la notification
    read: false,                     // false = non lue, true = lue
    icon: "description"              // Icône Material Symbol à afficher
  },
  // ... autres notifications
];

// Sauvegarder les notifications dans le localStorage du navigateur
// localStorage permet de conserver des données entre les sessions
function saveNotifications() {
    // JSON.stringify convertit l'objet JavaScript en chaîne JSON
    localStorage.setItem('notifications', JSON.stringify(notifications));
}

// Charger les notifications depuis le localStorage
function loadNotifications() {
    // Récupérer la chaîne JSON stockée
    const saved = localStorage.getItem('notifications');
    if (saved) {
        // JSON.parse convertit la chaîne JSON en objet JavaScript
        notifications = JSON.parse(saved);
    }
    updateNotificationBadge();  // Mettre à jour le compteur
}

// Compter le nombre de notifications non lues
function getUnreadCount() {
    // .filter() garde les notifications où read === false
    // .length donne le nombre d'éléments dans le tableau filtré
    return notifications.filter(n => !n.read).length;
}

// Mettre à jour le badge (petit cercle avec le nombre) sur l'icône de notification
function updateNotificationBadge() {
    // Sélectionner le bouton d'icône
    const iconBtn = document.querySelector('.icon-btn');
    if (!iconBtn) return;  // Sortir si le bouton n'existe pas
    
    const unreadCount = getUnreadCount();  // Nombre de notifications non lues
    const existingBadge = iconBtn.querySelector('.notification-badge');  // Badge existant
    
    // Supprimer l'ancien badge s'il existe
    if (existingBadge) {
        existingBadge.remove();
    }
    
    // Si des notifications non lues existent
    if (unreadCount > 0) {
        const badge = document.createElement('span');  // Créer un nouveau badge
        badge.className = 'notification-badge';       // Ajouter la classe CSS
        // Afficher le nombre (ou '9+' si plus de 9)
        badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        iconBtn.style.position = 'relative';  // Nécessaire pour positionner le badge
        iconBtn.appendChild(badge);           // Ajouter le badge au bouton
    }
}

// Créer le panneau de notifications (la fenêtre qui s'affiche)
function createNotificationPanel() {
    // Vérifier si le panneau existe déjà
    if (document.querySelector('.notification-panel')) return;
    
    // Créer l'élément principal du panneau
    const panel = document.createElement('div');
    panel.className = 'notification-panel';
    // Remplir le HTML du panneau
    panel.innerHTML = `
        <div class="notification-header">  <!-- En-tête du panneau -->
            <h3>Notifications</h3>
            <button class="close-notifications">  <!-- Bouton pour fermer -->
                <span class="material-symbols-outlined">close</span>
            </button>
        </div>
        <div class="notifications-list"></div>  <!-- Liste des notifications -->
        <div class="notification-footer">  <!-- Pied du panneau -->
            <button class="mark-all-read">Mark all as read</button>  <!-- Tout marquer comme lu -->
        </div>
    `;
    
    // Ajouter le panneau au body de la page
    document.body.appendChild(panel);
    
    // Créer un overlay (fond semi-transparent) pour fermer en cliquant à l'extérieur
    const overlay = document.createElement('div');
    overlay.className = 'notification-overlay';
    document.body.appendChild(overlay);
    
    return panel;
}

// Afficher les notifications dans le panneau
function renderNotifications() {
    const panel = document.querySelector('.notification-panel');
    if (!panel) return;
    
    const listContainer = panel.querySelector('.notifications-list');
    if (!listContainer) return;
    
    // Si aucune notification
    if (notifications.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <span class="material-symbols-outlined" style="font-size: 3rem;">notifications_off</span>
                <p>No notifications yet</p>
            </div>
        `;
        return;
    }
    
    // Générer le HTML pour chaque notification
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
    
    // Ajouter les événements pour les boutons "Marquer comme lu"
    document.querySelectorAll('.mark-read-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();  // Empêche la propagation de l'événement
            const id = parseInt(btn.dataset.id);  // Récupérer l'ID de la notification
            markAsRead(id);  // Marquer comme lue
        });
    });
    
    // Ajouter les événements pour cliquer sur une notification
    document.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('mark-read-btn')) {
                const id = parseInt(item.dataset.id);
                markAsRead(id);
                closeNotificationPanel();
                console.log(`Notification ${id} clicked`);
            }
        });
    });
}

// Marquer une notification spécifique comme lue
function markAsRead(id) {
    // .find() cherche la notification avec l'ID correspondant
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
        notification.read = true;  // Changer le statut
        saveNotifications();        // Sauvegarder
        renderNotifications();      // Rafraîchir l'affichage
        updateNotificationBadge();  // Mettre à jour le badge
    }
}

// Marquer toutes les notifications comme lues
function markAllAsRead() {
    // Boucle sur chaque notification
    notifications.forEach(n => {
        n.read = true;  // Marquer chaque notification comme lue
    });
    saveNotifications();        // Sauvegarder
    renderNotifications();      // Rafraîchir l'affichage
    updateNotificationBadge();  // Mettre à jour le badge
}

// Ouvrir le panneau de notifications
function openNotificationPanel() {
    let panel = document.querySelector('.notification-panel');
    if (!panel) {
        panel = createNotificationPanel();  // Créer le panneau s'il n'existe pas
    }
    
    const overlay = document.querySelector('.notification-overlay');
    
    renderNotifications();                  // Afficher les notifications
    panel.classList.add('open');            // Ajouter la classe 'open' pour l'animation
    if (overlay) overlay.classList.add('active');
}

// Fermer le panneau de notifications
function closeNotificationPanel() {
    const panel = document.querySelector('.notification-panel');
    const overlay = document.querySelector('.notification-overlay');
    
    if (panel) panel.classList.remove('open');  // Enlever la classe 'open'
    if (overlay) overlay.classList.remove('active');
}

// Ajouter une nouvelle notification
function addNotification(title, message, icon = 'notifications') {
    const newNotification = {
        id: Date.now(),          // Utiliser le timestamp comme ID unique
        title: title,
        message: message,
        time: 'Just now',        // Temps = "à l'instant"
        read: false,             // Non lue par défaut
        icon: icon
    };
    
    notifications.unshift(newNotification);  // Ajouter au début du tableau
    saveNotifications();                     // Sauvegarder
    updateNotificationBadge();               // Mettre à jour le badge
    
    // Si le panneau est ouvert, le rafraîchir
    const panel = document.querySelector('.notification-panel');
    if (panel && panel.classList.contains('open')) {
        renderNotifications();
    }
}

// Initialiser le système de notifications
function initNotifications() {
    loadNotifications();          // Charger les notifications sauvegardées
    createNotificationPanel();    // Créer le panneau
    
    // Événement pour le bouton de notification (clique = ouvre/ferme)
    const notificationBtn = document.querySelector('.icon-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const panel = document.querySelector('.notification-panel');
            if (panel && panel.classList.contains('open')) {
                closeNotificationPanel();  // Fermer si ouvert
            } else {
                openNotificationPanel();   // Ouvrir si fermé
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
}

// Appeler l'initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    initNotifications();  // Démarrer le système de notifications
});