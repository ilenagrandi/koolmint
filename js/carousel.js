// Continuous Auto-scrolling Carousel for Offer Cards
class OfferCarousel {
    constructor() {
        this.carousel = document.getElementById('offersCarousel');
        this.cards = document.querySelectorAll('.offer-card');
        this.isDragging = false;
        this.isPaused = false;
        this.animationFrame = null;
        this.scrollPosition = 0;
        this.scrollSpeed = 0.5; // pixels per frame
        this.cardWidth = 0;
        this.gap = 24;
        this.totalWidth = 0;
        this.init();
    }

    init() {
        if (!this.carousel || this.cards.length === 0) return;

        // Duplicate cards for seamless infinite loop
        this.duplicateCards();
        
        this.calculateDimensions();
        this.attachEventListeners();
        this.handleResize();
        this.startContinuousScroll();
        
        // Make all cards visible
        this.cards.forEach(card => card.classList.add('visible'));
    }

    duplicateCards() {
        // Clone all cards to create seamless loop
        const cardsArray = Array.from(this.cards);
        cardsArray.forEach(card => {
            const clone = card.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            this.carousel.appendChild(clone);
        });
    }

    calculateDimensions() {
        if (this.cards.length === 0) return;
        
        const firstCard = this.cards[0];
        this.cardWidth = firstCard.offsetWidth;
        this.totalWidth = (this.cardWidth + this.gap) * this.cards.length;
    }

    startContinuousScroll() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        const animate = () => {
            if (!this.isPaused && !this.isDragging) {
                this.scrollPosition -= this.scrollSpeed;
                
                // Reset position when we've scrolled past one set of cards
                if (Math.abs(this.scrollPosition) >= this.totalWidth) {
                    this.scrollPosition = 0;
                }
                
                this.carousel.style.transform = `translateX(${this.scrollPosition}px)`;
            }
            
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        animate();
    }

    pauseAutoScroll() {
        this.isPaused = true;
    }

    resumeAutoScroll() {
        this.isPaused = false;
    }

    attachEventListeners() {
        // Pause on hover
        const container = this.carousel.closest('.offers-container');
        if (container) {
            container.addEventListener('mouseenter', () => this.pauseAutoScroll());
            container.addEventListener('mouseleave', () => this.resumeAutoScroll());
        }

        // Touch/Swipe support
        let touchStartX = 0;
        let touchStartScroll = 0;

        this.carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartScroll = this.scrollPosition;
            this.pauseAutoScroll();
        }, { passive: true });

        this.carousel.addEventListener('touchmove', (e) => {
            if (!this.isDragging) {
                this.isDragging = true;
            }
            const diff = e.changedTouches[0].screenX - touchStartX;
            this.scrollPosition = touchStartScroll + diff;
            this.carousel.style.transform = `translateX(${this.scrollPosition}px)`;
        }, { passive: true });

        this.carousel.addEventListener('touchend', () => {
            this.isDragging = false;
            setTimeout(() => this.resumeAutoScroll(), 1000);
        }, { passive: true });

        // Mouse drag support
        let mouseStartX = 0;
        let scrollStartPosition = 0;

        this.carousel.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            mouseStartX = e.pageX;
            scrollStartPosition = this.scrollPosition;
            this.carousel.style.cursor = 'grabbing';
            this.pauseAutoScroll();
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            e.preventDefault();
            const diff = e.pageX - mouseStartX;
            this.scrollPosition = scrollStartPosition + diff;
            this.carousel.style.transform = `translateX(${this.scrollPosition}px)`;
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.carousel.style.cursor = 'grab';
                setTimeout(() => this.resumeAutoScroll(), 1000);
            }
        });
    }

    handleResize() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.calculateDimensions();
                // Reset scroll position if needed
                if (Math.abs(this.scrollPosition) >= this.totalWidth) {
                    this.scrollPosition = 0;
                }
            }, 250);
        });
    }
}

// Initialize carousel when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.offerCarousel = new OfferCarousel();
    });
} else {
    window.offerCarousel = new OfferCarousel();
}
