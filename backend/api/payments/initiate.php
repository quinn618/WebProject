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
$data   = json_decode(file_get_contents('php://input'), true);
$docId  = intval($data['document_id'] ?? 0);

if (!$docId) {
    echo json_encode(['success' => false, 'message' => 'ID document manquant']);
    exit;
}

// Get user's balance
$stmt = $pdo->prepare('SELECT solde_portefeuille FROM utilisateurs WHERE id = ?');
$stmt->execute([$userId]);
$userRow = $stmt->fetch();
$userBalance = (float)($userRow['solde_portefeuille'] ?? 0);

$stmt = $pdo->prepare('SELECT id, prix FROM documents WHERE id = ?');
$stmt->execute([$docId]);
$doc = $stmt->fetch();

if (!$doc) {
    echo json_encode(['success' => false, 'message' => 'Document introuvable']);
    exit;
}

$price = (float)($doc['prix'] ?? 0);
if ($price <= 0) {
    echo json_encode(['success' => false, 'message' => 'Ce document est gratuit']);
    exit;
}

// Check if user has enough balance
if ($userBalance < $price) {
    echo json_encode([
        'success' => false, 
        'message' => 'Solde insuffisant pour acheter ce document',
        'required' => $price,
        'balance' => $userBalance
    ]);
    exit;
}

$stmt = $pdo->prepare('SELECT id FROM transactions WHERE utilisateur_id = ? AND document_id = ? AND type = "achat" AND statut = "complete" LIMIT 1');
$stmt->execute([$userId, $docId]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'Document déjà acheté']);
    exit;
}

// Create a pending transaction (gateway integration not implemented)
$stmt = $pdo->prepare('INSERT INTO transactions (utilisateur_id, type, montant, methode_paiement, statut, document_id, description) VALUES (?, "achat", ?, NULL, "en_attente", ?, ?)');
$stmt->execute([$userId, $price, $docId, 'Achat document']);
$txnId = (int)$pdo->lastInsertId();

echo json_encode([
    'success' => true,
    'message' => 'Transaction créée - Prêt à confirmer le paiement',
    'payment_url' => null,
    'payment_ref' => 'txn:' . $txnId,
    'data' => [
        'transaction_id' => $txnId,
        'amount' => $price,
        'balance' => $userBalance
    ]
]);
