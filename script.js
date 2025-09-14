let barChartInstance;
let genderChart;

let allScholars = [];
let scholarRawById = {};

// Updated fetchScholars function with alphabetical sorting
async function fetchScholars() {
  try {
    const res = await fetch('../backend/scholars_list.php', { credentials: 'same-origin' });
    const json = await res.json();
    if (json.success) {
      scholarRawById = {};
      allScholars = json.data.map(row => {
        scholarRawById[row.id] = row;
        return ({
          id: row.id,
          batch: row.batch,
          name: `${row.last_name}, ${row.first_name}${row.middle_name ? ' ' + row.middle_name : ''}`,
          address: row.home_address,
          province: row.province || '',
          program: row.program,
          contact: row.contact_number,
          sex: row.sex,
          status: row.remarks || 'Active',
          bankDetails: row.bank_details,
          recentDate: row.created_at
        });
      })
      // Sort scholars alphabetically by name (last name first, then first name)
      .sort((a, b) => {
        // Compare names alphabetically (case-insensitive)
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return nameA.localeCompare(nameB);
      });
      window.scholarRawById = scholarRawById;
      renderScholarsTable();
      updateDashboardCounts();
      updateRecentScholars();
      updateGenderChart();
    }
  } catch (e) {
    console.error('Failed to fetch scholars', e);
  }
}


const COLORS = {
  EDSP: '#1E3A8A',
  ODSP: '#DC2626',
  ELAP: '#0F766E',
  MALE: '#1E3A8A',
  FEMALE: '#DC2626'
};

const yearlyData = {
  2023: {
    EDSP: Array(12).fill(0),
    ODSP: Array(12).fill(0),
    ELAP: Array(12).fill(0)
  },
  2024: {
    EDSP: [10, 11, 9, 14, 12, 13, 9, 8, 10, 12, 11, 13],
    ODSP: [6, 7, 8, 9, 7, 6.5, 7, 8, 9, 10, 8, 9],
    ELAP: [4, 5, 3.5, 4.5, 4, 3, 4, 3.5, 4, 3.8, 4.2, 5]
  },
  2025: {
    EDSP: [10, 11, 9, 14, 12, 13, 9, 8, 10, 12, 11, 13],
    ODSP: [6, 7, 8, 9, 7, 6.5, 7, 8, 9, 10, 8, 9],
    ELAP: [4, 5, 3.5, 4.5, 4, 3, 4, 3.5, 4, 3.8, 4.2, 5]
  }
};


function createOrUpdateBarChart(year = '2025') {
  const ctx = document.getElementById('barChart');
  if (!ctx) return;

  const data = yearlyData[year] || {
    EDSP: Array(12).fill(0),
    ODSP: Array(12).fill(0),
    ELAP: Array(12).fill(0)
  };

  const noDataPluginForBar = {
    id: 'noDataBar',
    afterDraw(chart) {
      const { ctx, chartArea: { left, top, width, height } } = chart;
      const allData = chart.data.datasets.flatMap(ds => ds.data);
      const allZero = allData.every(value => value === 0 || value === null || value === undefined);

      if (allZero) {
        ctx.save();
        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = '#999';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No Data', left + width / 2, top + height / 2);
        ctx.restore();
      }
    }
  };

  if (barChartInstance) {
    barChartInstance.data.datasets[0].data = data.EDSP;
    barChartInstance.data.datasets[1].data = data.ODSP;
    barChartInstance.data.datasets[2].data = data.ELAP;
    barChartInstance.update();
    return;
  }

  barChartInstance = new Chart(ctx.getContext('2d'), {
    type: 'bar',
    data: {
      labels: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      datasets: [
        {
          label: 'EDSP',
          data: data.EDSP,
          backgroundColor: COLORS.EDSP,
          borderRadius: 6
        },
        {
          label: 'ODSP',
          data: data.ODSP,
          backgroundColor: COLORS.ODSP,
          borderRadius: 6
        },
        {
          label: 'ELAP',
          data: data.ELAP,
          backgroundColor: COLORS.ELAP,
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            title: (tooltipItems) => `Month: ${tooltipItems[0].label}`,
            label: (tooltipItem) => {
              const amount = tooltipItem.raw.toLocaleString('en-PH', {
                style: 'currency',
                currency: 'PHP'
              });
              return `${tooltipItem.dataset.label}: ${amount}`;
            }
          }
        }
      },
      interaction: { mode: 'index', intersect: false },
      scales: {
        y: {
          display: true,
          grid: { display: true, color: '#e0e0e0' },
          ticks: { display: false }
        }
      }
    },
    plugins: [noDataPluginForBar]
  });
}

