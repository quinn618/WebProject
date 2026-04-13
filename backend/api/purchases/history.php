<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';
require_once '../../middleware/auth.php';

$userId = verifyToken();

$stmt = $pdo->prepare('
    SELECT p.*, d.title, d.filiere, d.matiere, d.price, u.name AS author
    FROM purchases p
    JOIN documents d ON p.document_id = d.id
    JOIN users u ON d.user_id = u.id
    WHERE p.user_id = ? AND p.status = "completed"
    ORDER BY p.created_at DESC
');
$stmt->execute([$userId]);
$purchases = $stmt->fetchAll();

echo json_encode(['success' => true, 'data' => $purchases]);
