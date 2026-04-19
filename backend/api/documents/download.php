<?php
require_once '../../config/db.php';

/* ---------------------------------------------------------------
   TWO-STEP DOWNLOAD FLOW
   Step 1 (AJAX, Authorization header):
       GET download.php?id=X  → returns JSON { download_url }
   Step 2 (browser tab, no header):
       GET download.php?id=X&dl=1&t=TOKEN → streams the file
--------------------------------------------------------------- */

// ── Helpers ──────────────────────────────────────────────────────────────────

function gc_all_headers(): array {
    if (function_exists('getallheaders')) {
        $h = getallheaders();
        if (is_array($h)) return $h;
    }
    $out = [];
    foreach ($_SERVER as $k => $v) {
        if (str_starts_with($k, 'HTTP_')) {
            $name = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($k, 5)))));
            $out[$name] = $v;
        }
    }
    if (!empty($_SERVER['HTTP_AUTHORIZATION']))          $out['Authorization'] = $_SERVER['HTTP_AUTHORIZATION'];
    if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) $out['Authorization'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    return $out;
}

function gc_verify_token(string $raw): int {
    // base64 may have been URL-encoded; urldecode first, then handle padding
    $raw     = urldecode($raw);
    $padded  = $raw . str_repeat('=', (4 - strlen($raw) % 4) % 4);
    $decoded = json_decode(base64_decode($padded), true);
    if (!$decoded || empty($decoded['user_id']) || empty($decoded['exp']) || $decoded['exp'] < time()) {
        throw new Exception('Token invalide ou expiré');
    }
    return (int)$decoded['user_id'];
}

function gc_user_id_or_null(): ?int {
    // Priority 1: Authorization header (AJAX step)
    $headers = gc_all_headers();
    $auth    = $headers['Authorization'] ?? ($headers['authorization'] ?? '');
    if ($auth && str_starts_with($auth, 'Bearer ')) {
        try { return gc_verify_token(trim(substr($auth, 7))); } catch (Exception $e) {}
    }
    // Priority 2: ?t= query param (browser tab step)
    $rawToken = $_GET['t'] ?? ($_GET['token'] ?? '');
    if ($rawToken !== '') {
        try { return gc_verify_token((string)$rawToken); } catch (Exception $e) {}
    }
    return null;
}

function gc_backend_base(): string {
    $scheme   = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host     = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $basePath = rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? '/', 3), '/');
    return $scheme . '://' . $host . $basePath;
}

// ── Resolve document ─────────────────────────────────────────────────────────

$docId = intval($_GET['id'] ?? 0);
$wantStream = ($_GET['dl'] ?? '') === '1' || ($_GET['stream'] ?? '') === '1';

if (!$docId) {
    if (!$wantStream) { require_once '../../config/cors.php'; }
    http_response_code(400);
    echo $wantStream ? 'ID manquant' : json_encode(['success' => false, 'message' => 'ID manquant']);
    exit;
}

$stmt = $pdo->prepare('SELECT id, titre, chemin_fichier, prix, type_fichier, utilisateur_id FROM documents WHERE id = ?');
$stmt->execute([$docId]);
$doc = $stmt->fetch();

if (!$doc) {
    if (!$wantStream) { require_once '../../config/cors.php'; }
    http_response_code(404);
    echo $wantStream ? 'Document introuvable' : json_encode(['success' => false, 'message' => 'Document introuvable']);
    exit;
}

$price   = (float)($doc['prix'] ?? 0);
$isPaid  = $price > 0;
$ownerId = (int)($doc['utilisateur_id'] ?? 0);
$fileRel = (string)($doc['chemin_fichier'] ?? '');

// ── Resolve physical file path ───────────────────────────────────────────────

$backendRoot    = dirname(__DIR__, 2);                     // …/backend
$projectRoot    = dirname($backendRoot);                   // …/project root
$normalizedRel  = ltrim(str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $fileRel), DIRECTORY_SEPARATOR);
$baseName       = $normalizedRel !== '' ? basename($normalizedRel) : '';

$candidates = [];
if ($baseName !== '') {
    $candidates[] = $backendRoot . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . $baseName;
}
$candidates[] = $projectRoot . DIRECTORY_SEPARATOR . $normalizedRel;
$candidates[] = $backendRoot . DIRECTORY_SEPARATOR . $normalizedRel;

