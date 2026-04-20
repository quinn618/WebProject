<?php

require_once '../../config/cors.php';
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);
require_once '../../config/db.php';
require_once '../../middleware/auth.php';

$userId = verifyToken();

// Get JSON body
$input = json_decode(file_get_contents('php://input'), true);
$amount = isset($input['amount']) ? (int)$input['amount'] : 0;

if ($amount < 1) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid amount']);
    exit;
}

try {
    // Add to the sold_count (increment it)
    $stmt = $pdo->prepare('UPDATE utilisateurs SET sold_count = sold_count + ? WHERE id = ?');
    $stmt->execute([$amount, $userId]);

    // Get updated sold_count
    $stmt = $pdo->prepare('SELECT sold_count FROM utilisateurs WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    echo json_encode([
        'success' => true,
        'message' => 'Sale logged successfully',
        'data' => [
            'sold_count' => (int)($user['sold_count'] ?? 0)
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
