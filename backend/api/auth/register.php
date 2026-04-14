<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
    exit;
}

$data     = json_decode(file_get_contents('php://input'), true);
$name     = trim($data['name']     ?? '');
$email    = trim($data['email']    ?? '');
$password = $data['password']      ?? '';
$passwordConfirm = $data['password_confirm'] ?? ($data['passwordConfirm'] ?? null);
$instituteCode   = trim($data['institute_code'] ?? ($data['instituteCode'] ?? ''));

if (!$name || !$email || !$password || !$instituteCode) {
    echo json_encode(['success' => false, 'message' => 'Tous les champs sont obligatoires']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Email invalide']);
    exit;
}

if ($passwordConfirm !== null && $password !== $passwordConfirm) {
    echo json_encode(['success' => false, 'message' => 'La confirmation du mot de passe ne correspond pas']);
    exit;
}

if (strlen($password) < 6) {
    echo json_encode(['success' => false, 'message' => 'Mot de passe trop court (min. 6 caractères)']);
    exit;
}

$stmt = $pdo->prepare('SELECT id FROM utilisateurs WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'Email déjà utilisé']);
    exit;
}

$hashed = password_hash($password, PASSWORD_BCRYPT);
$stmt   = $pdo->prepare('INSERT INTO utilisateurs (nom, email, mot_de_passe, code_institut, aura_points, sold_count) VALUES (?, ?, ?, ?, 0, 0)');
$stmt->execute([$name, $email, $hashed, $instituteCode]);
$userId = $pdo->lastInsertId();

$token = base64_encode(json_encode([
    'user_id' => $userId,
    'exp'     => time() + 86400
]));

echo json_encode([
    'success' => true,
    'message' => 'Compte créé avec succès',
    'token'   => $token,
    'user'    => [
        'id'             => (int)$userId,
        'name'           => $name,
        'email'          => $email,
        'institute_code' => $instituteCode,
        'role'           => 'etudiant'
    ]
]);
