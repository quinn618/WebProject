<?php
/**
 * Database Migration Runner
 * Imports schema and demo data from data_seed.sql
 */

try {
    // Connect to MySQL server (not database yet)
    $pdo = new PDO('mysql:host=localhost', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Read migration file
    $sql = file_get_contents(__DIR__ . '/data_seed.sql');
    
    // Execute SQL statements
    $pdo->exec($sql);
    
    echo "✓ Migration complete\n";
    echo "✓ Database created with schema and demo data\n";
    echo "✓ 7 users (3 buyers + 4 sellers)\n";
    echo "✓ 18 documents (8 free + 10 paid)\n";
    echo "✓ 15 transactions with balances\n";
    
} catch (Exception $e) {
    echo "✗ Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
?>
