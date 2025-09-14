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

$id = isset($input['id']) ? (int)$input['id'] : 0;
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid or missing scholar ID']);
    exit;
}

// Map and sanitize inputs
$program = trim($input['program'] ?? '');
$batch = isset($input['batch']) ? (int)$input['batch'] : null;
$last_name = trim($input['last_name'] ?? '');
$first_name = trim($input['first_name'] ?? '');
$middle_name = trim($input['middle_name'] ?? '');
$birth_date = trim($input['birth_date'] ?? '');
$sex = trim($input['sex'] ?? '');
$home_address = trim($input['home_address'] ?? '');
$province = trim($input['province'] ?? '');
$contact_number = trim($input['contact_number'] ?? '');
$email = trim($input['email'] ?? '');
$course = trim($input['course'] ?? '');
$years = isset($input['years']) ? (int)$input['years'] : null;
$year_level = trim($input['year_level'] ?? '');
$school = trim($input['school'] ?? '');
$school_address = trim($input['school_address'] ?? '');
$remarks = trim($input['remarks'] ?? '');
$bank_details = trim($input['bank_details'] ?? '');
$parent_name = trim($input['parent_name'] ?? '');
$relationship = trim($input['relationship'] ?? '');
$ofw_name = trim($input['ofw_name'] ?? '');
$category = trim($input['category'] ?? '');
$gender = trim($input['gender'] ?? '');
$jobsite = trim($input['jobsite'] ?? '');
$position = trim($input['position'] ?? '');

// Required fields
$required = [
    'program' => $program,
    'batch' => $batch,
    'last_name' => $last_name,
    'first_name' => $first_name,
    'sex' => $sex,
    'home_address' => $home_address,
    'province' => $province,
    'contact_number' => $contact_number,
    'email' => $email    
];
foreach ($required as $field => $value) {
    if ($value === '' || $value === null) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Field '$field' is required"]);
        exit;
    }
}

try {
    // Check if birth_date exists in table
    $hasBirthDate = false;
    if ($result = $conn->query("SHOW COLUMNS FROM scholars LIKE 'birth_date'")) {
        $hasBirthDate = $result->num_rows > 0;
        $result->close();
    }

    // SECURITY CHECK: If bank details are being changed, require OTP verification
    $current_bank_query = "SELECT bank_details FROM scholars WHERE id = ?";
    $current_bank_stmt = $conn->prepare($current_bank_query);
    $current_bank_stmt->bind_param('i', $id);
    $current_bank_stmt->execute();
    $current_bank_result = $current_bank_stmt->get_result();
    
    if ($current_bank_result->num_rows === 0) {
        throw new Exception('Scholar not found');
    }
    
    $current_scholar = $current_bank_result->fetch_assoc();
    $current_bank_stmt->close();
    
    $current_bank_details = $current_scholar['bank_details'] ?? '';
    
    // Clean bank details for comparison
    $clean_bank_details = preg_replace('/[\s\-]/', '', $bank_details);
    $clean_current_bank_details = preg_replace('/[\s\-]/', '', $current_bank_details);
    
    // ✅ Only check OTP if bank details are actually being changed
    $bank_details_changed = ($clean_bank_details !== $clean_current_bank_details);
    
    if ($bank_details_changed) {
        // Check if there's a completed OTP verification for this exact bank update
        $otp_check_query = "
            SELECT p.id, p.status, p.completed_at
            FROM pending_bank_updates p
            INNER JOIN otp_verifications o ON p.otp_verification_id = o.id
            WHERE p.scholar_id = ? 
              AND p.new_bank_details = ?
              AND p.status = 'completed'
              AND o.is_used = TRUE
            ORDER BY p.completed_at DESC
            LIMIT 1
        ";
        
        $otp_check_stmt = $conn->prepare($otp_check_query);
        $otp_check_stmt->bind_param('is', $id, $clean_bank_details);
        $otp_check_stmt->execute();
        $otp_check_result = $otp_check_stmt->get_result();
        
        if ($otp_check_result->num_rows === 0) {
            // No valid OTP verification found for this bank update
            http_response_code(400);
            echo json_encode([
                'success' => false, 
                'message' => 'Bank details cannot be updated without OTP verification. Please use the "Request OTP for Bank Update" button first.',
                'requires_otp' => true
            ]);
            exit;
        }
        
        $otp_data = $otp_check_result->fetch_assoc();
        
        // ✅ Mark the OTP verification as consumed to prevent reuse
        $consume_otp_query = "UPDATE pending_bank_updates SET status = 'consumed' WHERE id = ?";
        $consume_stmt = $conn->prepare($consume_otp_query);
        $consume_stmt->bind_param('i', $otp_data['id']);
        $consume_stmt->execute();
        $consume_stmt->close();
        
        $otp_check_stmt->close();
    }

    // Proceed with the update
    if ($hasBirthDate) {
        $sql = "UPDATE scholars SET 
            program=?, batch=?, last_name=?, first_name=?, middle_name=?, birth_date=?, sex=?, home_address=?, province=?, contact_number=?, email=?,
            course=?, years=?, year_level=?, school=?, school_address=?, remarks=?, bank_details=?,
            parent_name=?, relationship=?, ofw_name=?, category=?, gender=?, jobsite=?, position=?
            WHERE id=?";

        $stmt = $conn->prepare($sql);
        if (!$stmt) throw new Exception('Prepare failed: ' . $conn->error);

        $stmt->bind_param(
            'sissssssssssissssssssssssi',
            $program,
            $batch,
            $last_name,
            $first_name,
            $middle_name,
            $birth_date,
            $sex,
            $home_address,
            $province,
            $contact_number,
            $email,
            $course,
            $years,
            $year_level,
            $school,
            $school_address,
            $remarks,
            $clean_bank_details,
            $parent_name,
            $relationship,
            $ofw_name,
            $category,
            $gender,
            $jobsite,
            $position,
            $id
        );
    } else {
        $sql = "UPDATE scholars SET 
            program=?, batch=?, last_name=?, first_name=?, middle_name=?, sex=?, home_address=?, province=?, contact_number=?, email=?,
            course=?, years=?, year_level=?, school=?, school_address=?, remarks=?, bank_details=?,
            parent_name=?, relationship=?, ofw_name=?, category=?, gender=?, jobsite=?, position=?
            WHERE id=?";

        $stmt = $conn->prepare($sql);
        if (!$stmt) throw new Exception('Prepare failed: ' . $conn->error);

        $stmt->bind_param(
            'sisssssssssissssssssssssi',
            $program,
            $batch,
            $last_name,
            $first_name,
            $middle_name,
            $sex,
            $home_address,
            $province,
            $contact_number,
            $email,
            $course,
            $years,
            $year_level,
            $school,
            $school_address,
            $remarks,
            $clean_bank_details,
            $parent_name,
            $relationship,
            $ofw_name,
            $category,
            $gender,
            $jobsite,
            $position,
            $id
        );
    }

    if (!$stmt->execute()) {
        throw new Exception('Execute failed: ' . $stmt->error);
    }

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} finally {
    if (isset($stmt)) $stmt->close();
    $conn->close();
}
?>