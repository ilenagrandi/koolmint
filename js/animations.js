// Scroll Animations and Floating CTA
class ScrollAnimations {
    constructor() {
        this.floatingCta = document.getElementById('floatingCta');
        this.init();
    }

    init() {
        this.handleFloatingCTA();
        this.initScrollAnimations();
        this.initSmoothScroll();
    }

    handleFloatingCTA() {
        if (!this.floatingCta) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > CONFIG.scroll.floatingCtaThreshold) {
                this.floatingCta.classList.add('visible');
            } else {
                this.floatingCta.classList.remove('visible');
            }
        });
    }

    initScrollAnimations() {
        const observerOptions = {
            threshold: CONFIG.animations.observerThreshold,
            rootMargin: CONFIG.animations.observerRootMargin
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe all sections for animation
        document.querySelectorAll('section').forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            observer.observe(section);
        });
    }

    initSmoothScroll() {
        // Smooth scroll for non-modal links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            if (!anchor.classList.contains('open-modal-btn')) {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            }
        });
    }
}

// Initialize scroll animations when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.scrollAnimations = new ScrollAnimations();
    });
} else {
    window.scrollAnimations = new ScrollAnimations();
}

