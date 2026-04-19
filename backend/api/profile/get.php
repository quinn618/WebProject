<?php

require_once '../../config/cors.php';
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);
require_once '../../config/db.php';
require_once '../../middleware/auth.php';

$userId = verifyToken();

$stmt = $pdo->prepare('SELECT id, nom, email, code_institut, role, solde_portefeuille, date_inscription, aura_points, sold_count FROM utilisateurs WHERE id = ?');
$stmt->execute([$userId]);
$user = $stmt->fetch();

if (!$user) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Utilisateur introuvable']);
    exit;
}

$stmt = $pdo->prepare('SELECT COUNT(*) AS total FROM documents WHERE utilisateur_id = ?');
$stmt->execute([$userId]);
$docsCount = (int)($stmt->fetch()['total'] ?? 0);

$stmt = $pdo->prepare('SELECT COUNT(*) AS total FROM transactions WHERE utilisateur_id = ? AND type = "achat" AND statut = "complete"');
$stmt->execute([$userId]);
$purchasesCount = (int)($stmt->fetch()['total'] ?? 0);

echo json_encode([
    'success' => true,
    'data'    => [
        'id'             => (string)$user['id'],
        'name'           => $user['nom'],
        'email'          => $user['email'],
        'institute_code' => $user['code_institut'],
        'role'           => $user['role'] ?? 'etudiant',
        'sold'           => (float)($user['solde_portefeuille'] ?? 0),
        'created_at'     => $user['date_inscription'],
        'documents_count' => $docsCount,
        'purchases_count' => $purchasesCount,
        'aura_points'    => (int)($user['aura_points'] ?? 0),
        'sold_count'     => (int)($user['sold_count'] ?? 0),
        'filiere'        => $user['code_institut'] ?? '',
        'bio'            => ''
    ]
]);
