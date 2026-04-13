<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';
require_once '../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
    exit;
}

$userId = verifyToken();

$title       = trim($_POST['title']       ?? '');
$description = trim($_POST['description'] ?? '');
$filiere     = trim($_POST['filiere']     ?? '');
$matiere     = trim($_POST['matiere']     ?? '');
$type        = $_POST['type']             ?? 'free';
$price       = floatval($_POST['price']   ?? 0);

if (!$title || !$filiere || !$matiere) {
    echo json_encode(['success' => false, 'error' => 'Champs obligatoires manquants']);
    exit;
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'error' => 'Fichier manquant ou corrompu']);
    exit;
}

$file     = $_FILES['file'];
$mimeType = mime_content_type($file['tmp_name']);

if ($mimeType !== 'application/pdf') {
    echo json_encode(['success' => false, 'error' => 'Seuls les fichiers PDF sont acceptés']);
    exit;
}

if ($file['size'] > 10 * 1024 * 1024) {
    echo json_encode(['success' => false, 'error' => 'Fichier trop volumineux (max 10 Mo)']);
    exit;
}

$filename = uniqid('doc_') . '.pdf';
$dest     = __DIR__ . '/../../../uploads/' . $filename;

if (!move_uploaded_file($file['tmp_name'], $dest)) {
    echo json_encode(['success' => false, 'error' => 'Erreur lors de l\'enregistrement du fichier']);
    exit;
}

$stmt = $pdo->prepare('INSERT INTO documents (user_id, title, description, filiere, matiere, type, price, filename) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
$stmt->execute([$userId, $title, $description, $filiere, $matiere, $type, $price, $filename]);
$docId = $pdo->lastInsertId();

echo json_encode(['success' => true, 'data' => ['id' => $docId, 'filename' => $filename]]);
