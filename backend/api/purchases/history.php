<?php
require_once '../../config/cors.php';
require_once '../../config/db.php';
require_once '../../middleware/auth.php';

$userId = verifyToken();

$page  = max(1, (int)($_GET['page'] ?? 1));
$limit = (int)($_GET['limit'] ?? 50);
$limit = $limit > 0 ? min($limit, 200) : 50;
$offset = ($page - 1) * $limit;

$stmt = $pdo->prepare('SELECT COUNT(*) AS total FROM transactions WHERE utilisateur_id = ? AND type = "achat" AND statut = "complete"');
$stmt->execute([$userId]);
$total = (int)($stmt->fetch()['total'] ?? 0);

$stmt = $pdo->prepare(
    'SELECT t.id, t.document_id, t.montant, t.date_transaction, d.titre, d.type_fichier, '
  . 'f.nom AS filiere_nom, m.nom AS matiere_nom '
  . 'FROM transactions t '
  . 'JOIN documents d ON t.document_id = d.id '
  . 'JOIN matieres m ON d.matiere_id = m.id '
  . 'JOIN filieres f ON m.filiere_id = f.id '
  . 'WHERE t.utilisateur_id = ? AND t.type = "achat" AND t.statut = "complete" '
  . 'ORDER BY t.date_transaction DESC '
  . 'LIMIT ' . (int)$limit . ' OFFSET ' . (int)$offset
);
$stmt->execute([$userId]);
$rows = $stmt->fetchAll();

$items = array_map(function ($r) {
    return [
        'id'                 => (int)$r['id'],
        'document_id'        => (int)$r['document_id'],
        'title'              => $r['titre'],
        'document_title'     => $r['titre'],
        'filiere'            => $r['filiere_nom'] ?? '',
        'matiere'            => $r['matiere_nom'] ?? '',
        'price'              => (float)$r['montant'],
        'document_file_type' => $r['type_fichier'] ?? null,
        'amount_paid'        => (float)$r['montant'],
        'created_at'         => $r['date_transaction'],
        'purchased_at'       => $r['date_transaction'],
    ];
}, $rows);

echo json_encode([
    'success' => true,
    'data'    => $items,
    'total'   => $total,
    'page'    => $page,
    'limit'   => $limit,
]);
