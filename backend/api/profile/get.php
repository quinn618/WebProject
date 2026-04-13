<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';
require_once '../../middleware/auth.php';

$userId = verifyToken();

$stmt = $pdo->prepare('SELECT id, name, email, filiere, bio, photo, created_at FROM users WHERE id = ?');
$stmt->execute([$userId]);
$user = $stmt->fetch();

$stmt = $pdo->prepare('SELECT COUNT(*) AS total FROM documents WHERE user_id = ?');
$stmt->execute([$userId]);
$docsCount = $stmt->fetch()['total'];

$stmt = $pdo->prepare('SELECT COUNT(*) AS total FROM purchases WHERE user_id = ? AND status = "completed"');
$stmt->execute([$userId]);
$purchasesCount = $stmt->fetch()['total'];

echo json_encode([
    'success' => true,
    'data'    => array_merge($user, [
        'documents_count' => $docsCount,
        'purchases_count' => $purchasesCount
    ])
]);
