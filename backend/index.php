<?php
/**
 * Ghassra API Router
 * Main entry point for all API requests
 */

header('Content-Type: application/json');
header('X-API-Version: v1');

// Load configuration
require_once 'config/db.php';
require_once 'config/cors.php';

// Load middleware
require_once 'middleware/auth.php';

// Get request method and path
$request_method = $_SERVER['REQUEST_METHOD'];
$request_path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request_path = str_replace('/api/', '', $request_path); // Remove /api prefix

// Route the requests
switch (true) {
    // Auth Routes
    case preg_match('#^auth/login$#', $request_path) && $request_method === 'POST':
        require 'api/auth/login.php';
        break;
    
    case preg_match('#^auth/logout$#', $request_path) && $request_method === 'POST':
        require 'api/auth/logout.php';
        break;
    
    case preg_match('#^auth/register$#', $request_path) && $request_method === 'POST':
        require 'api/auth/register.php';
        break;

    // Profile Routes
    case preg_match('#^profile/get$#', $request_path) && $request_method === 'GET':
        require 'api/profile/get.php';
        break;
    
    case preg_match('#^profile/update$#', $request_path) && $request_method === 'PUT':
        require 'api/profile/update.php';
        break;

    // Documents Routes
    case preg_match('#^documents/list$#', $request_path) && $request_method === 'GET':
        require 'api/documents/list.php';
        break;
    
    case preg_match('#^documents/detail/(\d+)$#', $request_path) && $request_method === 'GET':
        require 'api/documents/detail.php';
        break;
    
    case preg_match('#^documents/upload$#', $request_path) && $request_method === 'POST':
        require 'api/documents/upload.php';
        break;
    
    case preg_match('#^documents/delete/(\d+)$#', $request_path) && $request_method === 'DELETE':
        require 'api/documents/delete.php';
        break;
    
    case preg_match('#^documents/download/(\d+)$#', $request_path) && $request_method === 'GET':
        require 'api/documents/download.php';
        break;

    // Payments Routes
    case preg_match('#^payments/initiate$#', $request_path) && $request_method === 'POST':
        require 'api/payments/initiate.php';
        break;
    
    case preg_match('#^payments/verify$#', $request_path) && $request_method === 'POST':
        require 'api/payments/verify.php';
        break;

    // Purchases Routes
    case preg_match('#^purchases/history$#', $request_path) && $request_method === 'GET':
        require 'api/purchases/history.php';
        break;

    // 404 Not Found
    default:
        http_response_code(404);
        echo json_encode([
            'error' => 'Endpoint not found',
            'path' => $request_path,
            'method' => $request_method
        ]);
        break;
}
?>
