<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

require_once __DIR__ . '/../includes/db_conn.php';

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
    exit;
}

// Sanitize inputs
$input = array_map(function($v) {
    return is_string($v) ? trim($v) : $v;
}, $input);

// Required fields
$required = ['program','batch','last_name','first_name','sex','home_address','province','contact_number','email'];
foreach ($required as $field) {
    if (empty($input[$field]) && $input[$field] !== '0') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Field '$field' is required"]);
        exit;
    }
}

// Validate bank details if provided
if (isset($input['bank_details']) && !empty($input['bank_details'])) {
    $bank_details = trim($input['bank_details']);
    
    // Clean bank details (remove spaces and dashes)
    $clean_bank_details = preg_replace('/[\s\-]/', '', $bank_details);
    
    if (strlen($clean_bank_details) < 6 || strlen($clean_bank_details) > 20) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Bank account must be 6-20 digits long']);
        exit;
    }
    
    if (!preg_match('/^\d+$/', $clean_bank_details)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Bank account must contain only numbers']);
        exit;
    }
    
    // Check for duplicate bank accounts
    $duplicate_check_query = "SELECT id, first_name, last_name FROM scholars WHERE bank_details = ?";
    $duplicate_stmt = $conn->prepare($duplicate_check_query);
    $duplicate_stmt->bind_param('s', $clean_bank_details);
    $duplicate_stmt->execute();
    $duplicate_result = $duplicate_stmt->get_result();
    
    if ($duplicate_result->num_rows > 0) {
        $duplicate_scholar = $duplicate_result->fetch_assoc();
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => "Bank account number already exists for scholar: {$duplicate_scholar['first_name']} {$duplicate_scholar['last_name']}"
        ]);
        $duplicate_stmt->close();
        exit;
    }
    $duplicate_stmt->close();
    
    // Update the input with cleaned bank details
    $input['bank_details'] = $clean_bank_details;
}

// Get existing columns in scholars table
$columns = [];
$result = $conn->query("SHOW COLUMNS FROM scholars");
while ($row = $result->fetch_assoc()) {
    $columns[] = $row['Field'];
}
$result->free();

// Prepare dynamic insert
$fields = [];
$placeholders = [];
$values = [];

foreach ($columns as $col) {
    if (isset($input[$col])) {
        $fields[] = $col;
        $placeholders[] = '?';
        $values[] = $input[$col];
    }
}

if (empty($fields)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No valid data to insert']);
    exit;
}

$sql = "INSERT INTO scholars (" . implode(',', $fields) . ") VALUES (" . implode(',', $placeholders) . ")";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]);
    exit;
}

// Bind types dynamically
$types = '';
foreach ($values as $v) {
    $types .= is_int($v) ? 'i' : 's';
}
$stmt->bind_param($types, ...$values);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Execute failed: ' . $stmt->error]);
    exit;
}

echo json_encode(['success' => true, 'id' => $conn->insert_id]);

$stmt->close();
$conn->close();
