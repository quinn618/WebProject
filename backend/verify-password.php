<?php
require_once 'config/db.php';

// Verify password hash for demo123456
$stored_hash = '$2y$10$ocObB.Ka86.0L5PceQ0xQupnKFUp5etwt1clZmwGhBaw18y7cUtJe';
$password = 'demo123456';

if (password_verify($password, $stored_hash)) {
    echo "✓ Password verification: PASSED\n";
} else {
    echo "✗ Password verification: FAILED\n";
}

// Check what's actually in the database
echo "\n📋 Checking database...\n";
$stmt = $pdo->prepare("SELECT id, nom, email, mot_de_passe FROM utilisateurs LIMIT 1");
$stmt->execute();
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    echo "Found user: " . $user['nom'] . " (" . $user['email'] . ")\n";
    echo "Stored password hash: " . $user['mot_de_passe'] . "\n";
    
    // Verify against stored hash
    if (password_verify('demo123456', $user['mot_de_passe'])) {
        echo "✓ Password matches!\n";
    } else {
        echo "✗ Password does NOT match\n";
    }
} else {
    echo "✗ No users found in database\n";
}
?>
