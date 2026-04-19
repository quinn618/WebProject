<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';
require_once '../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

$userId = verifyToken();

try {
    // Get all documents uploaded by this user with matiere_id
    $stmt = $pdo->prepare('
        SELECT d.id, d.titre, d.prix, d.matiere_id, d.date_upload,
               f.nom AS filiere_nom, m.nom AS matiere_nom,
               (SELECT COUNT(*) FROM transactions 
                WHERE document_id = d.id AND statut = "complete" AND type = "achat") as sales_count,
               (SELECT SUM(t.montant) FROM transactions t
                WHERE t.document_id = d.id AND t.statut = "complete" AND t.type = "achat") as total_earned
        FROM documents d
        JOIN matieres m ON d.matiere_id = m.id
        JOIN filieres f ON m.filiere_id = f.id
        WHERE d.utilisateur_id = ?
        ORDER BY d.date_upload DESC
    ');
    $stmt->execute([$userId]);
    $documents = $stmt->fetchAll();

    // Calculate total earnings
    $totalEarnings = 0;
    foreach ($documents as &$doc) {
        $doc['total_earned'] = (float)($doc['total_earned'] ?? 0);
        $totalEarnings += $doc['total_earned'];
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'documents' => $documents,
            'total_earned' => $totalEarnings,
            'documents_count' => count($documents)
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
}
?>
