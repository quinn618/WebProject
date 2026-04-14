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

$data = json_decode(file_get_contents('php://input'), true);
$docId = (int)($data['id'] ?? 0);

if (!$docId) {
    echo json_encode(['success' => false, 'message' => 'ID du document manquant']);
    exit;
}

// Verify the user owns this document
$stmt = $pdo->prepare('SELECT id, utilisateur_id FROM documents WHERE id = ?');
$stmt->execute([$docId]);
$doc = $stmt->fetch();

if (!$doc) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Document introuvable']);
    exit;
}

if ((int)$doc['utilisateur_id'] !== $userId) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Vous n\'avez pas la permission de supprimer ce document']);
    exit;
}

try {
    // Delete the document
    $stmt = $pdo->prepare('DELETE FROM documents WHERE id = ?');
    $stmt->execute([$docId]);
    
    // Clean up document references
    $stmt = $pdo->prepare('DELETE FROM utilisateur_documents WHERE document_id = ?');
    $stmt->execute([$docId]);
    
    // Decrease user's aura points (-5 for deleting)
    $stmt = $pdo->prepare('UPDATE utilisateurs SET aura_points = GREATEST(0, aura_points - 5) WHERE id = ?');
    $stmt->execute([$userId]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Document supprimé avec succès'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur lors de la suppression']);
}