function updateGenderChart() {
  const selectedProgram = document.getElementById('genderProgramSelect')?.value || 'ALL';

  // Filter and count dynamically from allScholars
  let filteredScholars = allScholars;

  if (selectedProgram !== 'ALL') {
    // Filter by program prefix (e.g., "EDSP" matches "EDSP1", "EDSP2")
    filteredScholars = allScholars.filter(scholar =>
      scholar.program.toUpperCase().startsWith(selectedProgram)
    );
  }

  const maleCount = filteredScholars.filter(s => s.sex.toLowerCase() === 'male').length;
  const femaleCount = filteredScholars.filter(s => s.sex.toLowerCase() === 'female').length;

  const total = maleCount + femaleCount;

  const data = {
    labels: ['Male', 'Female'],
    datasets: [{
      data: [maleCount, femaleCount],
      backgroundColor: [COLORS.MALE, COLORS.FEMALE],
      borderWidth: 1
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 0, bottom: 0 } },
    plugins: {
      title: {
        display: true,
        text: selectedProgram === 'ALL'
          ? 'Gender Breakdown (All Programs)'
          : `Gender Breakdown (${selectedProgram})`,
        font: { size: 12, weight: 'bold' },
        position: 'bottom',
        padding: { top: 4 }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label;
            const value = context.raw;
            const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} scholars (${percent}%)`;
          }
        }
      },
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 6,
          boxHeight: 6,
          padding: 6,
          font: { size: 12 }
        }
      }
    }
  };

  const noDataPlugin = {
    id: 'noData',
    afterDraw(chart) {
      const { ctx, chartArea: { left, top, width, height } } = chart;
      const values = chart.data.datasets[0].data;
      const allZero = values.every(v => v === 0);

      if (allZero) {
        ctx.save();
        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = '#999';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No Data', left + width / 2, top + height / 2);
        ctx.restore();
      }
    }
  };

  if (genderChart) genderChart.destroy();

  const genderCtx = document.getElementById('pieChart')?.getContext('2d');
  if (!genderCtx) return;

  genderChart = new Chart(genderCtx, {
    type: 'doughnut',
    data,
    options,
    plugins: [noDataPlugin]
  });
}


document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons(); // Initialize Lucide icons
  bindProfileDropdown();
  bindSidebarNav();
  bindDashboardCardClicks();
  populateYearSelect();

  // Bank Details input: Allow flexible formatting with spaces and dashes
  const bankDetailsInput = document.getElementById('bankDetailsInput');
  if (bankDetailsInput) {
    bankDetailsInput.addEventListener('input', function() {
      // Allow digits, spaces, and dashes, limit to 25 characters
      let val = bankDetailsInput.value.replace(/[^\d\s\-]/g, '').slice(0, 25);
      bankDetailsInput.value = val;
    });
    
    bankDetailsInput.addEventListener('blur', function() {
      // Clean up extra spaces and dashes on blur
      let val = bankDetailsInput.value.replace(/\s+/g, ' ').replace(/\-+/g, '-').trim();
      bankDetailsInput.value = val;
    });
  }

  // Load scholars data first
  fetchScholars();

  // Initialize showing/pagination after data is loaded
  setTimeout(() => {
    const tbody = document.getElementById('scholar-table-body');
    if (tbody) {
      const rows = Array.from(tbody.querySelectorAll('tr'));
      const showingEl = document.getElementById('pagination-showing');
      if (showingEl) showingEl.textContent = `Showing: ${rows.length} of ${rows.length}`;
    }
  }, 100);

  // Initialize bar chart with selected year or default
  const yearSelect = document.getElementById('year');
  const initialYear = yearSelect?.value || '2025';
  createOrUpdateBarChart(initialYear);

  if (yearSelect) {
    yearSelect.addEventListener('change', e => {
      createOrUpdateBarChart(e.target.value);
    });
  }

  // Initialize gender chart
  updateGenderChart();

  // Update gender chart when program dropdown changes
  const programSelect = document.getElementById('genderProgramSelect');
  if (programSelect) {
    programSelect.addEventListener('change', updateGenderChart);
  }

  // Initialize recent scholars list
  updateRecentScholars();
  bindScholarSearch();
  // Scholars filter dropdown (program/category/province)
  bindFilterDropdownToggle();
  bindExportCsv();
  // Ensure row action menus are bound on initial render as well
  bindScholarRowActionMenus();
   bindScholarDropdownActions();

  // Submission handled by modal.js
});

// -------- Your existing functions below --------
// Fixed Pagination Functions - Replace your existing pagination code
let currentPage = 1;
const scholarsPerPage = 10;

function paginateScholars() {
  const tbody = document.getElementById('scholar-table-body');
  if (!tbody) return;
  
  const allRows = Array.from(tbody.querySelectorAll('tr'));
  
  // Get all rows that should be visible based on current filters (not pagination)
  const visibleRows = allRows.filter(row => {
    // Check if row is hidden by filters or search (not by pagination)
    return !row.hasAttribute('data-filtered-out');
  });
  
  const totalRows = visibleRows.length;
  const totalPages = Math.ceil(totalRows / scholarsPerPage) || 1;
  
  // Ensure current page is within valid range
  currentPage = Math.max(1, Math.min(currentPage, totalPages));
  
  const startIndex = (currentPage - 1) * scholarsPerPage;
  const endIndex = startIndex + scholarsPerPage;
  
  // Hide all rows first
  allRows.forEach(row => {
    row.style.display = 'none';
  });
  
  // Show only the rows for current page
  visibleRows.forEach((row, index) => {
    if (index >= startIndex && index < endIndex) {
      row.style.display = '';
    }
  });
  
  // Update pagination info
  const pageInfo = document.getElementById('page-info');
  if (pageInfo) {
    pageInfo.textContent = `${currentPage} / ${totalPages}`;
  }
  
  // Enable/disable buttons
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  if (prevBtn) prevBtn.disabled = currentPage === 1;
  if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
  
  // Update showing counter
  const showingEl = document.getElementById('pagination-showing');
  if (showingEl) {
    const actualShowing = Math.min(scholarsPerPage, totalRows - startIndex);
    const showingStart = totalRows > 0 ? startIndex + 1 : 0;
    const showingEnd = totalRows > 0 ? startIndex + actualShowing : 0;
    showingEl.textContent = `Showing: ${showingStart}-${showingEnd} of ${totalRows}`;
  }
  
  // Update checkbox states after pagination
  updateSelectAllState();
}

function nextPage() {
  const tbody = document.getElementById('scholar-table-body');
  if (!tbody) return;
  
  // Count visible rows (not filtered out)
  const allRows = Array.from(tbody.querySelectorAll('tr'));
  const visibleRows = allRows.filter(row => !row.hasAttribute('data-filtered-out'));
  const totalRows = visibleRows.length;
  const totalPages = Math.ceil(totalRows / scholarsPerPage) || 1;
  
  if (currentPage < totalPages) {
    currentPage++;
    paginateScholars();
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    paginateScholars();
  }
}

let __profileDropdownBound = false;
function bindProfileDropdown() {
  if (__profileDropdownBound) return;
  const profileContainer = document.querySelector('.admin-profile');
  const profileDropdown = document.getElementById('profileDropdown');
  if (!profileContainer || !profileDropdown) return;

  __profileDropdownBound = true;

  // Toggle when clicking anywhere on the profile container (avatar/details/chevron)
  profileContainer.addEventListener('click', (e) => {
    e.stopPropagation();
    // Close others first
    closeAllDropdownsExcept(profileDropdown);
    const isOpen = profileDropdown.style.display === 'block';
    profileDropdown.style.display = isOpen ? 'none' : 'block';
  });

  // Prevent closing when interacting inside the dropdown
  profileDropdown.addEventListener('click', (e) => e.stopPropagation());

  // Close when clicking outside
  document.addEventListener('click', () => {
    if (profileDropdown.style.display === 'block') {
      profileDropdown.style.display = 'none';
    }
  });
}

function bindExportCsv() {
  const btn = document.getElementById('exportCsvBtn');
  const tbody = document.getElementById('scholar-table-body');
  if (!btn || !tbody) return;

  btn.addEventListener('click', () => {
    const rows = Array.from(tbody.querySelectorAll('tr'))
      .filter(r => r.style.display !== 'none'); // only currently visible (filtered/searched)

    const header = ['No.', 'Batch', 'Name of Scholar', 'Home Address', 'Program', 'Birth Date', 'Contact', 'Sex', 'Status', 'Bank Details'];

    const data = rows.map(r => ([
      r.cells[1]?.textContent?.trim() || '',
      r.cells[2]?.textContent?.trim() || '',
      r.cells[3]?.textContent?.trim() || '',
      r.cells[4]?.textContent?.trim() || '',
      r.cells[5]?.textContent?.trim() || '',
      r.cells[6]?.textContent?.trim() || '',
      r.cells[7]?.textContent?.trim() || '',
      r.cells[8]?.textContent?.trim() || '',
      r.cells[9]?.textContent?.trim() || '',
      r.cells[10]?.textContent?.trim() || '',
    ]));

    const csv = [header, ...data]
      .map(cols => cols.map(escapeCsv).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scholars_export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

function escapeCsv(value) {
  const v = (value || '').replace(/\r?\n/g, ' ');
  if (v.includes(',') || v.includes('"')) {
    return '"' + v.replace(/"/g, '""') + '"';
  }
  return v;
}

function showAllScholars() {
  const rows = document.querySelectorAll("#scholar-table-body tr");
  rows.forEach(row => {
    row.style.display = "";
  });
}

function filterScholarsByPrograms(allowedPrograms) {
  const rows = document.querySelectorAll("#scholar-table-body tr");
  rows.forEach(row => {
    const scholarProgram = (row.getAttribute("data-subprogram") || row.getAttribute("data-program") || "").toUpperCase();
    row.style.display = allowedPrograms.includes(scholarProgram) ? "" : "none";
  });
}

function filterEDSPScholars() {
  filterScholarsByPrograms(["EDSP1", "EDSP2"]);
}

function filterODSPScholars() {
  filterScholarsByPrograms(["ODSP1", "ODSP2"]);
}

function filterELAPScholars() {
  filterScholarsByPrograms(["ELAP ELEMENTARY", "ELAP HIGHSCHOOL", "ELAP COLLEGE"]);
}

function updateScholarsLabel(program) {
  const label = document.getElementById("scholarsLabel");
  if (!label) return;

  let text = "All Scholars";

  if (program === "EDSP") text = "EDSP Scholars";
  else if (program === "ODSP") text = "ODSP Scholars";
  else if (program === "ELAP") text = "ELAP Scholars";
  else if (program === "ALL") text = "All Scholars";

  label.textContent = text;
}

// Fixed bindSidebarNav function
function bindSidebarNav() {
  const navLinks = document.querySelectorAll(".nav-link");
  const dropdownToggles = document.querySelectorAll(".dropdown-toggle");
  const allDropdowns = document.querySelectorAll(".dropdown");
  const allSections = document.querySelectorAll(".page-section");

  function updateTopbarTitleAndIcon(title, iconName) {
    const iconElement = document.getElementById("sectionIcon");
    const titleElement = document.getElementById("sectionTitleText");

    if (iconElement && titleElement) {
      iconElement.setAttribute("data-lucide", iconName);
      titleElement.textContent = title;
      lucide.createIcons();
    }
  }

  function showAllScholars() {
    const tbody = document.getElementById('scholar-table-body');
    if (!tbody) return;
    
    const rows = Array.from(tbody.querySelectorAll('tr'));
    // Remove filter attributes and show all rows
    rows.forEach(row => {
      row.removeAttribute('data-filtered-out');
      row.style.display = '';
    });
    
    // Reset current filter state
    currentFilterState = {
      program: 'ALL',
      category: 'ALL',
      province: 'ALL'
    };
  }

  navLinks.forEach(link => {
    link.addEventListener("click", function (e) {
      if (this.classList.contains("logout-link")) {
        return; // allow natural navigation for logout link
      }
      e.preventDefault();

      navLinks.forEach(l => l.classList.remove("active"));
      dropdownToggles.forEach(t => t.classList.remove("active"));
      allDropdowns.forEach(d => d.classList.remove("open"));
      this.classList.add("active");

      const parentDropdown = this.closest(".dropdown");
      if (parentDropdown) {
        parentDropdown.classList.add("open");
        const toggle = parentDropdown.querySelector(".dropdown-toggle");
        if (toggle) toggle.classList.add("active");
      }

      const sectionId = this.getAttribute("data-section-id");
      if (sectionId) {
        allSections.forEach(sec => sec.classList.add("hidden"));
        const target = document.getElementById(sectionId);
        if (target) target.classList.remove("hidden");
      }

      const program = (this.getAttribute("data-program") || "ALL").toUpperCase();

      if (sectionId === "scholars-section") {
        // Clear search input first
        const searchInput = document.querySelector('.search-bar');
        if (searchInput) {
          searchInput.value = '';
        }

        // Update filter dropdown UI to reflect submenu choice
        updateFilterDropdownUI(program);

        // Apply program filter (no specific category)
        if (program === "ALL") {
          showAllScholars();
        } else {
          applyFilters(program, "", "ALL");
        }

        // Update label and reset pagination
        updateScholarsLabel(program);
        currentPage = 1;
        paginateScholars();
        
        // Update checkbox states
        updateSelectAllState();
      }

      if (!this.closest(".dropdown-menu")) {
        const title = this.getAttribute("data-title");
        const icon = this.getAttribute("data-icon");
        if (title && icon) {
          updateTopbarTitleAndIcon(title, icon);
          bindProfileDropdown();
        }
      } else {
        updateTopbarTitleAndIcon("Scholars", "users");
        bindProfileDropdown();
      }
    });
  });

  dropdownToggles.forEach(toggle => {
    toggle.addEventListener("click", function (e) {
      e.preventDefault();

      const parent = this.closest(".dropdown");
      const isAlreadyOpen = parent.classList.contains("open");

      allDropdowns.forEach(d => d.classList.remove("open"));
      dropdownToggles.forEach(t => t.classList.remove("active"));
      navLinks.forEach(l => l.classList.remove("active"));

      // **FIX: Handle scholars dropdown toggle properly**
      const sectionId = this.getAttribute("data-section-id");
      if (sectionId === "scholars-section") {
        if (isAlreadyOpen) {
          // If clicking on already open scholars dropdown, show ALL scholars
          const searchInput = document.querySelector('.search-bar');
          if (searchInput) {
            searchInput.value = '';
          }
          
          updateFilterDropdownUI('ALL');
          showAllScholars();
          updateScholarsLabel("ALL");
          
          // Clear submenu active states
          const submenuLinks = parent.querySelectorAll('.dropdown-menu .nav-link');
          submenuLinks.forEach(link => link.classList.remove('active'));
          
          currentPage = 1;
          paginateScholars();
          updateSelectAllState();
        }
      }

      parent.classList.add("open");
      this.classList.add("active");

      const title = this.getAttribute("data-title");
      const icon = this.getAttribute("data-icon");
      if (title && icon) {
        updateTopbarTitleAndIcon(title, icon);
        bindProfileDropdown();
      }

      if (sectionId) {
        allSections.forEach(sec => sec.classList.add("hidden"));
        const target = document.getElementById(sectionId);
        if (target) target.classList.remove("hidden");

        if (sectionId === "scholars-section" && !isAlreadyOpen) {
          // First time opening scholars section
          showAllScholars();
          updateScholarsLabel("ALL");
          updateFilterDropdownUI('ALL');
          currentPage = 1;
          paginateScholars();
          updateSelectAllState();
        }
      }
    });
  });
}

function bindDashboardCardClicks() {
  const scholarsCard = document.getElementById("goToScholars");
  const disbursementCard = document.getElementById("goToDisbursement");
  const graduatesCard = document.getElementById("goToGraduates");
  const navLinks = document.querySelectorAll(".nav-link");
  const dropdownToggles = document.querySelectorAll(".dropdown-toggle");
  const allDropdowns = document.querySelectorAll(".dropdown");
  const allSections = document.querySelectorAll(".page-section");

  function updateTopbarTitleAndIcon(title, iconName) {
    const iconElement = document.getElementById("sectionIcon");
    const titleElement = document.getElementById("sectionTitleText");

    if (iconElement && titleElement) {
      iconElement.setAttribute("data-lucide", iconName);
      titleElement.textContent = title;
      lucide.createIcons();
    }
  }

  function showAllScholars() {
    const tbody = document.getElementById('scholar-table-body');
    if (!tbody) return;
    
    const rows = Array.from(tbody.querySelectorAll('tr'));
    // Remove filter attributes and show all rows
    rows.forEach(row => {
      row.removeAttribute('data-filtered-out');
      row.style.display = '';
    });
    
    // Reset current filter state
    currentFilterState = {
      program: 'ALL',
      category: 'ALL',
      province: 'ALL'
    };
  }

 function activateNavLinkAndShowSection(navSelector, sectionId, title, icon, extraAction) {
    navLinks.forEach(l => l.classList.remove("active"));
    dropdownToggles.forEach(t => t.classList.remove("active"));
    allDropdowns.forEach(d => d.classList.remove("open"));

    const navLink = document.querySelector(navSelector);
    if (!navLink) return;

    navLink.classList.add("active");

    const parentDropdown = navLink.closest(".dropdown");
    if (parentDropdown) {
      parentDropdown.classList.add("open");
      const toggle = parentDropdown.querySelector(".dropdown-toggle");
      if (toggle) toggle.classList.add("active");
    }

    allSections.forEach(sec => sec.classList.add("hidden"));
    const targetSection = document.getElementById(sectionId);
    if (targetSection) targetSection.classList.remove("hidden");

    updateTopbarTitleAndIcon(title, icon);

    if (extraAction) extraAction();

    bindProfileDropdown();
  }

  if (scholarsCard) {
    scholarsCard.addEventListener("click", (e) => {
      e.preventDefault();

      activateNavLinkAndShowSection(
        '.nav-link[data-section-id="scholars-section"]',
        "scholars-section",
        "Scholars",
        "users",
        () => {
          // Clear search input
          const searchInput = document.querySelector('.search-bar');
          if (searchInput) {
            searchInput.value = '';
          }

          // Reset filter dropdown UI
          updateFilterDropdownUI('ALL');
          
          // Show all scholars and reset filters
          showAllScholars();
          
          // Update label
          const label = document.getElementById("scholarsLabel");
          if (label) label.textContent = "All Scholars";

          // Clear active states from submenu links
          const parentDropdown = document.querySelector('.nav-link[data-section-id="scholars-section"]').closest(".dropdown");
          if (parentDropdown) {
            const subNavLinks = parentDropdown.querySelectorAll(".dropdown-menu .nav-link");
            subNavLinks.forEach(link => link.classList.remove("active"));
          }
          
          // **FIX: Reset pagination properly**
          currentPage = 1;
          paginateScholars();
          
          // Update checkbox states after showing all scholars
          updateSelectAllState();
        }
      );
    });
  }

  if (disbursementCard) {
    disbursementCard.addEventListener("click", (e) => {
      e.preventDefault();

      activateNavLinkAndShowSection(
        '.nav-link[data-section-id="disbursement-section"]',
        "disbursement-section",
        "Disbursement",
        "wallet",
        null
      );
    });
  }

  if (graduatesCard) {
    graduatesCard.addEventListener("click", (e) => {
      e.preventDefault();

      activateNavLinkAndShowSection(
        '.nav-link[data-section-id="graduates-section"]',
        "graduates-section",
        "Graduates",
        "graduation-cap",
        null
      );
    });
  }
}

// Update the Program/Category dropdown UI from submenu actions
function updateFilterDropdownUI(programValue) {
  const programSelect = document.getElementById('filterProgramSelect') || document.getElementById('programSelect');
  const categorySelect = document.getElementById('categorySelect');
  if (!programSelect || !categorySelect) return;

  const program = (programValue || 'ALL').toUpperCase();

  // Set program value if option exists
  const hasOption = Array.from(programSelect.options).some(opt => opt.value.toUpperCase() === program);
  if (hasOption) programSelect.value = program;

  // Build category options based on program
  categorySelect.innerHTML = '';
  if (program === 'ALL' || program === '') {
    categorySelect.disabled = true;
    const opt = document.createElement('option');
    opt.textContent = 'Select program first';
    opt.value = '';
    categorySelect.appendChild(opt);
    return;
  }

  categorySelect.disabled = false;
  let categories = [];
  if (program === 'EDSP') categories = ['EDSP1', 'EDSP2'];
  else if (program === 'ODSP') categories = ['ODSP1', 'ODSP2'];
  else if (program === 'ELAP') categories = ['ELEMENTARY', 'HIGHSCHOOL', 'COLLEGE'];

  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });
}

function populateYearSelect() {
  const yearSelect = document.getElementById('year');
  if (!yearSelect) return;

  const startYear = 2025;
  const currentYear = new Date().getFullYear();

  let options = `<option value="${startYear}">${startYear}</option>`;

  for (let year = currentYear; year > startYear; year--) {
    options += `<option value="${year}">${year}</option>`;
  }

  yearSelect.innerHTML = options;
}

function updateRecentScholars() {
  const list = document.getElementById('recent-scholars-list');
  if (!list) return;

  list.innerHTML = ''; // Clear existing content

  // Sort allScholars by recentDate descending (newest first)
  const sortedScholars = allScholars
    .filter(s => s.recentDate) // only those with recentDate
    .sort((a, b) => new Date(b.recentDate) - new Date(a.recentDate));

  // Take top 5 recent scholars (change number if you want)
  const recent = sortedScholars.slice(0, 5);

  if (recent.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No recent scholars available';
    li.classList.add('no-hover');
    Object.assign(li.style, {
      textAlign: 'center',
      fontStyle: 'italic',
      color: '#888'
    });
    list.appendChild(li);
    return;
  }

  recent.forEach(({ name, program, recentDate }) => {
    const li = document.createElement('li');
    li.classList.add('recent-scholar-item'); // optional for styling

    // Format date nicely, e.g. Aug 7, 2025
    const dateObj = new Date(recentDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });

    li.innerHTML = `
      <div class="scholar-info">
        <strong>${name}</strong>
        <span>${program}</span>
      </div>
      <span class="date">${formattedDate}</span>
    `;

    list.appendChild(li);
  });
}


function renderScholarsTable() {
  const tbody = document.getElementById('scholar-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  // Render ALL scholars, don't slice here - pagination will handle visibility
  allScholars.forEach((scholar, index) => {
    const tr = document.createElement('tr');
tr.setAttribute('data-program', scholar.program.toUpperCase());
tr.setAttribute('data-subprogram', scholar.program.toUpperCase());
tr.setAttribute('data-province', scholar.province.toUpperCase());
tr.setAttribute('data-scholar-id', scholar.id); // Add this line
    tr.innerHTML = `
      <td><input type="checkbox" class="row-checkbox"/></td>
      <td>${index + 1}</td>
      <td>${scholar.batch}</td>
      <td>${scholar.name}</td>
      <td>${scholar.address}</td>
      <td>${scholar.program}</td>
      <td>${scholar.contact}</td>
      <td>${scholar.sex}</td>
      <td><span class="status done">${scholar.status}</span></td>
      <td>
        <span class="bank-details" data-full="${scholar.bankDetails || ''}"></span>
        <button class="toggle-bank-btn" title="Show/Hide Account" style="background:none;border:none;cursor:pointer;padding:0;>
          <span class="eye-icon">👁</span>
        </button>
      </td>
      <td class="action-wrapper" style="position: relative;">
        <button class="action-menu-btn">
          <i data-lucide="more-vertical"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Mask bank details and add toggle logic
  document.querySelectorAll('.bank-details').forEach((el, idx) => {
    const full = el.getAttribute('data-full');
    if (!full || full === 'N/A') {
      el.textContent = 'N/A';
      return;
    }
    const match = full.match(/(\d{3})$/);
    const last3 = match ? match[1] : '';
    el.textContent = `LNB - ****${last3}`;
    el.setAttribute('data-masked', `LNB - ****${last3}`);
    el.setAttribute('data-visible', 'false');
  });

  document.querySelectorAll('.toggle-bank-btn').forEach((btn, idx) => {
    btn.addEventListener('click', function() {
      const bankSpan = btn.previousElementSibling;
      if (!bankSpan) return;
      const visible = bankSpan.getAttribute('data-visible') === 'true';
      if (visible) {
        bankSpan.textContent = bankSpan.getAttribute('data-masked');
        bankSpan.setAttribute('data-visible', 'false');
      } else {
        bankSpan.textContent = bankSpan.getAttribute('data-full');
        bankSpan.setAttribute('data-visible', 'true');
      }
    });
  });

  bindCheckboxLogic();
  bindContextualActionBar();
  bindScholarRowActionMenus();

  // Reset to first page and apply pagination
  currentPage = 1;
  paginateScholars();
}

function updateDashboardCounts() {
  const totalScholarsCountElem = document.getElementById('total-scholars-count');
  if (!totalScholarsCountElem) return;

  totalScholarsCountElem.textContent = allScholars.length;
}

function computeGenderData(scholars) {
  return scholars.reduce((acc, scholar) => {
    const gender = (scholar.sex || '').toLowerCase();
    if (gender === 'male') acc.male++;
    else if (gender === 'female') acc.female++;
    return acc;
  }, { male: 0, female: 0 });
}




// Toggle the Scholars filter dropdown panel
function bindFilterDropdownToggle() {
  const filterBtn = document.getElementById('filterBtn') || document.querySelector('.filter-btn');
  const filterDropdown = document.getElementById('filter-dropdown');
  const programSelect = document.getElementById('filterProgramSelect') || document.getElementById('programSelect');
  const categorySelect = document.getElementById('categorySelect');
  const provinceSelect = document.getElementById('provinceSelect');
  const applyBtn = document.getElementById('applyFilterBtn');
  const clearBtn = document.getElementById('clearFilterBtn');

  if (!filterBtn || !filterDropdown) return;

  // Toggle dropdown visibility
  filterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    filterDropdown.classList.toggle('hidden');
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    const isInside = filterDropdown.contains(e.target) || filterBtn.contains(e.target);
    if (!isInside) filterDropdown.classList.add('hidden');
  });

  // Prevent closing when interacting inside the dropdown
  filterDropdown.addEventListener('click', (e) => e.stopPropagation());

  // Populate Category options based on selected Program
  if (programSelect && categorySelect) {
    const populateCategories = (programValue) => {
      const value = (programValue || '').toUpperCase();
      categorySelect.innerHTML = '';

      if (value === 'ALL' || value === '') {
        categorySelect.disabled = true;
        const opt = document.createElement('option');
        opt.textContent = 'Select program first';
        opt.value = '';
        categorySelect.appendChild(opt);
        return;
      }

      categorySelect.disabled = false;

      let categories = [];
      if (value === 'EDSP') categories = ['ALL', 'EDSP1', 'EDSP2'];
      else if (value === 'ODSP') categories = ['ALL', 'ODSP1', 'ODSP2'];
      else if (value === 'ELAP') categories = ['ALL', 'ELEMENTARY', 'HIGHSCHOOL', 'COLLEGE'];

      categories.forEach((cat) => {
        const opt = document.createElement('option');
        opt.value = cat.toUpperCase();
        opt.textContent = cat === 'ALL' ? 'All' : cat;
        categorySelect.appendChild(opt);
      });

      // Default to All for the chosen program
      categorySelect.value = 'ALL';
    };

    // Initialize once and when Program changes
    populateCategories(programSelect.value);
    programSelect.addEventListener('change', (e) => populateCategories(e.target.value));
  }

  // Populate Province options from data
  if (provinceSelect) {
    const populateProvinces = () => {
      provinceSelect.innerHTML = '';
      
      // Add "All" option
      const allOpt = document.createElement('option');
      allOpt.value = 'ALL';
      allOpt.textContent = 'All Provinces';
      provinceSelect.appendChild(allOpt);

      // Get unique provinces from data
      const provinces = [...new Set(allScholars.map(scholar => scholar.province).filter(p => p))];
      provinces.sort().forEach(province => {
        const opt = document.createElement('option');
        opt.value = province.toUpperCase();
        opt.textContent = province;
        provinceSelect.appendChild(opt);
      });
    };

    // Populate provinces when data is loaded
    if (allScholars.length > 0) {
      populateProvinces();
    } else {
      // Wait for data to be loaded
      const checkData = setInterval(() => {
        if (allScholars.length > 0) {
          populateProvinces();
          clearInterval(checkData);
        }
      }, 100);
    }
  }

  // Apply filter to table rows
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      const selectedProgram = (programSelect?.value || 'ALL').toUpperCase();
      const selectedCategoryRaw = (categorySelect?.value || 'ALL').toUpperCase();
      const selectedProvince = (provinceSelect?.value || 'ALL').toUpperCase();

      applyFilters(selectedProgram, selectedCategoryRaw, selectedProvince);
      // Sync submenu active state and label with selected Program
      updateScholarsSubmenuActive(selectedProgram);
      updateScholarsLabel(selectedProgram);

      // If there is an active search, re-apply it
      const searchInput = document.querySelector('.search-bar');
      if (searchInput && searchInput.value.trim() !== '') {
        performScholarSearch(searchInput.value.toLowerCase().trim());
      }

      // Close dropdown after applying
      filterDropdown.classList.add('hidden');
    });
  }

  // Clear filters: reset selects, show all rows, reset pagination/counter
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      const tbody = document.getElementById('scholar-table-body');
      if (!tbody) return;

      // Reset Program select to All if exists
      if (programSelect) {
        // Prefer explicit "ALL" option where available
        const hasAll = Array.from(programSelect.options).some(o => o.value.toUpperCase() === 'ALL');
        programSelect.value = hasAll ? 'ALL' : (programSelect.options[0]?.value || 'ALL');
      }

      // Reset Category select disabled + placeholder
      if (categorySelect) {
        categorySelect.disabled = true;
        categorySelect.innerHTML = '';
        const opt = document.createElement('option');
        opt.textContent = 'Select program first';
        opt.value = '';
        categorySelect.appendChild(opt);
      }

      // Reset Province select to All
      if (provinceSelect) {
        provinceSelect.value = 'ALL';
      }

      // Show all rows
      const rows = Array.from(tbody.querySelectorAll('tr'));
      rows.forEach(r => r.style.display = '');

      // Reset pagination to first page if available
      try { if (typeof currentPage !== 'undefined') currentPage = 1; } catch (_) {}
      if (typeof paginateScholars === 'function') {
        paginateScholars();
      } else {
        const showingEl = document.getElementById('pagination-showing');
        if (showingEl) showingEl.textContent = `Showing: ${rows.length} of ${rows.length}`;
      }

      // Re-apply search if any
      const searchInput = document.querySelector('.search-bar');
      if (searchInput && searchInput.value.trim() !== '') {
        performScholarSearch(searchInput.value.toLowerCase().trim());
      }
      // Sync submenu and label to ALL
      updateScholarsSubmenuActive('ALL');
      updateScholarsLabel('ALL');

      // Keep dropdown open to reflect cleared state or close if preferred
      // filterDropdown.classList.add('hidden');
    });
  }
}

