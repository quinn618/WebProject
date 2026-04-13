<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';
require_once '../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
    exit;
}

$userId     = verifyToken();
$data       = json_decode(file_get_contents('php://input'), true);
$purchaseId = intval($data['purchase_id'] ?? 0);

if (!$purchaseId) {
    echo json_encode(['success' => false, 'error' => 'ID achat manquant']);
    exit;
}

$stmt = $pdo->prepare('SELECT * FROM purchases WHERE id = ? AND user_id = ?');
$stmt->execute([$purchaseId, $userId]);
$purchase = $stmt->fetch();

if (!$purchase) {
    echo json_encode(['success' => false, 'error' => 'Achat introuvable']);
    exit;
}

// Ici : vérifier le paiement auprès de la passerelle (Stripe/Flouci)
// Pour la démo on valide directement
$stmt = $pdo->prepare('UPDATE purchases SET status = "completed" WHERE id = ?');
$stmt->execute([$purchaseId]);

echo json_encode([
    'success' => true,
    'data'    => ['message' => 'Paiement validé, téléchargement débloqué']
]);
