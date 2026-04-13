<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';
require_once '../../middleware/auth.php';

$userId = verifyToken();
$docId  = intval($_GET['id'] ?? 0);

if (!$docId) {
    echo json_encode(['success' => false, 'error' => 'ID manquant']);
    exit;
}

$stmt = $pdo->prepare('SELECT * FROM documents WHERE id = ?');
$stmt->execute([$docId]);
$doc = $stmt->fetch();

if (!$doc) {
    echo json_encode(['success' => false, 'error' => 'Document introuvable']);
    exit;
}

// Vérifier accès si document payant
if ($doc['type'] === 'paid') {
    $stmt = $pdo->prepare('SELECT id FROM purchases WHERE user_id = ? AND document_id = ? AND status = "completed"');
    $stmt->execute([$userId, $docId]);
    if (!$stmt->fetch()) {
        echo json_encode(['success' => false, 'error' => 'Achat requis pour télécharger ce document']);
        exit;
    }
}

$filepath = __DIR__ . '/../../../uploads/' . $doc['filename'];
if (!file_exists($filepath)) {
    echo json_encode(['success' => false, 'error' => 'Fichier introuvable sur le serveur']);
    exit;
}

// Enregistrer dans l'historique
$stmt = $pdo->prepare('INSERT IGNORE INTO downloads (user_id, document_id) VALUES (?, ?)');
$stmt->execute([$userId, $docId]);

// Envoyer le fichier
header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="' . $doc['title'] . '.pdf"');
header('Content-Length: ' . filesize($filepath));
readfile($filepath);
exit;