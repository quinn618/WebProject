<?php
require_once 'config/db.php';

// Password for all test accounts is: demo123456
// Hashed using password_hash('demo123456', PASSWORD_BCRYPT)
$test_password_hash = '$2y$10$ocObB.Ka86.0L5PceQ0xQupnKFUp5etwt1clZmwGhBaw18y7cUtJe';

try {
    // Create database if not exists
    $pdo->exec("CREATE DATABASE IF NOT EXISTS ghassra_core");
    $pdo->exec("USE ghassra_core");
    
    // Create users table if not exists
    $pdo->exec("CREATE TABLE IF NOT EXISTS utilisateurs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nom VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        mot_de_passe VARCHAR(255) NOT NULL,
        code_institut VARCHAR(50),
        role VARCHAR(50),
        solde DECIMAL(10, 2),
        date_creation TIMESTAMP,
        bio TEXT,
        est_vendeur INT,
        avatar_url VARCHAR(255),
        url_site_perso VARCHAR(255),
        documents_vendus INT,
        avis_moyen DECIMAL(3,2),
        KEY idx_email (email)
    )");
    
    // Check if test users exist
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM utilisateurs WHERE email IN (?, ?, ?)");
    $stmt->execute(['nour@gmail.com', 'houda@gmail.com', 'arij@gmail.com']);
    $count = $stmt->fetchColumn();
    
    if ($count === 0) {
        // Insert test buyers
        $stmt = $pdo->prepare("INSERT INTO utilisateurs (nom, email, mot_de_passe, code_institut, role, solde, date_creation, est_vendeur, documents_vendus, avis_moyen) 
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $stmt->execute(['Nour', 'nour@gmail.com', $test_password_hash, '654', 'etudiant', 906.00, date('Y-m-d H:i:s'), 1, 12, 4]);
        $stmt->execute(['Houda', 'houda@gmail.com', $test_password_hash, '777', 'etudiant', 894.50, date('Y-m-d H:i:s'), 1, 22, 4]);
        $stmt->execute(['Arij', 'arij@gmail.com', $test_password_hash, '111', 'etudiant', 896.50, date('Y-m-d H:i:s'), 1, 3, 1]);
        
        // Insert test sellers
        $stmt->execute(['Ahmed Mansouri', 'ahmed.mansouri@isimm.edu', $test_password_hash, 'GH-2024', 'etudiant', 565.50, date('Y-m-d H:i:s'), 1, 4, 4.5]);
        $stmt->execute(['Fatima Benali', 'fatima.benali@isimm.edu', $test_password_hash, 'GH-2024', 'etudiant', 334.50, date('Y-m-d H:i:s'), 1, 4, 4.2]);
        $stmt->execute(['Mohammed Saidi', 'mohammed.saidi@isimm.edu', $test_password_hash, 'GH-2024', 'etudiant', 1089.50, date('Y-m-d H:i:s'), 1, 4, 4.8]);
        $stmt->execute(['Leila Khaled', 'leila.khaled@isimm.edu', $test_password_hash, 'GH-2024', 'etudiant', 218.00, date('Y-m-d H:i:s'), 1, 1, 5.0]);
        
        echo "✓ Test users created successfully\n";
        echo "✓ Password for all users: demo123456\n";
        echo "\nAvailable test accounts:\n";
        echo "  Buyers:\n";
        echo "    - nour@gmail.com\n";
        echo "    - houda@gmail.com\n";
        echo "    - arij@gmail.com\n";
        echo "  Sellers:\n";
        echo "    - ahmed.mansouri@isimm.edu\n";
        echo "    - fatima.benali@isimm.edu\n";
        echo "    - mohammed.saidi@isimm.edu\n";
        echo "    - leila.khaled@isimm.edu\n";
    } else {
        echo "✓ Test users already exist in database\n";
    }
    
} catch (Exception $e) {
    echo "✗ Setup failed: " . $e->getMessage() . "\n";
    exit(1);
}
?>
