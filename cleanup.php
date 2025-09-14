<?php
// cleanup.php

// Database connection
$servername = "localhost"; 
$username   = "root";       // change if your DB has a different user
$password   = "";           // change if your DB has a password
$dbname     = "owwa_db";    // your database name

$conn = new mysqli($servername, $username, $password, $dbname);

// Prepare log file
$logFile = __DIR__ . "/cleanup.log";
$time = date("Y-m-d H:i:s");
$logMessages = "=== Cleanup run at $time ===\n";

// Check connection
if ($conn->connect_error) {
    $logMessages .= "Connection failed: " . $conn->connect_error . "\n";
    file_put_contents($logFile, $logMessages, FILE_APPEND);
    die();
}

// 1. Delete expired OTPs + linked pending updates
$deleteQuery = "
    DELETE o, p FROM otp_verifications o
    LEFT JOIN pending_bank_updates p ON p.otp_verification_id = o.id
    WHERE o.expires_at < NOW() 
      AND o.is_used = FALSE
";

if ($conn->query($deleteQuery) === TRUE) {
    $logMessages .= "Deleted OTP + updates: " . $conn->affected_rows . " rows\n";
} else {
    $logMessages .= "Error deleting: " . $conn->error . "\n";
}

// 2. Update expired pending requests
$updateQuery = "
    UPDATE pending_bank_updates p
    INNER JOIN otp_verifications o ON p.otp_verification_id = o.id
    SET p.status = 'expired'
    WHERE o.expires_at < NOW() 
      AND p.status = 'pending'
";

if ($conn->query($updateQuery) === TRUE) {
    $logMessages .= "Expired requests updated: " . $conn->affected_rows . " rows\n";
} else {
    $logMessages .= "Error updating: " . $conn->error . "\n";
}

$conn->close();

// Write log
$logMessages .= "=== Cleanup finished ===\n\n";
file_put_contents($logFile, $logMessages, FILE_APPEND);

echo "Cleanup executed. Check cleanup.log for details.\n";
?>
