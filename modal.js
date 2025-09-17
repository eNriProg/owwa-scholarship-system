    // Modal functionality for OWWA Scholarship Management System

    class ScholarModal {
        constructor() {
            this.modal = document.getElementById('addScholarModal2');
            this.otpModal = document.getElementById('otpVerificationModal');
            this.form = null;
            this.isSubmitting = false;
            this.mode = 'add';
            this.editId = null;
            this.originalBankDetails = null;
            this.otpCooldownTimer = null;
            this.otpExpiryTimer = null;

            this.schoolDatabase = {
                "Kinder": [
                    { name: "Little Angels Kindergarten", address: "Tetuan, Zamboanga City" },
                    { name: "Sunshine Kindergarten School", address: "Putik, Zamboanga City" },
                    { name: "Rainbow Kids Learning Center", address: "Tumaga, Zamboanga City" },
                    { name: "Happy Hearts Kindergarten", address: "La Paz, Zamboanga City" },
                    { name: "Bright Start Kindergarten", address: "Ayala, Zamboanga City" }
                ],
                "Elementary": [
                    { name: "Zamboanga City Central Elementary School", address: "Veterans Ave, Zamboanga City" },
                    { name: "Tetuan Elementary School", address: "Tetuan, Zamboanga City" },
                    { name: "Tumaga Elementary School", address: "Tumaga, Zamboanga City" },
                    { name: "Baliwasan Elementary School", address: "Baliwasan, Zamboanga City" },
                    { name: "Putik Elementary School", address: "Putik, Zamboanga City" },
                    { name: "Ayala Elementary School", address: "Ayala, Zamboanga City" },
                    { name: "La Paz Elementary School", address: "La Paz, Zamboanga City" },
                    { name: "Maasin Elementary School", address: "Maasin, Zamboanga City" },
                    { name: "Guiwan Elementary School", address: "Guiwan, Zamboanga City" },
                    { name: "Boalan Elementary School", address: "Boalan, Zamboanga City" }
                ],
                "Junior High School": [
                    { name: "Zamboanga City High School", address: "Veterans Ave, Zamboanga City" },
                    { name: "Regional Science High School", address: "Normal Rd, Zamboanga City" },
                    { name: "Don Pablo Lorenzo Memorial High School", address: "Tetuan, Zamboanga City" },
                    { name: "Tumaga National High School", address: "Tumaga, Zamboanga City" },
                    { name: "Baliwasan Senior High School", address: "Baliwasan, Zamboanga City" },
                    { name: "La Paz National High School", address: "La Paz, Zamboanga City" },
                    { name: "Putik National High School", address: "Putik, Zamboanga City" },
                    { name: "Ayala National High School", address: "Ayala, Zamboanga City" },
                    { name: "Guiwan National High School", address: "Guiwan, Zamboanga City" },
                    { name: "Maasin National High School", address: "Maasin, Zamboanga City" }
                ],
                "Senior High School": [
                    { name: "Zamboanga City High School (Senior High)", address: "Veterans Ave, Zamboanga City" },
                    { name: "Regional Science High School (Senior High)", address: "Normal Rd, Zamboanga City" },
                    { name: "Don Pablo Lorenzo Memorial High School (Senior High)", address: "Tetuan, Zamboanga City" },
                    { name: "Tumaga National High School (Senior High)", address: "Tumaga, Zamboanga City" },
                    { name: "Western Mindanao State University Laboratory High School", address: "Normal Rd, Zamboanga City" },
                    { name: "Universidad De Zamboanga High School", address: "Gov. Camins Ave, Zamboanga City" },
                    { name: "Immaculate Conception Academy", address: "Veterans Ave, Zamboanga City" },
                    { name: "Ateneo de Zamboanga University High School", address: "La Purisima St, Zamboanga City" },
                    { name: "Claret School of Zamboanga", address: "General Alano St, Zamboanga City" },
                    { name: "Liceo de Zamboanga High School", address: "Valderosa St, Zamboanga City" }
                ],
                "College": [
                    { name: "Zamboanga State College of Marine Sciences and Technology", address: "Fort Pilar, Zamboanga City" },
                    { name: "Western Mindanao State University", address: "Normal Rd, Zamboanga City" },
                    { name: "Mindanao State University - Zamboanga Peninsula", address: "Talon-Talon, Zamboanga City" },
                    { name: "Zamboanga City State Polytechnic College", address: "Baliwasan, Zamboanga City" },
                    { name: "Zamboanga City Medical Center College of Nursing", address: "Dr. Evangelista St, Zamboanga City" },
                    { name: "Zamboanga City Polytechnic State College", address: "Tetuan, Zamboanga City" },
                    { name: "Zamboanga City State University", address: "Tetuan, Zamboanga City" },
                    { name: "Zamboanga City College of Arts and Trades", address: "Baliwasan, Zamboanga City" },
                    { name: "Zamboanga City College of Science and Technology", address: "La Paz, Zamboanga City" },
                    { name: "Zamboanga City College of Education", address: "Tetuan, Zamboanga City" },
                    { name: "Zamboanga City College of Business and Management", address: "Tumaga, Zamboanga City" },
                    { name: "Universidad De Zamboanga", address: "Gov. Camins Ave, Zamboanga City" },
                    { name: "Ateneo de Zamboanga University", address: "La Purisima St, Zamboanga City" },
                    { name: "Arturo Eustaquio College", address: "Governor Ramos St, Zamboanga City" },
                    { name: "Jose Maria College", address: "Tumaga, Zamboanga City" },
                    { name: "Pilar College", address: "General Alano St, Zamboanga City" }
                ]
            };
            // Address data for cascading dropdowns
    this.addressData = {
        "Basilan": {
            cities: ["Isabela City", "Lamitan City"],
            municipalities: ["Akbar", "Al-Barka", "Hadji Mohammad Ajul", "Hadji Muhtamad", "Lantawan", "Maluso", "Sumisip", "Tabuan-Lasa", "Tipo-Tipo", "Tuburan", "Ungkaya Pukan"],
            barangays: {
                "Isabela City": [
                    "Aguada", "Baluno", "Begang", "Binuangan", "Busay", "Cabunbata",
                    "Calvario", "Carbon", "Claret", "Diki", "Fort Pilar", "Gubwan",
                    "Kaumpurnah", "La Piedad", "Lamisahan", "Lukbuton", "Malagutay",
                    "Maluso", "Marang-Marang", "Marketsite", "Menzi", "Panigayan",
                    "Port Area", "Riverside", "San Rafael", "Santa Barbara", "Small Kaumpurnah",
                    "Sumagdang", "Sunrise Village", "Tabuk", "Tabiawan", "Tolosa"
                ],
                "Lamitan City": [
                    "Arco", "Baimbing", "Balagtasan", "Balas", "Balobo", "Bungkaong",
                    "Bualan", "Colonia", "Lanote", "Look Bato", "Maganda", "Malinis",
                    "Matibay", "Parangbasak", "Sabong", "Sengal", "Sinangkapan",
                    "Tandong Ahas", "Ulitan", "Pasilmanta", "Ba-as", "Campo Uno"
                ]
            }
        },
        "Zamboanga del Norte": {
            municipalities: [
                "Bacungan", "Baliguian", "Dapitan", "Dipolog", "Godod", "Gutalac",
                "Jose Dalman", "Kalawit", "Katipunan", "La Libertad", "Labason",
                "Leon B. Postigo", "Liloy", "Manukan", "Mutia", "Piñan", "Polanco",
                "Pres. Manuel A. Roxas", "Rizal", "Salug", "Sergio Osmeña Sr.",
                "Siayan", "Sibuco", "Sindangan", "Siocon", "Sirawai", "Tampilisan"
            ],
            barangays: {
                "Dipolog": ["Barra", "Biasong", "Central", "Cogon", "Dicayas", "Diwan", "Estaca", "Galas", "Gulayon", "Lugdungan", "Miputak", "Olingan", "Punta", "Santa Isabel", "Sicayab", "Sinaman", "Sunset", "Turno"],
                "Dapitan": ["Aliguay", "Antipolo", "Ba-ao", "Bagting", "Bambanan", "Barcelona", "Baylimango", "Burgos", "Carang", "Cawa-cawa", "Dapitan", "Dawo", "Diwa-an", "Guimputlan", "Ilaya", "Lagting", "Linabo", "Magsaysay", "Matimbo", "Opao", "Oro", "Potol", "Sabang", "San Nicolas", "San Pedro", "San Vicente", "Santa Cruz", "Santo Niño", "Sikatuna", "Sulangon", "Taguilon", "Talisay", "Tamion", "Tiguma", "Villa Aurora"]
            }
        },
        "Zamboanga del Sur": {
            cities: ["Zamboanga City", "Pagadian City"],
            municipalities: ["Aurora", "Bayog", "Dimataling", "Dinas", "Dumalinao", "Dumingag", "Guipos", "Josefina", "Kumalarang", "Labangan", "Lakewood", "Lapuyan", "Mahayag", "Margosatubig", "Midsalip", "Molave", "Pitogo", "Ramon Magsaysay", "San Miguel", "San Pablo", "Sominot", "Tabina", "Tambulig", "Tigbao", "Tukuran", "Vincenzo A. Sagun"],
            barangays: {
                "Zamboanga City": ["Ayala", "Baliwasan", "Boalan", "Bolong", "Bunguiao", "Busay", "Calabasa", "Camino Nuevo", "Canelar", "Capisan", "Caputian", "Cawit", "Curuan", "Divisoria", "Dulian", "Guiwan", "Kasanyangan", "La Paz", "Lamisahan", "Landang Gua", "Landang Laum", "Lanzones", "Latuan", "Lubigan", "Lunzuran", "Maasin", "Malagutay", "Mampang", "Manicahan", "Mariki", "Mercedes", "Muti", "Pamucutan", "Pasobolong", "Patalon", "Poblacion", "Putik", "Quiniput", "Recodo", "Rio Hondo", "Salaan", "San Jose Cawa-cawa", "San Jose Gusu", "San Roque", "Santa Barbara", "Santa Catalina", "Santa Maria", "Santo Niño", "Sibulao", "Sinubung", "Sinunoc", "Talon-talon", "Talisayan", "Tetuan", "Tigbalabag", "Tigtabon", "Tolosa", "Tugbungan", "Tulungatung", "Tumaga", "Upper Calarian", "Victoria", "Vitali", "Yulo", "Zambowood"],
                "Pagadian City": ["Balangasan", "Baloyboan", "Banale", "Barcelona", "Bulatok", "Bungiao", "Dao-ao", "Dumagoc", "Gatas", "Gubac", "Kagawasan", "Kawit", "Lenienza", "Lower Sibatang", "Lourdes", "Macasing", "Napolan", "Pajo", "San Francisco", "San Pedro", "Santiago", "Santo Niño", "Tiguma", "Tigumon", "Tulangan", "Tumalasay", "Upper Sibatang", "White Beach"]
            }
        },
        "Zamboanga Sibugay": {
            municipalities: ["Alicia", "Buug", "Diplahan", "Imelda", "Ipil", "Kabasalan", "Mabuhay", "Malangas", "Naga", "Olutanga", "Payao", "Roseller Lim", "Siay", "Talusan", "Titay", "Tungawan"],
            barangays: {
                "Ipil": ["Balas", "Boalan", "Dumalinao", "Imelda", "Kapok", "Keputatan", "Lourdes", "Lumbayao", "Maasin", "Makilas", "Pangi", "Poblacion East", "Poblacion West", "Roseller Lim", "San Isidro", "San Pedro", "Santa Filomena", "Santo Niño", "Tenan", "Umaloy"],
                "Kabasalan": ["Bagalupa", "Balabawan", "Bangkaw-bangkaw", "Calube", "Conacon", "Dimalinao", "Kahayagan", "Labrador", "Little Baguio", "Lumbog", "Magahub", "Maitom", "Malangas", "Poblacion", "San Isidro", "Sandayong", "Sapa Daan", "Tabayo", "Taguisan", "Tigbao"]
            }
        }
    };
            this.schoolData = {
                "Zamboanga State College of Marine Sciences and Technology": "Fort Pilar, Zamboanga City",
                "Western Mindanao State University": "Normal Rd, Zamboanga City",
                "Mindanao State University - Zamboanga Peninsula": "Talon-Talon, Zamboanga City",
                "Zamboanga City State Polytechnic College": "Baliwasan, Zamboanga City",
                "Zamboanga City Medical Center College of Nursing": "Dr. Evangelista St, Zamboanga City",
                "Zamboanga City Polytechnic State College": "Tetuan, Zamboanga City",
                "Zamboanga City State University": "Tetuan, Zamboanga City",
                "Zamboanga City College of Arts and Trades": "Baliwasan, Zamboanga City",
                "Zamboanga City College of Science and Technology": "La Paz, Zamboanga City",
                "Zamboanga City College of Education": "Tetuan, Zamboanga City",
                "Zamboanga City College of Business and Management": "Tumaga, Zamboanga City",
                "Universidad De Zamboanga": "Gov. Camins Ave, Zamboanga City"
            };
            this.init();
        }

        init() {
                this.bindEvents();
                this.setupFormValidation();
                this.setupBirthDateAgeCalculation();
                this.bindOtpEvents();
                this.setupAddressCascading();        // ADD THIS LINE
                this.setupPresentAddressCopy();      // ADD THIS LINE
                this.setupDynamicFields();
        }

        bindEvents() {
            // Add button click event
            const addBtn = document.querySelector('.add-btn');
            if (addBtn) {
                addBtn.addEventListener('click', () => {
                    this.openModal();
                });
            }

            // Main modal close events - ONLY close button and escape key
            if (this.modal) {
                // Remove overlay click to close
                this.modal.addEventListener('click', (e) => {
                    // Don't close on overlay click anymore
                    e.stopPropagation();
                });

                // Close on escape key
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        if (!this.otpModal.classList.contains('hidden')) {
                            // If OTP modal is open, close only OTP modal
                            this.closeOtpModal();
                        } else if (!this.modal.classList.contains('hidden')) {
                            // If main modal is open, close main modal
                            this.closeModal();
                        }
                    }
                });

                // Contact number input formatting
                const contactInput = this.modal.querySelector('input[name="contact_number"]');
                if (contactInput) {
                    contactInput.addEventListener('focus', (e) => {
                        if (e.target.value.trim() === '') {
                            e.target.value = '+63';
                            setTimeout(() => {
                                e.target.selectionStart = e.target.selectionEnd = e.target.value.length;
                            }, 0);
                        }
                    });

                    contactInput.addEventListener('input', (e) => {
                        let val = e.target.value;
                        if (val === '') return;
                        
                        if (!val.startsWith('+63')) {
                            val = '+63' + val.replace(/^(\+|0)*/, '');
                            e.target.value = val;
                        }
                        e.target.value = e.target.value[0] + e.target.value.slice(1).replace(/\D/g, '');
                    });
                }
            }

            // OTP modal events - ONLY close button, cancel button and escape key
            if (this.otpModal) {
                this.otpModal.addEventListener('click', (e) => {
                    // Don't close on overlay click
                    e.stopPropagation();
                });
            }
        }

        setupBirthDateAgeCalculation() {
            const birthDateInput = this.modal?.querySelector('input[name="birth_date"]');
            const ageInput = this.modal?.querySelector('input[name="age"]');

            if (birthDateInput && ageInput) {
                const today = new Date().toISOString().split("T")[0];
                birthDateInput.setAttribute("max", today);

                birthDateInput.addEventListener('change', (e) => {
                    const birthDate = new Date(e.target.value);
                    const todayDate = new Date();

                    let age = todayDate.getFullYear() - birthDate.getFullYear();
                    const monthDiff = todayDate.getMonth() - birthDate.getMonth();
                    const dayDiff = todayDate.getDate() - birthDate.getDate();

                    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
                        age--;
                    }

                    if (age < 5) {
                        this.showFieldError(birthDateInput, "Age must be at least 5 years old.");
                        e.target.value = "";
                        ageInput.value = "";
                        return;
                    }

                    ageInput.value = age >= 0 ? age : "";
                });
            }
        }

        openModal() {
            if (this.modal) {
                this.setMode('add');
                this.modal.classList.remove('hidden');
                this.clearForm();
                this.resetValidation();

                const firstInput = this.modal.querySelector('input, select');
                if (firstInput) {
                    firstInput.focus();
                }
            }
        }

        closeModal() {
            if (this.modal) {
                this.modal.classList.add('hidden');
                this.clearForm();
                this.resetValidation();
                this.clearCooldownTimer();
            }
        }

        clearForm() {
            this.hideAllAcademicFields(); // Add this line at the beginning
            
            const inputs = this.modal.querySelectorAll('input, select');
            inputs.forEach(input => {
                input.value = '';
                input.classList.remove('error');
            });
        
            const errorMessages = this.modal.querySelectorAll('.error-message');
            errorMessages.forEach(msg => msg.remove());
            
            this.originalBankDetails = null;
            
            // Reset education level container visibility
            const educationLevelContainer = document.getElementById('educationLevelContainer');
            if (educationLevelContainer) {
                educationLevelContainer.classList.add('hidden');
            }
        }

        resetValidation() {
            const inputs = this.modal.querySelectorAll('input, select');
            inputs.forEach(input => {
                input.classList.remove('error');
            });
        }

        setupFormValidation() {
            const inputs = this.modal.querySelectorAll('input, select');

            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });

                input.addEventListener('input', () => {
                    if (input.classList.contains('error')) {
                        input.classList.remove('error');
                        const errorMsg = input.parentNode.querySelector('.error-message');
                        if (errorMsg) {
                            errorMsg.remove();
                        }
                    }
                });
            });
        }

        validateField(field) {
            const value = field.value.trim();
            const fieldName = field.name;
            let isValid = true;
            let errorMessage = '';

            if (field.hasAttribute('required') && !value) {
                isValid = false;
                errorMessage = `${this.getFieldLabel(fieldName)} is required`;
            }

            if (isValid && value) {
                switch (fieldName) {
                    case 'contact_number':
                        if (!this.validatePhoneNumber(value)) {
                            isValid = false;
                            errorMessage = 'Please enter a valid phone number (e.g., +639123456789)';
                        }
                        break;
                    case 'birth_date':
                        const birthDate = new Date(value);
                        const today = new Date();
                        let age = today.getFullYear() - birthDate.getFullYear();
                        const monthDiff = today.getMonth() - birthDate.getMonth();
                        const dayDiff = today.getDate() - birthDate.getDate();

                        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
                            age--;
                        }

                        if (age < 5) {
                            isValid = false;
                            errorMessage = 'Age must be at least 5 years old';
                        }
                        break;
                    case 'batch':
                        const year = parseInt(value);
                        const currentYear = new Date().getFullYear();

                        if (isNaN(year) || year < 2000 || year > currentYear + 1) {
                            isValid = false;
                            errorMessage = `Batch year must be between 2000 and ${currentYear + 1}`;
                        }
                        break;
                    case 'last_name':
                    case 'first_name':
                        if (value.length < 2) {
                            isValid = false;
                            errorMessage = `${this.getFieldLabel(fieldName)} must be at least 2 characters`;
                        }
                        break;
                    case 'email':
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(value)) {
                            isValid = false;
                            errorMessage = 'Please enter a valid email address';
                        }
                        break;
                    case 'bank_details':
                        const cleanBankDetails = value.replace(/[\s\-]/g, '');
                        
                        if (cleanBankDetails.length < 6 || cleanBankDetails.length > 20) {
                            isValid = false;
                            errorMessage = 'Bank account must be 6-20 digits long';
                        } else if (!/^\d+$/.test(cleanBankDetails)) {
                            isValid = false;
                            errorMessage = 'Bank account must contain only numbers (spaces and dashes are allowed)';
                        }
                        break;
                }
            }

            if (!isValid) {
                field.classList.add('error');
                this.showFieldError(field, errorMessage);
            } else {
                field.classList.remove('error');
                this.removeFieldError(field);
            }

            return isValid;
        }

        validatePhoneNumber(phone) {
            const phoneRegex = /^\+63[0-9]{10}$/;
            return phoneRegex.test(phone);
        }

        getFieldLabel(fieldName) {
            const labels = {
                'last_name': 'Last Name',
                'first_name': 'First Name',
                'middle_name': 'Middle Name',
                'program': 'Program',
                'batch': 'Batch Year',
                'sex': 'Sex',
                'province': 'Province',
                'city': 'City/Municipality',
                'barangay': 'Barangay',
                'street': 'Street/Purok/Sitio',
                'contact_number': 'Contact Number',
                'email': 'Email',
                'course': 'Course',
                'years': 'Years of Study',
                'year_level': 'Year Level',
                'school': 'School',
                'school_address': 'School Address',
                'remarks': 'Remarks',
                'bank_details': 'Bank Details',
                'parent_name': 'Parent/Guardian Name',
                'present_address': 'Present Address',
                'relationship': 'Relationship to OFW',
                'ofw_name': 'Name of OFW',
                'category': 'Category',
                'gender': 'Gender',
                'jobsite': 'Jobsite',
                'position': 'Position'
            };
            return labels[fieldName] || fieldName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
        

        showFieldError(field, message) {
            this.removeFieldError(field);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message show';
            errorDiv.textContent = message;
            field.parentNode.appendChild(errorDiv);
        }

        removeFieldError(field) {
            const errorMsg = field.parentNode.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.remove();
            }
        }

        validateForm() {
            const inputs = this.modal.querySelectorAll('input[required], select[required]');
            let isValid = true;

            inputs.forEach(input => {
                if (!this.validateField(input)) {
                    isValid = false;
                }
            });

            return isValid;
        }

        getFormData() {
            const formData = {};
            const inputs = this.modal.querySelectorAll('input, select');
        
            inputs.forEach(input => {
                if (input.name) {
                    let value = input.value.trim();
                    
                    if (input.name === 'bank_details' && value) {
                        value = value.replace(/[\s\-]/g, '');
                    }
                    
                    formData[input.name] = value;
                }
            });
        
            return formData;
        }

        showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <span>${message}</span>
                <button onclick="this.parentElement.remove()">&times;</button>
            `;

            document.body.appendChild(notification);

            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 5000);
        }

        setLoading(loading) {
            this.isSubmitting = loading;
            const submitBtn = this.modal.querySelector('.submit-btn');
            const modal = this.modal.querySelector('.modal');

            if (loading) {
                submitBtn.disabled = true;
                submitBtn.textContent = this.mode === 'edit' ? 'Updating...' : 'Saving...';
                modal.classList.add('loading');
            } else {
                submitBtn.disabled = false;
                submitBtn.textContent = this.mode === 'edit' ? 'Update' : 'Save';
                modal.classList.remove('loading');
            }
        }

        async submitForm() {
            if (this.isSubmitting) return;

            if (!this.validateForm()) {
                this.showNotification('Please fix the errors in the form', 'warning');
                return;
            }

            this.setLoading(true);

            try {
                const formData = this.getFormData();

                let response;
                if (this.mode === 'edit' && this.editId) {
                    response = await this.updateScholar({ id: this.editId, ...formData });
                } else {
                    response = await this.saveScholar(formData);
                }

                if (response.success) {
                    this.showNotification(this.mode === 'edit' ? 'Scholar updated successfully!' : 'Scholar added successfully!', 'success');
                    this.closeModal();

                    if (typeof fetchScholars === 'function') {
                        fetchScholars();
                    }
                } else {
                    if (response.requires_otp) {
                        this.showNotification('Bank details require OTP verification. Please click "Request OTP for Bank Update" first.', 'warning');
                    } else {
                        this.showNotification(response.message || (this.mode === 'edit' ? 'Failed to update scholar' : 'Failed to add scholar'), 'error');
                    }
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                this.showNotification('An error occurred while saving the scholar', 'error');
            } finally {
                this.setLoading(false);
            }
        }

        async saveScholar(data) {
            try {
                const response = await fetch('../backend/scholars_create.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                return await response.json();
            } catch (error) {
                throw new Error('Network error: ' + error.message);
            }
        }

        async updateScholar(data) {
            try {
                const response = await fetch('../backend/update_scholar.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify(data)
                });
                return await response.json();
            } catch (error) {
                throw new Error('Network error: ' + error.message);
            }
        }

        setMode(mode) {
            this.mode = mode === 'edit' ? 'edit' : 'add';
            const header = this.modal.querySelector('.modal-header h2');
            const submitBtn = this.modal.querySelector('.submit-btn');
            const otpButtonContainer = document.getElementById('otpButtonContainer');
            
            if (header) {
                if (this.mode === 'edit') {
                    header.innerHTML = '<i data-lucide="user-plus" class="icon"></i> Edit Scholar Record';
                } else {
                    header.innerHTML = '<i data-lucide="user-plus" class="icon"></i> Add Scholar Record';
                }
                if (window.lucide) {
                    window.lucide.createIcons();
                }
            }
            if (submitBtn) {
                submitBtn.textContent = this.mode === 'edit' ? 'Update' : 'Save';
            }
            
            if (otpButtonContainer) {
                if (this.mode === 'edit') {
                    otpButtonContainer.classList.remove('hidden');
                    this.updateOtpButtonState();
                } else {
                    otpButtonContainer.classList.add('hidden');
                }
            }
        }

        openForEdit(scholar) {
            if (!this.modal) return;
            this.setMode('edit');
            this.editId = scholar.id;
            this.modal.classList.remove('hidden');
            this.resetValidation();
            this.prefillForm(scholar);
            const firstInput = this.modal.querySelector('input, select');
            if (firstInput) firstInput.focus();
        }

        prefillForm(data) {
            const setValue = (name, value) => {
                const el = this.modal.querySelector(`[name="${name}"]`);
                if (!el) return;
                
                // Special handling for program field to normalize old values
                if (name === 'program') {
                    value = this.normalizeProgram(value);
                }
                
                if (el.tagName.toLowerCase() === 'select') {
                    const exists = Array.from(el.options).some(opt => opt.value === (value ?? ''));
                    if (!exists && value !== undefined && value !== null && value !== '') {
                        const opt = document.createElement('option');
                        opt.value = value;
                        opt.textContent = value;
                        el.appendChild(opt);
                    }
                    el.value = value ?? '';
                } else {
                    el.value = value ?? '';
                }
            };
        
            setValue('last_name', data.last_name);
            setValue('first_name', data.first_name);
            setValue('middle_name', data.middle_name);
            setValue('program', data.program);
            setValue('education_level', data.education_level);
            setValue('batch', data.batch);
            setValue('birth_date', data.birth_date);
            if (data.birth_date) {
                const birthDate = new Date(data.birth_date);
                const today = new Date();
        
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                const dayDiff = today.getDate() - birthDate.getDate();
        
                if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
                    age--;
                }
        
                const ageInput = this.modal.querySelector('input[name="age"]');
                if (ageInput) ageInput.value = age >= 0 ? age : "";
            }
            setValue('sex', data.sex);
            setValue('province', data.province);
            setValue('city', data.city);
            setValue('barangay', data.barangay);
            setValue('street', data.street);
            setValue('contact_number', data.contact_number);
            setValue('email', data.email);
            setValue('course', data.course);
            setValue('semester', data.semester);
            setValue('grading_period', data.grading_period);
            setValue('grade_level', data.grade_level);
            setValue('strand', data.strand);
            setValue('years', data.years);
            setValue('year_level', data.year_level);
            setValue('school', data.school);
            setValue('school_address', data.school_address);
            setValue('remarks', data.remarks);
            setValue('bank_details', data.bank_details);
            this.originalBankDetails = data.bank_details || '';
            setValue('parent_name', data.parent_name);
            setValue('relationship', data.relationship);
            setValue('ofw_name', data.ofw_name);
            setValue('category', data.category);
            setValue('gender', data.gender);
            setValue('jobsite', data.jobsite);
            setValue('position', data.position);
            setValue('present_address', data.present_address);
        
            // ADD THESE LINES TO TRIGGER DYNAMIC FIELD LOGIC AFTER SETTING VALUES
            setTimeout(() => {
                if (data.province) {
                    this.updateCityOptions(data.province);
                    if (data.city) {
                        setTimeout(() => {
                            this.updateBarangayOptions(data.province, data.city);
                        }, 50);
                    }
                }
                
                // Trigger program change to show appropriate fields
                if (data.program) {
                    this.handleProgramChange(data.program);
                    
                    // If it's ELAP and has education_level, trigger that too
                    if (data.program === 'ELAP' && data.education_level) {
                        setTimeout(() => {
                            this.handleEducationLevelChange(data.education_level);
                        }, 100);
                    }
                }
            }, 100);
        }
        setupAddressCascading() {
            const provinceSelect = this.modal?.querySelector('select[name="province"]');
            const citySelect = this.modal?.querySelector('select[name="city"]');
            const barangaySelect = this.modal?.querySelector('select[name="barangay"]');
        
            if (!provinceSelect || !citySelect || !barangaySelect) return;
        
            provinceSelect.addEventListener('change', (e) => {
                this.updateCityOptions(e.target.value);
                this.clearBarangayOptions();
            });
        
            citySelect.addEventListener('change', (e) => {
                this.updateBarangayOptions(provinceSelect.value, e.target.value);
            });
        }
        
        updateCityOptions(province) {
            const citySelect = this.modal?.querySelector('select[name="city"]');
            if (!citySelect || !province) return;
        
            citySelect.innerHTML = '<option value="">Select City/Municipality</option>';
            const provinceData = this.addressData[province];
            if (provinceData) {
                if (provinceData.cities) {
                    provinceData.cities.forEach(city => {
                        const option = document.createElement('option');
                        option.value = city;
                        option.textContent = city;
                        citySelect.appendChild(option);
                    });
                }
                if (provinceData.municipalities) {
                    provinceData.municipalities.forEach(municipality => {
                        const option = document.createElement('option');
                        option.value = municipality;
                        option.textContent = municipality;
                        citySelect.appendChild(option);
                    });
                }
            }
        }
        
        updateBarangayOptions(province, city) {
            const barangaySelect = this.modal?.querySelector('select[name="barangay"]');
            if (!barangaySelect || !province || !city) return;
        
            barangaySelect.innerHTML = '<option value="">Select Barangay</option>';
            const provinceData = this.addressData[province];
            if (provinceData && provinceData.barangays && provinceData.barangays[city]) {
                provinceData.barangays[city].forEach(barangay => {
                    const option = document.createElement('option');
                    option.value = barangay;
                    option.textContent = barangay;
                    barangaySelect.appendChild(option);
                });
            }
        }
        
        clearBarangayOptions() {
            const barangaySelect = this.modal?.querySelector('select[name="barangay"]');
            if (barangaySelect) {
                barangaySelect.innerHTML = '<option value="">Select City/Municipality first</option>';
            }
        }
        
        setupPresentAddressCopy() {
            const checkbox = this.modal?.querySelector('#sameAsHomeAddress');
            const presentAddressInput = this.modal?.querySelector('input[name="present_address"]'); // Changed from 
            
            if (!checkbox || !presentAddressInput) return;
        
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.copyHomeToPresent();
                    presentAddressInput.style.opacity = '0.6';
                    presentAddressInput.readOnly = true;
                } else {
                    this.clearPresentAddress();
                    presentAddressInput.style.opacity = '1';
                    presentAddressInput.readOnly = false;
                }
            });
        }
        setupDynamicFields() {
            const programSelect = document.getElementById('programSelect');
            const educationLevelSelect = document.getElementById('educationLevelSelect');
            const schoolSelect = document.getElementById('schoolSelect');
        
            if (programSelect) {
                programSelect.addEventListener('change', (e) => {
                    this.handleProgramChange(e.target.value);
                });
            }
        
            if (educationLevelSelect) {
                educationLevelSelect.addEventListener('change', (e) => {
                    this.handleEducationLevelChange(e.target.value);
                });
            }
        
            if (schoolSelect) {
                schoolSelect.addEventListener('change', (e) => {
                    this.handleSchoolChange(e.target.value);
                });
            }
        }
        
        handleProgramChange(program) {
            const educationLevelContainer = document.getElementById('educationLevelContainer');
            const educationLevelSelect = document.getElementById('educationLevelSelect');
        
            // Hide all academic fields first
            this.hideAllAcademicFields();
        
            if (program === 'ELAP') {
                // Show education level dropdown for ELAP
                educationLevelContainer.classList.remove('hidden');
                // Don't clear the value if we're in edit mode
                if (this.mode === 'add') {
                    educationLevelSelect.value = '';
                }
            } else if (program === 'EDSP1' || program === 'EDSP2' || program === 'ODSP1' || program === 'ODSP2' || 
                       program === 'EDSP' || program === 'ODSP') {
                // Hide education level, show college fields directly
                educationLevelContainer.classList.add('hidden');
                this.showCollegeFields();
            } else {
                // Hide education level for empty selection
                educationLevelContainer.classList.add('hidden');
            }
        }
        
        handleEducationLevelChange(educationLevel) {
                // Hide all academic fields first
                this.hideAllAcademicFields();

                // Always show school fields for all education levels
                document.getElementById('schoolContainer').classList.remove('hidden');
                document.getElementById('schoolAddressContainer').classList.remove('hidden');

                // Populate schools based on education level
                this.populateSchoolsByEducationLevel(educationLevel);

                switch (educationLevel) {
                    case 'Kinder':
                        this.showKinderFields();
                        break;
                    case 'Elementary':
                        this.showElementaryFields();
                        break;
                    case 'Junior High School':
                        this.showJuniorHighFields();
                        break;
                    case 'Senior High School':
                        this.showSeniorHighFields();
                        break;
                    case 'College':
                        this.showCollegeFields();
                        break;
                }
            }
        // Add this new method after handleEducationLevelChange()
        normalizeProgram(program) {
                // Handle old program formats that might exist in your database
                const programMap = {
                    'EDSP': 'EDSP1',
                    'ODSP': 'ODSP1',
                    'ELAP ELEMENTARY': 'ELAP',
                    'ELAP HIGHSCHOOL': 'ELAP', 
                    'ELAP COLLEGE': 'ELAP'
                };
                
                return programMap[program] || program;
        }
        
        hideAllAcademicFields() {
            const fields = document.querySelectorAll('.academic-field');
            fields.forEach(field => {
                field.classList.add('hidden');
                // DON'T clear values when in edit mode - only clear when in add mode
                if (this.mode === 'add') {
                    const inputs = field.querySelectorAll('input, select');
                    inputs.forEach(input => {
                        if (input.name !== 'school_address') { // Don't clear readonly school address
                            input.value = '';
                        }
                    });
                }
            });
        }

        populateSchoolsByEducationLevel(educationLevel) {
            const schoolSelect = document.getElementById('schoolSelect');
            if (!schoolSelect || !educationLevel) return;
        
            // Clear existing options
            schoolSelect.innerHTML = '<option value="">Select School</option>';
        
            // Get schools for the selected education level
            const schools = this.schoolDatabase[educationLevel] || [];
            
            schools.forEach(school => {
                const option = document.createElement('option');
                option.value = school.name;
                option.textContent = school.name;
                option.dataset.address = school.address; // Store address in data attribute
                schoolSelect.appendChild(option);
            });
        }
        
        showKinderFields() {
            document.getElementById('gradeLevelContainer').classList.remove('hidden');
            this.populateGradeLevels(['Kinder 1', 'Kinder 2']);
        }
        
        showElementaryFields() {
            document.getElementById('gradeLevelContainer').classList.remove('hidden');
            document.getElementById('gradingPeriodContainer').classList.remove('hidden');
            this.populateGradeLevels(['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6']);
        }
        
        showJuniorHighFields() {
            document.getElementById('gradeLevelContainer').classList.remove('hidden');
            document.getElementById('gradingPeriodContainer').classList.remove('hidden');
            this.populateGradeLevels(['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10']);
        }
        
        showSeniorHighFields() {
            document.getElementById('gradeLevelContainer').classList.remove('hidden');
            document.getElementById('strandContainer').classList.remove('hidden');
            document.getElementById('semesterContainer').classList.remove('hidden');
            this.populateGradeLevels(['Grade 11', 'Grade 12']);
        }
        
        showCollegeFields() {
            // Show school fields for college programs
            document.getElementById('schoolContainer').classList.remove('hidden');
            document.getElementById('schoolAddressContainer').classList.remove('hidden');
            document.getElementById('courseContainer').classList.remove('hidden');
            document.getElementById('yearLevelContainer').classList.remove('hidden');
            document.getElementById('semesterContainer').classList.remove('hidden');
            this.populateSchoolsByEducationLevel('College');
        }
        
        populateGradeLevels(levels) {
            const gradeLevelSelect = document.getElementById('gradeLevelSelect');
            if (gradeLevelSelect) {
                gradeLevelSelect.innerHTML = '<option value="">Select Grade Level</option>';
                levels.forEach(level => {
                    const option = document.createElement('option');
                    option.value = level;
                    option.textContent = level;
                    gradeLevelSelect.appendChild(option);
                });
            }
        }
        
        handleSchoolChange(schoolName) {
            const schoolAddressInput = this.modal?.querySelector('input[name="school_address"]');
            const schoolSelect = document.getElementById('schoolSelect');
            
            if (schoolAddressInput && schoolSelect && schoolName) {
                // Find the selected option and get its address
                const selectedOption = schoolSelect.querySelector(`option[value="${schoolName}"]`);
                if (selectedOption && selectedOption.dataset.address) {
                    schoolAddressInput.value = selectedOption.dataset.address;
                } else {
                    schoolAddressInput.value = '';
                }
            } else if (schoolAddressInput) {
                schoolAddressInput.value = '';
            }
        }
        
        copyHomeToPresent() {
            const homeStreet = this.modal?.querySelector('input[name="street"]')?.value || '';
            const homeBarangay = this.modal?.querySelector('select[name="barangay"]')?.value || '';
            const homeCity = this.modal?.querySelector('select[name="city"]')?.value || '';
            const homeProvince = this.modal?.querySelector('select[name="province"]')?.value || '';
        
            const presentAddressInput = this.modal?.querySelector('input[name="present_address"]'); // Changed from present_street
        
            if (presentAddressInput) {
                const addressParts = [homeStreet, homeBarangay, homeCity, homeProvince].filter(part => part.trim() !== '');
                presentAddressInput.value = addressParts.join(', ');
            }
        }
        
        clearPresentAddress() {
            const presentAddressInput = this.modal?.querySelector('input[name="present_address"]'); // Changed from present_street
            
            if (presentAddressInput) {
                presentAddressInput.value = '';
            }
        }
        bindOtpEvents() {
            const requestOtpBtn = document.getElementById('requestOtpBtn');
            if (requestOtpBtn) {
                requestOtpBtn.addEventListener('click', () => {
                    this.requestOtp();
                });
            }

            const verifyOtpBtn = document.getElementById('verifyOtpBtn');
            if (verifyOtpBtn) {
                verifyOtpBtn.addEventListener('click', () => {
                    this.verifyOtp();
                });
            }

            const resendOtpBtn = document.getElementById('resendOtpBtn');
            if (resendOtpBtn) {
                resendOtpBtn.addEventListener('click', () => {
                    this.resendOtp();
                });
            }

            const otpInput = document.getElementById('otpInput');
            if (otpInput) {
                otpInput.addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/\D/g, '');
                    
                    if (e.target.value.length === 6) {
                        this.verifyOtp();
                    }
                });
            }

            const bankDetailsInput = document.getElementById('bankDetailsInput');
            if (bankDetailsInput) {
                bankDetailsInput.addEventListener('input', () => {
                    this.updateOtpButtonState();
                });
            }
        }

        updateOtpButtonState() {
            const bankDetailsInput = document.getElementById('bankDetailsInput');
            const requestOtpBtn = document.getElementById('requestOtpBtn');
            const otpHelpText = document.querySelector('.otp-help-text');
            
            if (!bankDetailsInput || !requestOtpBtn || !otpHelpText) return;
            
            const currentBankDetails = bankDetailsInput.value.trim();
            const hasChanged = currentBankDetails !== this.originalBankDetails;
            
            const cleanBankDetails = currentBankDetails.replace(/[\s\-]/g, '');
            const isValidLength = cleanBankDetails.length >= 6 && cleanBankDetails.length <= 20;
            const isOnlyDigits = /^\d+$/.test(cleanBankDetails);
            
            if (hasChanged && isValidLength && isOnlyDigits) {
                requestOtpBtn.disabled = false;
                requestOtpBtn.style.opacity = '1';
                otpHelpText.textContent = 'Bank details have been changed. OTP verification is required for security.';
                otpHelpText.style.color = '#dc3545';
                otpHelpText.style.fontWeight = '500';
            } else if (hasChanged && (!isValidLength || !isOnlyDigits)) {
                requestOtpBtn.disabled = true;
                requestOtpBtn.style.opacity = '0.6';
                if (!isOnlyDigits) {
                    otpHelpText.textContent = 'Bank account must contain only numbers (spaces and dashes are allowed).';
                } else {
                    otpHelpText.textContent = 'Bank account must be 6-20 digits long.';
                }
                otpHelpText.style.color = '#6c757d';
                otpHelpText.style.fontWeight = 'normal';
            } else {
                requestOtpBtn.disabled = true;
                requestOtpBtn.style.opacity = '0.6';
                otpHelpText.textContent = 'Bank account updates require OTP verification for security.';
                otpHelpText.style.color = '#6c757d';
                otpHelpText.style.fontWeight = 'normal';
            }
        }

        async requestOtp() {
            if (!this.editId) {
                this.showNotification('No scholar selected for OTP request', 'error');
                return;
            }

            const bankDetailsInput = document.getElementById('bankDetailsInput');
            if (!bankDetailsInput || !bankDetailsInput.value.trim()) {
                this.showNotification('Please enter bank details before requesting OTP', 'error');
                return;
            }

            const rawBankDetails = bankDetailsInput.value.trim();
            const cleanBankDetails = rawBankDetails.replace(/[\s\-]/g, '');
            
            if (cleanBankDetails.length < 6 || cleanBankDetails.length > 20) {
                this.showNotification('Bank account must be 6-20 digits long', 'error');
                return;
            }
            
            if (!/^\d+$/.test(cleanBankDetails)) {
                this.showNotification('Bank account must contain only numbers', 'error');
                return;
            }

            const requestBtn = document.getElementById('requestOtpBtn');
            if (requestBtn) {
                requestBtn.disabled = true;
                requestBtn.innerHTML = '<i data-lucide="loader-2" class="animate-spin"></i> Requesting OTP...';
            }

            try {
                const response = await fetch('../backend/update_bank.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify({
                        scholar_id: this.editId,
                        bank_details: cleanBankDetails
                    })
                });

                const result = await response.json();

                if (result.success) {
                    // ✅ Close the edit modal after successful OTP request
                    this.closeModal();
                    
                    this.showOtpModal(result);
                    this.showNotification('OTP generated successfully', 'success');
                }  else {
                    // ✅ Handle cooldown error specially
                    if (result.cooldown_active) {
                        this.showNotification(result.message, 'warning');
                    } else {
                        this.showNotification(result.message || 'Failed to generate OTP', 'error');
                    }
                }
            } catch (error) {
                console.error('Error requesting OTP:', error);
                this.showNotification('Network error while requesting OTP', 'error');
            } finally {
                if (requestBtn) {
                    requestBtn.disabled = false;
                    requestBtn.innerHTML = '<i data-lucide="shield-check"></i> Request OTP for Bank Update';
                    if (window.lucide) {
                        window.lucide.createIcons();
                    }
                }
            }
        }

        startCooldownTimer(seconds) {
            const requestBtn = document.getElementById('requestOtpBtn');
            const otpHelpText = document.querySelector('.otp-help-text');
            
            if (!requestBtn || !otpHelpText) return;

            let timeLeft = seconds;
            requestBtn.disabled = true;

            this.otpTimer = setInterval(() => {
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                
                if (timerElement) {
                    timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                }
            
                if (timeLeft <= 0) {
                    clearInterval(this.otpTimer);
                    if (timerElement) {
                        timerElement.textContent = 'Expired';
                    }
                    if (verifyBtn) {
                        verifyBtn.disabled = true;
                    }
                    if (resendBtn) {
                        resendBtn.disabled = false;
                        resendBtn.innerHTML = '<i data-lucide="refresh-cw"></i> Resend OTP';
                        if (window.lucide) {
                            window.lucide.createIcons();
                        }
                    }
                } else {
                    timeLeft--;
                    
                    // ✅ Show countdown on resend button for first 3 minutes (180 seconds)
                    const initialTime = minutes * 60;
                    const elapsedTime = initialTime - timeLeft;
                    
                    if (elapsedTime < 180) { // First 3 minutes
                        const remainingWaitTime = 180 - elapsedTime;
                        const waitMinutes = Math.floor(remainingWaitTime / 60);
                        const waitSeconds = remainingWaitTime % 60;
                        
                        if (resendBtn) {
                            resendBtn.innerHTML = `<i data-lucide="clock"></i> Wait ${waitMinutes}:${waitSeconds.toString().padStart(2, '0')}`;
                            resendBtn.disabled = true;
                            if (window.lucide) {
                                window.lucide.createIcons();
                            }
                        }
                    } else {
                        // ✅ Enable resend button after 3 minutes
                        if (resendBtn && resendBtn.disabled) {
                            resendBtn.disabled = false;
                            resendBtn.innerHTML = '<i data-lucide="refresh-cw"></i> Resend OTP';
                            if (window.lucide) {
                                window.lucide.createIcons();
                            }
                        }
                    }
                }
            }, 1000);
        }

        clearCooldownTimer() {
            if (this.otpCooldownTimer) {
                clearInterval(this.otpCooldownTimer);
                this.otpCooldownTimer = null;
            }
            if (this.otpExpiryTimer) {
                clearInterval(this.otpExpiryTimer);
                this.otpExpiryTimer = null;
            }
        }

        showOtpModal(otpData) {
            const otpScholarInfo = document.getElementById('otpScholarInfo');
            const otpDisplayContainer = document.getElementById('otpDisplayContainer');
            const otpDisplayValue = document.getElementById('otpDisplayValue');
            const otpInput = document.getElementById('otpInput');

            if (otpScholarInfo) {
                otpScholarInfo.textContent = `OTP sent to ${otpData.scholar_name}. Please check your email.`;
            }

            if (otpData.otp && otpDisplayContainer && otpDisplayValue) {
                otpDisplayContainer.classList.remove('hidden');
                otpDisplayValue.textContent = otpData.otp;
            }

            if (otpInput) {
                otpInput.value = '';
            }

            // Start 5-minute expiry timer
            this.startOtpExpiryTimer(5 * 60); // 5 minutes

            this.otpModal.classList.remove('hidden');

            setTimeout(() => {
                if (otpInput) {
                    otpInput.focus();
                }
            }, 100);

            if (window.lucide) {
                window.lucide.createIcons();
            }
        }

        startOtpExpiryTimer(seconds) {
            let timeLeft = seconds;
            const timerElement = document.getElementById('otpTimer');
            const verifyBtn = document.getElementById('verifyOtpBtn');
            const resendBtn = document.getElementById('resendOtpBtn');

            this.otpExpiryTimer = setInterval(() => {
                const minutes = Math.floor(timeLeft / 60);
                const secs = timeLeft % 60;
                
                if (timerElement) {
                    timerElement.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;
                }

                if (timeLeft <= 0) {
                    clearInterval(this.otpExpiryTimer);
                    this.otpExpiryTimer = null;
                    if (timerElement) {
                        timerElement.textContent = 'Expired';
                        timerElement.style.color = '#ef4444';
                    }
                    if (verifyBtn) {
                        verifyBtn.disabled = true;
                    }
                    if (resendBtn) {
                        resendBtn.disabled = false;
                    }
                } else {
                    timeLeft--;
                }
            }, 1000);
        }

        async verifyOtp() {
            const otpInput = document.getElementById('otpInput');
            const verifyBtn = document.getElementById('verifyOtpBtn');

            if (!otpInput || !otpInput.value.trim()) {
                this.showNotification('Please enter the OTP', 'error');
                return;
            }

            if (otpInput.value.length !== 6) {
                this.showNotification('OTP must be 6 digits', 'error');
                return;
            }

            if (verifyBtn) {
                verifyBtn.disabled = true;
                verifyBtn.innerHTML = '<i data-lucide="loader-2" class="animate-spin"></i> Verifying...';
            }

            try {
                const response = await fetch('../backend/verify_otp.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify({
                        scholar_id: this.editId,
                        otp: otpInput.value.trim()
                    })
                });

                const result = await response.json();

                if (result.success) {
                    this.showNotification('Bank details updated successfully!', 'success');
                    this.closeOtpModal();
                    
                    const bankDetailsInput = document.getElementById('bankDetailsInput');
                    if (bankDetailsInput && result.new_bank_details) {
                        bankDetailsInput.value = result.new_bank_details;
                    }

                    if (typeof fetchScholars === 'function') {
                        fetchScholars();
                    }
                } else {
                    this.showNotification(result.message || 'OTP verification failed', 'error');
                }
            } catch (error) {
                console.error('Error verifying OTP:', error);
                this.showNotification('Network error while verifying OTP', 'error');
            } finally {
                if (verifyBtn) {
                    verifyBtn.disabled = false;
                    verifyBtn.innerHTML = '<i data-lucide="check"></i> Verify OTP';
                    if (window.lucide) {
                        window.lucide.createIcons();
                    }
                }
            }
        }

        async resendOtp() {
            const resendBtn = document.getElementById('resendOtpBtn');
            
            if (resendBtn && resendBtn.disabled) {
                this.showNotification('Please wait before requesting a new OTP', 'warning');
                return;
            }
            
            if (resendBtn) {
                resendBtn.disabled = true;
                resendBtn.innerHTML = '<i data-lucide="loader-2"></i> Resending...';
            }
        
            try {
                // Close current OTP modal first
                this.closeOtpModal();
                
                // Request a new OTP
                await this.requestOtp();
            } catch (error) {
                console.error('Error resending OTP:', error);
                this.showNotification('Network error while resending OTP', 'error');
            } finally {
                if (resendBtn) {
                    resendBtn.disabled = false;
                    resendBtn.innerHTML = '<i data-lucide="refresh-cw"></i> Resend OTP';
                    if (window.lucide) {
                        window.lucide.createIcons();
                    }
                }
            }
        }

        closeOtpModal() {
            if (this.otpModal) {
                this.otpModal.classList.add('hidden');
                
                const otpInput = document.getElementById('otpInput');
                if (otpInput) {
                    otpInput.value = '';
                }

                this.clearCooldownTimer();

                const timerElement = document.getElementById('otpTimer');
                if (timerElement) {
                    timerElement.textContent = '5:00';
                    timerElement.style.color = '';
                }

                const verifyBtn = document.getElementById('verifyOtpBtn');
                const resendBtn = document.getElementById('resendOtpBtn');
                
                if (verifyBtn) {
                    verifyBtn.disabled = false;
                    verifyBtn.innerHTML = '<i data-lucide="check"></i> Verify OTP';
                }
                
                if (resendBtn) {
                    resendBtn.disabled = true;
                    resendBtn.innerHTML = '<i data-lucide="refresh-cw"></i> Resend OTP';
                }

                const otpDisplayContainer = document.getElementById('otpDisplayContainer');
                if (otpDisplayContainer) {
                    otpDisplayContainer.classList.add('hidden');
                }

                if (window.lucide) {
                    window.lucide.createIcons();
                }
            }
        }
    }

    // Initialize modal when DOM is loaded
    let scholarModal;

    document.addEventListener('DOMContentLoaded', () => {
        scholarModal = new ScholarModal();
        window.scholarModal = scholarModal;
    });

    // Global functions for modal control
    function openAddScholarModal() {
        if (scholarModal) {
            scholarModal.openModal();
        }
    }

    function closeAddScholarModal2() {
        if (scholarModal) {
            scholarModal.closeModal();
        }
    }

    function submitScholarForm() {
        if (scholarModal) {
            scholarModal.submitForm();
        }
    }

    function closeOtpModal() {
        if (scholarModal) {
            scholarModal.closeOtpModal();
        }
    }

    // Add notification styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 80px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 10001;
                display: flex;
                align-items: center;
                gap: 10px;
                min-width: 300px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                animation: slideInRight 0.3s ease-out;
            }

            .notification-success {
                background-color: #10b981;
                border-left: 4px solid #059669;
            }

            .notification-error {
                background-color: #ef4444;
                border-left: 4px solid #dc2626;
            }

            .notification-warning {
                background-color: #f59e0b;
                border-left: 4px solid #d97706;
            }

            .notification-info {
                background-color: #3b82f6;
                border-left: 4px solid #2563eb;
            }

            .notification button {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                margin-left: auto;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .notification button:hover {
                opacity: 0.8;
            }

            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            .animate-spin {
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                from {
                    transform: rotate(0deg);
                }
                to {
                    transform: rotate(360deg);
                }
            }
        `;
        document.head.appendChild(style);
    }