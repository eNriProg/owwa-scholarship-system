<?php
session_start();

// Prevent caching of the login page so Back button won't show a stale form
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Expires: Sat, 01 Jan 2000 00:00:00 GMT");

if (isset($_SESSION['admin_id'])) {
    header("Location: ../frontend/index.php"); // Or your protected page
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OWWA Scholarship</title>

    <link rel="stylesheet" href="../frontend/assets/css/login.css" />
    <link rel="stylesheet" href="../frontend/assets/css/style.css">
    <link rel="icon" type="images/png" href="../frontend/assets/images/owwa-bg-remove.png" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Lora:wght@400;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>

    <style id="notification-styles">
      .notification { position: fixed; top: 24px; left: 50%; transform: translateX(-50%); right: auto; padding: 15px 20px; border-radius: 8px; color: #fff; font-weight: 500; z-index: 10001; display: flex; align-items: center; gap: 10px; min-width: 300px; max-width: 90vw; box-shadow: 0 4px 12px rgba(0,0,0,.15); animation: slideInDown .25s ease-out; }
      .notification-error { background-color: #ef4444; border-left: 4px solid #dc2626; }
      .notification button { background: none; border: none; color: #fff; font-size: 18px; cursor: pointer; margin-left: auto; padding: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; }
      .notification button:hover { opacity: .8; }
      @keyframes slideInDown { from { transform: translate(-50%, -12px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
    </style>

    <script>
      // Disable BFCache for this page to prevent flicker when navigating back from dashboard
      window.addEventListener('unload', function () {});
    </script>

</head>
<body>
    <div class="login-container">
        <div class="section-wrapper">
            <!-- left branding section -->
            <section class="left">
                <img src="../frontend/assets/images/owwa-bg-remove.png" alt="OWWA-logo" class="logo">

                <div class="branding">
                    <h1>OWWA</h1>
                    <p>Regional Welfare Office IX</p>
                </div>
            </section>

            <!-- Divider -->
            <div class="divider"></div>

            <!-- Right Login Section -->
            <section class="right">
                <div class="header">
                    <h2>Welcome back!</h2>
                    <p>Please enter your credentials.</p>
                </div>

                <form id="loginForm" action="../backend/login.php" method="POST">
                    <div class="form-group">
                        <input type="text" name="username" id="username" required placeholder=" " />
                        <label for="username">Email</label>
                        <i class="input-icon" data-lucide="user"></i>
                    </div>
                    
                    <div class="form-group">
                        <input type="password" name="password" id="password" required placeholder=" " />
                        <label for="password">Password</label>
                        <i class="input-icon" data-lucide="lock"></i>
                    </div>
                    
                </form>

                <div class="action">
                    <button type="submit" form="loginForm">Login</button>
                    <a href="#" class="forgot">Forgot your password?</a>
                </div>                
            </section>
        </div>
    </div>
    

    <script src="../frontend/assets/js/script.js"></script>
    <script>
      // Show login error popup if server set a message
      (function() {
        <?php if (!empty($_SESSION['login_error'])): ?>
          const message = <?php echo json_encode($_SESSION['login_error']); ?>;
          // Use the same notification UI used elsewhere
          (function showLoginError(msg){
            const notification = document.createElement('div');
            notification.className = 'notification notification-error';
            notification.innerHTML = '<span>'+ msg +'</span><button onclick="this.parentElement.remove()">&times;</button>';
            document.body.appendChild(notification);
            setTimeout(() => { if (notification.parentElement) notification.remove(); }, 5000);
          })(message);
          <?php unset($_SESSION['login_error']); ?>
        <?php endif; ?>
      })();
    </script>
    <script>
      // If user navigates back and the page is restored from bfcache, reload so PHP can redirect
      window.addEventListener('pageshow', function (event) {
        const isBackForward = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]?.type) === 'back_forward';
        if (event.persisted || isBackForward) {
          window.location.reload();
        }
      });
    </script>
</body>
</html>