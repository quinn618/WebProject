
CREATE DATABASE IF NOT EXISTS ghassra_core 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE ghassra_core;

CREATE TABLE utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    code_institut VARCHAR(50) NOT NULL,
  
    role ENUM('etudiant', 'admin') DEFAULT 'etudiant',
    
    solde_portefeuille DECIMAL(10,2) DEFAULT 0.00,
    
    date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP,
    derniere_connexion DATETIME NULL,
    
    est_actif BOOLEAN DEFAULT TRUE,
    
    token_reset_password VARCHAR(255) NULL,
    token_expiration DATETIME NULL,
    
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB;

CREATE TABLE filieres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT NULL,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE matieres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT NULL,
    filiere_id INT NOT NULL,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (filiere_id) REFERENCES filieres(id) ON DELETE CASCADE,
    INDEX idx_filiere (filiere_id)
) ENGINE=InnoDB;

CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT NULL,
    chemin_fichier VARCHAR(500) NOT NULL,
    prix DECIMAL(10,2) DEFAULT 0.00,  
    
    utilisateur_id INT NOT NULL,
    matiere_id INT NOT NULL,
    
    statut ENUM('en_attente', 'valide', 'rejete') DEFAULT 'en_attente',
    
    nb_telechargements INT DEFAULT 0,
    nb_vues INT DEFAULT 0,
    note_moyenne DECIMAL(3,2) DEFAULT 0.00,
    
    type_fichier VARCHAR(50) NULL,
    taille_fichier INT NULL,  
    date_upload DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_validation DATETIME NULL,
    valide_par INT NULL,  
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (matiere_id) REFERENCES matieres(id) ON DELETE CASCADE,
    FOREIGN KEY (valide_par) REFERENCES utilisateurs(id) ON DELETE SET NULL,
    
    
    INDEX idx_utilisateur (utilisateur_id),
    INDEX idx_matiere (matiere_id),
    INDEX idx_statut (statut)
) ENGINE=InnoDB;

CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    
    type ENUM('recharge', 'achat', 'retrait', 'remboursement') NOT NULL,
    
    montant DECIMAL(10,2) NOT NULL,
    
    methode_paiement ENUM('carte', 'paypal') NULL,
  
    statut ENUM('en_attente', 'complete', 'echouee') DEFAULT 'en_attente',
    
    stripe_payment_id VARCHAR(255) NULL,
  
    document_id INT NULL,
    
    date_transaction DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    description TEXT NULL,
    
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL,
    
    INDEX idx_utilisateur (utilisateur_id),
    INDEX idx_statut (statut),
    INDEX idx_date (date_transaction)
) ENGINE=InnoDB;

CREATE TABLE utilisateur_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    document_id INT NOT NULL,
    
    type_acces ENUM('achete', 'telecharge', 'upload') NOT NULL,
    
    date_acces DATETIME DEFAULT CURRENT_TIMESTAMP,
    derniere_ouverture DATETIME NULL,
    nb_ouvertures INT DEFAULT 0,
    est_favori BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_acces (utilisateur_id, document_id),
    INDEX idx_utilisateur (utilisateur_id),
    INDEX idx_document (document_id)
) ENGINE=InnoDB;

CREATE TABLE notations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    document_id INT NOT NULL,
    
    note INT NOT NULL CHECK (note BETWEEN 1 AND 5),
    commentaire TEXT NULL,
    
    -- Dates
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME NULL,
    
    -- Clés étrangères
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_notation (utilisateur_id, document_id),
    
    -- Index
    INDEX idx_utilisateur (utilisateur_id),
    INDEX idx_document (document_id)
) ENGINE=InnoDB;

CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    
    -- Token de session
    token VARCHAR(255) UNIQUE NOT NULL,
    
    -- Informations de connexion
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    
    -- Dates
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_expiration DATETIME NOT NULL,
    est_active BOOLEAN DEFAULT TRUE,
    
    -- Clé étrangère
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    
    -- Index
    INDEX idx_token (token),
    INDEX idx_expiration (date_expiration)
) ENGINE=InnoDB;

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    
    -- Type de notification
    type ENUM(
        'document_valide', 
        'document_rejete', 
        'achat_effectue',
        'recharge_effectuee',
        'nouveau_commentaire',
        'systeme'
    ) NOT NULL,
    
    -- Contenu
    message TEXT NOT NULL,
    est_lu BOOLEAN DEFAULT FALSE,
    
    -- Dates
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_lecture DATETIME NULL,
    
    -- Lien optionnel vers la page concernée
    lien VARCHAR(255) NULL,
    
    -- Clé étrangère
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    
    -- Index
    INDEX idx_utilisateur_nonlu (utilisateur_id, est_lu)
) ENGINE=InnoDB;


CREATE TABLE logs_activite (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NULL,
    action VARCHAR(100) NOT NULL,
    details JSON NULL,  -- Stocke des données supplémentaires
    ip_address VARCHAR(45) NULL,
    date_action DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Clé étrangère (peut être NULL si utilisateur supprimé)
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL,
    
    -- Index
    INDEX idx_utilisateur (utilisateur_id),
    INDEX idx_date (date_action)
) ENGINE=InnoDB;
