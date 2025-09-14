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
$otp = trim($input['otp'] ?? '');

if ($scholar_id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid or missing scholar ID']);
    exit;
}

if (empty($otp) || !preg_match('/^\d{6}$/', $otp)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'OTP must be 6 digits']);
    exit;
}

try {
    $conn->begin_transaction();

    // Fetch the most recent pending bank update with OTP details
    $pending_query = "
        SELECT p.id, p.new_bank_details, o.id as otp_id, o.otp_hash, o.expires_at, o.is_used, o.attempts, o.max_attempts
        FROM pending_bank_updates p
        INNER JOIN otp_verifications o ON p.otp_verification_id = o.id
        WHERE p.scholar_id = ? AND p.status = 'pending'
        ORDER BY p.created_at DESC
        LIMIT 1
    ";
    $pending_stmt = $conn->prepare($pending_query);
    $pending_stmt->bind_param('i', $scholar_id);
    $pending_stmt->execute();
    $pending_result = $pending_stmt->get_result();

    if ($pending_result->num_rows === 0) {
        throw new Exception('No OTP request found. Please request an OTP first.');
    }

    $pending_data = $pending_result->fetch_assoc();
    $pending_stmt->close();

    $max_attempts = $pending_data['max_attempts'] ?? 3;
    $current_attempts = $pending_data['attempts'] ?? 0;

    // Check if OTP has expired
    if (strtotime($pending_data['expires_at']) < time()) {
        // Mark as expired
        $expire_query = "UPDATE otp_verifications SET is_used = TRUE, used_at = NOW() WHERE id = ?";
        $expire_stmt = $conn->prepare($expire_query);
        $expire_stmt->bind_param('i', $pending_data['otp_id']);
        $expire_stmt->execute();
        $expire_stmt->close();

        $expire_pending_query = "UPDATE pending_bank_updates SET status = 'expired' WHERE id = ?";
        $expire_pending_stmt = $conn->prepare($expire_pending_query);
        $expire_pending_stmt->bind_param('i', $pending_data['id']);
        $expire_pending_stmt->execute();
        $expire_pending_stmt->close();

        $conn->commit();
        throw new Exception('Your OTP has expired. Please request a new one.');
    }

    // Check if OTP has already been used
    if ($pending_data['is_used']) {
        throw new Exception('This OTP has already been used. Please request a new one.');
    }

    // Check if maximum attempts have been exceeded
    if ($current_attempts >= $max_attempts) {
        throw new Exception('Too many failed attempts. Please request a new OTP.');
    }

    // Verify the OTP
    if (!password_verify($otp, $pending_data['otp_hash'])) {
        // Increment attempts
        $new_attempts = $current_attempts + 1;
        
        // Add delay for brute force protection (progressive delay)
        $delay_seconds = min($new_attempts * 2, 10); // Max 10 seconds delay
        if ($delay_seconds > 0) {
            sleep($delay_seconds);
        }
        
        // Update attempts in database
        $update_attempts_query = "UPDATE otp_verifications SET attempts = ? WHERE id = ?";
        $update_attempts_stmt = $conn->prepare($update_attempts_query);
        $update_attempts_stmt->bind_param('ii', $new_attempts, $pending_data['otp_id']);
        
        if (!$update_attempts_stmt->execute()) {
            error_log("Failed to update OTP attempts: " . $update_attempts_stmt->error);
        }
        $update_attempts_stmt->close();

        // If max attempts reached, lock the OTP
        if ($new_attempts >= $max_attempts) {
            // Mark OTP as used (blocked)
            $block_otp_query = "UPDATE otp_verifications SET is_used = TRUE, used_at = NOW() WHERE id = ?";
            $block_otp_stmt = $conn->prepare($block_otp_query);
            $block_otp_stmt->bind_param('i', $pending_data['otp_id']);
            $block_otp_stmt->execute();
            $block_otp_stmt->close();
            
            // Mark pending update as failed
            $fail_pending_query = "UPDATE pending_bank_updates SET status = 'failed', completed_at = NOW() WHERE id = ?";
            $fail_pending_stmt = $conn->prepare($fail_pending_query);
            $fail_pending_stmt->bind_param('i', $pending_data['id']);
            $fail_pending_stmt->execute();
            $fail_pending_stmt->close();
            
            $conn->commit();
            throw new Exception("Too many failed attempts. Please request a new OTP.");
        }

        // Commit the attempt increment
        $conn->commit();
        
        // Calculate remaining attempts
        $remaining_attempts = $max_attempts - $new_attempts;
        throw new Exception("The OTP you entered is incorrect. You have {$remaining_attempts} attempt(s) remaining.");
    }

    // OTP is valid - proceed with bank update
    $new_bank_details = $pending_data['new_bank_details'];

    // Update scholar's bank details
    $update_scholar_query = "UPDATE scholars SET bank_details = ? WHERE id = ?";
    $update_scholar_stmt = $conn->prepare($update_scholar_query);
    $update_scholar_stmt->bind_param('si', $new_bank_details, $scholar_id);
    if (!$update_scholar_stmt->execute()) {
        throw new Exception('Failed to update scholar bank details: ' . $update_scholar_stmt->error);
    }
    $update_scholar_stmt->close();

    // Mark OTP as used and verified
    $mark_used_query = "UPDATE otp_verifications SET is_used = TRUE, is_verified = TRUE, used_at = NOW() WHERE id = ?";
    $mark_used_stmt = $conn->prepare($mark_used_query);
    $mark_used_stmt->bind_param('i', $pending_data['otp_id']);
    $mark_used_stmt->execute();
    $mark_used_stmt->close();

    // Update pending bank update status to completed
    $update_status_query = "UPDATE pending_bank_updates SET status = 'completed', completed_at = NOW() WHERE id = ?";
    $update_status_stmt = $conn->prepare($update_status_query);
    $update_status_stmt->bind_param('i', $pending_data['id']);
    $update_status_stmt->execute();
    $update_status_stmt->close();

    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Bank details updated successfully',
        'new_bank_details' => $new_bank_details
    ]);

} catch (Exception $e) {
    $conn->rollback();
    
    // Determine appropriate HTTP status code based on error message
    if (strpos($e->getMessage(), 'expired') !== false) {
        http_response_code(410); // Gone
    } elseif (strpos($e->getMessage(), 'already been used') !== false) {
        http_response_code(409); // Conflict
    } elseif (strpos($e->getMessage(), 'Too many failed attempts') !== false) {
        http_response_code(429); // Too Many Requests
    } elseif (strpos($e->getMessage(), 'incorrect') !== false) {
        http_response_code(422); // Unprocessable Entity
    } else {
        http_response_code(400); // Bad Request
    }
    
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} finally {
    $conn->close();
}
?>