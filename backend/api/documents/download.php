<?php
require_once '../../config/db.php';

// Two-step download flow:
// 1) Authenticated fetch (AJAX) -> returns JSON { download_url }
// 2) Browser navigates to download_url -> streams the file

function gc_headers(): array {
    if (function_exists('getallheaders')) {
        $h = getallheaders();
        return is_array($h) ? $h : [];
    }
    return [];
}

function gc_verify_token_from_string(string $token): int {
    $decoded = json_decode(base64_decode($token), true);
    if (!$decoded || !isset($decoded['user_id']) || !isset($decoded['exp']) || $decoded['exp'] < time()) {
        throw new Exception('Token invalide ou expiré');
    }
    return (int)$decoded['user_id'];
}

function gc_user_id_or_null(): ?int {
    $headers = gc_headers();
    $auth = $headers['Authorization'] ?? ($headers['authorization'] ?? '');
    if ($auth && str_starts_with($auth, 'Bearer ')) {
        try {
            return gc_verify_token_from_string(substr($auth, 7));
        } catch (_) {
            return null;
        }
    }
    if (!empty($_GET['t'])) {
        try {
            return gc_verify_token_from_string((string)$_GET['t']);
        } catch (_) {
            return null;
        }
    }
    return null;
}

function gc_base_backend_url(): string {
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host   = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $basePath = rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? '/', 3), '/'); // /Ghassra/backend
    return $scheme . '://' . $host . $basePath;
}

$docId = intval($_GET['id'] ?? 0);
if (!$docId) {
    require_once '../../config/cors.php';
    echo json_encode(['success' => false, 'message' => 'ID manquant']);
    exit;
}

$stmt = $pdo->prepare('SELECT id, titre, chemin_fichier, prix, type_fichier FROM documents WHERE id = ?');
$stmt->execute([$docId]);
$doc = $stmt->fetch();

if (!$doc) {
    require_once '../../config/cors.php';
    echo json_encode(['success' => false, 'message' => 'Document introuvable']);
    exit;
}

$price = (float)($doc['prix'] ?? 0);
$isPaid = $price > 0;
$fileRel = (string)($doc['chemin_fichier'] ?? '');

// Resolve the file path from project root
$projectRoot = dirname(dirname(dirname(__DIR__)));
$filePath = $projectRoot . DIRECTORY_SEPARATOR . ltrim(str_replace('/', DIRECTORY_SEPARATOR, $fileRel), DIRECTORY_SEPARATOR);

if (!file_exists($filePath)) {
    require_once '../../config/cors.php';
    echo json_encode(['success' => false, 'message' => 'Fichier introuvable sur le serveur']);
    exit;
}

$base = gc_base_backend_url();

// If dl=1 (or stream=1), stream the file directly.
$wantsStream = ($_GET['dl'] ?? '') === '1' || ($_GET['stream'] ?? '') === '1';
if ($wantsStream) {
    $userId = gc_user_id_or_null();
    if ($isPaid) {
        if (!$userId) {
            http_response_code(401);
            header('Content-Type: text/plain; charset=utf-8');
            echo 'Unauthorized';
            exit;
        }
        $stmt = $pdo->prepare('SELECT id FROM transactions WHERE utilisateur_id = ? AND document_id = ? AND type = "achat" AND statut = "complete" LIMIT 1');
        $stmt->execute([$userId, $docId]);
        if (!$stmt->fetch()) {
            http_response_code(403);
            header('Content-Type: text/plain; charset=utf-8');
            echo 'Purchase required';
            exit;
        }
    }

    // Track access
    if ($userId) {
        $stmt = $pdo->prepare('INSERT INTO utilisateur_documents (utilisateur_id, document_id, type_acces) VALUES (?, ?, "telecharge")');
        $stmt->execute([$userId, $docId]);
    }

    $safeName = preg_replace('/[^a-zA-Z0-9_\- ]+/', '', (string)($doc['titre'] ?? 'document'));
    if (!$safeName) $safeName = 'document';
    $safeName = preg_replace('/\s+/', '_', $safeName);

    // Ensure headers are sent
    if (!headers_sent()) {
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="' . addslashes($safeName) . '.pdf"');
        header('Content-Length: ' . filesize($filePath));
        header('Cache-Control: no-cache, no-store, must-revalidate');
    }
    
    readfile($filePath);
    exit;
}

// Otherwise return JSON with a download_url.
require_once '../../config/cors.php';

$userId = gc_user_id_or_null();
if ($isPaid) {
    if (!$userId) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Authentification requise']);
        exit;
    }
    $stmt = $pdo->prepare('SELECT id FROM transactions WHERE utilisateur_id = ? AND document_id = ? AND type = "achat" AND statut = "complete" LIMIT 1');
    $stmt->execute([$userId, $docId]);
    if (!$stmt->fetch()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Achat requis pour télécharger ce document']);
        exit;
    }
}

// For paid docs we must include token in the URL because a new tab won't send Authorization headers.
$token = '';
$headers = gc_headers();
$auth = $headers['Authorization'] ?? ($headers['authorization'] ?? '');
if ($auth && str_starts_with($auth, 'Bearer ')) {
    $token = substr($auth, 7);
}

$url = $base . '/api/documents/download.php?id=' . urlencode((string)$docId) . '&dl=1';
if ($isPaid && $token) {
    $url .= '&t=' . urlencode($token);
}

echo json_encode([
    'success'      => true,
    'download_url' => $url,
]);