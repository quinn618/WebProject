<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';
require_once '../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
    exit;
}

$userId = verifyToken();
$data   = json_decode(file_get_contents('php://input'), true);

$name    = trim($data['name']    ?? '');
$bio     = trim($data['bio']     ?? '');
$filiere = trim($data['filiere'] ?? '');

if (!$name) {
    echo json_encode(['success' => false, 'error' => 'Le nom est obligatoire']);
    exit;
}

$stmt = $pdo->prepare('UPDATE users SET name = ?, bio = ?, filiere = ? WHERE id = ?');
$stmt->execute([$name, $bio, $filiere, $userId]);

echo json_encode(['success' => true, 'data' => ['message' => 'Profil mis à jour']]);