// Track current filter state globally
let currentFilterState = {
  program: 'ALL',
  category: 'ALL',
  province: 'ALL'
};

// Helper: Apply Program + Category + Province filter to rows and update counts/pagination
function applyFilters(selectedProgram, selectedCategoryRaw, selectedProvince) {
  const tbody = document.getElementById('scholar-table-body');
  if (!tbody) return;

  // Save current filter state
  currentFilterState = {
    program: (selectedProgram || 'ALL').toUpperCase(),
    category: (selectedCategoryRaw || 'ALL').toUpperCase(),
    province: (selectedProvince || 'ALL').toUpperCase()
  };

  // When filtering, clear search bar so only filter is applied
  const searchInput = document.querySelector('.search-bar');
  if (searchInput && searchInput.value.trim() !== '') {
    searchInput.value = '';
  }

  filterAndSearchScholars('');
}

// Updated filter and search logic to work with pagination
function filterAndSearchScholars(searchTerm) {
  const tbody = document.getElementById('scholar-table-body');
  const rows = Array.from(tbody?.querySelectorAll('tr') || []);
  const { program, category } = currentFilterState;
  const province = (currentFilterState.province || 'ALL').trim().toUpperCase();
  let visibleCount = 0;
  const terms = (searchTerm || '').toLowerCase().split(/\s+/);
  const lastNameTerm = terms[0] || "";
  const firstNameTerm = terms[1] || "";

  rows.forEach((row) => {
    const rowProgram = (row.getAttribute('data-program') || '').toUpperCase();
    const rowSub = (row.getAttribute('data-subprogram') || '').toUpperCase();
    const rowProvince = (row.getAttribute('data-province') || '').trim().toUpperCase();

    // Filter logic
    const matchesProgram = program === 'ALL' || rowProgram.startsWith(program);
    let matchesCategory = true;
    if (program !== 'ALL' && category !== 'ALL') {
      let expectedSub = category;
      if (program === 'ELAP' && !category.startsWith('ELAP')) {
        expectedSub = `ELAP ${category}`;
      }
      matchesCategory = rowSub === expectedSub || rowProgram === expectedSub;
    }
    const matchesProvince = province === 'ALL' || rowProvince === province;

    // Search logic
    let matchesSearch = true;
    if (searchTerm && searchTerm !== "") {
      const nameCell = row.cells[3];
      const addressCell = row.cells[4];
      const contactCell = row.cells[7];
      const provinceCell = row.getAttribute('data-province') || '';
      if (!nameCell) {
        matchesSearch = false;
      } else {
        const fullName = nameCell.textContent.trim().toLowerCase();
        const address = addressCell?.textContent.trim().toLowerCase() || '';
        const contact = contactCell?.textContent.trim().toLowerCase() || '';
        const prov = provinceCell.toLowerCase();
        const nameParts = fullName.split(/\s+/);
        const lastName = nameParts[0] || "";
        const firstName = nameParts[1] || "";
        const nameMatch = lastName.startsWith(lastNameTerm) && (firstNameTerm === '' || firstName.startsWith(firstNameTerm));
        const addressMatch = address.includes(searchTerm);
        const contactMatch = contact.includes(searchTerm);
        const provinceMatch = prov.includes(searchTerm);
        matchesSearch = nameMatch || addressMatch || contactMatch || provinceMatch;
      }
    }

    // Mark row as filtered out or not (don't change display here)
    const shouldShow = matchesProgram && matchesCategory && matchesProvince && matchesSearch;
    if (shouldShow) {
      row.removeAttribute('data-filtered-out');
      visibleCount++;
    } else {
      row.setAttribute('data-filtered-out', 'true');
    }
  });

  // Reset pagination to first page
  currentPage = 1;
  paginateScholars();

   // Update checkbox states after filtering
  updateSelectAllState();
}

 


