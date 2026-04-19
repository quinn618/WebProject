<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';

function gc_optional_user_id(): ?int {
    $rawAuth = $_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
    if (!$rawAuth && function_exists('getallheaders')) {
        $headers = getallheaders();
        if (is_array($headers)) {
            $rawAuth = $headers['Authorization'] ?? ($headers['authorization'] ?? '');
        }
    }

    if (!$rawAuth || !str_starts_with($rawAuth, 'Bearer ')) {
        return null;
    }

    $token = substr($rawAuth, 7);
    $decoded = json_decode(base64_decode($token), true);
    if (!$decoded || !isset($decoded['user_id']) || !isset($decoded['exp']) || $decoded['exp'] < time()) {
        return null;
    }
    return (int)$decoded['user_id'];
}

function gc_base_url(): string {
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host   = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $basePath = rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? '/', 3), '/'); // /Ghassra/backend
    return $scheme . '://' . $host . $basePath;
}

function gc_slug(string $value): string {
    $value = strtolower(trim($value));
    $value = preg_replace('/[^a-z0-9]+/i', '_', $value);
    return trim($value, '_');
}

function gc_category_from_doc(array $row): string {
    $title = strtolower((string)($row['titre'] ?? ''));
    $path  = strtolower((string)($row['chemin_fichier'] ?? ''));
    $mime  = strtolower((string)($row['type_fichier'] ?? ''));

    if (str_contains($title, 'exam') || str_contains($title, 'examen')) return 'exam';
    if (str_contains($title, 'cheat') || str_contains($title, 'sheet') || str_contains($title, 'resume') || str_contains($title, 'résumé')) return 'cheat-sheet';
    if (preg_match('/\.(c|cpp|h|py|js|ts|java|cs|php)(\?.*)?$/', $path)) return 'code';
    if (str_contains($mime, 'text/') || str_contains($mime, 'application/json')) return 'code';
    return 'document';
}

function gc_file_type(string $path, string $mime): string {
    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    if ($ext) return strtoupper($ext === 'pdf' ? 'PDF' : '.' . $ext);
    if (str_contains(strtolower($mime), 'pdf')) return 'PDF';
    return 'File';
}

$category = trim($_GET['category'] ?? '');
$filiere = trim($_GET['filiere'] ?? '');
$matiere = trim($_GET['matiere'] ?? '');
$query   = trim($_GET['q'] ?? '');
$page    = max(1, (int)($_GET['page'] ?? 1));
$limit   = (int)($_GET['limit'] ?? 50);
$limit   = $limit > 0 ? min($limit, 200) : 50;
$offset  = ($page - 1) * $limit;

$where  = ' WHERE d.statut = "valide"';
$params = [];
$requestUserId = gc_optional_user_id();

// Special category: return only the authenticated user's uploads
if (in_array(strtolower($category), ['my-notes', 'personal', 'mine'], true)) {
    require_once '../../middleware/auth.php';
    $userId = verifyToken();
    $where .= ' AND d.utilisateur_id = ?';
    $params[] = $userId;
}

if ($filiere && $filiere !== 'all') {
    $where .= ' AND (f.nom = ? OR f.code = ?)';
    $params[] = $filiere;
    $params[] = $filiere;
}
if ($matiere) {
    $where .= ' AND (m.nom = ? OR m.code = ?)';
    $params[] = $matiere;
    $params[] = $matiere;
}
if ($query) {
    $where .= ' AND (d.titre LIKE ? OR d.description LIKE ?)';
    $params[] = "%$query%";
    $params[] = "%$query%";
}

// total count
$stmt = $pdo->prepare(
    'SELECT COUNT(*) AS total '
  . 'FROM documents d '
  . 'JOIN utilisateurs u ON d.utilisateur_id = u.id '
  . 'JOIN matieres m ON d.matiere_id = m.id '
  . 'JOIN filieres f ON m.filiere_id = f.id '
  . $where
);
$stmt->execute($params);
$total = (int)($stmt->fetch()['total'] ?? 0);

// data page
$stmt = $pdo->prepare(
    'SELECT d.*, u.nom AS auteur_nom, m.nom AS matiere_nom, f.nom AS filiere_nom, '
  . ($requestUserId !== null
        ? '(CASE WHEN EXISTS(SELECT 1 FROM transactions t WHERE t.utilisateur_id = ' . (int)$requestUserId . ' AND t.document_id = d.id AND t.type = "achat" AND t.statut = "complete") THEN 1 ELSE 0 END) AS is_purchased '
        : '0 AS is_purchased ')
  . 'FROM documents d '
  . 'JOIN utilisateurs u ON d.utilisateur_id = u.id '
  . 'JOIN matieres m ON d.matiere_id = m.id '
  . 'JOIN filieres f ON m.filiere_id = f.id '
  . $where
  . ' ORDER BY d.date_upload DESC '
  . ' LIMIT ' . (int)$limit . ' OFFSET ' . (int)$offset
);
$stmt->execute($params);
$rows = $stmt->fetchAll();

$base = gc_base_url();

$items = array_map(function ($r) use ($base, $requestUserId) {
    $price = (float)($r['prix'] ?? 0);
    $path  = (string)($r['chemin_fichier'] ?? '');
    $mime  = (string)($r['type_fichier'] ?? '');
    $docOwnerId = (int)($r['utilisateur_id'] ?? 0);

    $category = gc_category_from_doc($r);
    // Always use download.php endpoint to handle file access control
    $downloadUrl = $base . '/api/documents/download.php?id=' . (int)$r['id'];
    $authorHandle = '@' . (gc_slug((string)($r['auteur_nom'] ?? 'user')) ?: 'user');
    $isPaid = $price > 0;
    $isOwnedByRequester = $requestUserId !== null && $requestUserId === $docOwnerId;
    $hasPurchased = (int)($r['is_purchased'] ?? 0) === 1;
    $canDownload = !$isPaid || $isOwnedByRequester || $hasPurchased;

    return [
        'id'           => (int)$r['id'],
        'title'        => $r['titre'],
        'author'       => $authorHandle,
        'description'  => $r['description'] ?? '',
        'badge'        => ($price > 0 ? 'Paid' : 'Free'),
        'badge_class'  => ($price > 0 ? 'badge-teal' : 'badge-blue'),
        'file_type'    => gc_file_type($path, $mime),
        'category'     => $category,
        'download_url' => $downloadUrl,
        'price'        => $price,
        'date'         => $r['date_upload'],
        'created_at'   => $r['date_upload'],
        'filiere'      => $r['filiere_nom'] ?? '',
        'matiere'      => $r['matiere_nom'] ?? '',
        'is_paid'      => $isPaid,
        'owner_id'     => $docOwnerId,
        'is_owned'     => $isOwnedByRequester,
        'is_purchased' => $hasPurchased,
        'can_download' => $canDownload,
    ];
}, $rows);

echo json_encode([
    'success' => true,
    'data'    => $items,
    'total'   => $total,
    'page'    => $page,
    'limit'   => $limit,
]);
