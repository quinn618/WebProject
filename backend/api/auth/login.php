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

if (!$email || !$password) {
    echo json_encode(['success' => false, 'error' => 'Champs manquants']);
    exit;
}

$stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password'])) {
    echo json_encode(['success' => false, 'error' => 'Email ou mot de passe incorrect']);
    exit;
}

$token = base64_encode(json_encode([
    'user_id' => $user['id'],
    'exp'     => time() + 86400
]));

echo json_encode([
    'success' => true,
    'data'    => [
        'token' => $token,
        'user'  => [
            'id'      => $user['id'],
            'name'    => $user['name'],
            'filiere' => $user['filiere'],
            'photo'   => $user['photo']
        ]
    ]
]);