// Highlight the correct Scholars submenu based on program
function updateScholarsSubmenuActive(programValue) {
  const program = (programValue || 'ALL').toUpperCase();
  const dropdown = document.querySelector('.dropdown');
  const toggle = dropdown?.querySelector('.dropdown-toggle');
  const submenuLinks = dropdown?.querySelectorAll('.dropdown-menu .nav-link') || [];

  // Clear active from all submenu links
  submenuLinks.forEach(link => link.classList.remove('active'));

  if (program !== 'ALL') {
    // Ensure the dropdown is open and toggle active
    if (dropdown) dropdown.classList.add('open');
    if (toggle) toggle.classList.add('active');

    // Activate the matching submenu link
    const match = Array.from(submenuLinks).find(l => (l.getAttribute('data-program') || '').toUpperCase() === program);
    if (match) match.classList.add('active');
  }
}






// Add any other existing helper or binding functions here...

// Legacy modal functions (kept for compatibility)
function openAddScholarModal() {
  if (window.scholarModal) {
    window.scholarModal.openModal();
  }
}

function closeAddScholarModal2() {
  if (window.scholarModal) {
    window.scholarModal.closeModal();
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Bind contextual action bar functionality
  bindContextualActionBar();
});

// ========== CHECKBOX FUNCTIONALITY ==========
function bindCheckboxLogic() {
  const selectAllCheckbox = document.getElementById('select-all-scholars');
  const rowCheckboxes = document.querySelectorAll('.row-checkbox');
  
  if (!selectAllCheckbox) return;
  
  // Select all checkbox functionality
  selectAllCheckbox.addEventListener('change', function() {
    const isChecked = this.checked;
    
    // Get only visible checkboxes (not filtered out)
    const visibleCheckboxes = Array.from(rowCheckboxes).filter(checkbox => {
      const row = checkbox.closest('tr');
      return row && row.style.display !== 'none';
    });
    
    // Check/uncheck all visible checkboxes
    visibleCheckboxes.forEach(checkbox => {
      checkbox.checked = isChecked;
    });
    
    updateSelectedCount();
  });
  
  // Individual checkbox functionality
  rowCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      updateSelectAllState();
      updateSelectedCount();
    });
  });
}

