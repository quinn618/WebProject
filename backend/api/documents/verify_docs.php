<?php
require_once '../../config/db.php';

$stmt = $pdo->prepare('SELECT id, titre, chemin_fichier FROM documents WHERE id IN (?, ?, ?) LIMIT 3');
$stmt->execute([147, 155, 159]);
$docs = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Documents from database:\n";
foreach ($docs as $doc) {
    $path = $doc['chemin_fichier'];
    // Match the logic in download.php
    $projectRoot = dirname(dirname(dirname(__DIR__)));
    $filePath = $projectRoot . DIRECTORY_SEPARATOR . ltrim(str_replace('/', DIRECTORY_SEPARATOR, $path), DIRECTORY_SEPARATOR);
    $exists = file_exists($filePath) ? 'YES' : 'NO';
    echo "ID {$doc['id']}: {$doc['titre']}\n";
    echo "  Path from DB: {$path}\n";
    echo "  Full path: {$filePath}\n";
    echo "  Exists: {$exists}\n\n";
}
?>
