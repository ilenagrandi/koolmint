// Multi-Step Form Handler
class FormHandler {
    constructor() {
        this.currentStep = CONFIG.form.initialStep;
        this.totalSteps = CONFIG.form.totalSteps;
        this.form = document.getElementById('applicationForm');
        this.nextBtn = document.getElementById('nextBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.submitBtn = document.getElementById('submitBtn');
        this.progressFill = document.getElementById('progressFill');
        this.init();
    }

    init() {
        this.updateStep(this.currentStep);
        this.nextBtn.addEventListener('click', () => this.next());
        this.prevBtn.addEventListener('click', () => this.prev());
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.setupFieldValidations();
    }

    setupFieldValidations() {
        // Email validation
        const emailField = document.getElementById('email');
        if (emailField) {
            emailField.addEventListener('blur', () => this.validateEmail(emailField));
            emailField.addEventListener('input', () => this.clearError(emailField));
        }

        // Phone validation
        const phoneField = document.getElementById('phone');
        if (phoneField) {
            phoneField.addEventListener('blur', () => this.validatePhone(phoneField));
            phoneField.addEventListener('input', (e) => {
                this.formatPhoneInput(e.target);
                this.clearError(e.target);
            });
        }

        // URL validation
        const websiteField = document.getElementById('website');
        if (websiteField) {
            websiteField.addEventListener('blur', () => this.validateURL(websiteField));
            websiteField.addEventListener('input', () => this.clearError(websiteField));
        }

        // Name validation
        const nameField = document.getElementById('fullName');
        if (nameField) {
            nameField.addEventListener('blur', () => this.validateName(nameField));
            nameField.addEventListener('input', () => this.clearError(nameField));
        }
    }

    validateEmail(field) {
        const email = field.value.trim();
        if (!email) {
            if (field.hasAttribute('required')) {
                this.showError(field, 'Email is required');
                return false;
            }
            return true;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showError(field, 'Please enter a valid email address');
            return false;
        }

        this.showSuccess(field);
        return true;
    }

    validatePhone(field) {
        const phone = field.value.trim();
        if (!phone) {
            // Phone is optional, so empty is valid
            this.clearError(field);
            return true;
        }

        // Must start with + and have country code (1-3 digits), then rest of number
        // Format: +[country code][number] - e.g., +1234567890, +441234567890
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        
        // Also accept formatted: +1 (555) 123-4567
        const formattedPhone = phone.replace(/[\s\-\(\)]/g, '');
        
        if (!phoneRegex.test(formattedPhone)) {
            this.showError(field, 'Please enter a valid phone number with country code (e.g., +1 5551234567)');
            return false;
        }

        this.showSuccess(field);
        return true;
    }

    formatPhoneInput(field) {
        let value = field.value.replace(/\D/g, ''); // Remove non-digits
        
        // If doesn't start with +, add it
        if (value && !field.value.startsWith('+')) {
            value = '+' + value;
        }
        
        // Limit to 15 digits after + (E.164 standard)
        if (value.length > 16) { // + plus 15 digits
            value = value.substring(0, 16);
        }
        
        field.value = value;
    }

    validateURL(field) {
        const url = field.value.trim();
        if (!url) {
            // URL is optional
            this.clearError(field);
            return true;
        }

        try {
            // Must start with http:// or https://
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                this.showError(field, 'URL must start with http:// or https://');
                return false;
            }

            new URL(url); // This will throw if invalid
            this.showSuccess(field);
            return true;
        } catch (e) {
            this.showError(field, 'Please enter a valid URL');
            return false;
        }
    }

