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

    // Fetch the most recent pending bank update
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
        throw new Exception('No pending bank update found for this scholar');
    }

    $pending_data = $pending_result->fetch_assoc();
    $pending_stmt->close();

    // OTP validation checks
    if (strtotime($pending_data['expires_at']) < time()) {
        throw new Exception('OTP has expired. Please request a new OTP.');
    }

    if ($pending_data['is_used']) {
        throw new Exception('OTP has already been used. Please request a new OTP.');
    }

    // FIX: Check max attempts AFTER incrementing (or use >= max_attempts)
    $max_attempts = $pending_data['max_attempts'] ?? 3; // Use database value or default to 3
    
    if ($pending_data['attempts'] >= $max_attempts) {
        throw new Exception('Maximum OTP attempts exceeded. Please request a new OTP.');
    }

    // Verify OTP
    if (!password_verify($otp, $pending_data['otp_hash'])) {
        // FIX: Increment attempts in DB first, then check if we've reached max
        $new_attempts = $pending_data['attempts'] + 1;
        
        $update_attempts_query = "UPDATE otp_verifications SET attempts = ? WHERE id = ?";
        $update_attempts_stmt = $conn->prepare($update_attempts_query);
        $update_attempts_stmt->bind_param('ii', $new_attempts, $pending_data['otp_id']);
        $update_attempts_stmt->execute();
        $update_attempts_stmt->close();

        // Calculate remaining attempts
        $remaining_attempts = $max_attempts - $new_attempts;
        
        if ($remaining_attempts <= 0) {
            throw new Exception("Invalid OTP. Maximum attempts exceeded. Please request a new OTP.");
        } else {
            throw new Exception("Invalid OTP. {$remaining_attempts} attempt(s) remaining.");
        }
    }

    // OTP is valid - proceed with bank update
    $new_bank_details = $pending_data['new_bank_details'];

    $update_scholar_query = "UPDATE scholars SET bank_details = ? WHERE id = ?";
    $update_scholar_stmt = $conn->prepare($update_scholar_query);
    $update_scholar_stmt->bind_param('si', $new_bank_details, $scholar_id);
    if (!$update_scholar_stmt->execute()) {
        throw new Exception('Failed to update scholar bank details: ' . $update_scholar_stmt->error);
    }
    $update_scholar_stmt->close();

    // Mark OTP as used
    $mark_used_query = "UPDATE otp_verifications SET is_used = TRUE, used_at = NOW() WHERE id = ?";
    $mark_used_stmt = $conn->prepare($mark_used_query);
    $mark_used_stmt->bind_param('i', $pending_data['otp_id']);
    $mark_used_stmt->execute();
    $mark_used_stmt->close();

    // Update pending bank update status
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
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} finally {
    $conn->close();
}
?>