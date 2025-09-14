// Modal functionality for OWWA Scholarship Management System

class ScholarModal {
    constructor() {
        this.modal = document.getElementById('addScholarModal2');
        this.form = null;
        this.isSubmitting = false;
        this.mode = 'add';
        this.editId = null;
        this.originalBankDetails = null; // Track original bank details
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupFormValidation();
        this.setupBirthDateAgeCalculation();
        this.bindOtpEvents();
    }

    bindEvents() {
        // Add button click event
        const addBtn = document.querySelector('.add-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.openModal();
            });
        }

        // Modal close events
        if (this.modal) {
            // Close on overlay click
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });

            // Close on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
                    this.closeModal();
                }
            });

            // Contact number input formatting
            const contactInput = this.modal.querySelector('input[name="contact_number"]');
            if (contactInput) {
                contactInput.addEventListener('focus', (e) => {
                    if (e.target.value.trim() === '') {
                        e.target.value = '+63';
                        // Put cursor at the end after setting value
                        setTimeout(() => {
                            e.target.selectionStart = e.target.selectionEnd = e.target.value.length;
                        }, 0);
                    }
                });

                contactInput.addEventListener('input', (e) => {
                    let val = e.target.value;

                    // If user deletes all input, don't auto-fill here — wait for focus event to add +63
                    if (val === '') {
                        return;
                    }

                    // If input doesn't start with '+63', add it once and keep the rest
                    if (!val.startsWith('+63')) {
                        val = '+63' + val.replace(/^(\+|0)*/, '');
                        e.target.value = val;
                    }

                    // Allow user to type digits only after +63
                    // Remove non-digit characters except the leading '+'
                    e.target.value = e.target.value[0] + e.target.value.slice(1).replace(/\D/g, '');
                });
            }
        }
    }
    setupBirthDateAgeCalculation() {
    const birthDateInput = this.modal?.querySelector('input[name="birth_date"]');
    const ageInput = this.modal?.querySelector('input[name="age"]');

    if (birthDateInput && ageInput) {
        // Prevent selecting future dates
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

            // Focus on first input
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
        }
    }

    clearForm() {
        const inputs = this.modal.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.value = '';
            input.classList.remove('error');
        });

        // Clear any error messages
        const errorMessages = this.modal.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());
        
        // Reset original bank details
        this.originalBankDetails = null;
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
            // Real-time validation
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            // Remove error on input
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

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = `${this.getFieldLabel(fieldName)} is required`;
        }

        // Specific field validations
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
                    // Clean bank details (remove spaces and dashes)
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

        // Apply validation result
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
        // Basic Philippine phone number validation
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
            'home_address': 'Home Address',
            'province': 'Province',
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
        // Remove existing error message
        this.removeFieldError(field);

        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message show';
        errorDiv.textContent = message;

        // Insert after the field
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
                
                // Clean bank details before sending to backend
                if (input.name === 'bank_details' && value) {
                    value = value.replace(/[\s\-]/g, '');
                }
                
                formData[input.name] = value;
            }
        });

        return formData;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 5 seconds
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

        // Validate form
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

                // Refresh the scholars table without reloading
                if (typeof fetchScholars === 'function') {
                    fetchScholars();
                }
            } else {
                // Check if this is an OTP requirement error
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
        
        // Show/hide OTP button based on mode
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
            if (el.tagName.toLowerCase() === 'select') {
                // If option not present, append it
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
        setValue('home_address', data.home_address);
        setValue('province', data.province);
        setValue('contact_number', data.contact_number);
        setValue('email', data.email);
        setValue('course', data.course);
        setValue('years', data.years);
        setValue('year_level', data.year_level);
        setValue('school', data.school);
        setValue('school_address', data.school_address);
        setValue('remarks', data.remarks);
        setValue('bank_details', data.bank_details);
        // Store original bank details for comparison
        this.originalBankDetails = data.bank_details || '';
        setValue('parent_name', data.parent_name);
        setValue('relationship', data.relationship);
        setValue('ofw_name', data.ofw_name);
        setValue('category', data.category);
        setValue('gender', data.gender);
        setValue('jobsite', data.jobsite);
        setValue('position', data.position);
    }

    bindOtpEvents() {
        // Request OTP button
        const requestOtpBtn = document.getElementById('requestOtpBtn');
        if (requestOtpBtn) {
            requestOtpBtn.addEventListener('click', () => {
                this.requestOtp();
            });
        }

        // OTP verification modal events
        const otpModal = document.getElementById('otpVerificationModal');
        if (otpModal) {
            // Close on overlay click
            otpModal.addEventListener('click', (e) => {
                if (e.target === otpModal) {
                    this.closeOtpModal();
                }
            });

            // Close on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !otpModal.classList.contains('hidden')) {
                    this.closeOtpModal();
                }
            });
        }

        // Verify OTP button
        const verifyOtpBtn = document.getElementById('verifyOtpBtn');
        if (verifyOtpBtn) {
            verifyOtpBtn.addEventListener('click', () => {
                this.verifyOtp();
            });
        }

        // Resend OTP button
        const resendOtpBtn = document.getElementById('resendOtpBtn');
        if (resendOtpBtn) {
            resendOtpBtn.addEventListener('click', () => {
                this.resendOtp();
            });
        }

        // OTP input formatting
        const otpInput = document.getElementById('otpInput');
        if (otpInput) {
            otpInput.addEventListener('input', (e) => {
                // Only allow digits
                e.target.value = e.target.value.replace(/\D/g, '');
                
                // Auto-submit when 6 digits are entered
                if (e.target.value.length === 6) {
                    this.verifyOtp();
                }
            });
        }

        // Bank details change tracking
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
        
        // Clean the bank details (remove spaces, dashes, keep only digits)
        const cleanBankDetails = currentBankDetails.replace(/[\s\-]/g, '');
        const isValidLength = cleanBankDetails.length >= 6 && cleanBankDetails.length <= 20;
        const isOnlyDigits = /^\d+$/.test(cleanBankDetails);
        
        if (hasChanged && isValidLength && isOnlyDigits) {
            // Bank details have changed and are valid
            requestOtpBtn.disabled = false;
            requestOtpBtn.style.opacity = '1';
            otpHelpText.textContent = 'Bank details have been changed. OTP verification is required for security.';
            otpHelpText.style.color = '#dc3545';
            otpHelpText.style.fontWeight = '500';
        } else if (hasChanged && (!isValidLength || !isOnlyDigits)) {
            // Bank details have changed but are invalid
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
            // Bank details haven't changed
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

        // Clean bank details (remove spaces and dashes)
        const rawBankDetails = bankDetailsInput.value.trim();
        const cleanBankDetails = rawBankDetails.replace(/[\s\-]/g, '');
        
        // Validate cleaned bank details
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
            requestBtn.innerHTML = '<i data-lucide="loader-2"></i> Requesting OTP...';
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
                this.showOtpModal(result);
                this.showNotification('OTP generated successfully', 'success');
            } else {
                this.showNotification(result.message || 'Failed to generate OTP', 'error');
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

    showOtpModal(otpData) {
        const otpModal = document.getElementById('otpVerificationModal');
        const otpScholarInfo = document.getElementById('otpScholarInfo');
        const otpDisplayContainer = document.getElementById('otpDisplayContainer');
        const otpDisplayValue = document.getElementById('otpDisplayValue');
        const otpInput = document.getElementById('otpInput');

        if (otpModal) {
            // Update scholar info
            if (otpScholarInfo) {
                otpScholarInfo.textContent = `OTP sent to ${otpData.scholar_name}. Please check your email.`;
            }

            // Show OTP for localhost testing
            if (otpData.otp) {
                if (otpDisplayContainer) {
                    otpDisplayContainer.classList.remove('hidden');
                }
                if (otpDisplayValue) {
                    otpDisplayValue.textContent = otpData.otp;
                }
            }

            // Clear OTP input
            if (otpInput) {
                otpInput.value = '';
            }

            // Start timer
            this.startOtpTimer(otpData.expires_in || 15);

            // Show modal
            otpModal.classList.remove('hidden');

            // Focus on OTP input
            setTimeout(() => {
                if (otpInput) {
                    otpInput.focus();
                }
            }, 100);

            // Initialize Lucide icons
            if (window.lucide) {
                window.lucide.createIcons();
            }
        }
    }

    startOtpTimer(minutes) {
        let timeLeft = minutes * 60; // Convert to seconds
        const timerElement = document.getElementById('otpTimer');
        const verifyBtn = document.getElementById('verifyOtpBtn');
        const resendBtn = document.getElementById('resendOtpBtn');

        const timer = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            
            if (timerElement) {
                timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }

            if (timeLeft <= 0) {
                clearInterval(timer);
                if (timerElement) {
                    timerElement.textContent = 'Expired';
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

        // Store timer reference for cleanup
        this.otpTimer = timer;
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
            verifyBtn.innerHTML = '<i data-lucide="loader-2"></i> Verifying...';
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
                
                // Update the bank details input with the new value
                const bankDetailsInput = document.getElementById('bankDetailsInput');
                if (bankDetailsInput && result.new_bank_details) {
                    bankDetailsInput.value = result.new_bank_details;
                }

                // Refresh the scholars table
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
        
        if (resendBtn) {
            resendBtn.disabled = true;
            resendBtn.innerHTML = '<i data-lucide="loader-2"></i> Resending...';
        }

        try {
            // Reuse the requestOtp method
            await this.requestOtp();
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
        const otpModal = document.getElementById('otpVerificationModal');
        if (otpModal) {
            otpModal.classList.add('hidden');
            
            // Clear OTP input
            const otpInput = document.getElementById('otpInput');
            if (otpInput) {
                otpInput.value = '';
            }

            // Clear timer
            if (this.otpTimer) {
                clearInterval(this.otpTimer);
                this.otpTimer = null;
            }

            // Reset timer display
            const timerElement = document.getElementById('otpTimer');
            if (timerElement) {
                timerElement.textContent = '15:00';
            }

            // Reset buttons
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

            // Hide OTP display
            const otpDisplayContainer = document.getElementById('otpDisplayContainer');
            if (otpDisplayContainer) {
                otpDisplayContainer.classList.add('hidden');
            }

            // Reinitialize Lucide icons
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
    `;
    document.head.appendChild(style);
}