function updateSelectAllState() {
  const selectAllCheckbox = document.getElementById('select-all-scholars');
  const visibleCheckboxes = Array.from(document.querySelectorAll('.row-checkbox')).filter(checkbox => {
    const row = checkbox.closest('tr');
    return row && row.style.display !== 'none';
  });
  
  if (visibleCheckboxes.length === 0) {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;
    return;
  }
  
  const checkedCount = visibleCheckboxes.filter(checkbox => checkbox.checked).length;
  
  if (checkedCount === 0) {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;
  } else if (checkedCount === visibleCheckboxes.length) {
    selectAllCheckbox.checked = true;
    selectAllCheckbox.indeterminate = false;
  } else {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = true;
  }
}

function updateSelectedCount() {
  const checkedCheckboxes = document.querySelectorAll('.row-checkbox:checked');
  const count = checkedCheckboxes.length;
  
  // Update contextual action bar
  const contextualActionBar = document.getElementById('contextual-action-bar');
  const selectedCountText = document.getElementById('selected-count-text');
  const actionBarCheckbox = document.getElementById('action-bar-checkbox');
  
  if (count > 0) {
    // Show the contextual action bar
    if (contextualActionBar) {
      contextualActionBar.classList.remove('hidden');
    }
    
    // Update the count text
    if (selectedCountText) {
      selectedCountText.textContent = `${count} Item${count === 1 ? '' : 's'}`;
    }
    
    // Update action bar checkbox state
    if (actionBarCheckbox) {
      actionBarCheckbox.checked = true;
    }
  } else {
    // Hide the contextual action bar
    if (contextualActionBar) {
      contextualActionBar.classList.add('hidden');
    }
    
    // Update action bar checkbox state
    if (actionBarCheckbox) {
      actionBarCheckbox.checked = false;
    }
  }
  
  console.log(`Selected ${count} scholars`);
}

// ========== SCHOLAR ROW ACTION MENU (3-DOT) - FIXED VERSION ==========
let __rowActionMenusBound = false;
function bindScholarRowActionMenus() {
  if (__rowActionMenusBound) return;
  __rowActionMenusBound = true;
  const dropdown = document.getElementById('scholar-action-dropdown');
  const tableBody = document.getElementById('scholar-table-body');
  if (!dropdown || !tableBody) return;

  // Delegate click for all current/future buttons
  tableBody.addEventListener('click', (event) => {
    const button = event.target.closest('.action-menu-btn');
    if (!button) return;

    event.stopPropagation();

    // Close any other open dropdowns (e.g., profile dropdown, filter dropdown)
    closeAllDropdownsExcept(dropdown);

    // Toggle if clicking the same button again
    const isOpen = !dropdown.classList.contains('hidden');
    const openedFor = dropdown.getAttribute('data-for-button-id');
    const thisId = ensureActionButtonId(button);
    if (isOpen && openedFor === thisId) {
      hideScholarActionDropdown(dropdown);
      return;
    }

    // Position dropdown with smart positioning
    positionDropdownSmart(dropdown, button);

    // Mark which button opened it
    dropdown.setAttribute('data-for-button-id', thisId);

    // Show dropdown
    dropdown.classList.remove('hidden');

    // Re-init icons in case
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });

  // Global outside click to close
  document.addEventListener('click', (e) => {
    if (dropdown.classList.contains('hidden')) return;
    const isInside = dropdown.contains(e.target);
    const openedButtonId = dropdown.getAttribute('data-for-button-id');
    const openedButton = openedButtonId ? document.getElementById(openedButtonId) : null;
    const clickOnButton = openedButton && openedButton.contains(e.target);
    if (!isInside && !clickOnButton) {
      hideScholarActionDropdown(dropdown);
    }
  });

  // Close on scroll/resize to avoid misplacement
  window.addEventListener('scroll', () => hideScholarActionDropdown(dropdown), true);
  window.addEventListener('resize', () => hideScholarActionDropdown(dropdown));
}

// Smart positioning function to prevent dropdown cutoff
function positionDropdownSmart(dropdown, button) {
  const rect = button.getBoundingClientRect();
  const dropdownWidth = 130; // From your CSS
  
  // Get dropdown height by temporarily showing it to measure
  dropdown.style.visibility = 'hidden';
  dropdown.style.display = 'block';
  dropdown.classList.remove('hidden');
  const dropdownHeight = dropdown.offsetHeight;
  dropdown.style.visibility = '';
  dropdown.style.display = '';
  dropdown.classList.add('hidden');
  
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  
  // Calculate space available below and above the button
  const spaceBelow = viewportHeight - rect.bottom;
  const spaceAbove = rect.top;
  
  // Determine vertical position
  let top;
  if (spaceBelow >= dropdownHeight + 10) {
    // Enough space below - position below button
    top = rect.bottom + scrollTop + 6;
  } else if (spaceAbove >= dropdownHeight + 10) {
    // Not enough space below but enough above - position above button
    top = rect.top + scrollTop - dropdownHeight - 6;
  } else {
    // Not enough space either direction - position to fit in viewport
    if (spaceBelow > spaceAbove) {
      // More space below - position at bottom edge
      top = viewportHeight - dropdownHeight - 10 + scrollTop;
    } else {
      // More space above - position at top edge
      top = 10 + scrollTop;
    }
  }
  
  // Calculate horizontal position (prefer right-aligned to button)
  let left = rect.right + scrollLeft - dropdownWidth;
  
  // Ensure dropdown doesn't go off-screen horizontally
  if (left < 8) {
    left = 8; // Minimum padding from left edge
  } else if (left + dropdownWidth > viewportWidth - 8) {
    left = viewportWidth - dropdownWidth - 8; // Maximum padding from right edge
  }
  
  // Apply positioning
  dropdown.style.position = 'absolute';
  dropdown.style.top = `${Math.round(top)}px`;
  dropdown.style.left = `${Math.round(left)}px`;
  dropdown.style.right = 'auto';
}

function ensureActionButtonId(button) {
  if (!button.id) {
    button.id = `action-btn-${Math.random().toString(36).slice(2, 9)}`;
  }
  return button.id;
}

function hideScholarActionDropdown(dropdown) {
  dropdown.classList.add('hidden');
  dropdown.removeAttribute('data-for-button-id');
}

