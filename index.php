<?php
session_start();

// Prevent caching of the protected page to avoid Back showing stale content
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Expires: Sat, 01 Jan 2000 00:00:00 GMT");

if (!isset($_SESSION['admin_id'])) {
	header("Location: ../frontend/login.php");
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

	<link rel="stylesheet" href="../frontend/assets/css/style.css"/>
	<link rel="icon" type="image/png" href="../frontend/assets/images/owwa-bg-remove.png" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Lora:wght@400;700&display=swap" rel="stylesheet">
	<script src="https://unpkg.com/lucide@latest"></script>
	<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels"></script>
</head>
<body> 
	 <!-- top bar section -->
	 <header>
		<!-- left section topbar -->
		<div class="left-section">
			<div class="left-wrapper">
				<img src="../frontend/assets/images/owwa-bg-remove.png" alt="Owwa-logo" height="45px">

				<div class="title-header">
					<h4>OWWA</h4>
					<p>Scholarship & Monitoring</p>
				</div>
			</div>
			
			<div class="section-title-bar" id="sectionTitleBar" style="display: flex; align-items: center;">
				<i id="sectionIcon" data-lucide="layout-grid"></i>
				<span id="sectionTitleText">Dashboard</span>
			</div>
			
		</div>

		<!-- right section topbar-->
		<div class="right-section">
			<div class="admin-profile">
				<!-- Click to preview or change profile picture -->
				<img src="/frontend/assets/images/samrinjaji.jpg" alt="Admin Avatar" class="profile-avatar" id="profileImage" height="40px">
			
				<!-- Click to go to profile settings -->
				<div class="profile-details" id="profileDetails">
					<span class="admin-name">Samrin Jaji</span>
					<span class="admin-role">Administrator</span>
				</div>
			
				<!-- Click to toggle dropdown -->
				<i data-lucide="chevron-down" class="dropdown-icon" id="dropdownToggle"></i>
			
				<!-- Dropdown menu -->
<ul class="profile-dropdown" id="profileDropdown">
  <li>
	<a href="#">
	  <i data-lucide="user-round-cog" class="dropdown-icon-left"></i>
	  <span>Profile Settings</span>
	</a>
  </li>
  <li>
	<a href="../backend/logout.php" class="logout-link">
	  <i data-lucide="log-out" class="dropdown-icon-left"></i>
	  <span>Logout</span>
	</a>
  </li>
</ul>


			</div>
		</div>
	</header>

	<aside class="sidebar">

		<nav class="navbar">
		  <span class="menu-label">Menu</span>

			<ul class="nav-links">
				<li>
					<a href="#" class="nav-link active" data-file="dashboard.html" 
					data-title="Dashboard" 
					data-icon="layout-grid"
					data-section-id="dashboard-section">
					  <i data-lucide="layout-grid"></i>
					  <span>Dashboard</span>
					</a>
				</li>

				<li class="dropdown">
				  <a href="#" class="dropdown-toggle" data-file="scholars.html" 
				  data-title="Scholars" 
				  data-icon="users"
				  data-program="ALL"
				  data-section-id="scholars-section">
					<div class="toggle-left">
					  <i data-lucide="users"></i>
					  <span>Scholars</span>
					</div>
					<i data-lucide="chevron-down" class="chevron-icon"></i>
				  </a>
				  
				  <ul class="dropdown-menu">
					<li id="submenu-edsp"><a href="#" class="nav-link" data-program="EDSP" data-section-id="scholars-section" data-title="EDSP" data-icon="users">EDSP</a></li>
					<li id="submenu-odsp"><a href="#" class="nav-link" data-program="ODSP" data-section-id="scholars-section" data-title="ODSP" data-icon="users">ODSP</a></li>
					<li id="submenu-elap"><a href="#" class="nav-link" data-program="ELAP" data-section-id="scholars-section" data-title="ELAP" data-icon="users">ELAP</a></li>
				  </ul>
				</li>
				
				

				<li>
					<a href="#" class="nav-link" data-file="disbursement.html" data-title="Disbursement" data-icon="wallet"
					data-section-id="disbursement-section">
					  <i data-lucide="wallet"></i>
					  <span>Disbursement</span>
					</a>
				</li>

				<li>
					<a href="#" class="nav-link" data-file="graduates.html" data-title="Graduates" data-icon="graduation-cap"
					data-section-id="graduates-section">
					  <i data-lucide="graduation-cap"></i>
					  <span>Graduates</span>
					</a>
				</li>
				  

				<li>
					<a href="#" class="nav-link" data-file="settings.html" data-title="Settings" data-icon="settings"
					data-section-id="settings-section">
					  <i data-lucide="settings"></i>
					  <span>Settings</span>
					</a>
				</li>
			</ul>
		</nav>

		<div class="logout-section">
		  <a href="../backend/logout.php" class="logout-link">
			<i data-lucide="log-out"></i>
			<span>Logout</span>
		  </a>
		</div>
	</aside>

	<main class="main-content" id="main-content">
		<!-- DASHBOARD SECTION -->
		<section id="dashboard-section" class="page-section">
			<h3>Welcome back! Samrin Jaji</h3>

			 <!-- existing dashboard content goes here, unchanged -->
			 <!-- Dashboard Cards -->
			<div class="dashboard-cards">
			<div class="card scholars-card" id="goToScholars">
				<div class="card-content">
				<h4>Total Scholars</h4>
				<p id="total-scholars-count">0</p>
				</div>
				<i data-lucide="users" class="card-icon"></i>
			</div>

			<div class="card fund-card" id="goToDisbursement">
				<div class="card-content">
				<h4>Total Disbursement Fund</h4>
				<p id="total-fund-count">0</p>
				</div>
				<i data-lucide="wallet" class="card-icon"></i>
			</div>

			<div class="card graduates-card" id="goToGraduates">
				<div class="card-content">
				<h4>Total Graduates</h4>
				<p id="total-graduates-count">0</p>
				</div>
				<i data-lucide="graduation-cap" class="card-icon"></i>
			</div>
			</div>


				<!-- Dashboard Chart Section -->
				<div class="dashboard-chart">
					<!-- Disbursement Statistics (2-card width) -->
						<div class="card chart-card wide">
							<div class="chart-header">
								<h3>Disbursement (Statistic)</h3>
						
								<div class="year-selector">
									<label for="year">Year:</label>
									<select id="year" onchange="updateBarChartData()">
										<option value="2023">2023</option>
										<option value="2024">2024</option>
										<option value="2025">2025</option>
									</select>
								</div>
						
								<div class="legend">
									<span><span class="dot dot-edsp"></span>EDSP</span>
									<span><span class="dot dot-odsp"></span>ODSP</span>
									<span><span class="dot dot-elap"></span>ELAP</span>
								</div>
							</div>
						
							<canvas id="barChart"></canvas>

						</div>
						
	
					   <!-- Gender Distribution (1-card width) -->
					  <div class="chart-card">
	
						<!-- Title + Dropdown Row -->
						<div class="genderchart-top" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
						  <h3 class="gender-chart-title">Gender Distribution</h3>
						
						  <select id="genderProgramSelect" onchange="updateGenderChart()" class="gender-chart-select">
							<option value="ALL">All Programs</option>
							<option value="EDSP">EDSP</option>
							<option value="ODSP">ODSP</option>
							<option value="ELAP">ELAP</option>
						  </select>
						</div>
						
	
						<!-- Chart Canvas -->
						<div class="pie-chart-wrapper">
						  <canvas id="pieChart"></canvas>
						</div>
	
					  </div>
					</div>

					<!-- Recently Added Scholars -->
					<div class="dashboard-card recent-scholars">
						<h3>Recently Added Scholars</h3>
						<ul class="dashboard-list" id="recent-scholars-list">
						 
						</ul>
					</div>
		</section>

		<!-- SCHOLARS SECTION  -->
		<section id="scholars-section" class="page-section hidden">
			<h3 id="scholarsLabel">All Scholars</h3>
			<p>View and manage scholar information.</p>

			<div class="container">

				<div class="scholar-top">
					<div class="left-side">
						<div class="header-search" id="searchBar" style="display: flex;">
							<input type="text" class="search-bar" placeholder="Search..." />
							<i data-lucide="search" class="input-icon"></i>
						</div>
					</div>
					<div class="right-side" style="position: relative;">
						<button class="btn filter-btn" id="filterBtn">
							<i data-lucide="filter" class="btn-icon"></i>
							Filter
						</button>
						<button class="btn add-btn">
							<i data-lucide="plus" class="btn-icon"></i>
							Add
						</button>
						<button class="btn" id="exportCsvBtn">
							<i data-lucide="download" class="btn-icon"></i>
							Export CSV
						</button>
						<!-- dropdown filter -->
						<div id="filter-dropdown" class="filter-dropdown hidden">
							<div class="dropdown-group">
								<span class="dropdown-label">Program</span>
								<select id="filterProgramSelect" class="dropdown-select">
								<option value="ALL">All</option>
								<option value="EDSP">EDSP</option>
								<option value="ODSP">ODSP</option>
								<option value="ELAP">ELAP</option>
								</select>
							</div>

							<div class="dropdown-group">
								<span class="dropdown-label">Category</span>
								<select id="categorySelect" class="dropdown-select" disabled>
								<option>Select program first</option>
								</select>
							</div>
							
							<div class="dropdown-group">
							<span class="dropdown-label">Province</span>
							<select id="provinceSelect" class="dropdown-select">
								<option value="ALL">All</option>
								<option value="Zamboanga City">Zamboanga City</option>
								<option value="Isabela City">Isabela City</option>
								<option value="Dipolog City">Dipolog City</option>
								<option value="Pagadian City">Pagadian City</option>
								<option value="Zamboanga del Norte">Zamboanga del Norte</option>
								<option value="Zamboanga del Sur">Zamboanga del Sur</option>
								<option value="Zamboanga Sibugay">Zamboanga Sibugay</option>
							</select>
							</div>


							<button id="applyFilterBtn" class="btn apply-filter-btn">Apply</button>
							<button id="clearFilterBtn" class="btn cancel-btn" type="button">Clear</button>
						</div>
					</div>
				</div>

				<table class="scholar-table" id="scholarsTable">
						<thead>
							<tr>
								<th><input type="checkbox" id="select-all-scholars"></th>
								<th>No.</th>
								<th>Batch</th>
								<th>Name of Scholar</th>
								<th>Home Address</th>
								<th>Program</th>
								<th>Contact</th>
								<th>Sex</th>
								<th>Status</th>
								<th>Bank Details</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody id="scholar-table-body">
							
						</tbody>
					</table>
					
					<!-- Contextual Action Bar -->
					<div id="contextual-action-bar" class="contextual-action-bar hidden">
						<div class="action-bar-left">
							<input type="checkbox" id="action-bar-checkbox" checked>
							<span id="selected-count-text">0 Items</span>
						</div>
						<div class="action-bar-divider"></div>
						<div class="action-bar-middle">
							<button class="action-bar-btn" id="release-btn">
								<i data-lucide="graduation-cap" class="action-bar-icon"></i>
								<span>Graduates</span>
							</button>
						</div>
						<div class="action-bar-divider"></div>
						<div class="action-bar-right">
							<button class="action-bar-btn danger" id="remove-btn">
								<i data-lucide="trash-2" class="action-bar-icon"></i>
								<span>Remove</span>
							</button>
						</div>
					</div>
					
					<!-- Global Scholar Dropdown -->
								<div id="scholar-action-dropdown" class="action-dropdown hidden">
									<div class="dropdown-item"><i data-lucide="edit-2"></i><span>Edit</span></div>
									<div class="dropdown-item"><i data-lucide="view"></i><span>View</span></div>
									<div class="dropdown-item"><i data-lucide="file-text"></i><span>PPF</span></div>
									<div class="dropdown-item"><i data-lucide="graduation-cap"></i><span>Graduate</span></div>
									<div class="dropdown-divider"></div>
									<div class="dropdown-item danger"><i data-lucide="trash-2"></i><span>Delete</span></div>
								</div>
				</div>

				

				<div class="pagination">
					<span class="pagination-left" id="pagination-showing">Showing: 0 of 0</span>
					<div class="pagination-right">
						<button onclick="prevPage()" id="prev-btn" disabled>&lsaquo;</button>
							<span	span id="page-info">1 / 1</span>
						<button onclick="nextPage()" id="next-btn">&rsaquo;</button>
					</div>
				</div>
			</div>

			
			<!-- Minimal & Clean Add Scholar Modal with Labels -->
			<div id="addScholarModal2" class="modal-overlay hidden">
			<div class="modal">
				<div class="modal-header">
					<h2><i data-lucide="user-plus" class="icon"></i> Add Scholar Record</h2>
					<button class="modal-close" onclick="closeAddScholarModal2()">&times;</button>
				</div>

			<div class="modal-body">
				<!-- Personal Information Section -->
				<div class="modal-section">
					<h3><i data-lucide="user-round" class="icon"></i> Personal Information</h3>
					<hr>
					<div class="form-grid">
					
					<label>Last Name<input type="text" name="last_name" required /></label>
					<label>First Name<input type="text" name="first_name" required /></label>
					<label>Middle Name<input type="text" name="middle_name" /></label>

					<label>Birth Date
						<input type="date" name="birth_date" required />
					</label>

					<label>Age
					<input type="number" name="age" id="ageInput" readonly />
					</label>

					<label>Sex
						<select name="sex" required>
							<option value="">Select Sex</option>
							<option value="Male">Male</option>
							<option value="Female">Female</option>
						</select>
					</label>

					<label>Contact Number<input name="contact_number" type="tel" placeholder="+63" pattern="[+]63[0-9]{10}" required /></label>

					<label>Email
						<input type="email" name="email" placeholder="example@email.com" required />
					</label>

					<label>Program
						<select name="program" required>
							<option value="">Select Program</option>
							<option value="EDSP1">EDSP1</option>
							<option value="EDSP2">EDSP2</option>
							<option value="ODSP1">ODSP1</option>
							<option value="ODSP2">ODSP2</option>
							<option value="ELAP ELEMENTARY">ELAP ELEMENTARY</option>
							<option value="ELAP HIGHSCHOOL">ELAP HIGHSCHOOL</option>
							<option value="ELAP COLLEGE">ELAP COLLEGE</option>
						</select>
					</label>
					<label>Batch (Year)<input type="number" name="batch" placeholder="e.g. 2025" min="2020" max="3000" required /></label>
					<label>Remarks<input type="text" name="remarks" /></label>

					</div>
				</div>

				<!-- Address Information Section -->
				<div class="modal-section">
					<h3><i data-lucide="map-pin" class="icon"></i> Address Information</h3>
					<hr>
					<div class="form-grid">

					<label>Home Address<input type="text" name="home_address" required /></label>

					<label>Province
						<select name="province" required>
							
								<option value="Zamboanga City">Zamboanga City</option>
								<option value="Zamboanga del Norte">Zamboanga del Norte</option>
								<option value="Zamboanga del Sur">Zamboanga del Sur</option>
								<option value="Zamboanga Sibugay">Zamboanga Sibugay</option>
								<option value="Dipolog City">Dipolog City</option>
								<option value="Pagadian City">Pagadian City</option>
								<option value="Isabela City">Isabela City</option>
						</select>
					</label>

					</div>
				</div>

				<!-- Academic Information Section -->
				<div class="modal-section">
					<h3><i data-lucide="graduation-cap" class="icon"></i> Academic Information</h3>
					<hr>
					<div class="form-grid">

					<label>School
						<select name="school">
							<option value="">Select School</option>
							<option value="Zamboanga State College of Marine Sciences and Technology">Zamboanga State College of Marine Sciences and Technology</option>
							<option value="Western Mindanao State University">Western Mindanao State University</option>
							<option value="Mindanao State University - Zamboanga Peninsula">Mindanao State University - Zamboanga Peninsula</option>
							<option value="Zamboanga City State Polytechnic College">Zamboanga City State Polytechnic College</option>
							<option value="Zamboanga City Medical Center College of Nursing">Zamboanga City Medical Center College of Nursing</option>
							<option value="Zamboanga City Polytechnic State College">Zamboanga City Polytechnic State College</option>
							<option value="Zamboanga City State University">Zamboanga City State University</option>
							<option value="Zamboanga City College of Arts and Trades">Zamboanga City College of Arts and Trades</option>
							<option value="Zamboanga City College of Science and Technology">Zamboanga City College of Science and Technology</option>
							<option value="Zamboanga City College of Education">Zamboanga City College of Education</option>
							<option value="Zamboanga City College of Business and Management">Zamboanga City College of Business and Management</option>
							<option value="Universidad De Zamboanga">Universidad De Zamboanga</option>
						</select>
					</label>

					<label>Course
						<select name="course">
							<option value="">Select Course</option>
							<option value="Bachelor of Science in Information Technology">Bachelor of Science in Information Technology</option>
							<option value="Bachelor of Science in Computer Science">Bachelor of Science in Computer Science</option>
							<option value="Bachelor of Science in Business Administration">Bachelor of Science in Business Administration</option>
							<option value="Bachelor of Science in Accountancy">Bachelor of Science in Accountancy</option>
							<option value="Bachelor of Science in Civil Engineering">Bachelor of Science in Civil Engineering</option>
							<option value="Bachelor of Science in Electrical Engineering">Bachelor of Science in Electrical Engineering</option>
							<option value="Bachelor of Science in Mechanical Engineering">Bachelor of Science in Mechanical Engineering</option>
							<option value="Bachelor of Science in Electronics Engineering">Bachelor of Science in Electronics Engineering</option>
							<option value="Bachelor of Arts in Communication">Bachelor of Arts in Communication</option>
							<option value="Bachelor of Arts in Political Science">Bachelor of Arts in Political Science</option>
							<option value="Bachelor of Arts in Psychology">Bachelor of Arts in Psychology</option>
							<option value="Bachelor of Arts in Sociology">Bachelor of Arts in Sociology</option>
							<option value="Bachelor of Arts in Education">Bachelor of Arts in Education</option>
							<option value="Bachelor of Arts in English">Bachelor of Arts in English</option>
							<option value="Bachelor of Arts in Filipino">Bachelor of Arts in Filipino</option>
							<option value="Bachelor of Arts in History">Bachelor of Arts in History</option>
							<option value="Bachelor of Arts in Philosophy">Bachelor of Arts in Philosophy</option>
							<option value="Bachelor of Arts in Anthropology">Bachelor of Arts in Anthropology</option>
							<option value="Bachelor of Arts in Economics">Bachelor of Arts in Economics</option>
						</select>
					</label>

					<label>Year Level
						<select name="year_level">
							<option value="">Select Year Level</option>
							<option value="1st Year">1st Year</option>
							<option value="2nd Year">2nd Year</option>
							<option value="3rd Year">3rd Year</option>
							<option value="4th Year">4th Year</option>
						</select>
					</label>

					<label>School Address<input name="school_address" type="text" /></label>

					</div>
				</div>

				<!-- Financial Information Section -->
				<div class="modal-section">
					<h3><i data-lucide="credit-card" class="icon"></i> Financial Information</h3>
					<hr>
					<div class="form-grid">

					<label>Bank Details
						<input type="text" name="bank_details" id="bankDetailsInput" maxlength="25" placeholder="e.g., 1234-5678-9012 or 1234 5678 9012" required />
					</label>

					<!-- OTP Button - Only visible in Edit mode -->
					<div id="otpButtonContainer" class="otp-button-container hidden">
						<button type="button" id="requestOtpBtn" class="btn otp-btn">
							<i data-lucide="shield-check" class="btn-icon"></i>
							Request OTP for Bank Update
						</button>
						<p class="otp-help-text">Bank account updates require OTP verification for security.</p>
					</div>

					</div>
				</div>

				<!-- OFW Information Section -->
				<div class="modal-section">
					<h3><i data-lucide="briefcase" class="icon"></i> OFW Information</h3>
					<hr>
					<div class="form-grid">
					
					<label>Parent/Guardian Name<input type="text" name="parent_name" /></label>
					<label>Relationship to OFW<input type="text" name="relationship" /></label>
					<label>Name of OFW<input type="text" name="ofw_name" /></label>
					<label>Category<input type="text" name="category" /></label>

					<label>Gender
						<select name="gender">
							<option value="">Select Gender</option>
							<option value="Male">Male</option>
							<option value="Female">Female</option>
						</select>
					</label>

					<label>Jobsite<input type="text" name="jobsite" /></label>
					<label>Position<input type="text" name="position" /></label>
					</div>
				</div>
				</div>

			<div class="modal-footer">
			<button type="button" class="btn cancel-btn" onclick="closeAddScholarModal2()">Cancel</button>
			<button type="button" class="btn submit-btn" onclick="submitScholarForm()">Save</button>
			</div>
		</div>
		</div>
		</section>

		<!-- OTP Verification Modal -->
		<div id="otpVerificationModal" class="modal-overlay hidden">
			<div class="modal">
				<div class="modal-header">
					<h2><i data-lucide="shield-check" class="icon"></i> Verify Bank Update</h2>
					<button class="modal-close" onclick="closeOtpModal()">&times;</button>
				</div>

				<div class="modal-body">
					<div class="otp-verification-content">
						<div class="otp-info">
							<i data-lucide="mail" class="otp-icon"></i>
							<h3>OTP Verification Required</h3>
							<p id="otpScholarInfo">An OTP has been sent to the scholar's email address.</p>
							<p class="otp-instruction">Please enter the 6-digit OTP code below:</p>
						</div>

						<div class="otp-input-container">
							<input type="text" id="otpInput" maxlength="6" pattern="\d{6}" inputmode="numeric" placeholder="000000" />
							<div class="otp-timer">
								<span id="otpTimer">15:00</span>
							</div>
						</div>

						<div class="otp-display-container hidden" id="otpDisplayContainer">
							<div class="otp-display">
								<i data-lucide="eye" class="otp-display-icon"></i>
								<span>OTP for testing: <strong id="otpDisplayValue"></strong></span>
							</div>
						</div>

						<div class="otp-actions">
							<button type="button" id="verifyOtpBtn" class="btn submit-btn">
								<i data-lucide="check" class="btn-icon"></i>
								Verify OTP
							</button>
							<button type="button" id="resendOtpBtn" class="btn cancel-btn">
								<i data-lucide="refresh-cw" class="btn-icon"></i>
								Resend OTP
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- SCHOLAR VIEW SECTION -->
		<section id="scholar-view-section" class="page-section hidden" style="min-height: 100vh; background-color: #f0f4ff;">
			<div class="scholar-view-container">
				<!-- Scholar Profile Content -->
				<div class="scholar-profile-content">
					<div class="scholar-profile-header">
						<div class="scholar-avatar-section">
							<div class="scholar-avatar">
								<i data-lucide="user"></i>
							</div>
							<div class="scholar-basic-info">
								<h2 id="scholar-view-name">Scholar Name</h2>
								<p id="scholar-view-program">Program</p>
								<span id="scholar-view-status" class="status done">Active</span>
							</div>
						</div>
					</div>

					<!-- Scholar Details Cards -->
					<div class="scholar-details-grid">
						<!-- Personal Information Card -->
						<div class="detail-card">
							<div class="card-header">
								<i data-lucide="user-round"></i>
								<h3>Personal Information</h3>
							</div>
							<div class="card-content">
								<div class="detail-row">
									<span class="detail-label">Full Name:</span>
									<span id="scholar-detail-name" class="detail-value">-</span>
								</div>
								<div class="detail-row">
									<span class="detail-label">Birth Date:</span>
									<span id="scholar-detail-birthdate" class="detail-value">-</span>
								</div>
								<div class="detail-row">
									<span class="detail-label">Age:</span>
									<span id="scholar-detail-age" class="detail-value">-</span>
								</div>
								<div class="detail-row">
									<span class="detail-label">Sex:</span>
									<span id="scholar-detail-sex" class="detail-value">-</span>
								</div>
								<div class="detail-row">
									<span class="detail-label">Contact Number:</span>
									<span id="scholar-detail-contact" class="detail-value">-</span>
								</div>
								<div class="detail-row">
									<span class="detail-label">Email:</span>
									<span id="scholar-detail-email" class="detail-value">-</span>
								</div>
								<div class="detail-row">
									<span class="detail-label">Program:</span>
									<span id="scholar-detail-program" class="detail-value">-</span>
								</div>
								<div class="detail-row">
									<span class="detail-label">Batch Year:</span>
									<span id="scholar-detail-batch" class="detail-value">-</span>
								</div>
								<div class="detail-row">
									<span class="detail-label">Remarks:</span>
									<span id="scholar-detail-remarks" class="detail-value">-</span>
								</div>
							</div>
						</div>

						<!-- Address Information Card -->
						<div class="detail-card">
							<div class="card-header">
								<i data-lucide="map-pin"></i>
								<h3>Address Information</h3>
							</div>
							<div class="card-content">
								<div class="detail-row">
									<span class="detail-label">Home Address:</span>
									<span id="scholar-detail-address" class="detail-value">-</span>
								</div>
								<div class="detail-row">
									<span class="detail-label">Province:</span>
									<span id="scholar-detail-province" class="detail-value">-</span>
								</div>
							</div>
						</div>

						<!-- Academic Information Card -->
						<div class="detail-card">
							<div class="card-header">
								<i data-lucide="graduation-cap"></i>
								<h3>Academic Information</h3>
							</div>
							<div class="card-content">
								<div class="detail-row">
									<span class="detail-label">Course:</span>
									<span id="scholar-detail-course" class="detail-value">-</span>
								</div>
								<div class="detail-row">
									<span class="detail-label">Year Level:</span>
									<span id="scholar-detail-year-level" class="detail-value">-</span>
								</div>
								<div class="detail-row">
									<span class="detail-label">School:</span>
									<span id="scholar-detail-school" class="detail-value">-</span>
								</div>
								<div class="detail-row">
									<span class="detail-label">School Address:</span>
									<span id="scholar-detail-school-address" class="detail-value">-</span>
								</div>
							</div>
						</div>

						<!-- Financial Information Card -->
						<div class="detail-card">
							<div class="card-header">
								<i data-lucide="credit-card"></i>
								<h3>Financial Information</h3>
							</div>
							<div class="card-content">
								<div class="detail-row">
									<span class="detail-label">Bank Details:</span>
									<span id="scholar-detail-bank" class="detail-value">-</span>
								</div>
							</div>
						</div>

						<!-- OFW Information Card -->
						<div class="detail-card">
							<div class="card-header">
								<i data-lucide="briefcase"></i>
								<h3>OFW Information</h3>
							</div>
							<div class="card-content">
								<div class="detail-row">
									<span class="detail-label">Parent/Guardian:</span>
									<span id="scholar-detail-parent" class="detail-value">-</span>
								</div>
								<div class="detail-row">
									<span class="detail-label">Relationship:</span>
									<span id="scholar-detail-relationship" class="detail-value">-</span>
								</div>
								<div class="detail-row">
									<span class="detail-label">OFW Name:</span>
									<span id="scholar-detail-ofw-name" class="detail-value">-</span>
								</div>
								<div class="detail-row">
									<span class="detail-label">Category:</span>
									<span id="scholar-detail-category" class="detail-value">-</span>
								</div>
								<div class="detail-row">
									<span class="detail-label">Jobsite:</span>
									<span id="scholar-detail-jobsite" class="detail-value">-</span>
								</div>
								<div class="detail-row">
									<span class="detail-label">Position:</span>
									<span id="scholar-detail-position" class="detail-value">-</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- DISBURSEMENT SECTION -->
		<section id="disbursement-section" class="page-section hidden">
			<h3>Disbursement</h3>
			<p>Track individual payment status</p>
		</section>

		<!-- GRADUATES SECTION -->
		<section id="graduates-section" class="page-section hidden">
			<h3>Graduates</h3>
			<p>List of students who have completed the program.</p>
		</section>

		<section id="settings-section" class="page-section hidden">
			<h3>Settings</h3>
			<p>Manage admin profile, system preferences, and security options.</p>
		</section>
	</main>
	<script src="../frontend/assets/js/script.js"></script>
	<script src="../frontend/assets/js/dashboard.js"></script>
	<script src="../frontend/assets/js/modal.js"></script>
	<script>
	  // If the dashboard is restored from bfcache after logout, force a reload
	  window.addEventListener('pageshow', function (event) {
		const isBackForward = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]?.type) === 'back_forward';
		if (event.persisted || isBackForward) {
		  // Reload so PHP session check runs again
		  window.location.reload();
		}
	  });

	  // Keep the user on the dashboard when pressing Back (avoid flashing login page)
	  (function () {
		if (window.history && window.history.pushState) {
		  // Create a new history entry for the current page
		  history.pushState(null, '', location.href);
		  window.addEventListener('popstate', function () {
			// Immediately move forward to stay on dashboard
			history.go(1);
		  });
		}
	  })();
	</script>
</body>
</html>