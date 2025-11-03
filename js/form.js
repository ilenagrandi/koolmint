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
        this.submitBtn.classList.toggle('hidden', step !== this.totalSteps);
        
        // Update review step
        if (step === this.totalSteps) {
            this.updateReview();
        }
    }

    validateStep(step) {
        const currentStepElement = document.querySelector(`.form-step[data-step="${step}"]`);
        if (!currentStepElement) return false;

        const requiredFields = currentStepElement.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = '#ff4444';
                setTimeout(() => {
                    field.style.borderColor = '';
                }, 3000);
            } else {
                field.style.borderColor = '#00D084';
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
            this.currentStep++;
            this.updateStep(this.currentStep);
        }
    }

    prev() {
        this.currentStep--;
        this.updateStep(this.currentStep);
    }

    handleSubmit(e) {
        e.preventDefault();
        if (this.validateStep(this.currentStep)) {
            // Show success message
            alert('🎉 Application submitted! We\'ll review your idea and get back to you within 5 business days.');
            if (window.modal) {
                window.modal.close();
            }
            this.reset();
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

