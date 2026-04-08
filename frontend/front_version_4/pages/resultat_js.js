// resultat_js.js - Version complète avec recherche et notifications

//  Écouteur d'événement =====
// Cette ligne attend que tout le HTML soit chargé avant d'exécuter le code
document.addEventListener('DOMContentLoaded', function() {
  
  //  Déclaration de l'URL de l'API =====
  // Variable qui stocke l'adresse de base de votre future API (à remplacer plus tard)
  const API_BASE_URL = 'https://votre-api.com/api';

  //  Début de la configuration des sections =====
  // Objet JavaScript contenant la configuration de chaque section de la page
  const sections = {
    
    // Configuration de la section "Tous les fichiers" =====
    'all-files-section': {           // Identifiant unique de la section dans le HTML
      linkId: 'all_files',            // ID du lien dans la barre latérale
      title: 'All Files',             // Titre affiché dans l'interface
      count: '124',                   // Nombre statique de documents
      type: 'all'                     // Type utilisé pour filtrer les données
    },
    
    //  Configuration de la section "Examens" =====
    'exam-papers-section': {
      linkId: 'exam_papers',
      title: 'Exam Papers',
      count: '42',
      type: 'exam'
    },
    
    // Configuration de la section "Aide-mémoire" =====
    'cheat-sheets-section': {
      linkId: 'cheat_sheets',
      title: 'Cheat Sheets',
      count: '31',
      type: 'cheat'
    },
    
    //  Configuration de la section "Code" =====
    'code-snippets-section': {
      linkId: 'code_snippets',
      title: 'Code Snippets',
      count: '56',
      type: 'code'
    }
  };
  
  //  Variables de cache =====
  // Stocke les ressources déjà chargées pour éviter de les recharger
  let cachedResources = {};
  
  // Stocke les ressources actuellement affichées (utilisé pour la recherche)
  let currentResources = [];
  
  // Stocke le type de section actuellement affichée
  let currentSectionType = 'all';
  
  //Fonction asynchrone pour récupérer les données =====
  // Le mot-clé 'async' permet d'utiliser 'await' à l'intérieur
  async function fetchSectionData(sectionType) {
    
    // Bloc try/catch pour gérer les erreurs =====
    try {
      
      // Données mockées (simulation) =====
      // Ces données remplacent temporairement une vraie API
      const mockData = {
        
        // Toutes les ressources =====
        all: [
          { 
            id: 1,                                    // Identifiant unique
            title: "Network Layers Flashcards",       // Titre du document
            author: "@alex_dev",                      // Nom de l'auteur
            description: "Complete guide to OSI model layers", // Description
            icon: "description",                      // Icône Material Symbol
            fileType: "PDF",                          // Type de fichier
            badge: "High Aura",                       // Badge de qualité
            badgeClass: "badge-teal",                 // Classe CSS du badge
            image: "data:image/jpeg;base64,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"                      // URL de l'image
          },
          // ... autres ressources similaires
        ],
        
        //  Ressources de type examen =====
        exam: [ /* contenu des examens */ ],
        
        //  Ressources de type aide-mémoire =====
        cheat: [ /* contenu des cheat sheets */ ],
        
        // Ressources de type code =====
        code: [ /* contenu des snippets */ ]
      };
      
      // Retourne les données correspondantes =====
      // L'opérateur || retourne mockData.all si sectionType n'existe pas
      return mockData[sectionType] || mockData.all;
      
    //  Gestion des erreurs =====
    } catch (error) {
      // Affiche l'erreur dans la console du navigateur
      console.error('Erreur API:', error);
      // Retourne un tableau vide pour éviter de casser l'application
      return [];
    }
  }
  
  // Fonction de rendu des ressources =====
  // Transforme les données en HTML pour l'affichage
  function renderResources(resources) {
    
    //  Vérification des données =====
    // Si pas de ressources ou tableau vide
    if (!resources || resources.length === 0) {
      // Retourne un message d'absence de résultat
      return '<div class="no-results" style="text-align: center; padding: 3rem;">Aucune ressource trouvée</div>';
    }
    
    //  Génération du HTML =====
    // Retourne une chaîne de caractères HTML
    return `
      <div class="results-grid">
        ${resources.map(resource => `
          <div class="result-card" data-id="${resource.id}">
            <div class="card-header">
              <div class="card-icon">
                <span class="material-symbols-outlined">${resource.icon || 'description'}</span>
              </div>
              <div>
                <h3 class="card-title">${resource.title}</h3>
                <p class="card-meta">Uploaded by <span class="author-name">${resource.author}</span></p>
              </div>
            </div>
            ${resource.image ? `
              <div class="card-img-wrap" style="margin: 1rem 0; border-radius: 12px; overflow: hidden; height: 150px; position: relative;">
                <img src="${resource.image}" alt="${resource.title}" style="width: 100%; height: 100%; object-fit: cover;">
                ${resource.badge ? `<span class="card-badge ${resource.badgeClass || 'badge-teal'}" style="position: absolute; top: 10px; right: 10px;">${resource.badge}</span>` : ''}
              </div>
            ` : ''}
            <p class="card-description">${resource.description || 'Aucune description'}</p>
            <div class="card-tags">
              <span class="tag tag-outline">${resource.fileType || 'Document'}</span>
            </div>
            <div class="card-footer">
              <span class="file-type">${resource.fileType || 'Fichier'}</span>
              <button class="action-btn" onclick="window.handleDownload(${resource.id})">
                <span class="material-symbols-outlined">download</span>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  //Fonction d'affichage d'une section =====
  async function showSection(sectionId, section, activeLink) {
    
    // Cacher toutes les sections =====
    // Sélectionne tous les éléments avec la classe 'content-section'
    document.querySelectorAll('.content-section').forEach(s => {
      // Retire la classe 'active' de chaque section (les cache)
      s.classList.remove('active');
    });
    
    // Récupérer la section cible =====
    const targetSection = document.getElementById(sectionId);
    
    // Si la section existe =====
    if (targetSection) {
      // Ajoute la classe 'active' pour afficher la section
      targetSection.classList.add('active');
      
      // Affiche un message de chargement temporaire
      targetSection.innerHTML = '<div class="loading-placeholder" style="text-align: center; padding: 3rem;">Chargement...</div>';
      
      //Charger les données =====
      // Appelle l'API pour récupérer les ressources
      const resources = await fetchSectionData(section.type);
      
      // Stocke les ressources pour la recherche future
      currentResources = resources;
      
      // Mémorise le type de section actuel
      currentSectionType = section.type;
      
      // Met en cache les ressources
      cachedResources[section.type] = resources;
      
      // Affiche les ressources dans la section
      targetSection.innerHTML = renderResources(resources);
      
      // Initialise les animations des cartes
      autoInitGrids();
    }
    
    // mettre à jour l'interface =====
    // Récupère les éléments d'affichage
    const currentFilterSpan = document.getElementById('current-filter');
    const resultsCountSpan = document.getElementById('nbre_document_trouver');
    
    // Met à jour le titre avec le nom de la section
    if (currentFilterSpan) {
      currentFilterSpan.innerHTML = `"${section.title}"`;
    }
    
    // Met à jour le compteur de documents
    if (resultsCountSpan) {
      resultsCountSpan.textContent = section.count;
    }
    
    // Mettre à jour la sidebar =====
    // Retire la classe 'active' de tous les liens
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.classList.remove('active');
    });
    
    // Ajoute la classe 'active' au lien cliqué
    if (activeLink) {
      activeLink.classList.add('active');
    }
    
    // Réinitialiser la recherche =====
    const searchInput = document.querySelector('.search-input-desktop');
    if (searchInput) {
      searchInput.value = '';  // Vide le champ de recherche
    }
  }
  
  // Fonction d'initialisation des grilles =====
  function autoInitGrids() {
    // Trouve la section active
    const activeSection = document.querySelector('.content-section.active');
    
    // Si une section active existe
    if (activeSection) {
        // Trouve la grille dans la section
        const grid = activeSection.querySelector('.results-grid');
        
        // Si la grille existe et contient des éléments
        if (grid && grid.children.length > 0) {
            // Récupère toutes les cartes
            const cards = grid.querySelectorAll('.result-card');
            
            // Pour chaque carte, ajoute une animation progressive
            cards.forEach((card, i) => {
                // i * 0.03 crée un délai progressif : 0s, 0.03s, 0.06s, etc.
                card.style.animation = `fadeInUp 0.2s ease ${i * 0.03}s forwards`;
            });
        }
    }
  }
  
  // Fonction de recherche =====
  async function performSearch() {
    // Récupère l'élément de recherche
    const searchInput = document.querySelector('.search-input-desktop');
    
    // Récupère la requête (en minuscules, sans espaces)
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    
    // Récupère les éléments d'affichage
    const currentFilterSpan = document.getElementById('current-filter');
    const resultsCountSpan = document.getElementById('nbre_document_trouver');
    
    //Si la requête est vide =====
    if (query === "") {
      // Récupère le lien actif dans la sidebar
      const activeLink = document.querySelector('.sidebar-link.active');
      
      // Si un lien actif existe
      if (activeLink) {
        // Récupère l'ID du span à l'intérieur
        const spanId = activeLink.querySelector('span[id]')?.id;
        
        // Parcourt toutes les sections pour trouver celle correspondante
        for (const [sectionId, section] of Object.entries(sections)) {
          if (section.linkId === spanId) {
            // Recharge la section
            await showSection(sectionId, section, activeLink);
            break;  // Sort de la boucle
          }
        }
      }
      
      // Affiche un message de confirmation
      showToast("Affichage de tous les documents", "info");
      return;  // Sort de la fonction
    }
    
    //Filtrer les ressources =====
    const filtered = currentResources.filter(resource => 
      // Vérifie si le titre contient la requête
      (resource.title && resource.title.toLowerCase().includes(query)) ||
      // Vérifie si l'auteur contient la requête
      (resource.author && resource.author.toLowerCase().includes(query)) ||
      // Vérifie si le type de fichier contient la requête
      (resource.fileType && resource.fileType.toLowerCase().includes(query)) ||
      // Vérifie si le badge contient la requête
      (resource.badge && resource.badge.toLowerCase().includes(query)) ||
      // Vérifie si la description contient la requête
      (resource.description && resource.description.toLowerCase().includes(query))
    );
    
    //Afficher les résultats =====
    const activeSection = document.querySelector('.content-section.active');
    
    // Si une section active existe
    if (activeSection) {
      // Si aucun résultat trouvé
      if (filtered.length === 0) {
        // Affiche un message "aucun résultat"
        activeSection.innerHTML = `
          <div style="text-align: center; padding: 3rem;">
            <span class="material-symbols-outlined" style="font-size: 3rem; color: var(--outline);">search_off</span>
            <p style="margin-top: 1rem; color: var(--on-surface-variant);">Aucun résultat trouvé pour "${query}"</p>
            <p style="margin-top: 0.5rem; font-size: 0.875rem;">Essayez avec d'autres mots-clés</p>
          </div>
        `;
      } else {
        // Affiche les résultats filtrés
        activeSection.innerHTML = renderResources(filtered);
      }
    }
    
    // ===== LIGNE 34 : Mettre à jour les compteurs =====
    if (resultsCountSpan) {
      resultsCountSpan.textContent = filtered.length;  // Affiche le nombre de résultats
    }
    
    if (currentFilterSpan) {
      currentFilterSpan.innerHTML = `"${query}"`;  // Affiche la requête dans le titre
    }
    
    // ===== LIGNE 35 : Message de résultat =====
    if (filtered.length === 0) {
      showToast(`Aucun résultat pour "${query}"`, "error");
    } else {
      showToast(`${filtered.length} résultat(s) trouvé(s) pour "${query}"`, "success");
    }
  }
  
  // ===== LIGNE 36 : Fonction Toast (notification) =====
  function showToast(message, type = 'info') {
    // Supprime les toasts existants pour éviter les doublons
    const existingToasts = document.querySelectorAll('.custom-toast');
    existingToasts.forEach(toast => toast.remove());
    
    // Crée un nouvel élément div
    const toast = document.createElement('div');
    toast.className = `custom-toast toast-${type}`;
    
    // Remplit le contenu HTML
    toast.innerHTML = `
      <span class="material-symbols-outlined">
        ${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}
      </span>
      <span>${message}</span>
    `;
    
    // Applique les styles CSS
    toast.style.cssText = `
      position: fixed;      /* Fixe par rapport à la fenêtre */
      bottom: 20px;         /* À 20px du bas */
      right: 20px;          /* À 20px de la droite */
      background: white;
      padding: 12px 20px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      z-index: 1000;        /* Au-dessus de tout */
      animation: slideIn 0.3s ease;
      font-family: 'Be Vietnam Pro', sans-serif;
      font-size: 0.875rem;
      border-left: 4px solid ${type === 'success' ? '#4caf50' : type === 'error' ? '#f76a80' : '#3d57bb'};
    `;
    
    // Ajoute le toast à la page
    document.body.appendChild(toast);
    
    // Programmer la disparition après 3 secondes
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
  
  // ===== LIGNE 37 : Gestionnaire de téléchargement global =====
  window.handleDownload = function(id) {
    showToast(`Téléchargement de la ressource #${id} démarré`, 'success');
    console.log(`Download resource ${id}`);
  };
  
  // ===== LIGNE 38 : Initialisation de la recherche =====
  function initSearch() {
    // Récupère le bouton et le champ de recherche
    const searchButton = document.querySelector('.search.button');
    const searchInput = document.querySelector('.search-input-desktop');
    
    // Si le bouton existe, ajoute un écouteur de clic
    if (searchButton) {
      searchButton.addEventListener('click', (e) => {
        e.preventDefault();  // Empêche le comportement par défaut
        performSearch();     // Lance la recherche
      });
    }
    
    // Si le champ existe, ajoute un écouteur de touche
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {  // Si la touche Entrée est pressée
          e.preventDefault();
          performSearch();        // Lance la recherche
        }
      });
    }
  }
  
  // ===== LIGNE 39 : Attachement des événements de la sidebar =====
  // Parcourt chaque section dans l'objet 'sections'
  for (const [sectionId, section] of Object.entries(sections)) {
    // Récupère l'élément du lien par son ID
    const linkElement = document.getElementById(section.linkId);
    
    // Si l'élément existe
    if (linkElement) {
      // Trouve le parent avec la classe 'sidebar-link'
      const parentLink = linkElement.closest('.sidebar-link');
      
      // Si le parent existe
      if (parentLink) {
        // Ajoute un écouteur de clic
        parentLink.addEventListener('click', (e) => {
          e.preventDefault();  // Empêche la navigation par défaut
          showSection(sectionId, section, parentLink);  // Affiche la section
        });
      }
    }
  }
  
  // ===== LIGNE 40 : Démarrer la recherche =====
  initSearch();
  
  // ===== LIGNE 41 : Activer la première section par défaut =====
  const defaultLink = document.querySelector('.sidebar-link.active');
  
  // Si un lien actif existe par défaut
  if (defaultLink) {
    // Récupère l'ID du span à l'intérieur
    const spanId = defaultLink.querySelector('span[id]')?.id;
    
    // Parcourt les sections pour trouver celle correspondante
    for (const [sectionId, section] of Object.entries(sections)) {
      if (section.linkId === spanId) {
        showSection(sectionId, section, defaultLink);
        break;  // Sort de la boucle
      }
    }
  }
  
  // ===== LIGNE 42 : Ajout des styles CSS =====
  // Crée un élément <style>
  const style = document.createElement('style');
  
  // Définit le contenu CSS
  style.textContent = `
    /* Animation d'entrée depuis la droite */
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    /* Animation de sortie vers la droite */
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    
    /* Style du bouton de recherche */
    .search.button {
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      border-radius: 50%;
      transition: background 0.2s;
      position: absolute;
      left: 4px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 1;
    }
    
    /* Effet au survol */
    .search.button:hover {
      background: rgba(0, 0, 0, 0.05);
    }
    
    /* Conteneur de recherche */
    .search-desktop {
      position: relative;
      display: flex;
      align-items: center;
    }
    
    /* Champ de recherche avec padding pour l'icône */
    .search-input-desktop {
      padding-left: 48px !important;
    }
    
    /* Indicateur de chargement */
    .loading-placeholder {
      text-align: center;
      padding: 3rem;
      color: var(--on-surface-variant);
    }
  `;
  
  // Ajoute les styles au <head> du document
  document.head.appendChild(style);
  
  // ===== LIGNE 43 : SYSTÈME DE NOTIFICATIONS =====
  
  // Tableau des notifications
  let notifications = [
    { id: 1, title: "New Resource Available!", message: "C++ Advanced Memory Management guide has been added.", time: "5 min ago", read: false, icon: "description" },
    { id: 2, title: "Your download is ready", message: "STL Cheat Sheet has been downloaded 100+ times.", time: "1 hour ago", read: false, icon: "download" },
    { id: 3, title: "New comment on your post", message: "@prof_x commented on your resource: 'Great work!'", time: "3 hours ago", read: true, icon: "chat" }
  ];
  
  // ===== LIGNE 44 : Sauvegarde des notifications =====
  // Convertit l'objet en JSON et le sauvegarde dans localStorage
  function saveNotifications() { 
    localStorage.setItem('notifications', JSON.stringify(notifications)); 
  }
  
  // ===== LIGNE 45 : Chargement des notifications =====
  function loadNotifications() { 
    const saved = localStorage.getItem('notifications'); 
    if (saved) { 
      notifications = JSON.parse(saved);  // Convertit le JSON en objet
    } 
    updateNotificationBadge();  // Met à jour l'affichage
  }
  
  // ===== LIGNE 46 : Compte des notifications non lues =====
  // filter() garde les notifications avec read === false, length donne le nombre
  function getUnreadCount() { 
    return notifications.filter(n => !n.read).length; 
  }
  
  // ===== LIGNE 47 : Mise à jour du badge =====
  function updateNotificationBadge() {
    // Récupère le bouton d'icône
    const iconBtn = document.querySelector('.icon-btn');
    if (!iconBtn) return;  // Sort si le bouton n'existe pas
    
    const unreadCount = getUnreadCount();
    const existingBadge = iconBtn.querySelector('.notification-badge');
    
    // Supprime l'ancien badge s'il existe
    if (existingBadge) existingBadge.remove();
    
    // Si des notifications non lues existent
    if (unreadCount > 0) {
      const badge = document.createElement('span');  // Crée un span
      badge.className = 'notification-badge';
      badge.textContent = unreadCount > 9 ? '9+' : unreadCount;  // Affiche le nombre
      badge.style.cssText = 'position: absolute; top: -5px; right: -5px; background: #f76a80; color: white; font-size: 0.625rem; font-weight: 700; padding: 2px 6px; border-radius: 9999px; min-width: 18px; text-align: center;';
      iconBtn.style.position = 'relative';
      iconBtn.appendChild(badge);  // Ajoute le badge au bouton
    }
  }
  
  // ===== LIGNE 48 : Création du panneau =====
  function createNotificationPanel() {
    // Si le panneau existe déjà, ne pas le recréer
    if (document.querySelector('.notification-panel')) return;
    
    const panel = document.createElement('div');
    panel.className = 'notification-panel';
    panel.style.cssText = 'position: fixed; top: 80px; right: 20px; width: 380px; background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); border-radius: 1rem; box-shadow: 0 20px 40px rgba(0,0,0,0.15); z-index: 1000; transform: translateX(400px); opacity: 0; transition: all 0.3s ease; overflow: hidden;';
    
    panel.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid rgba(0,0,0,0.05);">
        <h3 style="font-family: Plus Jakarta Sans; font-weight: 700;">Notifications</h3>
        <button class="close-notifications" style="background: none; border: none; cursor: pointer;"><span class="material-symbols-outlined">close</span></button>
      </div>
      <div class="notifications-list" style="max-height: 500px; overflow-y: auto;"></div>
      <div style="padding: 0.75rem; text-align: center; border-top: 1px solid rgba(0,0,0,0.05);">
        <button class="mark-all-read" style="background: none; border: none; color: #3d57bb; cursor: pointer;">Mark all as read</button>
      </div>
    `;
    
    document.body.appendChild(panel);  // Ajoute le panneau à la page
    
    // Crée un overlay (fond transparent) pour fermer en cliquant à l'extérieur
    const overlay = document.createElement('div');
    overlay.className = 'notification-overlay';
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: transparent; z-index: 999; display: none;';
    document.body.appendChild(overlay);
    
    return panel;
  }
  
  // ===== LIGNE 49 : Affichage des notifications =====
  function renderNotifications() {
    const panel = document.querySelector('.notification-panel');
    if (!panel) return;
    
    const listContainer = panel.querySelector('.notifications-list');
    if (!listContainer) return;
    
    // Si aucune notification
    if (notifications.length === 0) {
      listContainer.innerHTML = '<div style="text-align: center; padding: 3rem;">Aucune notification</div>';
      return;
    }
    
    // Génère le HTML pour chaque notification
    listContainer.innerHTML = notifications.map(n => `
      <div class="notification-item ${n.read ? '' : 'unread'}" data-id="${n.id}" style="display: flex; gap: 0.75rem; padding: 1rem; border-bottom: 1px solid rgba(0,0,0,0.05); cursor: pointer; ${!n.read ? 'background: rgba(61,87,187,0.05);' : ''}">
        <div style="width: 40px; height: 40px; background: #b0beff; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center;"><span class="material-symbols-outlined">${n.icon}</span></div>
        <div style="flex: 1;"><div style="font-weight: 700;">${n.title}</div><div style="font-size: 0.75rem; color: #545d86;">${n.message}</div><div style="font-size: 0.625rem; color: #6f79a4;">${n.time}</div></div>
        ${!n.read ? `<button class="mark-read-btn" data-id="${n.id}" style="background: none; border: none; color: #3d57bb; cursor: pointer; font-size: 0.625rem;">Mark read</button>` : ''}
      </div>
    `).join('');
    
    // Ajoute les écouteurs pour marquer comme lu
    document.querySelectorAll('.mark-read-btn').forEach(btn => {
      btn.addEventListener('click', (e) => { 
        e.stopPropagation();  // Empêche la propagation
        const id = parseInt(btn.dataset.id); 
        markAsRead(id); 
      });
    });
    
    // Ajoute les écouteurs pour cliquer sur une notification
    document.querySelectorAll('.notification-item').forEach(item => {
      item.addEventListener('click', (e) => { 
        if (!e.target.classList.contains('mark-read-btn')) { 
          const id = parseInt(item.dataset.id); 
          markAsRead(id); 
          closeNotificationPanel();  // Ferme le panneau
        } 
      });
    });
  }
  
  // ===== LIGNE 50 : Marquer une notification comme lue =====
  function markAsRead(id) { 
    const n = notifications.find(n => n.id === id);  // Trouve la notification
    if (n && !n.read) { 
      n.read = true;  // Change le statut
      saveNotifications();      // Sauvegarde
      renderNotifications();    // Rafraîchit l'affichage
      updateNotificationBadge(); // Met à jour le badge
    } 
  }
  
  // ===== LIGNE 51 : Marquer toutes comme lues =====
  function markAllAsRead() { 
    notifications.forEach(n => n.read = true);  // Boucle sur chaque notification
    saveNotifications(); 
    renderNotifications(); 
    updateNotificationBadge(); 
  }
  
  // ===== LIGNE 52 : Ouvrir le panneau =====
  function openNotificationPanel() { 
    let panel = document.querySelector('.notification-panel'); 
    if (!panel) panel = createNotificationPanel();  // Crée si nécessaire
    const overlay = document.querySelector('.notification-overlay'); 
    renderNotifications(); 
    panel.style.transform = 'translateX(0)';   // Anime l'entrée
    panel.style.opacity = '1'; 
    if (overlay) overlay.style.display = 'block';  // Affiche l'overlay
  }
  
  // ===== LIGNE 53 : Fermer le panneau =====
  function closeNotificationPanel() { 
    const panel = document.querySelector('.notification-panel'); 
    const overlay = document.querySelector('.notification-overlay'); 
    if (panel) { 
      panel.style.transform = 'translateX(400px)';  // Anime la sortie
      panel.style.opacity = '0'; 
    } 
    if (overlay) overlay.style.display = 'none';  // Cache l'overlay
  }
  
  // : Initialisation des notifications =====
  function initNotifications() {
    loadNotifications();        // Charge les notifications sauvegardées
    createNotificationPanel();  // Crée le panneau
    
    const notificationBtn = document.querySelector('.icon-btn');
    if (notificationBtn) {
      notificationBtn.addEventListener('click', (e) => { 
        e.stopPropagation(); 
        const panel = document.querySelector('.notification-panel'); 
        if (panel && panel.style.opacity === '1') closeNotificationPanel(); 
        else openNotificationPanel(); 
      });
    }
    
    // Ferme le panneau quand on clique sur le bouton close ou "mark all read"
    document.addEventListener('click', (e) => { 
      if (e.target.closest('.close-notifications')) closeNotificationPanel(); 
      if (e.target.closest('.mark-all-read')) markAllAsRead(); 
    });
    
    const overlay = document.querySelector('.notification-overlay');
    if (overlay) overlay.addEventListener('click', closeNotificationPanel);
  }
  
  // Démarrer les notifications =====
  initNotifications();
  
}); // ===== FIN de DOMContentLoaded =====