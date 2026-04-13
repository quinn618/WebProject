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
$filiere  = trim($data['filiere']  ?? '');
$password = $data['password']      ?? '';

if (!$name || !$email || !$filiere || !$password) {
    echo json_encode(['success' => false, 'error' => 'Tous les champs sont obligatoires']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'error' => 'Email invalide']);
    exit;
}

if (strlen($password) < 6) {
    echo json_encode(['success' => false, 'error' => 'Mot de passe trop court (min. 6 caractères)']);
    exit;
}

$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'error' => 'Email déjà utilisé']);
    exit;
}

$hashed = password_hash($password, PASSWORD_BCRYPT);
$stmt   = $pdo->prepare('INSERT INTO users (name, email, filiere, password) VALUES (?, ?, ?, ?)');
$stmt->execute([$name, $email, $filiere, $hashed]);
$userId = $pdo->lastInsertId();

$token = base64_encode(json_encode([
    'user_id' => $userId,
    'exp'     => time() + 86400
]));

echo json_encode([
    'success' => true,
    'data'    => [
        'token' => $token,
        'user'  => ['id' => $userId, 'name' => $name, 'filiere' => $filiere]
    ]
]);
