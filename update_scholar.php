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

// Map and sanitize inputs with proper null handling
$program = trim($input['program'] ?? '');
$education_level = !empty($input['education_level']) ? trim($input['education_level']) : null;
$batch = isset($input['batch']) ? (int)$input['batch'] : null;
$last_name = trim($input['last_name'] ?? '');
$first_name = trim($input['first_name'] ?? '');
$middle_name = !empty($input['middle_name']) ? trim($input['middle_name']) : null;
$birth_date = !empty($input['birth_date']) ? trim($input['birth_date']) : null;
$sex = trim($input['sex'] ?? '');
$province = trim($input['province'] ?? '');
$city = !empty($input['city']) ? trim($input['city']) : null;
$barangay = !empty($input['barangay']) ? trim($input['barangay']) : null;
$street = !empty($input['street']) ? trim($input['street']) : null;
$present_address = !empty($input['present_address']) ? trim($input['present_address']) : null;
$contact_number = trim($input['contact_number'] ?? '');
$email = trim($input['email'] ?? '');

// Academic fields - handle empty strings as null
$course = !empty($input['course']) ? trim($input['course']) : null;
$semester = !empty($input['semester']) ? trim($input['semester']) : null;
$grading_period = !empty($input['grading_period']) ? trim($input['grading_period']) : null;
$grade_level = !empty($input['grade_level']) ? trim($input['grade_level']) : null;
$strand = !empty($input['strand']) ? trim($input['strand']) : null;
$years = !empty($input['years']) ? (int)$input['years'] : null;
$year_level = !empty($input['year_level']) ? trim($input['year_level']) : null;
$school = !empty($input['school']) ? trim($input['school']) : null;
$school_address = !empty($input['school_address']) ? trim($input['school_address']) : null;
$school_id = !empty($input['school_id']) ? (int)$input['school_id'] : null;

$remarks = !empty($input['remarks']) ? trim($input['remarks']) : null;
$bank_details = trim($input['bank_details'] ?? '');
$bank_id = !empty($input['bank_id']) ? (int)$input['bank_id'] : null;

// OFW fields
$parent_name = !empty($input['parent_name']) ? trim($input['parent_name']) : null;
$relationship = !empty($input['relationship']) ? trim($input['relationship']) : null;
$ofw_name = !empty($input['ofw_name']) ? trim($input['ofw_name']) : null;
$category = !empty($input['category']) ? trim($input['category']) : null;
$gender = !empty($input['gender']) ? trim($input['gender']) : null;
$jobsite = !empty($input['jobsite']) ? trim($input['jobsite']) : null;
$position = !empty($input['position']) ? trim($input['position']) : null;

// DEBUG: Log what we're receiving
error_log("Received data: " . json_encode($input));
error_log("Academic fields - course: '$course', semester: '$semester', grade_level: '$grade_level', school: '$school'");

// Required fields
$required = [
    'program' => $program,
    'batch' => $batch,
    'last_name' => $last_name,
    'first_name' => $first_name,
    'sex' => $sex,
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
    
    $clean_bank_details = preg_replace('/[\s\-]/', '', $bank_details);
    $clean_current_bank_details = preg_replace('/[\s\-]/', '', $current_bank_details);
    
    $bank_details_changed = ($clean_bank_details !== $clean_current_bank_details);
    
    if ($bank_details_changed) {
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
            http_response_code(400);
            echo json_encode([
                'success' => false, 
                'message' => 'Bank details cannot be updated without OTP verification. Please use the "Request OTP for Bank Update" button first.',
                'requires_otp' => true
            ]);
            exit;
        }
        
        $otp_data = $otp_check_result->fetch_assoc();
        
        $consume_otp_query = "UPDATE pending_bank_updates SET status = 'consumed' WHERE id = ?";
        $consume_stmt = $conn->prepare($consume_otp_query);
        $consume_stmt->bind_param('i', $otp_data['id']);
        $consume_stmt->execute();
        $consume_stmt->close();
        
        $otp_check_stmt->close();
    }

    // Proceed with the update - SIMPLIFIED VERSION
    $sql = "UPDATE scholars SET 
    program=?, education_level=?, batch=?, last_name=?, first_name=?, middle_name=?, birth_date=?, sex=?, 
    province=?, city=?, barangay=?, street=?, present_address=?, 
    contact_number=?, email=?, course=?, semester=?, grading_period=?, grade_level=?, strand=?, 
    years=?, year_level=?, school=?, school_address=?, school_id=?, 
    remarks=?, bank_details=?, bank_id=?, parent_name=?, relationship=?, ofw_name=?, category=?, 
    gender=?, jobsite=?, position=? 
    WHERE id=?";

    $stmt = $conn->prepare($sql);
    if (!$stmt) throw new Exception('Prepare failed: ' . $conn->error);

    // DEBUG: Let's count the parameters manually
    $params = [
        $program,           // 1
        $education_level,   // 2 - NEW
        $batch,             // 3
        $last_name,         // 4
        $first_name,        // 5
        $middle_name,       // 6
        $birth_date,        // 7
        $sex,               // 8
        $province,          // 9
        $city,              // 10
        $barangay,          // 11
        $street,            // 12
        $present_address,   // 13
        $contact_number,    // 14
        $email,             // 15
        $course,            // 16
        $semester,          // 17 - NEW
        $grading_period,    // 18 - NEW
        $grade_level,       // 19 - NEW
        $strand,            // 20 - NEW
        $years,             // 21
        $year_level,        // 22
        $school,            // 23
        $school_address,    // 24
        $school_id,         // 25 - NEW
        $remarks,           // 26
        $clean_bank_details,// 27
        $bank_id,           // 28 - NEW
        $parent_name,       // 29
        $relationship,      // 30
        $ofw_name,          // 31
        $category,          // 32
        $gender,            // 33
        $jobsite,           // 34
        $position,          // 35
        $id                 // 36
    ];

    // Build type string dynamically
    $types = '';
    foreach ($params as $param) {
        if (is_int($param) || $param === null) {
            $types .= 'i';
        } else {
            $types .= 's';
        }
    }

    // This should be: sisssssssssssisssssssssssssi
    error_log("Parameter count: " . count($params));
    error_log("Type string: " . $types);
    error_log("Type string length: " . strlen($types));

    $stmt->bind_param($types, ...$params);

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