// Typing Animation for Hero Headline
class TypingAnimation {
    constructor(element, text, options = {}) {
        this.element = element;
        this.text = text;
        this.speed = options.speed || 50; // milliseconds per character
        this.delay = options.delay || 500; // delay before starting
        this.cursor = options.cursor !== false; // show cursor
        this.cursorChar = options.cursorChar || '|';
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

    type() {
        let index = 0;
        
        const typeChar = () => {
            if (index < this.text.length) {
                // Remove cursor temporarily
                if (this.cursor && this.cursorElement) {
                    this.cursorElement.remove();
                }
                
                // Add next character
                const char = this.text[index];
                const textNode = document.createTextNode(char);
                this.element.appendChild(textNode);
                
                // Re-add cursor
                if (this.cursor && this.cursorElement) {
                    this.element.appendChild(this.cursorElement);
                }
                
                index++;
                
                // Continue typing
                setTimeout(typeChar, this.speed);
            } else {
                // Typing complete - remove cursor after a brief delay
                if (this.cursor && this.cursorElement) {
                    setTimeout(() => {
                        if (this.cursorElement && this.cursorElement.parentNode) {
                            this.cursorElement.style.opacity = '0';
                            setTimeout(() => {
                                if (this.cursorElement && this.cursorElement.parentNode) {
                                    this.cursorElement.remove();
                                }
                            }, 300);
                        }
                    }, 1000);
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
                speed: 60,
                delay: 800, // Wait for logo animation
                cursor: true,
                cursorChar: '|'
            });
        }
    });
} else {
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        const originalText = heroTitle.textContent.trim();
        window.typingAnimation = new TypingAnimation(heroTitle, originalText, {
            speed: 60,
            delay: 800,
            cursor: true,
            cursorChar: '|'
        });
    }
}

