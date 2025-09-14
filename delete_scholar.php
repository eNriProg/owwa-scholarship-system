<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    // Get input data
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Check if JSON decode was successful
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON data');
    }
    
    $scholarId = $input['id'] ?? null;
    
    if (!$scholarId) {
        throw new Exception('Scholar ID is required');
    }
    
    // Database configuration - update these with your actual database credentials
    $host = 'localhost';
    $dbname = 'owwa_db';
    $username = 'root'; // Update with your database username
    $password = '';     // Update with your database password
    
    // Create PDO connection
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    
    $pdo = new PDO($dsn, $username, $password, $options);
    
    // First, check if the scholar exists
    $checkStmt = $pdo->prepare("SELECT id, first_name, last_name FROM scholars WHERE id = ?");
    $checkStmt->execute([$scholarId]);
    $scholar = $checkStmt->fetch();
    
    if (!$scholar) {
        throw new Exception('Scholar not found');
    }
    
    // Delete the scholar
    $deleteStmt = $pdo->prepare("DELETE FROM scholars WHERE id = ?");
    $result = $deleteStmt->execute([$scholarId]);
    
    if ($result && $deleteStmt->rowCount() > 0) {
        echo json_encode([
            'success' => true, 
            'message' => 'Scholar deleted successfully',
            'deleted_scholar' => [
                'id' => $scholar['id'],
                'name' => $scholar['first_name'] . ' ' . $scholar['last_name']
            ]
        ]);
    } else {
        throw new Exception('Failed to delete scholar');
    }
    
} catch (PDOException $e) {
    // Database connection or query error
    error_log("Database error in delete_scholar.php: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    // General error
    error_log("Error in delete_scholar.php: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => $e->getMessage()
    ]);
}
?>