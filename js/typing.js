// Typing Animation for Hero Headline
class TypingAnimation {
    constructor(element, text, options = {}) {
        this.element = element;
        this.text = text;
        this.baseSpeed = options.speed || 80; // base milliseconds per character
        this.delay = options.delay || 1000; // delay before starting
        this.cursor = options.cursor !== false; // show cursor
        this.cursorChar = options.cursorChar || '|';
        this.variation = options.variation || 30; // speed variation for natural feel
        this.spaceDelay = options.spaceDelay || 120; // extra delay for spaces
        this.init();
    }

    init() {
        if (!this.element) return;
        
        // Store original text
        this.element.setAttribute('data-original-text', this.text);
        
        // Clear the element
        this.element.textContent = '';
        
        // Add cursor if enabled
        if (this.cursor) {
            this.cursorElement = document.createElement('span');
            this.cursorElement.className = 'typing-cursor';
            this.cursorElement.textContent = this.cursorChar;
            this.element.appendChild(this.cursorElement);
        }
        
        // Start typing after delay
        setTimeout(() => {
            this.type();
        }, this.delay);
    }

    getSpeed(char) {
        // Slower for spaces and punctuation
        if (char === ' ') {
            return this.baseSpeed + this.spaceDelay;
        }
        if (char === '.' || char === ',' || char === '!' || char === '?') {
            return this.baseSpeed * 2; // Pause longer at punctuation
        }
        // Add slight variation for natural feel
        return this.baseSpeed + (Math.random() * this.variation - this.variation / 2);
    }

    type() {
        let index = 0;
        
        const typeChar = () => {
            if (index < this.text.length) {
                // Remove cursor temporarily
                if (this.cursor && this.cursorElement) {
                    this.cursorElement.style.opacity = '0';
                    this.cursorElement.style.transition = 'opacity 0.1s ease';
                }
                
                // Add next character with fade-in effect
                const char = this.text[index];
                const textNode = document.createTextNode(char);
                const span = document.createElement('span');
                span.style.opacity = '0';
                span.style.transition = 'opacity 0.2s ease';
                span.appendChild(textNode);
                this.element.appendChild(span);
                
                // Fade in the character
                setTimeout(() => {
                    span.style.opacity = '1';
                }, 10);
                
                // Re-add cursor with fade
                if (this.cursor && this.cursorElement) {
                    this.element.appendChild(this.cursorElement);
                    setTimeout(() => {
                        this.cursorElement.style.opacity = '1';
                    }, 10);
                }
                
                index++;
                
                // Continue typing with variable speed
                const speed = this.getSpeed(char);
                setTimeout(typeChar, speed);
            } else {
                // Typing complete - remove cursor smoothly
                if (this.cursor && this.cursorElement) {
                    setTimeout(() => {
                        if (this.cursorElement && this.cursorElement.parentNode) {
                            this.cursorElement.style.transition = 'opacity 0.5s ease';
                            this.cursorElement.style.opacity = '0';
                            setTimeout(() => {
                                if (this.cursorElement && this.cursorElement.parentNode) {
                                    this.cursorElement.remove();
                                }
                            }, 500);
                        }
                    }, 800);
                }
            }
        };
        
        typeChar();
    }

    reset() {
        if (!this.element) return;
        this.element.textContent = '';
        this.init();
    }
}

// Initialize typing animation when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const heroTitle = document.querySelector('.hero h1');
        if (heroTitle) {
            const originalText = heroTitle.textContent.trim();
            window.typingAnimation = new TypingAnimation(heroTitle, originalText, {
                speed: 100, // Slower base speed for smoother feel
                delay: 1200, // Wait longer for logo animation
                cursor: true,
                cursorChar: '|',
                variation: 40, // More variation for natural rhythm
                spaceDelay: 150 // Longer pause at spaces
            });
        }
    });
} else {
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        const originalText = heroTitle.textContent.trim();
        window.typingAnimation = new TypingAnimation(heroTitle, originalText, {
            speed: 100,
            delay: 1200,
            cursor: true,
            cursorChar: '|',
            variation: 40,
            spaceDelay: 150
        });
    }
}

