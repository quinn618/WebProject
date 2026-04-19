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
        } catch (Exception $e) {
            return null;
        }
    }
    $rawToken = $_GET['t'] ?? ($_GET['token'] ?? '');
    if ($rawToken !== '' && $rawToken !== null) {
        try {
            return gc_verify_token_from_string((string)$rawToken);
        } catch (Exception $e) {
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
    if (($_GET['dl'] ?? '') === '1' || ($_GET['stream'] ?? '') === '1') {
        http_response_code(400);
        header('Content-Type: text/plain; charset=utf-8');
        echo 'ID manquant';
        exit;
    }
    require_once '../../config/cors.php';
    echo json_encode(['success' => false, 'message' => 'ID manquant']);
    exit;
}

$stmt = $pdo->prepare('SELECT id, titre, chemin_fichier, prix, type_fichier, utilisateur_id FROM documents WHERE id = ?');
$stmt->execute([$docId]);
$doc = $stmt->fetch();

if (!$doc) {
    if (($_GET['dl'] ?? '') === '1' || ($_GET['stream'] ?? '') === '1') {
        http_response_code(404);
        header('Content-Type: text/plain; charset=utf-8');
        echo 'Document introuvable';
        exit;
    }
    require_once '../../config/cors.php';
    echo json_encode(['success' => false, 'message' => 'Document introuvable']);
    exit;
}

$price = (float)($doc['prix'] ?? 0);
$isPaid = $price > 0;
$ownerId = (int)($doc['utilisateur_id'] ?? 0);
$fileRel = (string)($doc['chemin_fichier'] ?? '');

// Resolve path: demo PDFs and app uploads live under backend/uploads/ (see backend/uploads/*.pdf).
// DB usually stores chemin_fichier as "uploads/filename.pdf".
$projectRoot = dirname(dirname(dirname(__DIR__)));
$backendRoot = dirname(__DIR__, 2); // .../backend
$normalizedRel = ltrim(str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $fileRel), DIRECTORY_SEPARATOR);
$baseName = $normalizedRel !== '' ? basename($normalizedRel) : '';

$candidates = [];
if ($baseName !== '') {
    // Prefer backend/uploads by filename (matches seeded demos and current upload target).
    $candidates[] = $backendRoot . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . $baseName;
}
$candidates[] = $projectRoot . DIRECTORY_SEPARATOR . $normalizedRel;
$candidates[] = dirname($projectRoot) . DIRECTORY_SEPARATOR . $normalizedRel;
$candidates[] = $projectRoot . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . $normalizedRel;
if ($baseName !== '') {
    $candidates[] = $projectRoot . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . $baseName;
}

$filePath = null;
foreach ($candidates as $candidate) {
    if ($candidate && file_exists($candidate) && is_file($candidate)) {
        $filePath = $candidate;
        break;
    }
}

// Last resort: scan likely uploads directories by basename only.
if (!$filePath && $baseName !== '') {
    $uploadDirs = [
        $backendRoot . DIRECTORY_SEPARATOR . 'uploads',
        $projectRoot . DIRECTORY_SEPARATOR . 'uploads',
        $projectRoot . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . 'uploads',
        dirname(__DIR__, 3) . DIRECTORY_SEPARATOR . 'uploads',
    ];
    if (!empty($_SERVER['DOCUMENT_ROOT'])) {
        $docRoot = rtrim(str_replace(['/', '\\'], DIRECTORY_SEPARATOR, (string)$_SERVER['DOCUMENT_ROOT']), DIRECTORY_SEPARATOR);
        $uploadDirs[] = $docRoot . DIRECTORY_SEPARATOR . 'ghassra' . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . 'uploads';
        $uploadDirs[] = $docRoot . DIRECTORY_SEPARATOR . 'ghassra' . DIRECTORY_SEPARATOR . 'uploads';
        $uploadDirs[] = $docRoot . DIRECTORY_SEPARATOR . 'uploads';
    }
    foreach (array_unique(array_filter($uploadDirs)) as $ud) {
        $try = $ud . DIRECTORY_SEPARATOR . $baseName;
        if (file_exists($try) && is_file($try)) {
            $filePath = $try;
            break;
        }
    }
}

if (!$filePath) {
    if (($_GET['dl'] ?? '') === '1' || ($_GET['stream'] ?? '') === '1') {
        http_response_code(404);
        header('Content-Type: text/plain; charset=utf-8');
        echo 'Fichier introuvable sur le serveur';
        exit;
    }
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
        if ($userId !== $ownerId) {
            $stmt = $pdo->prepare('SELECT id FROM transactions WHERE utilisateur_id = ? AND document_id = ? AND type = "achat" AND statut = "complete" LIMIT 1');
            $stmt->execute([$userId, $docId]);
            if (!$stmt->fetch()) {
                http_response_code(403);
                header('Content-Type: text/plain; charset=utf-8');
                echo 'Purchase required';
                exit;
            }
        }
    }

    // Verify file exists before attempting to stream
    if (!$filePath || !file_exists($filePath) || !is_file($filePath)) {
        http_response_code(404);
        header('Content-Type: text/plain; charset=utf-8');
        echo 'Fichier non trouvé';
        exit;
    }

    // Track access (same user/doc can download again — table has UNIQUE user+document)
    if ($userId) {
        $stmt = $pdo->prepare(
            'INSERT INTO utilisateur_documents (utilisateur_id, document_id, type_acces) VALUES (?, ?, "telecharge") '
          . 'ON DUPLICATE KEY UPDATE date_acces = CURRENT_TIMESTAMP'
        );
        $stmt->execute([$userId, $docId]);
    }

    $safeName = preg_replace('/[^a-zA-Z0-9_\- ]+/', '', (string)($doc['titre'] ?? 'document'));
    if (!$safeName) $safeName = 'document';
    $safeName = preg_replace('/\s+/', '_', $safeName);
    $ext = pathinfo($filePath, PATHINFO_EXTENSION) ?: 'pdf';

    // Ensure headers are sent BEFORE any output
    if (!headers_sent()) {
        header('Content-Type: application/pdf; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $safeName . '.' . $ext . '"');
        header('Content-Length: ' . filesize($filePath));
        header('Pragma: no-cache');
        header('Cache-Control: no-cache, no-store, must-revalidate');
        header('Expires: 0');
    }
    
    // Stream the file
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
    if ($userId !== $ownerId) {
        $stmt = $pdo->prepare('SELECT id FROM transactions WHERE utilisateur_id = ? AND document_id = ? AND type = "achat" AND statut = "complete" LIMIT 1');
        $stmt->execute([$userId, $docId]);
        if (!$stmt->fetch()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Achat requis pour télécharger ce document']);
            exit;
        }
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
exit;