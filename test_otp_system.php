<?php
// Test script to verify OTP system setup
session_start();

// Database connection
require_once __DIR__ . '/../includes/db_conn.php';

echo "<h2>OWWA OTP System Test</h2>";

try {
    // Test 1: Check if required tables exist
    echo "<h3>1. Database Tables Check</h3>";
    
    $tables = ['scholars', 'otp_verifications', 'pending_bank_updates'];
    foreach ($tables as $table) {
        $result = $conn->query("SHOW TABLES LIKE '$table'");
        if ($result->num_rows > 0) {
            echo "✅ Table '$table' exists<br>";
        } else {
            echo "❌ Table '$table' missing<br>";
        }
    }

    // Test 2: Check scholars table structure
    echo "<h3>2. Scholars Table Structure</h3>";
    $result = $conn->query("DESCRIBE scholars");
    if ($result) {
        echo "✅ Scholars table structure:<br>";
        while ($row = $result->fetch_assoc()) {
            echo "- {$row['Field']} ({$row['Type']})<br>";
        }
    } else {
        echo "❌ Could not describe scholars table<br>";
    }

    // Test 3: Check OTP tables structure
    echo "<h3>3. OTP Tables Structure</h3>";
    
    $otp_tables = [
        'otp_verifications' => ['id', 'scholar_id', 'otp_hash', 'expires_at', 'is_used', 'attempts', 'created_at', 'used_at'],
        'pending_bank_updates' => ['id', 'scholar_id', 'new_bank_details', 'otp_verification_id', 'status', 'created_at', 'completed_at']
    ];

    foreach ($otp_tables as $table => $expected_columns) {
        $result = $conn->query("DESCRIBE $table");
        if ($result) {
            echo "✅ Table '$table' structure:<br>";
            $actual_columns = [];
            while ($row = $result->fetch_assoc()) {
                $actual_columns[] = $row['Field'];
                echo "- {$row['Field']} ({$row['Type']})<br>";
            }
            
            // Check if all expected columns exist
            $missing_columns = array_diff($expected_columns, $actual_columns);
            if (empty($missing_columns)) {
                echo "✅ All required columns present<br>";
            } else {
                echo "❌ Missing columns: " . implode(', ', $missing_columns) . "<br>";
            }
        } else {
            echo "❌ Could not describe table '$table'<br>";
        }
        echo "<br>";
    }

    // Test 4: Check if there are any scholars
    echo "<h3>4. Scholars Data Check</h3>";
    $result = $conn->query("SELECT COUNT(*) as count FROM scholars");
    if ($result) {
        $row = $result->fetch_assoc();
        echo "✅ Found {$row['count']} scholars in database<br>";
        
        if ($row['count'] > 0) {
            // Show a sample scholar
            $result = $conn->query("SELECT id, first_name, last_name, email, bank_details FROM scholars LIMIT 1");
            if ($result) {
                $scholar = $result->fetch_assoc();
                echo "Sample scholar: {$scholar['first_name']} {$scholar['last_name']} (ID: {$scholar['id']})<br>";
                echo "Email: {$scholar['email']}<br>";
                echo "Bank Details: " . ($scholar['bank_details'] ?: 'Not set') . "<br>";
            }
        }
    } else {
        echo "❌ Could not count scholars<br>";
    }

    // Test 5: Test OTP generation (without actually inserting)
    echo "<h3>5. OTP Generation Test</h3>";
    $test_otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $test_hash = password_hash($test_otp, PASSWORD_DEFAULT);
    echo "✅ Generated test OTP: $test_otp<br>";
    echo "✅ Hash generated: " . substr($test_hash, 0, 20) . "...<br>";
    echo "✅ Hash verification: " . (password_verify($test_otp, $test_hash) ? 'PASS' : 'FAIL') . "<br>";

    // Test 6: Check PHPMailer availability
    echo "<h3>6. PHPMailer Check</h3>";
    $phpmailer_path = __DIR__ . '/../vendor/phpmailer/phpmailer/src/PHPMailer.php';
    if (file_exists($phpmailer_path)) {
        echo "✅ PHPMailer found at: $phpmailer_path<br>";
    } else {
        echo "❌ PHPMailer not found. Email functionality will not work.<br>";
        echo "Run: composer install in the project root<br>";
    }

    echo "<h3>7. System Status</h3>";
    echo "✅ OTP system is ready for testing!<br>";
    echo "<br><strong>Next Steps:</strong><br>";
    echo "1. Open the frontend and edit a scholar<br>";
    echo "2. Change bank details and click 'Request OTP for Bank Update'<br>";
    echo "3. On localhost, the OTP will be displayed on screen<br>";
    echo "4. On production, OTP will be sent via email<br>";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "<br>";
} finally {
    $conn->close();
}
?>
