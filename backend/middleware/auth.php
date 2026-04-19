<?php
function gc_request_headers(): array {
    if (function_exists('getallheaders')) {
        $h = getallheaders();
        if (is_array($h)) {
            return $h;
        }
    }
    $out = [];
    foreach ($_SERVER as $key => $value) {
        if (str_starts_with($key, 'HTTP_')) {
            $name = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($key, 5)))));
            $out[$name] = $value;
        }
    }
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        $out['Authorization'] = $_SERVER['HTTP_AUTHORIZATION'];
    }
    if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $out['Authorization'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    return $out;
}

function verifyToken() {
    $headers = gc_request_headers();
    $auth    = $headers['Authorization'] ?? ($headers['authorization'] ?? '');

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
