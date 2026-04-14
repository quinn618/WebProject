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

$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
$isMultipart = stripos($contentType, 'multipart/form-data') !== false;

if ($isMultipart) {
    $name  = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
} else {
    $data  = json_decode(file_get_contents('php://input'), true) ?: [];
    $name  = trim($data['name'] ?? '');
    $email = trim($data['email'] ?? '');
}

if (!$name) {
    echo json_encode(['success' => false, 'message' => 'Le nom est obligatoire']);
    exit;
}

// Update only fields that exist in the current DB schema.
// Other frontend fields (bio, github, major, year_level, avatar_url, ...) are ignored for now.
if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Email invalide']);
    exit;
}

if ($email) {
    $stmt = $pdo->prepare('UPDATE utilisateurs SET nom = ?, email = ? WHERE id = ?');
    $stmt->execute([$name, $email, $userId]);
} else {
    $stmt = $pdo->prepare('UPDATE utilisateurs SET nom = ? WHERE id = ?');
    $stmt->execute([$name, $userId]);
}

// Return the updated profile snapshot
$stmt = $pdo->prepare('SELECT id, nom, email, code_institut, role, solde_portefeuille, date_inscription FROM utilisateurs WHERE id = ?');
$stmt->execute([$userId]);
$user = $stmt->fetch();

echo json_encode([
    'success' => true,
    'message' => 'Profil mis à jour',
    'data'    => [
        'id'             => (string)($user['id'] ?? $userId),
        'name'           => $user['nom'] ?? $name,
        'email'          => $user['email'] ?? ($email ?: null),
        'institute_code' => $user['code_institut'] ?? null,
        'role'           => $user['role'] ?? 'etudiant',
        'sold'           => (float)($user['solde_portefeuille'] ?? 0),
        'created_at'     => $user['date_inscription'] ?? null,
    ]
]);