// Close all dropdowns except the one provided (if any)
function closeAllDropdownsExcept(exceptElement) {
  const profileDropdown = document.getElementById('profileDropdown');
  const scholarDropdown = document.getElementById('scholar-action-dropdown');
  const filterDropdown = document.getElementById('filter-dropdown');

  if (profileDropdown && profileDropdown !== exceptElement) {
    profileDropdown.style.display = 'none';
  }
  if (scholarDropdown && scholarDropdown !== exceptElement) {
    hideScholarActionDropdown(scholarDropdown);
  }
  if (filterDropdown && filterDropdown !== exceptElement) {
    filterDropdown.classList.add('hidden');
  }
}

function ensureActionButtonId(button) {
  if (!button.id) {
    button.id = `action-btn-${Math.random().toString(36).slice(2, 9)}`;
  }
  return button.id;
}

function hideScholarActionDropdown(dropdown) {
  dropdown.classList.add('hidden');
  dropdown.removeAttribute('data-for-button-id');
}

// Close all dropdowns except the one provided (if any)
function closeAllDropdownsExcept(exceptElement) {
  const profileDropdown = document.getElementById('profileDropdown');
  const scholarDropdown = document.getElementById('scholar-action-dropdown');
  const filterDropdown = document.getElementById('filter-dropdown');

  if (profileDropdown && profileDropdown !== exceptElement) {
    profileDropdown.style.display = 'none';
  }
  if (scholarDropdown && scholarDropdown !== exceptElement) {
    hideScholarActionDropdown(scholarDropdown);
  }
  if (filterDropdown && filterDropdown !== exceptElement) {
    filterDropdown.classList.add('hidden');
  }
}

// Get selected scholar IDs
function getSelectedScholarIds() {
  const checkedCheckboxes = document.querySelectorAll('.row-checkbox:checked');
  const selectedIds = [];
  
  checkedCheckboxes.forEach(checkbox => {
    const row = checkbox.closest('tr');
    if (row) {
      // You can add data-id attribute to rows if needed
      const rowIndex = row.rowIndex - 1; // Adjust for header row
      selectedIds.push(rowIndex);
    }
  });
  
  return selectedIds;
}

// ========== CONTEXTUAL ACTION BAR FUNCTIONALITY ==========
function bindContextualActionBar() {
  const actionBarCheckbox = document.getElementById('action-bar-checkbox');
  const releaseBtn = document.getElementById('release-btn');
  const removeBtn = document.getElementById('remove-btn');
  
  // Action bar checkbox functionality
  if (actionBarCheckbox) {
    actionBarCheckbox.addEventListener('change', function() {
      const isChecked = this.checked;
      const selectAllCheckbox = document.getElementById('select-all-scholars');
      const rowCheckboxes = document.querySelectorAll('.row-checkbox');
      
      if (isChecked) {
        // Select all visible checkboxes
        const visibleCheckboxes = Array.from(rowCheckboxes).filter(checkbox => {
          const row = checkbox.closest('tr');
          return row && row.style.display !== 'none';
        });
        visibleCheckboxes.forEach(checkbox => {
          checkbox.checked = true;
        });
        if (selectAllCheckbox) {
          selectAllCheckbox.checked = true;
          selectAllCheckbox.indeterminate = false;
        }
      } else {
        // Unselect all checkboxes
        rowCheckboxes.forEach(checkbox => {
          checkbox.checked = false;
        });
        if (selectAllCheckbox) {
          selectAllCheckbox.checked = false;
          selectAllCheckbox.indeterminate = false;
        }
      }
      
      updateSelectedCount();
    });
  }
  
  // Graduates button functionality
  if (releaseBtn) {
    releaseBtn.addEventListener('click', function() {
      const selectedIds = getSelectedScholarIds();
      if (selectedIds.length > 0) {
        console.log(`Graduating ${selectedIds.length} scholars:`, selectedIds);
        // Add your graduate logic here
        alert(`Graduate functionality for ${selectedIds.length} selected scholars`);
      } else {
        alert('Please select scholars to graduate');
      }
    });
  }
  
 // Remove button functionality - Fixed version
if (removeBtn) {
  removeBtn.addEventListener('click', async function() {
    const checkedCheckboxes = document.querySelectorAll('.row-checkbox:checked');
    if (checkedCheckboxes.length === 0) {
      alert('Please select scholars to remove');
      return;
    }

    const selectedCount = checkedCheckboxes.length;
    const scholarNames = [];
    
    // Get scholar names for confirmation
    checkedCheckboxes.forEach(checkbox => {
      const row = checkbox.closest('tr');
      if (row && row.cells[3]) {
        scholarNames.push(row.cells[3].textContent.trim());
      }
    });

    // Show confirmation modal - use same modal for consistency
    const confirmMessage = selectedCount === 1 
      ? scholarNames[0] 
      : `${selectedCount} scholars`;
    
    let shouldRemove;
    try {
      shouldRemove = await showDeleteConfirmationModal(confirmMessage, 'remove');
    } catch (error) {
      console.error('Error showing confirmation modal:', error);
      return;
    }
    
    if (!shouldRemove) {
      return; // User cancelled - modal should already be closed by showDeleteConfirmationModal
    }

    // Show loading state
    const originalText = this.innerHTML;
    this.innerHTML = '<i data-lucide="loader-2"></i><span>Deleting...</span>';
    this.disabled = true;

    try {
      // Get selected scholar IDs for API call if you have them
      const selectedIds = [];
      checkedCheckboxes.forEach(checkbox => {
        const row = checkbox.closest('tr');
        const scholarId = row?.getAttribute('data-scholar-id');
        if (scholarId) {
          selectedIds.push(scholarId);
        }
      });

      // Use the same delete_scholar.php endpoint for each selected scholar
      if (selectedIds.length > 0) {
        // Delete all scholars in parallel instead of sequential loop
        const deletePromises = selectedIds.map(scholarId => 
          fetch('../backend/delete_scholar.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'same-origin',
            body: JSON.stringify({ 
              id: scholarId 
            })
          }).then(response => response.json())
        );

        const results = await Promise.all(deletePromises);
        
        // Check if any deletions failed
        const failedDeletions = results.filter(result => !result.success);
        if (failedDeletions.length > 0) {
          throw new Error(`Failed to delete ${failedDeletions.length} scholar(s)`);
        }
      }

      // Remove rows from table and update local data
      checkedCheckboxes.forEach(checkbox => {
        const row = checkbox.closest('tr');
        if (row) {
          // Remove from allScholars array
          const scholarName = row.cells[3]?.textContent.trim();
          const scholarBatch = row.cells[2]?.textContent.trim();
          const scholarProgram = row.cells[5]?.textContent.trim();
          
          const scholarIndex = allScholars.findIndex(scholar => 
            scholar.name === scholarName && 
            scholar.batch === scholarBatch &&
            scholar.program === scholarProgram
          );

          if (scholarIndex !== -1) {
            allScholars.splice(scholarIndex, 1);
          }

          // Remove the row
          row.remove();
        }
      });

      // Update UI
      updateDashboardCounts();
      updateRecentScholars();
      updateGenderChart();
      currentPage = 1;
      paginateScholars();
      updateSelectAllState();
      updateSelectedCount(); // This should hide the contextual action bar automatically

      // ADDITIONAL FIX: Explicitly hide the contextual action bar
      const contextualActionBar = document.getElementById('contextual-action-bar');
      if (contextualActionBar) {
        contextualActionBar.classList.add('hidden');
      }

      // Show success message
      showNotification(`${selectedCount} scholar${selectedCount === 1 ? '' : 's'} deleted successfully`, 'success');

    } catch (error) {
      console.error('Error deleting scholars:', error);
      showNotification('Failed to delete scholars: ' + error.message, 'error');
    } finally {
      // Reset button state
      this.innerHTML = originalText;
      this.disabled = false;
      
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }
  });
}
}


function bindScholarSearch() {
  const searchInput = document.querySelector('.search-bar');
  if (!searchInput) return;

  // Use a flag to prevent multiple bindings if this function is called multiple times
  if (searchInput.dataset.searchBound === 'true') {
    return;
  }
  searchInput.dataset.searchBound = 'true';

  searchInput.addEventListener('keyup', () => {
    const searchTerm = searchInput.value.toLowerCase().trim();
    filterAndSearchScholars(searchTerm);
  });
}


// Enhanced Notification function to match system design
function showNotification(message, type = 'info') {
  // Create notification container
  const notification = document.createElement('div');
  notification.className = `system-notification notification-${type}`;
  
  // Set up the notification HTML
  let iconHtml = '';
  let bgColor = '';
  let iconColor = '';
  
  switch (type) {
    case 'success':
      iconHtml = '<i data-lucide="check-circle"></i>';
      bgColor = '#10b981';
      iconColor = 'white';
      break;
    case 'error':
      iconHtml = '<i data-lucide="x-circle"></i>';
      bgColor = '#ef4444';
      iconColor = 'white';
      break;
    case 'info':
    default:
      iconHtml = '<i data-lucide="info"></i>';
      bgColor = '#3b82f6';
      iconColor = 'white';
      break;
  }
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <div style="color: ${iconColor}; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">
        ${iconHtml}
      </div>
      <span>${message}</span>
    </div>
  `;
  
  notification.style.cssText = `
    position: fixed;
    top: 24px;
    right: 24px;
    padding: 14px 18px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    font-size: 14px;
    z-index: 10001;
    background-color: ${bgColor};
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    animation: notificationSlideIn 0.3s ease;
    max-width: 350px;
    min-width: 250px;
  `;

  // Add animation styles
  const notificationStyle = document.createElement('style');
  notificationStyle.textContent = `
    @keyframes notificationSlideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes notificationSlideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(notificationStyle);

  document.body.appendChild(notification);

  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Auto remove after 3.5 seconds
  setTimeout(() => {
    notification.style.animation = 'notificationSlideOut 0.3s ease';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      if (notificationStyle.parentNode) {
        notificationStyle.parentNode.removeChild(notificationStyle);
      }
    }, 300);
  }, 3500);
}// Add this to your existing JavaScript code