// Fallback: scan upload dirs by basename
$uploadDirs = [
    $backendRoot . DIRECTORY_SEPARATOR . 'uploads',
    $projectRoot . DIRECTORY_SEPARATOR . 'uploads',
    $projectRoot . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . 'uploads',
];
if (!empty($_SERVER['DOCUMENT_ROOT'])) {
    $dr = rtrim($_SERVER['DOCUMENT_ROOT'], '/\\');
    $uploadDirs[] = $dr . DIRECTORY_SEPARATOR . 'ghassra'  . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . 'uploads';
    $uploadDirs[] = $dr . DIRECTORY_SEPARATOR . 'uploads';
}

$filePath = null;
foreach ($candidates as $c) {
    if ($c && file_exists($c) && is_file($c)) { $filePath = $c; break; }
}
if (!$filePath && $baseName !== '') {
    foreach (array_unique($uploadDirs) as $ud) {
        $try = $ud . DIRECTORY_SEPARATOR . $baseName;
        if (file_exists($try) && is_file($try)) { $filePath = $try; break; }
    }
}

// ── STREAM mode (browser tab, dl=1) ─────────────────────────────────────────

if ($wantStream) {
    $userId = gc_user_id_or_null();

    // Auth / purchase check
    if ($isPaid) {
        if (!$userId) {
            http_response_code(401);
            header('Content-Type: text/plain; charset=utf-8');
            echo 'Authentification requise';
            exit;
        }
        if ($userId !== $ownerId) {
            $stmt = $pdo->prepare(
                'SELECT id FROM transactions WHERE utilisateur_id = ? AND document_id = ? AND type = "achat" AND statut = "complete" LIMIT 1'
            );
            $stmt->execute([$userId, $docId]);
            if (!$stmt->fetch()) {
                http_response_code(403);
                header('Content-Type: text/plain; charset=utf-8');
                echo 'Achat requis pour télécharger ce document';
                exit;
            }
        }
    }

    if (!$filePath || !file_exists($filePath)) {
        http_response_code(404);
        header('Content-Type: text/plain; charset=utf-8');
        echo 'Fichier introuvable sur le serveur';
        exit;
    }

    // Track download
    if ($userId) {
        $stmt = $pdo->prepare(
            'INSERT INTO utilisateur_documents (utilisateur_id, document_id, type_acces) VALUES (?, ?, "telecharge") '
          . 'ON DUPLICATE KEY UPDATE date_acces = CURRENT_TIMESTAMP'
        );
        $stmt->execute([$userId, $docId]);
    }

    $safeName = preg_replace('/[^a-zA-Z0-9_ \-]+/', '', (string)($doc['titre'] ?? 'document'));
    $safeName = trim(preg_replace('/\s+/', '_', $safeName)) ?: 'document';
    $ext      = pathinfo($filePath, PATHINFO_EXTENSION) ?: 'pdf';

    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . $safeName . '.' . $ext . '"');
    header('Content-Length: ' . filesize($filePath));
    header('Pragma: no-cache');
    header('Cache-Control: no-cache, no-store, must-revalidate');
    header('Expires: 0');
    readfile($filePath);
    exit;
}

// ── JSON mode (AJAX step-1) ──────────────────────────────────────────────────

require_once '../../config/cors.php';

$userId = gc_user_id_or_null();

if ($isPaid) {
    if (!$userId) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Authentification requise']);
        exit;
    }
    if ($userId !== $ownerId) {
        $stmt = $pdo->prepare(
            'SELECT id FROM transactions WHERE utilisateur_id = ? AND document_id = ? AND type = "achat" AND statut = "complete" LIMIT 1'
        );
        $stmt->execute([$userId, $docId]);
        if (!$stmt->fetch()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Achat requis pour télécharger ce document']);
            exit;
        }
    }
}

if (!$filePath) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Fichier introuvable sur le serveur']);
    exit;
}

// Build the dl=1 URL, embedding the token so the browser tab can authenticate
$base  = gc_backend_base();
$token = '';
$headers = gc_all_headers();
$auth    = $headers['Authorization'] ?? ($headers['authorization'] ?? '');
if ($auth && str_starts_with($auth, 'Bearer ')) {
    $token = trim(substr($auth, 7));
}

$dlUrl = $base . '/api/documents/download.php?id=' . $docId . '&dl=1';
if ($token) {
    $dlUrl .= '&t=' . urlencode($token);
}

echo json_encode([
    'success'      => true,
    'download_url' => $dlUrl,
]);