<?php
function verifyToken() {
    $headers = getallheaders();
    $auth    = $headers['Authorization'] ?? '';

    if (!$auth || !str_starts_with($auth, 'Bearer ')) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Token manquant']);
        exit;
    }

    $token   = substr($auth, 7);
    $decoded = json_decode(base64_decode($token), true);

    if (!$decoded || !isset($decoded['user_id']) || $decoded['exp'] < time()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Token invalide ou expiré']);
        exit;
    }

    return $decoded['user_id'];
}
