<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';

$id = intval($_GET['id'] ?? 0);
if (!$id) {
    echo json_encode(['success' => false, 'error' => 'ID manquant']);
    exit;
}

$stmt = $pdo->prepare('SELECT d.*, u.name AS author_name FROM documents d JOIN users u ON d.user_id = u.id WHERE d.id = ?');
$stmt->execute([$id]);
$doc = $stmt->fetch();

if (!$doc) {
    echo json_encode(['success' => false, 'error' => 'Document introuvable']);
    exit;
}

echo json_encode(['success' => true, 'data' => $doc]);
