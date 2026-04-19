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

try {
    $pdo->beginTransaction();

    // Lock transaction row to guarantee idempotency.
    $stmt = $pdo->prepare('SELECT * FROM transactions WHERE id = ? AND utilisateur_id = ? LIMIT 1 FOR UPDATE');
    $stmt->execute([$txnId, $userId]);
    $txn = $stmt->fetch();
    if (!$txn) {
        throw new Exception('Transaction introuvable');
    }

    $documentId = (int)($txn['document_id'] ?? $docId);
    $amount = (float)($txn['montant'] ?? 0);
    $status = (string)($txn['statut'] ?? '');

    if ($documentId <= 0 || $amount <= 0) {
        throw new Exception('Transaction invalide');
    }

    // Already completed: return success without duplicating money/accounting updates.
    if ($status === 'complete') {
        $pdo->commit();
        echo json_encode([
            'success'  => true,
            'verified' => true,
            'message'  => 'Paiement déjà validé',
            'purchase' => ['document_id' => $documentId, 'amount' => $amount],
        ]);
        exit;
    }

    if ($status !== 'en_attente') {
        throw new Exception('Statut de transaction invalide');
    }

    $stmt = $pdo->prepare('SELECT id, utilisateur_id, prix FROM documents WHERE id = ? LIMIT 1');
    $stmt->execute([$documentId]);
    $docRow = $stmt->fetch();
    if (!$docRow) {
        throw new Exception('Document introuvable');
    }

    $sellerId = (int)$docRow['utilisateur_id'];
    if ($sellerId === $userId) {
        throw new Exception('Vous ne pouvez pas acheter votre propre document');
    }

    // Make sure buyer still has enough balance at verification time.
    $stmt = $pdo->prepare('SELECT solde_portefeuille FROM utilisateurs WHERE id = ? LIMIT 1 FOR UPDATE');
    $stmt->execute([$userId]);
    $buyerRow = $stmt->fetch();
    $balance = (float)($buyerRow['solde_portefeuille'] ?? 0);
    if ($balance < $amount) {
        throw new Exception('Solde insuffisant pour confirmer le paiement');
    }

    // Mark transaction complete first while inside transaction.
    $stmt = $pdo->prepare('UPDATE transactions SET statut = "complete" WHERE id = ?');
    $stmt->execute([$txnId]);

    // Record purchase access once.
    $stmt = $pdo->prepare(
        'INSERT INTO utilisateur_documents (utilisateur_id, document_id, type_acces) VALUES (?, ?, "achete") '
      . 'ON DUPLICATE KEY UPDATE date_acces = CURRENT_TIMESTAMP'
    );
    $stmt->execute([$userId, $documentId]);

    // Transfer funds buyer -> seller.
    $stmt = $pdo->prepare('UPDATE utilisateurs SET solde_portefeuille = solde_portefeuille - ? WHERE id = ?');
    $stmt->execute([$amount, $userId]);

    $stmt = $pdo->prepare('UPDATE utilisateurs SET solde_portefeuille = solde_portefeuille + ?, sold_count = sold_count + 1, aura_points = aura_points + 15 WHERE id = ?');
    $stmt->execute([$amount, $sellerId]);

    $pdo->commit();

    echo json_encode([
        'success'  => true,
        'verified' => true,
        'message'  => 'Paiement validé et traité',
        'purchase' => ['document_id' => $documentId, 'amount' => $amount],
    ]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
