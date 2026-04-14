<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
    exit;
}

$data     = json_decode(file_get_contents('php://input'), true);
$email    = trim($data['email']    ?? '');
$password = $data['password']      ?? '';
$instituteCode = trim($data['institute_code'] ?? ($data['instituteCode'] ?? ''));

if (!$email || !$password) {
    echo json_encode(['success' => false, 'message' => 'Champs manquants']);
    exit;
}

$stmt = $pdo->prepare('SELECT * FROM utilisateurs WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['mot_de_passe'])) {
    echo json_encode(['success' => false, 'message' => 'Email ou mot de passe incorrect']);
    exit;
}

if ($instituteCode && isset($user['code_institut']) && $user['code_institut'] !== $instituteCode) {
    echo json_encode(['success' => false, 'message' => 'Code institut incorrect']);
    exit;
}

$token = base64_encode(json_encode([
    'user_id' => $user['id'],
    'exp'     => time() + 86400
]));

echo json_encode([
    'success' => true,
    'message' => 'Connexion réussie',
    'token'   => $token,
    'user'    => [
        'id'             => (int)$user['id'],
        'name'           => $user['nom'],
        'email'          => $user['email'],
        'institute_code' => $user['code_institut'] ?? null,
        'role'           => $user['role'] ?? 'etudiant'
    ]
]);
