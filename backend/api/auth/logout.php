<?php
require_once '../../config/cors.php';

// Le logout côté backend est symbolique avec JWT
// Le vrai logout se fait côté front en supprimant le token du localStorage
echo json_encode(['success' => true, 'data' => ['message' => 'Déconnecté avec succès']]);