// Function to handle dropdown item clicks
function bindScholarDropdownActions() {
  const dropdown = document.getElementById('scholar-action-dropdown');
  if (!dropdown) return;

  // Remove any existing event listeners to prevent duplicates
  dropdown.removeEventListener('click', handleDropdownClick);
  
  // Add click event listener to the dropdown container
  dropdown.addEventListener('click', handleDropdownClick);
}

// Separate function to handle dropdown clicks (prevents duplicate bindings)
function handleDropdownClick(event) {
  const clickedItem = event.target.closest('.dropdown-item');
  if (!clickedItem) return;

  // Prevent action if button is disabled (loading state)
  if (clickedItem.disabled || clickedItem.style.pointerEvents === 'none') {
    return;
  }

  const dropdown = document.getElementById('scholar-action-dropdown');

  // Get the currently opened button's row
  const openedButtonId = dropdown.getAttribute('data-for-button-id');
  const openedButton = openedButtonId ? document.getElementById(openedButtonId) : null;
  const scholarRow = openedButton ? openedButton.closest('tr') : null;

  if (!scholarRow) {
    console.error('Could not find scholar row');
    return;
  }

  // Get scholar data from the row
  const scholarData = getScholarDataFromRow(scholarRow);

  // Handle different actions based on clicked item
  const actionText = clickedItem.querySelector('span')?.textContent?.trim().toLowerCase();
  
  switch (actionText) {
    case 'edit':
      handleEditScholar(scholarData, scholarRow);
      hideScholarActionDropdown(dropdown);
      break;
    case 'view':
      handleViewScholar(scholarData, scholarRow);
      hideScholarActionDropdown(dropdown);
      break;
    case 'ppf':
      handlePPFScholar(scholarData, scholarRow);
      hideScholarActionDropdown(dropdown);
      break;
    case 'graduate':
      handleGraduateScholar(scholarData, scholarRow);
      hideScholarActionDropdown(dropdown);
      break;
    case 'delete':
      // Don't hide dropdown immediately for delete - let the function handle it
      handleDeleteScholar(scholarData, scholarRow);
      break;
    default:
      console.log('Unknown action:', actionText);
      hideScholarActionDropdown(dropdown);
  }
}

// Function to extract scholar data from table row
function getScholarDataFromRow(row) {
  const cells = row.cells;
  return {
    id: row.getAttribute('data-scholar-id') || null, // Add this attribute to your rows if you have IDs
    rowIndex: row.rowIndex - 1, // Adjust for header row
    number: cells[1]?.textContent?.trim() || '',
    batch: cells[2]?.textContent?.trim() || '',
    name: cells[3]?.textContent?.trim() || '',
    address: cells[4]?.textContent?.trim() || '',
    program: cells[5]?.textContent?.trim() || '',
    contact: cells[6]?.textContent?.trim() || '',
    sex: cells[7]?.textContent?.trim() || '',
    status: cells[8]?.textContent?.trim() || '',
    bankDetails: cells[9]?.querySelector('.bank-details')?.getAttribute('data-full') || ''
  };
}

// Fixed handleDeleteScholar function
async function handleDeleteScholar(scholarData, row) {
  const dropdown = document.getElementById('scholar-action-dropdown');
  
  // Show custom delete confirmation modal
  let shouldDelete;
  try {
    shouldDelete = await showDeleteConfirmationModal(scholarData.name);
  } catch (error) {
    console.error('Error showing confirmation modal:', error);
    hideScholarActionDropdown(dropdown);
    return;
  }
  
  if (!shouldDelete) {
    // User cancelled - hide dropdown immediately
    hideScholarActionDropdown(dropdown);
    return;
  }

  // Find the specific delete button for this dropdown instance
  const deleteBtn = dropdown.querySelector('.dropdown-item.danger');
  let originalText = '';

  try {
    // Show loading state
    if (deleteBtn) {
      originalText = deleteBtn.innerHTML;
      deleteBtn.innerHTML = '<i data-lucide="loader-2"></i><span>Deleting...</span>';
      deleteBtn.style.pointerEvents = 'none';
      deleteBtn.disabled = true;
    }

    // If you have scholar IDs, make API call to delete from backend
    if (scholarData.id) {
      const response = await fetch('../backend/delete_scholar.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ 
          id: scholarData.id 
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to delete scholar from database');
      }
    }

    // Remove from local allScholars array
    const scholarIndex = allScholars.findIndex(scholar => 
      scholar.name === scholarData.name && 
      scholar.batch === scholarData.batch &&
      scholar.program === scholarData.program
    );

    if (scholarIndex !== -1) {
      allScholars.splice(scholarIndex, 1);
    }

    // Remove the row from the table
    row.remove();

    // Update dashboard counts
    updateDashboardCounts();

    // Update recent scholars list
    updateRecentScholars();

    // Update gender chart
    updateGenderChart();

    // Reset pagination and update display
    currentPage = 1;
    paginateScholars();

    // Update checkbox states
    updateSelectAllState();
    updateSelectedCount();

    // FORCE CLOSE the dropdown immediately after successful deletion
    // Hide dropdown first
    hideScholarActionDropdown(dropdown);
    
    // Additional cleanup - remove any dropdown positioning and attributes
    dropdown.style.position = '';
    dropdown.style.top = '';
    dropdown.style.left = '';
    dropdown.style.right = '';
    dropdown.removeAttribute('data-for-button-id');
    
    // Ensure dropdown is truly hidden
    dropdown.classList.add('hidden');
    dropdown.style.display = 'none';

    // Show success message
    showNotification('Scholar deleted successfully', 'success');

  } catch (error) {
    console.error('Error deleting scholar:', error);
    showNotification('Failed to delete scholar: ' + error.message, 'error');
    
    // Hide dropdown on error too with same cleanup
    hideScholarActionDropdown(dropdown);
    dropdown.style.position = '';
    dropdown.style.top = '';
    dropdown.style.left = '';
    dropdown.style.right = '';
    dropdown.removeAttribute('data-for-button-id');
    dropdown.classList.add('hidden');
    dropdown.style.display = 'none';
    
  } finally {
    // Always reset the button state regardless of success or failure
    if (deleteBtn && originalText) {
      deleteBtn.innerHTML = originalText;
      deleteBtn.style.pointerEvents = '';
      deleteBtn.disabled = false;
      
      // Recreate Lucide icons since we changed the innerHTML
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }
    
    // Extra safety - ensure dropdown is closed
    setTimeout(() => {
      if (dropdown) {
        hideScholarActionDropdown(dropdown);
        dropdown.classList.add('hidden');
        dropdown.style.display = 'none';
      }
    }, 100);
  }
}

// Enhanced hideScholarActionDropdown function for better cleanup
function hideScholarActionDropdown(dropdown) {
  if (!dropdown) return;
  
  // Remove all positioning styles
  dropdown.style.position = '';
  dropdown.style.top = '';
  dropdown.style.left = '';
  dropdown.style.right = '';
  dropdown.style.display = 'none';
  
  // Add hidden class
  dropdown.classList.add('hidden');
  
  // Remove tracking attribute
  dropdown.removeAttribute('data-for-button-id');
  
  // Force hide with multiple methods for maximum compatibility
  dropdown.style.visibility = 'hidden';
  dropdown.style.opacity = '0';
  dropdown.style.zIndex = '-1';
  
  // Reset after a short delay
  setTimeout(() => {
    dropdown.style.visibility = '';
    dropdown.style.opacity = '';
    dropdown.style.zIndex = '';
  }, 200);
}

// Enhanced dropdown click handler to ensure proper cleanup
function handleDropdownClick(event) {
  const clickedItem = event.target.closest('.dropdown-item');
  if (!clickedItem) return;

  // Prevent action if button is disabled (loading state)
  if (clickedItem.disabled || clickedItem.style.pointerEvents === 'none') {
    return;
  }

  const dropdown = document.getElementById('scholar-action-dropdown');

  // Get the currently opened button's row
  const openedButtonId = dropdown.getAttribute('data-for-button-id');
  const openedButton = openedButtonId ? document.getElementById(openedButtonId) : null;
  const scholarRow = openedButton ? openedButton.closest('tr') : null;

  if (!scholarRow) {
    console.error('Could not find scholar row');
    hideScholarActionDropdown(dropdown); // Close dropdown on error
    return;
  }

  // Get scholar data from the row
  const scholarData = getScholarDataFromRow(scholarRow);

  // Handle different actions based on clicked item
  const actionText = clickedItem.querySelector('span')?.textContent?.trim().toLowerCase();
  
  switch (actionText) {
    case 'edit':
      handleEditScholar(scholarData, scholarRow);
      hideScholarActionDropdown(dropdown);
      break;
    case 'view':
      handleViewScholar(scholarData, scholarRow);
      hideScholarActionDropdown(dropdown);
      break;
    case 'ppf':
      handlePPFScholar(scholarData, scholarRow);
      hideScholarActionDropdown(dropdown);
      break;
    case 'graduate':
      handleGraduateScholar(scholarData, scholarRow);
      hideScholarActionDropdown(dropdown);
      break;
    case 'delete':
      // For delete, the handleDeleteScholar function will handle closing the dropdown
      // Don't close it here as we need it open during the confirmation dialog
      handleDeleteScholar(scholarData, scholarRow);
      break;
    default:
      console.log('Unknown action:', actionText);
      hideScholarActionDropdown(dropdown);
  }
}

