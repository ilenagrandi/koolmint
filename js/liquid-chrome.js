// Liquid Chrome Background Effect
class LiquidChrome {
    constructor(container, options = {}) {
        this.container = container;
        // Brand color #00D084 converted to RGB (0-1): RGB(0, 208, 132) = [0, 0.816, 0.518]
        this.baseColor = options.baseColor || [0, 0.816, 0.518];
        this.speed = options.speed || 0.5;
        this.amplitude = options.amplitude || 0.4;
        this.frequencyX = options.frequencyX || 3;
        this.frequencyY = options.frequencyY || 3;
        this.interactive = options.interactive !== false;
        this.init();
    }

    init() {
        if (!this.container) return;

        // Wait for OGL to be loaded (it's loaded in HTML)
        const checkOGL = () => {
            if (window.OGL && window.OGL.Renderer) {
                this.setup();
            } else {
                setTimeout(checkOGL, 50);
            }
        };
        checkOGL();
    }

    setup() {
        const { Renderer, Program, Mesh, Triangle } = window.OGL;
        
        if (!Renderer) {
            console.error('OGL library not loaded');
            return;
        }

        const renderer = new Renderer({ antialias: true });
        const gl = renderer.gl;
        gl.canvas.style.position = 'absolute';
        gl.canvas.style.top = '0';
        gl.canvas.style.left = '0';
        gl.canvas.style.width = '100%';
        gl.canvas.style.height = '100%';
        gl.canvas.style.zIndex = '0';
        gl.canvas.style.pointerEvents = 'none';
        gl.canvas.style.opacity = '0.4';
        gl.clearColor(0.043, 0.043, 0.043, 1); // Dark background to match hero

        const vertexShader = `
            attribute vec2 position;
            attribute vec2 uv;
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;

        const fragmentShader = `
            precision highp float;
            uniform float uTime;
            uniform vec3 uResolution;
            uniform vec3 uBaseColor;
            uniform float uAmplitude;
            uniform float uFrequencyX;
            uniform float uFrequencyY;
            uniform vec2 uMouse;

            varying vec2 vUv;

            vec4 renderImage(vec2 uvCoord) {
                vec2 fragCoord = uvCoord * uResolution.xy;
                vec2 uv = (2.0 * fragCoord - uResolution.xy) / min(uResolution.x, uResolution.y);

                for (float i = 1.0; i < 10.0; i++){
                    uv.x += uAmplitude / i * cos(i * uFrequencyX * uv.y + uTime + uMouse.x * 3.14159);
                    uv.y += uAmplitude / i * cos(i * uFrequencyY * uv.x + uTime + uMouse.y * 3.14159);
                }

                vec2 diff = (uvCoord - uMouse);
                float dist = length(diff);
                float falloff = exp(-dist * 20.0);
                float ripple = sin(10.0 * dist - uTime * 2.0) * 0.03;
                uv += (diff / (dist + 0.0001)) * ripple * falloff;

                vec3 color = uBaseColor / abs(sin(uTime - uv.y - uv.x));
                return vec4(color, 1.0);
            }

            void main() {
                vec4 col = vec4(0.0);
                int samples = 0;
                for (int i = -1; i <= 1; i++){
                    for (int j = -1; j <= 1; j++){
                        vec2 offset = vec2(float(i), float(j)) * (1.0 / min(uResolution.x, uResolution.y));
                        col += renderImage(vUv + offset);
                        samples++;
                    }
                }
                gl_FragColor = col / float(samples);
            }
        `;

        const geometry = new Triangle(gl);
        const program = new Program(gl, {
            vertex: vertexShader,
            fragment: fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uResolution: {
                    value: new Float32Array([gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height])
                },
                uBaseColor: { value: new Float32Array(this.baseColor) },
                uAmplitude: { value: this.amplitude },
                uFrequencyX: { value: this.frequencyX },
                uFrequencyY: { value: this.frequencyY },
                uMouse: { value: new Float32Array([0.5, 0.5]) }
            }
        });

        const mesh = new Mesh(gl, { geometry, program });
        this.renderer = renderer;
        this.gl = gl;
        this.program = program;
        this.mesh = mesh;

        const resize = () => {
            const scale = 1;
            renderer.setSize(container.offsetWidth * scale, container.offsetHeight * scale);
            const resUniform = program.uniforms.uResolution.value;
            resUniform[0] = gl.canvas.width;
            resUniform[1] = gl.canvas.height;
            resUniform[2] = gl.canvas.width / gl.canvas.height;
        };

        window.addEventListener('resize', resize);
        resize();

        const handleMouseMove = (event) => {
            const rect = this.container.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width;
            const y = 1 - (event.clientY - rect.top) / rect.height;
            const mouseUniform = program.uniforms.uMouse.value;
            mouseUniform[0] = x;
            mouseUniform[1] = y;
        };

        const handleTouchMove = (event) => {
            if (event.touches.length > 0) {
                const touch = event.touches[0];
                const rect = this.container.getBoundingClientRect();
                const x = (touch.clientX - rect.left) / rect.width;
                const y = 1 - (touch.clientY - rect.top) / rect.height;
                const mouseUniform = program.uniforms.uMouse.value;
                mouseUniform[0] = x;
                mouseUniform[1] = y;
            }
        };

        if (this.interactive) {
            this.container.addEventListener('mousemove', handleMouseMove);
            this.container.addEventListener('touchmove', handleTouchMove);
        }

        let animationId;
        const update = (t) => {
            animationId = requestAnimationFrame(update);
            program.uniforms.uTime.value = t * 0.001 * this.speed;
            renderer.render({ scene: mesh });
        };
        animationId = requestAnimationFrame(update);
        this.animationId = animationId;

        this.container.appendChild(gl.canvas);
        this.resizeHandler = resize;
        this.handleMouseMove = handleMouseMove;
        this.handleTouchMove = handleTouchMove;
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
        if (this.interactive) {
            this.container.removeEventListener('mousemove', this.handleMouseMove);
            this.container.removeEventListener('touchmove', this.handleTouchMove);
        }
        if (this.gl && this.gl.canvas && this.gl.canvas.parentElement) {
            this.gl.canvas.parentElement.removeChild(this.gl.canvas);
        }
        if (this.gl) {
            this.gl.getExtension('WEBGL_lose_context')?.loseContext();
        }
    }
}

// Initialize Liquid Chrome for hero section
function initLiquidChrome() {
    const heroSection = document.querySelector('.hero');
    if (heroSection && window.OGL) {
        // Brand color #00D084: RGB(0, 208, 132) = [0, 0.816, 0.518]
        const brandColor = [0, 0.816, 0.518];
        window.liquidChrome = new LiquidChrome(heroSection, {
            baseColor: brandColor,
            speed: 0.6,
            amplitude: 0.35,
            frequencyX: 3,
            frequencyY: 3,
            interactive: true
        });
    }
}

// Wait for OGL to load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait a bit for OGL script to load
        setTimeout(initLiquidChrome, 100);
    });
} else {
    setTimeout(initLiquidChrome, 100);
}

