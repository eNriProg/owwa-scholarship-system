<?php
session_start();
require_once "../includes/db_conn.php"; // Your DB connection file

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);

    $stmt = $conn->prepare("SELECT * FROM admin_users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($user = $result->fetch_assoc()) {
        // Verify password
        if ($password === $user['password']) {
            $_SESSION['admin_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            header("Location: ../frontend/index.php");
            exit;
        } else {
            $_SESSION['login_error'] = 'Incorrect username or password.';
            header("Location: ../frontend/login.php");
            exit;
        }
    } else {
        $_SESSION['login_error'] = 'Incorrect username or password.';
        header("Location: ../frontend/login.php");
        exit;
    }
}
?>