    validateName(field) {
        const name = field.value.trim();
        if (!name) {
            if (field.hasAttribute('required')) {
                this.showError(field, 'Name is required');
                return false;
            }
            return true;
        }

        // Name should have at least 2 characters and contain letters
        if (name.length < 2) {
            this.showError(field, 'Name must be at least 2 characters');
            return false;
        }

        if (!/^[a-zA-Z\s\-'\.]+$/.test(name)) {
            this.showError(field, 'Name can only contain letters, spaces, hyphens, apostrophes, and periods');
            return false;
        }

        this.showSuccess(field);
        return true;
    }

    showError(field, message) {
        field.style.borderColor = '#ff4444';
        this.removeErrorMessage(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.color = '#ff4444';
        errorDiv.style.fontSize = '0.85rem';
        errorDiv.style.marginTop = '0.25rem';
        errorDiv.style.animation = 'fadeIn 0.3s ease';
        
        field.parentElement.appendChild(errorDiv);
        field.setAttribute('data-error', 'true');
    }

    showSuccess(field) {
        field.style.borderColor = '#00D084';
        this.removeErrorMessage(field);
        field.removeAttribute('data-error');
    }

    clearError(field) {
        if (!field.hasAttribute('data-error')) {
            field.style.borderColor = '';
        }
    }

    removeErrorMessage(field) {
        const existingError = field.parentElement.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    updateStep(step) {
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
        
        // Show current step
        const currentStepElement = document.querySelector(`.form-step[data-step="${step}"]`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }
        
        // Update indicators
        document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
            indicator.classList.remove('active', 'completed');
            if (index + 1 < step) {
                indicator.classList.add('completed');
            } else if (index + 1 === step) {
                indicator.classList.add('active');
            }
        });
        
        // Update progress bar
        if (this.progressFill) {
            this.progressFill.style.width = `${(step / this.totalSteps) * 100}%`;
        }
        
        // Update navigation buttons
        this.prevBtn.classList.toggle('hidden', step === 1);
        this.nextBtn.classList.toggle('hidden', step === this.totalSteps);
        // Submit button should only show on the last step
        if (step === this.totalSteps) {
            this.submitBtn.classList.remove('hidden');
            this.nextBtn.classList.add('hidden');
        } else {
            this.submitBtn.classList.add('hidden');
            this.nextBtn.classList.remove('hidden');
        }
        
        // Update review step
        if (step === this.totalSteps) {
            this.updateReview();
        }
    }

    validateStep(step) {
        const currentStepElement = document.querySelector(`.form-step[data-step="${step}"]`);
        if (!currentStepElement) return false;

        let isValid = true;
        
        // Validate all fields in current step
        const allFields = currentStepElement.querySelectorAll('input, select, textarea');
        allFields.forEach(field => {
            let fieldValid = true;
            
            // Check if required and empty
            if (field.hasAttribute('required') && !field.value.trim()) {
                fieldValid = false;
                this.showError(field, 'This field is required');
            } else {
                // Validate based on field type
                switch (field.type) {
                    case 'email':
                        fieldValid = this.validateEmail(field);
                        break;
                    case 'tel':
                        fieldValid = this.validatePhone(field);
                        break;
                    case 'url':
                        fieldValid = this.validateURL(field);
                        break;
                    case 'text':
                        if (field.id === 'fullName') {
                            fieldValid = this.validateName(field);
                        } else if (field.value.trim()) {
                            this.showSuccess(field);
                        }
                        break;
                    default:
                        if (field.value.trim()) {
                            this.showSuccess(field);
                        }
                }
            }
            
            if (!fieldValid) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    updateReview() {
        const fields = {
            reviewName: document.getElementById('fullName'),
            reviewEmail: document.getElementById('email'),
            reviewStartup: document.getElementById('startupName'),
            reviewStage: document.getElementById('stage'),
            reviewSolution: document.getElementById('problemSolution')
        };

        if (fields.reviewName) {
            document.getElementById('reviewName').textContent = fields.reviewName.value || '-';
        }
        if (fields.reviewEmail) {
            document.getElementById('reviewEmail').textContent = fields.reviewEmail.value || '-';
        }
        if (fields.reviewStartup) {
            document.getElementById('reviewStartup').textContent = fields.reviewStartup.value || '-';
        }
        if (fields.reviewStage) {
            const stageText = fields.reviewStage.options[fields.reviewStage.selectedIndex]?.text || '-';
            document.getElementById('reviewStage').textContent = stageText;
        }
        if (fields.reviewSolution) {
            document.getElementById('reviewSolution').textContent = fields.reviewSolution.value || '-';
        }
    }

    next() {
        if (this.validateStep(this.currentStep)) {
            // Send data to webhook before advancing
            this.sendToWebhook(this.currentStep);
            
            this.currentStep++;
            this.updateStep(this.currentStep);
        }
    }

    collectFormData() {
        // Collect all form data
        const formData = {
            step: this.currentStep,
            timestamp: new Date().toISOString(),
            fullName: document.getElementById('fullName')?.value || '',
            email: document.getElementById('email')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            startupName: document.getElementById('startupName')?.value || '',
            stage: document.getElementById('stage')?.value || '',
            website: document.getElementById('website')?.value || '',
            problemSolution: document.getElementById('problemSolution')?.value || '',
            targetMarket: document.getElementById('targetMarket')?.value || '',
            timeline: document.getElementById('timeline')?.value || ''
        };
        
        return formData;
    }

    async sendToWebhook(step) {
        try {
            const formData = this.collectFormData();
            formData.step = step;
            formData.action = 'step_progress'; // Indicates this is a step update, not final submission
            
            // Send to Make.com webhook
            const response = await fetch(CONFIG.form.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                console.warn('Webhook request failed:', response.status);
                // Don't block user progress if webhook fails
            } else {
                console.log('Data sent to webhook successfully for step', step);
            }
        } catch (error) {
            console.error('Error sending data to webhook:', error);
            // Don't block user progress if webhook fails
        }
    }

    prev() {
        this.currentStep--;
        this.updateStep(this.currentStep);
    }

    async handleSubmit(e) {
        e.preventDefault();
        if (this.validateStep(this.currentStep)) {
            try {
                // Send final submission to webhook
                const formData = this.collectFormData();
                formData.step = this.currentStep;
                formData.action = 'final_submission'; // Indicates this is the final submission
                
                const response = await fetch(CONFIG.form.webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    throw new Error('Failed to submit application');
                }

                // Show success message
                alert('🎉 Application submitted! We\'ll review your idea and get back to you within 5 business days.');
                
                // Close modal
                if (window.modal && window.modal.close) {
                    window.modal.close();
                } else {
                    // Fallback: close modal directly
                    const modal = document.getElementById('applicationModal');
                    if (modal) {
                        modal.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                }
                
                // Reset form
                this.reset();
            } catch (error) {
                console.error('Error submitting application:', error);
                alert('There was an error submitting your application. Please try again or contact us directly.');
            }
        }
    }

    reset() {
        this.currentStep = CONFIG.form.initialStep;
        if (this.form) {
            this.form.reset();
        }
        this.updateStep(this.currentStep);
    }
}

// Initialize form handler when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.formHandler = new FormHandler();
    });
} else {
    window.formHandler = new FormHandler();
}

