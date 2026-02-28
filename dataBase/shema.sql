CREATE DATABASE IF NOT EXISTS ghassra_platform 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE ghassra_platform;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  role ENUM('student', 'admin') DEFAULT 'student',
  wallet_balance DECIMAL(10,2) DEFAULT 0.00,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME NULL,
  is_active BOOLEAN DEFAULT TRUE,
  reset_password_token VARCHAR(255) NULL,
  token_expiration DATETIME NULL,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB;

CREATE TABLE departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  department_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  INDEX idx_department (department_id)
) ENGINE=InnoDB;

CREATE TABLE documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  file_path VARCHAR(500) NOT NULL,
  price DECIMAL(10,2) DEFAULT 0.00,
  user_id INT NOT NULL,
  subject_id INT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  download_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  file_type VARCHAR(50) NULL,
  file_size INT NULL,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  validated_at DATETIME NULL,
  validated_by INT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_subject (subject_id),
  INDEX idx_status (status)
) ENGINE=InnoDB;
