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
$docId  = intval($data['document_id'] ?? 0);

if (!$docId) {
    echo json_encode(['success' => false, 'error' => 'ID document manquant']);
    exit;
}

$stmt = $pdo->prepare('SELECT * FROM documents WHERE id = ? AND type = "paid"');
$stmt->execute([$docId]);
$doc = $stmt->fetch();

if (!$doc) {
    echo json_encode(['success' => false, 'error' => 'Document payant introuvable']);
    exit;
}

// Vérifier si déjà acheté
$stmt = $pdo->prepare('SELECT id FROM purchases WHERE user_id = ? AND document_id = ? AND status = "completed"');
$stmt->execute([$userId, $docId]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'error' => 'Document déjà acheté']);
    exit;
}

// Créer la commande en attente
$stmt = $pdo->prepare('INSERT INTO purchases (user_id, document_id, amount, status) VALUES (?, ?, ?, "pending")');
$stmt->execute([$userId, $docId, $doc['price']]);
$purchaseId = $pdo->lastInsertId();

// Ici : intégrer Stripe ou Flouci pour générer l'URL de paiement
// Pour l'instant on retourne l'ID de commande
echo json_encode([
    'success' => true,
    'data'    => [
        'purchase_id' => $purchaseId,
        'amount'      => $doc['price'],
        'message'     => 'Commande créée, en attente de paiement'
    ]
]);
