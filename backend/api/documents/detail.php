<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';

$id = intval($_GET['id'] ?? 0);
if (!$id) {
    echo json_encode(['success' => false, 'message' => 'ID manquant']);
    exit;
}

function gc_base_url(): string {
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host   = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $basePath = rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? '/', 3), '/');
    return $scheme . '://' . $host . $basePath;
}

function gc_slug(string $value): string {
    $value = strtolower(trim($value));
    $value = preg_replace('/[^a-z0-9]+/i', '_', $value);
    return trim($value, '_');
}

function gc_file_type(string $path, string $mime): string {
    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    if ($ext) return strtoupper($ext === 'pdf' ? 'PDF' : '.' . $ext);
    if (str_contains(strtolower($mime), 'pdf')) return 'PDF';
    return 'File';
}

$stmt = $pdo->prepare(
    'SELECT d.*, u.nom AS auteur_nom, m.nom AS matiere_nom, f.nom AS filiere_nom '
  . 'FROM documents d '
  . 'JOIN utilisateurs u ON d.utilisateur_id = u.id '
  . 'JOIN matieres m ON d.matiere_id = m.id '
  . 'JOIN filieres f ON m.filiere_id = f.id '
  . 'WHERE d.id = ?'
);
$stmt->execute([$id]);
$doc = $stmt->fetch();

if (!$doc) {
    echo json_encode(['success' => false, 'message' => 'Document introuvable']);
    exit;
}

$base  = gc_base_url();
$price = (float)($doc['prix'] ?? 0);
$path  = (string)($doc['chemin_fichier'] ?? '');
$mime  = (string)($doc['type_fichier'] ?? '');

$authorHandle = '@' . (gc_slug((string)($doc['auteur_nom'] ?? 'user')) ?: 'user');
$downloadUrl  = ($price <= 0 && $path) ? ($base . '/' . ltrim($path, '/')) : '#';

echo json_encode([
    'success' => true,
    'data'    => [
        'id'           => (int)$doc['id'],
        'title'        => $doc['titre'],
        'author'       => $authorHandle,
        'description'  => $doc['description'] ?? '',
        'badge'        => ($price > 0 ? 'Paid' : 'Free'),
        'badge_class'  => ($price > 0 ? 'badge-teal' : 'badge-blue'),
        'file_type'    => gc_file_type($path, $mime),
        'category'     => 'document',
        'download_url' => $downloadUrl,
        'price'        => $price,
        'date'         => $doc['date_upload'],
        'created_at'   => $doc['date_upload'],
        'filiere'      => $doc['filiere_nom'] ?? '',
        'matiere'      => $doc['matiere_nom'] ?? '',
    ]
]);
