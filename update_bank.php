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

$scholar_id = isset($input['scholar_id']) ? (int)$input['scholar_id'] : 0;
$new_bank_details = trim($input['bank_details'] ?? '');

if ($scholar_id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid or missing scholar ID']);
    exit;
}

if (empty($new_bank_details)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Bank details are required']);
    exit;
}

// Clean and validate bank details format (6-20 digits)
$clean_bank_details = preg_replace('/[\s\-]/', '', $new_bank_details);
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

// Optional: Check for duplicate bank accounts
$duplicate_check_query = "SELECT id, first_name, last_name FROM scholars WHERE bank_details = ? AND id != ?";
$duplicate_stmt = $conn->prepare($duplicate_check_query);
$duplicate_stmt->bind_param('si', $clean_bank_details, $scholar_id);
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

try {
    // ✅ CHECK FOR 24-HOUR COOLDOWN ON SUCCESSFUL BANK UPDATES
    $cooldown_check_query = "
        SELECT completed_at 
        FROM pending_bank_updates 
        WHERE scholar_id = ? 
          AND status = 'completed' 
          AND completed_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
        ORDER BY completed_at DESC 
        LIMIT 1
    ";
    
    $cooldown_stmt = $conn->prepare($cooldown_check_query);
    $cooldown_stmt->bind_param('i', $scholar_id);
    $cooldown_stmt->execute();
    $cooldown_result = $cooldown_stmt->get_result();
    
    if ($cooldown_result->num_rows > 0) {
        $last_update = $cooldown_result->fetch_assoc();
        $last_update_time = strtotime($last_update['completed_at']);
        $current_time = time();
        $time_diff = $current_time - $last_update_time;
        $hours_remaining = 24 - floor($time_diff / 3600);
        $minutes_remaining = 60 - floor(($time_diff % 3600) / 60);
        
        // If less than 24 hours have passed
        if ($time_diff < (24 * 3600)) {
            $cooldown_stmt->close();
            http_response_code(400);
            
            if ($hours_remaining > 0) {
                $wait_message = "You must wait {$hours_remaining} hour(s) and {$minutes_remaining} minute(s) before updating bank details again. Please try again later.";
            } else {
                $wait_message = "You must wait {$minutes_remaining} minute(s) before updating bank details again. Please try again later.";
            }
            
            echo json_encode([
                'success' => false, 
                'message' => $wait_message,
                'cooldown_active' => true,
                'hours_remaining' => $hours_remaining,
                'minutes_remaining' => $minutes_remaining
            ]);
            exit;
        }
    }
    $cooldown_stmt->close();

    // Start transaction
    $conn->begin_transaction();

    // Get scholar email for OTP delivery
    $scholar_query = "SELECT email, first_name, last_name FROM scholars WHERE id = ?";
    $scholar_stmt = $conn->prepare($scholar_query);
    $scholar_stmt->bind_param('i', $scholar_id);
    $scholar_stmt->execute();
    $scholar_result = $scholar_stmt->get_result();
    
    if ($scholar_result->num_rows === 0) {
        throw new Exception('Scholar not found');
    }
    
    $scholar = $scholar_result->fetch_assoc();
    $scholar_stmt->close();

    // Generate 6-digit OTP
    $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $otp_hash = password_hash($otp, PASSWORD_DEFAULT);

    // Set expiry time (15 minutes from now)
    $expires_at = date('Y-m-d H:i:s', time() + (15 * 60));
    
    // Define max_attempts variable
    $max_attempts = 3;

    // Insert OTP verification record with attempts initialized to 0
    $otp_query = "INSERT INTO otp_verifications 
        (scholar_id, otp_hash, purpose, created_at, expires_at, attempts, max_attempts, is_verified, is_used) 
        VALUES (?, ?, ?, NOW(), ?, 0, ?, 0, 0)";

    $otp_stmt = $conn->prepare($otp_query);
    $purpose = 'bank_update';
    $otp_stmt->bind_param('isssi', $scholar_id, $otp_hash, $purpose, $expires_at, $max_attempts);
    $otp_stmt->execute();
    $otp_id = $conn->insert_id;
    $otp_stmt->close();

    // Insert pending bank update record
    $pending_query = "INSERT INTO pending_bank_updates (scholar_id, new_bank_details, otp_verification_id, status, created_at) VALUES (?, ?, ?, 'pending', NOW())";
    $pending_stmt = $conn->prepare($pending_query);
    $pending_stmt->bind_param('isi', $scholar_id, $clean_bank_details, $otp_id);
    $pending_stmt->execute();
    $pending_stmt->close();

    // Commit transaction
    $conn->commit();

    // Send OTP (display on localhost, email on production)
    $is_localhost = ($_SERVER['HTTP_HOST'] === 'localhost' || $_SERVER['HTTP_HOST'] === '127.0.0.1' || strpos($_SERVER['HTTP_HOST'], 'localhost') !== false);
    
    if ($is_localhost) {
        // On localhost, just return the OTP for display
        echo json_encode([
            'success' => true, 
            'message' => 'OTP generated successfully',
            'otp' => $otp,
            'scholar_name' => $scholar['first_name'] . ' ' . $scholar['last_name'],
            'expires_in' => 15
        ]);
    } else {
        // On production, send email using PHPMailer
        require_once __DIR__ . '/../vendor/autoload.php';
        
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        
        try {
            // SMTP configuration
            $mail->isSMTP();
            $mail->Host = 'smtp.hostinger.com';
            $mail->SMTPAuth = true;
            $mail->Username = 'your-email@yourdomain.com';
            $mail->Password = 'your-email-password';
            $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;

            // Recipients
            $mail->setFrom('noreply@yourdomain.com', 'OWWA Scholarship System');
            $mail->addAddress($scholar['email'], $scholar['first_name'] . ' ' . $scholar['last_name']);

            // Content
            $mail->isHTML(true);
            $mail->Subject = 'Bank Account Update Verification - OTP';
            $mail->Body = "
                <h2>Bank Account Update Verification</h2>
                <p>Dear {$scholar['first_name']} {$scholar['last_name']},</p>
                <p>You have requested to update your bank account details. Please use the following OTP to verify this change:</p>
                <div style='background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;'>
                    {$otp}
                </div>
                <p><strong>This OTP will expire in 15 minutes.</strong></p>
                <p>If you did not request this change, please contact the administrator immediately.</p>
                <br>
                <p>Best regards,<br>OWWA Scholarship Management System</p>
            ";

            $mail->send();
            
            echo json_encode([
                'success' => true, 
                'message' => 'OTP sent to scholar email successfully',
                'scholar_name' => $scholar['first_name'] . ' ' . $scholar['last_name'],
                'expires_in' => 15
            ]);
            
        } catch (Exception $e) {
            error_log("Failed to send OTP email: " . $e->getMessage());
            
            echo json_encode([
                'success' => true, 
                'message' => 'OTP generated but email delivery failed. Please contact administrator.',
                'otp' => $otp,
                'scholar_name' => $scholar['first_name'] . ' ' . $scholar['last_name'],
                'expires_in' => 15
            ]);
        }
    }

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} finally {
    $conn->close();
}
?>