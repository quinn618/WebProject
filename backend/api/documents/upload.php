<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';
require_once '../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

$userId = verifyToken();

$title       = trim($_POST['title']       ?? '');
$description = trim($_POST['description'] ?? '');
$filiere     = trim($_POST['filiere']     ?? '');
$matiere     = trim($_POST['matiere']     ?? '');
$category    = trim($_POST['category']    ?? 'document');
$price       = floatval($_POST['price']   ?? 0);

if (!$title) {
    echo json_encode(['success' => false, 'message' => 'Champs obligatoires manquants']);
    exit;
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'message' => 'Fichier manquant ou corrompu']);
    exit;
}

$file     = $_FILES['file'];
$mimeType = mime_content_type($file['tmp_name']);

if ($mimeType !== 'application/pdf') {
    echo json_encode(['success' => false, 'message' => 'Seuls les fichiers PDF sont acceptés']);
    exit;
}

if ($file['size'] > 10 * 1024 * 1024) {
    echo json_encode(['success' => false, 'message' => 'Fichier trop volumineux (max 10 Mo)']);
    exit;
}

$filename = uniqid('doc_') . '.pdf';
$uploadsDir = dirname(dirname(dirname(__DIR__))) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR;

// Create uploads directory if it doesn't exist
if (!is_dir($uploadsDir)) {
    mkdir($uploadsDir, 0755, true);
}

$dest = $uploadsDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $dest)) {
    echo json_encode(['success' => false, 'message' => 'Erreur lors de l\'enregistrement du fichier']);
    exit;
}

function gc_code(string $value, int $maxLen = 20): string {
    $v = strtoupper(trim($value));
    $v = preg_replace('/[^A-Z0-9]+/', '_', $v);
    $v = trim($v, '_');
    if (!$v) $v = 'GEN';
    return substr($v, 0, $maxLen);
}

function gc_get_or_create_filiere(PDO $pdo, string $filiere): int {
    $name = trim($filiere);
    if (!$name) $name = 'General';
    $code = gc_code($name);

    $stmt = $pdo->prepare('SELECT id FROM filieres WHERE nom = ? OR code = ? LIMIT 1');
    $stmt->execute([$name, $code]);
    $row = $stmt->fetch();
    if ($row && isset($row['id'])) return (int)$row['id'];

    $stmt = $pdo->prepare('INSERT INTO filieres (nom, code, description) VALUES (?, ?, ?)');
    $stmt->execute([$name, $code, null]);
    return (int)$pdo->lastInsertId();
}

function gc_get_or_create_matiere(PDO $pdo, string $matiere, int $filiereId): int {
    $name = trim($matiere);
    if (!$name) $name = 'General';
    $code = gc_code($name);

    $stmt = $pdo->prepare('SELECT id FROM matieres WHERE (nom = ? OR code = ?) AND filiere_id = ? LIMIT 1');
    $stmt->execute([$name, $code, $filiereId]);
    $row = $stmt->fetch();
    if ($row && isset($row['id'])) return (int)$row['id'];

    $stmt = $pdo->prepare('INSERT INTO matieres (nom, code, description, filiere_id) VALUES (?, ?, ?, ?)');
    $stmt->execute([$name, $code, null, $filiereId]);
    return (int)$pdo->lastInsertId();
}

$filiereId = gc_get_or_create_filiere($pdo, $filiere);
$matiereId = gc_get_or_create_matiere($pdo, $matiere, $filiereId);

$relativePath = 'uploads/' . $filename;

$stmt = $pdo->prepare(
    'INSERT INTO documents (titre, description, chemin_fichier, prix, utilisateur_id, matiere_id, statut, type_fichier, taille_fichier) '
  . 'VALUES (?, ?, ?, ?, ?, ?, "valide", ?, ?)'
);
$stmt->execute([
    $title,
    $description ?: null,
    $relativePath,
    $price,
    $userId,
    $matiereId,
    $mimeType,
    (int)$file['size'],
]);
$docId = (int)$pdo->lastInsertId();

// Track ownership/access
$stmt = $pdo->prepare('INSERT INTO utilisateur_documents (utilisateur_id, document_id, type_acces) VALUES (?, ?, "upload")');
$stmt->execute([$userId, $docId]);

// Increase user's aura points (+10 for uploading)
$stmt = $pdo->prepare('UPDATE utilisateurs SET aura_points = aura_points + 10 WHERE id = ?');
$stmt->execute([$userId]);

echo json_encode([
    'success' => true,
    'message' => 'Document uploadé',
    'data'    => [
        'id'           => $docId,
        'title'        => $title,
        'author'       => '@me',
        'description'  => $description ?? '',
        'category'     => $category ?: 'document',
        'file_type'    => 'PDF',
        'download_url' => '#',
        'price'        => (float)$price,
        'date'         => date('c'),
        'filiere'      => $filiere ?: 'General',
        'matiere'      => $matiere ?: 'General',
    ]
]);
