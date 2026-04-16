<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';
require_once '../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

$userId     = verifyToken();
$data       = json_decode(file_get_contents('php://input'), true);
$paymentRef = trim($data['payment_ref'] ?? '');
$docId      = intval($data['document_id'] ?? 0);

if (!$paymentRef) {
    echo json_encode(['success' => false, 'message' => 'Référence de paiement manquante']);
    exit;
}

if (!str_starts_with($paymentRef, 'txn:')) {
    echo json_encode(['success' => false, 'message' => 'Référence de paiement invalide']);
    exit;
}

$txnId = (int)substr($paymentRef, 4);
if ($txnId <= 0) {
    echo json_encode(['success' => false, 'message' => 'Référence de paiement invalide']);
    exit;
}

$stmt = $pdo->prepare('SELECT * FROM transactions WHERE id = ? AND utilisateur_id = ? LIMIT 1');
$stmt->execute([$txnId, $userId]);
$txn = $stmt->fetch();
if (!$txn) {
    echo json_encode(['success' => false, 'message' => 'Transaction introuvable']);
    exit;
}

$documentId = (int)($txn['document_id'] ?? $docId);
$amount = (float)($txn['montant'] ?? 0);

try {
    $pdo->beginTransaction();

    // Demo: mark as complete
    $stmt = $pdo->prepare('UPDATE transactions SET statut = "complete" WHERE id = ?');
    $stmt->execute([$txnId]);

    if ($documentId > 0) {
        $stmt = $pdo->prepare('INSERT INTO utilisateur_documents (utilisateur_id, document_id, type_acces) VALUES (?, ?, "achete")');
        $stmt->execute([$userId, $documentId]);
        
        // Get the seller (document author)
        $stmt = $pdo->prepare('SELECT utilisateur_id FROM documents WHERE id = ?');
        $stmt->execute([$documentId]);
        $docRow = $stmt->fetch();
        
        if ($docRow) {
            $sellerId = (int)$docRow['utilisateur_id'];
            
            // Deduct from buyer's balance
            $stmt = $pdo->prepare('UPDATE utilisateurs SET solde_portefeuille = solde_portefeuille - ? WHERE id = ?');
            $stmt->execute([$amount, $userId]);
            
            // Add to seller's balance
            $stmt = $pdo->prepare('UPDATE utilisateurs SET solde_portefeuille = solde_portefeuille + ? WHERE id = ?');
            $stmt->execute([$amount, $sellerId]);
            
            // Increment seller's sold_count and aura_points
            $stmt = $pdo->prepare('UPDATE utilisateurs SET sold_count = sold_count + 1, aura_points = aura_points + 15 WHERE id = ?');
            $stmt->execute([$sellerId]);
        }
    }
    
    $pdo->commit();

    echo json_encode([
        'success'  => true,
        'verified' => true,
        'message'  => 'Paiement validé et traité',
        'purchase' => $documentId > 0 ? ['document_id' => $documentId, 'amount' => $amount] : null,
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur lors du traitement: ' . $e->getMessage()
    ]);
}
