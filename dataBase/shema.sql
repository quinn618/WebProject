CREATE DATABASE IF NOT EXISTS ghassra_platform 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE ghassra_platform;

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