// Updated showDeleteConfirmationModal function to handle proper cleanup
function showDeleteConfirmationModal(scholarName, actionType = 'delete') {
    return new Promise((resolve) => {
        // Remove any existing delete confirmation modals first
        const existingModals = document.querySelectorAll('.modal-backdrop');
        existingModals.forEach(modal => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        });

        // Create modal backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';

        // Create modal container
        const modal = document.createElement('div');
        modal.className = 'delete-confirmation-modal';

        // Determine action text
        const actionText = actionType === 'remove' ? 'Remove' : 'Delete';
        const actionVerb = actionType === 'remove' ? 'remove' : 'delete';

        // Modal content
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-icon">
                    <i data-lucide="trash-2"></i>
                </div>
                <h3 class="modal-title">${actionText} Scholar${scholarName.includes('scholars') ? 's' : ''}</h3>
                <p class="modal-message">
                    Are you sure you want to ${actionVerb} <strong>"${scholarName}"</strong>?
                    <br><br>
                    <span class="modal-warning">This action cannot be undone.</span>
                </p>
            </div>
            <div class="modal-footer">
                <button class="modal-btn cancel-btn" id="cancel-delete-btn">Cancel</button>
                <button class="modal-btn delete-btn" id="confirm-delete-btn">${actionText}</button>
            </div>
        `;

        // Append to DOM
        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);

        // Initialize Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }

        // Get button elements
        const cancelBtn = modal.querySelector('#cancel-delete-btn');
        const confirmBtn = modal.querySelector('#confirm-delete-btn');

        // Close modal function with proper cleanup
        function closeModal(result) {
            // Ensure modal elements exist before animating
            if (backdrop && backdrop.parentNode) {
                backdrop.style.animation = 'fadeIn 0.2s ease reverse';
            }
            if (modal) {
                modal.style.animation = 'slideIn 0.2s ease reverse';
            }
            
            setTimeout(() => {
                // Remove modal from DOM
                if (backdrop && backdrop.parentNode) {
                    backdrop.parentNode.removeChild(backdrop);
                }
                resolve(result);
            }, 200);
        }

        // Event listeners
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeModal(false);
            });
        }
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeModal(true);
            });
        }

        // Close on backdrop click
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                closeModal(false);
            }
        });

        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', handleEscape);
                closeModal(false);
            }
        };
        document.addEventListener('keydown', handleEscape);

        // Focus on cancel button by default
        setTimeout(() => {
            if (cancelBtn && cancelBtn.focus) {
                cancelBtn.focus();
            }
        }, 100);
    });
}

function handleEditScholar(scholarData, scholarRow) {
  const id = scholarData?.id;
  if (!id) {
    showNotification('Cannot edit: missing scholar ID', 'error');
    return;
  }
  const raw = (window.scholarRawById || {})[id];
  if (!raw) {
    showNotification('Full scholar details not loaded. Please refresh.', 'error');
    return;
  }
  if (window.scholarModal && typeof window.scholarModal.openForEdit === 'function') {
    window.scholarModal.openForEdit(raw);
  } else {
    showNotification('Edit modal is not available', 'error');
  }
}

// Scholar View Functions
function handleViewScholar(scholarData, scholarRow) {
  console.log('handleViewScholar called with:', scholarData);
  
  const id = scholarData?.id;
  console.log('Scholar ID:', id);
  
  if (!id) {
    showNotification('Cannot view: missing scholar ID', 'error');
    // Try using the row data directly if ID is missing
    const fallbackData = {
      first_name: scholarData.name?.split(', ')[1]?.split(' ')[0] || 'Unknown',
      last_name: scholarData.name?.split(', ')[0] || 'Unknown',
      program: scholarData.program || '-',
      batch: scholarData.batch || '-',
      sex: scholarData.sex || '-',
      contact_number: scholarData.contact || '-',
      home_address: scholarData.address || '-',
      bank_details: scholarData.bankDetails || '-'
    };
    console.log('Using fallback data:', fallbackData);
    openViewSection(fallbackData);
    return;
  }
  
  // Get full scholar data from the global object
  const raw = (window.scholarRawById || {})[id];
  console.log('Raw scholar data:', raw);
  
  if (!raw) {
    showNotification('Full scholar details not loaded. Using available data.', 'info');
    // Use the basic scholar data we have
    const basicData = {
      first_name: scholarData.name?.split(', ')[1]?.split(' ')[0] || 'Unknown',
      last_name: scholarData.name?.split(', ')[0] || 'Unknown', 
      program: scholarData.program || '-',
      batch: scholarData.batch || '-',
      sex: scholarData.sex || '-',
      contact_number: scholarData.contact || '-',
      home_address: scholarData.address || '-',
      bank_details: scholarData.bankDetails || '-'
    };
    openViewSection(basicData);
    return;
  }
  
  openViewSection(raw);
}

function openViewSection(scholarData) {
  console.log('openViewSection called with:', scholarData);
  
  // Hide scholars section
  const scholarsSection = document.getElementById('scholars-section');
  const viewSection = document.getElementById('scholar-view-section');
  
  console.log('Scholars section found:', !!scholarsSection);
  console.log('View section found:', !!viewSection);
  
  if (scholarsSection) {
    scholarsSection.classList.add('hidden');
    console.log('Hidden scholars section');
  }
  
  if (viewSection) {
    viewSection.classList.remove('hidden');
    console.log('Showing view section');
  }
  
  // Update topbar title
  updateTopbarTitleAndIcon('Scholar Profile', 'user');
  
  // Populate scholar data
  populateScholarView(scholarData);
  
  // Initialize Lucide icons for the new content
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function populateScholarView(data) {
  // Helper function to safely set text content
  const setText = (elementId, value) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = value || '-';
    }
  };
  
  // Format the full name
  const fullName = `${data.last_name || ''}, ${data.first_name || ''}${data.middle_name ? ' ' + data.middle_name : ''}`.trim();
  
  // Header information
  setText('scholar-view-name', fullName);
  setText('scholar-view-program', data.program || '-');
  
  // Update status badge
  const statusElement = document.getElementById('scholar-view-status');
  if (statusElement) {
    statusElement.textContent = data.remarks || 'Active';
    statusElement.className = 'status done'; // Keep existing status styling
  }
  
  // Personal Information
  setText('scholar-detail-name', fullName);
  setText('scholar-detail-batch', data.batch || '-');
  setText('scholar-detail-birthdate', data.birth_date ? formatDate(data.birth_date) : '-');
  setText('scholar-detail-birthdate', data.birth_date ? formatDate(data.birth_date) : '-');

// ✅ Calculate and display age dynamically
if (data.birth_date) {
  const birthDate = new Date(data.birth_date);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  setText('scholar-detail-age', age >= 0 ? age : '-');
} else {
  setText('scholar-detail-age', '-');
}

  setText('scholar-detail-sex', data.sex || '-');
  setText('scholar-detail-contact', data.contact_number || '-');
  setText('scholar-detail-email', data.email || '-');
  
  // Address Information
  setText('scholar-detail-address', data.home_address || '-');
  setText('scholar-detail-province', data.province || '-');
  
  // Academic Information
  setText('scholar-detail-program', data.program || '-');
  setText('scholar-detail-course', data.course || '-');
  setText('scholar-detail-year-level', data.year_level || '-');
  setText('scholar-detail-school', data.school || '-');
  setText('scholar-detail-school-address', data.school_address || '-');
  
  // Financial Information
  setText('scholar-detail-bank', data.bank_details || '-');
  setText('scholar-detail-remarks', data.remarks || '-');
  
  // OFW Information
  setText('scholar-detail-parent', data.parent_name || '-');
  setText('scholar-detail-relationship', data.relationship || '-');
  setText('scholar-detail-ofw-name', data.ofw_name || '-');
  setText('scholar-detail-category', data.category || '-');
  setText('scholar-detail-jobsite', data.jobsite || '-');
  setText('scholar-detail-position', data.position || '-');
}

function backToScholars() {
  // Hide view section
  const viewSection = document.getElementById('scholar-view-section');
  const scholarsSection = document.getElementById('scholars-section');
  
  if (viewSection) {
    viewSection.classList.add('hidden');
  }
  
  if (scholarsSection) {
    scholarsSection.classList.remove('hidden');
  }
  
  // Update topbar title back to Scholars
  updateTopbarTitleAndIcon('Scholars', 'users');
  
  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function updateTopbarTitleAndIcon(title, iconName) {
  const iconElement = document.getElementById("sectionIcon");
  const titleElement = document.getElementById("sectionTitleText");

  if (iconElement && titleElement) {
    iconElement.setAttribute("data-lucide", iconName);
    titleElement.textContent = title;
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
}

function formatDate(dateString) {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    return dateString; // Return original if formatting fails
  }
}

// Placeholder functions for other dropdown actions
function handlePPFScholar(scholarData, scholarRow) {
  showNotification('PPF functionality not yet implemented', 'info');
}

function handleGraduateScholar(scholarData, scholarRow) {
  showNotification('Graduate functionality not yet implemented', 'info');
}

// Test function for Scholar View (can be called from browser console)
function testScholarView() {
  const testData = {
    first_name: "Juan",
    middle_name: "A",
    last_name: "Dela Cruz",
    program: "EDSP1",
    batch: "2023",
    birth_date: "2001-04-15",
    sex: "Male",
    contact_number: "+639123456789",
    home_address: "123 Main Street, Zamboanga City",
    province: "Zamboanga del Sur",
    course: "Bachelor of Science in Information Technology",
    school: "Western Mindanao State University",
    remarks: "Active"
  };
  
  console.log('Testing Scholar View with data:', testData);
  openViewSection(testData);
}

// Make test function globally available
window.testScholarView = testScholarView;