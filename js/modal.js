// Modal Functionality
class Modal {
    constructor() {
        this.modal = document.getElementById('applicationModal');
        this.openButtons = document.querySelectorAll('.open-modal-btn');
        this.closeButton = document.getElementById('closeModal');
        this.init();
    }

    init() {
        // Open modal
        this.openButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.open();
            });
        });

        // Close modal
        this.closeButton.addEventListener('click', () => this.close());

        // Close on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });
    }

    open() {
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Reset form when opening
        if (window.formHandler) {
            window.formHandler.reset();
        }
    }

    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Initialize modal when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.modal = new Modal();
    });
} else {
    window.modal = new Modal();
}

