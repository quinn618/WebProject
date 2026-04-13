<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';

$filiere = $_GET['filiere'] ?? '';
$matiere = $_GET['matiere'] ?? '';
$query   = $_GET['q']       ?? '';

$sql    = 'SELECT d.*, u.name AS author_name FROM documents d JOIN users u ON d.user_id = u.id WHERE 1=1';
$params = [];

if ($filiere && $filiere !== 'all') {
    $sql     .= ' AND d.filiere = ?';
    $params[] = $filiere;
}
if ($matiere) {
    $sql     .= ' AND d.matiere = ?';
    $params[] = $matiere;
}
if ($query) {
    $sql     .= ' AND (d.title LIKE ? OR d.description LIKE ?)';
    $params[] = "%$query%";
    $params[] = "%$query%";
}

$sql .= ' ORDER BY d.created_at DESC';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$documents = $stmt->fetchAll();

echo json_encode(['success' => true, 'data' => $documents]);
