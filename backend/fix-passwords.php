<?php
require_once 'config/db.php';

// Generate correct password hash for demo123456
$correct_hash = password_hash('demo123456', PASSWORD_BCRYPT);

echo "Generated correct hash for 'demo123456':\n";
echo $correct_hash . "\n\n";

// Update all test users with correct password hash
try {
    $stmt = $pdo->prepare("UPDATE utilisateurs SET mot_de_passe = ? WHERE email IN (
        'nour@gmail.com',
        'houda@gmail.com', 
        'arij@gmail.com',
        'ahmed.mansouri@isimm.edu',
        'fatima.benali@isimm.edu',
        'mohammed.saidi@isimm.edu',
        'leila.khaled@isimm.edu'
    )");
    
    $stmt->execute([$correct_hash]);
    echo "✓ Updated " . $stmt->rowCount() . " users with correct password hash\n";
    
    // Verify one user
    $stmt = $pdo->prepare("SELECT nom, email, mot_de_passe FROM utilisateurs WHERE email = 'nour@gmail.com'");
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (password_verify('demo123456', $user['mot_de_passe'])) {
        echo "✓ Verification successful! Password 'demo123456' works for " . $user['email'] . "\n";
    }
    
} catch (Exception $e) {
    echo "✗ Update failed: " . $e->getMessage() . "\n";
}
?>
