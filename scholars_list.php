<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

require_once __DIR__ . '/../includes/db_conn.php';

try {
    $sql = "SELECT id, program, batch, education_level, last_name, first_name, middle_name, birth_date, sex, province, city, barangay, street,present_address,
                   contact_number, email, course, years, year_level,semester, grading_period, grade_level, strand, school, school_id, school_address, remarks, bank_id,
                   bank_details, parent_name, relationship, ofw_name, category, gender, jobsite, position, created_at
            FROM scholars
            ORDER BY created_at DESC";

    $result = $conn->query($sql);
    if (!$result) {
        throw new Exception('Query failed: ' . $conn->error);
    }

    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }

    echo json_encode(['success' => true, 'data' => $rows]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} finally {
    $conn->close();
}
