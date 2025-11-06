// Hyperspeed Road Effect - Canvas based tunnel animation
class HyperspeedEffect {
    constructor(container, options = {}) {
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Options with defaults
        this.options = {
            distortion: options.distortion || 'turbulentDistortion',
            length: options.length || 400,
            roadWidth: options.roadWidth || 10,
            islandWidth: options.islandWidth || 2,
            lanesPerRoad: options.lanesPerRoad || 4,
            fov: options.fov || 90,
            fovSpeedUp: options.fovSpeedUp || 150,
            speedUp: options.speedUp || 2,
            carLightsFade: options.carLightsFade || 0.4,
            totalSideLightSticks: options.totalSideLightSticks || 20,
            lightPairsPerRoadWay: options.lightPairsPerRoadWay || 40,
            shoulderLinesWidthPercentage: options.shoulderLinesWidthPercentage || 0.05,
            brokenLinesWidthPercentage: options.brokenLinesWidthPercentage || 0.1,
            brokenLinesLengthPercentage: options.brokenLinesLengthPercentage || 0.5,
            lightStickWidth: options.lightStickWidth || [0.12, 0.5],
            lightStickHeight: options.lightStickHeight || [1.3, 1.7],
            movingAwaySpeed: options.movingAwaySpeed || [60, 80],
            movingCloserSpeed: options.movingCloserSpeed || [-120, -160],
            carLightsLength: options.carLightsLength || [400 * 0.03, 400 * 0.2],
            carLightsRadius: options.carLightsRadius || [0.05, 0.14],
            carWidthPercentage: options.carWidthPercentage || [0.3, 0.5],
            carShiftX: options.carShiftX || [-0.8, 0.8],
            carFloorSeparation: options.carFloorSeparation || [0, 5],
            colors: options.colors || {
                roadColor: 0x080808,
                islandColor: 0x0a0a0a,
                background: 0x000000,
                shoulderLines: 0xFFFFFF,
                brokenLines: 0xFFFFFF,
                leftCars: [0xD856BF, 0x6750A2, 0xC247AC],
                rightCars: [0x03B3C3, 0x0E5EA5, 0x324555],
                sticks: 0x03B3C3,
            },
            onSpeedUp: options.onSpeedUp || (() => {}),
            onSlowDown: options.onSlowDown || (() => {})
        };

        this.init();
    }

    init() {
        // Set canvas to fill container
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '0';
        this.container.appendChild(this.canvas);

        this.resize();
        this.setup();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.width = rect.width;
        this.height = rect.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
    }

    setup() {
        this.baseSpeed = 0.5;
        this.speed = this.baseSpeed;
        this.cameraHeight = 1.5;
        this.time = 0;
        
        // Initialize road segments
        this.segments = [];
        this.initRoad();
    }

    initRoad() {
        this.segments = [];
        for (let i = 0; i < this.options.length; i++) {
            this.segments.push({
                index: i,
                p1: { world: { y: i }, camera: {}, screen: {} },
                p2: { world: { y: i + 1 }, camera: {}, screen: {} },
                curve: 0,
                sprites: []
            });
        }
    }

    project(p, cameraX, cameraY, cameraZ, cameraDepth) {
        p.camera.x = p.world.x;
        p.camera.y = p.world.y;
        p.camera.z = p.world.z;
        
        p.screen.scale = cameraDepth / p.camera.z;
        p.screen.x = Math.round((this.centerX + p.camera.x * p.screen.scale));
        p.screen.y = Math.round((this.centerY - p.camera.y * p.screen.scale));
        p.screen.w = Math.round((this.options.roadWidth * p.screen.scale));
    }

    update(step) {
        this.time += step * this.speed;
        
        const baseSegment = Math.floor(this.time);
        const maxy = this.options.length;
        let carPercent = this.speed / this.options.maxSpeed;
        
        // Update camera
        let cameraX = 0;
        let cameraY = this.cameraHeight;
        let cameraZ = this.time * this.options.roadWidth;
        
        // Update segments
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            const camIndex = segment.index - baseSegment;
            
            if (camIndex < 0) continue;
            if (camIndex >= this.options.cameraDepth) continue;
            
            segment.p1.world.y = segment.index;
            segment.p2.world.y = segment.index + 1;
            
            this.project(segment.p1, cameraX, cameraY, cameraZ, this.options.cameraDepth);
            this.project(segment.p2, cameraX, cameraY, cameraZ, this.options.cameraDepth);
        }
    }

    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw background
        ctx.fillStyle = `#${this.options.colors.background.toString(16).padStart(6, '0')}`;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw road segments
        for (let i = 0; i < this.segments.length - 1; i++) {
            const seg1 = this.segments[i];
            const seg2 = this.segments[i + 1];
            
            if (!seg1.p1.screen.x || !seg2.p1.screen.x) continue;
            
            // Draw road
            this.drawSegment(
                ctx,
                seg1.p1.screen.x, seg1.p1.screen.y, seg1.p1.screen.w,
                seg2.p1.screen.x, seg2.p1.screen.y, seg2.p1.screen.w
            );
        }
    }

    drawSegment(ctx, x1, y1, w1, x2, y2, w2) {
        // Road color
        const roadColor = `#${this.options.colors.roadColor.toString(16).padStart(6, '0')}`;
        const islandColor = `#${this.options.colors.islandColor.toString(16).padStart(6, '0')}`;
        
        // Draw road
        ctx.fillStyle = roadColor;
        ctx.beginPath();
        ctx.moveTo(x1 - w1, y1);
        ctx.lineTo(x2 - w2, y2);
        ctx.lineTo(x2 + w2, y2);
        ctx.lineTo(x1 + w1, y1);
        ctx.closePath();
        ctx.fill();
        
        // Draw center island
        const islandW1 = w1 * (this.options.islandWidth / this.options.roadWidth);
        const islandW2 = w2 * (this.options.islandWidth / this.options.roadWidth);
        
        ctx.fillStyle = islandColor;
        ctx.beginPath();
        ctx.moveTo(x1 - islandW1, y1);
        ctx.lineTo(x2 - islandW2, y2);
        ctx.lineTo(x2 + islandW2, y2);
        ctx.lineTo(x1 + islandW1, y1);
        ctx.closePath();
        ctx.fill();
        
        // Draw lane lines
        const lanes = this.options.lanesPerRoad;
        const laneW1 = w1 / lanes;
        const laneW2 = w2 / lanes;
        
        ctx.strokeStyle = `#${this.options.colors.brokenLines.toString(16).padStart(6, '0')}`;
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        
        for (let i = 1; i < lanes; i++) {
            const x1_line = x1 - w1 + (i * laneW1);
            const x2_line = x2 - w2 + (i * laneW2);
            
            ctx.beginPath();
            ctx.moveTo(x1_line, y1);
            ctx.lineTo(x2_line, y2);
            ctx.stroke();
        }
        
        ctx.setLineDash([]);
        
        // Draw shoulder lines
        ctx.strokeStyle = `#${this.options.colors.shoulderLines.toString(16).padStart(6, '0')}`;
        ctx.lineWidth = 3;
        
        // Left shoulder
        ctx.beginPath();
        ctx.moveTo(x1 - w1, y1);
        ctx.lineTo(x2 - w2, y2);
        ctx.stroke();
        
        // Right shoulder
        ctx.beginPath();
        ctx.moveTo(x1 + w1, y1);
        ctx.lineTo(x2 + w2, y2);
        ctx.stroke();
    }

    animate() {
        const step = 1 / 60;
        this.update(step);
        this.render();
        requestAnimationFrame(() => this.animate());
    }
}

// Hyperspeed Light Lines Effect - Similar to React Bits
class SimpleHyperspeed {
    constructor(container) {
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.lines = [];
        this.init();
    }

    init() {
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '0';
        this.container.appendChild(this.canvas);

        this.resize();
        this.setup();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.width = rect.width;
        this.height = rect.height;
        this.centerX = this.width / 2;
        this.centerY = this.height * 0.4; // Vanishing point slightly above center
    }

    setup() {
        // Brand colors
        this.leftColor = { r: 0, g: 208, b: 132 }; // #00D084 - Mint green
        this.rightColor = { r: 233, g: 255, b: 106 }; // #E9FF6A - Yellow
        
        this.time = 0;
        this.speed = 0.02;
        this.numLines = 80;
        
        // Initialize lines
        this.lines = [];
        for (let i = 0; i < this.numLines; i++) {
            this.createLine();
        }
    }

    createLine() {
        // Create a line that starts from bottom or sides and converges to center
        const side = Math.random() > 0.5 ? 'left' : 'right';
        const startY = this.height + Math.random() * 200;
        const startX = side === 'left' 
            ? -100 + Math.random() * 200 
            : this.width - 100 - Math.random() * 200;
        
        // Control points for curved path
        const midX = side === 'left' 
            ? this.centerX * 0.3 + Math.random() * this.centerX * 0.2
            : this.centerX * 1.7 + Math.random() * this.centerX * 0.2;
        const midY = this.height * 0.7 + Math.random() * this.height * 0.2;
        
        // End point near vanishing point
        const endX = this.centerX + (Math.random() - 0.5) * 50;
        const endY = this.centerY + (Math.random() - 0.5) * 30;
        
        return {
            startX: startX,
            startY: startY,
            midX: midX,
            midY: midY,
            endX: endX,
            endY: endY,
            progress: Math.random(),
            speed: 0.005 + Math.random() * 0.01,
            side: side,
            width: 2 + Math.random() * 4,
            opacity: 0.3 + Math.random() * 0.7
        };
    }

    update() {
        this.time += this.speed;
        
        // Update line progress
        this.lines.forEach(line => {
            line.progress += line.speed;
            
            // Reset line if it's past the vanishing point
            if (line.progress > 1) {
                const newLine = this.createLine();
                Object.assign(line, newLine);
            }
        });
    }

    render() {
        const ctx = this.ctx;
        
        // Dark gradient background
        const bgGradient = ctx.createRadialGradient(
            this.centerX, this.centerY,
            0,
            this.centerX, this.centerY,
            Math.max(this.width, this.height) * 0.8
        );
        bgGradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
        bgGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.6)');
        bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw lines with glow effect
        this.lines.forEach(line => {
            const t = line.progress;
            
            // Calculate position along curve using quadratic bezier
            const x = (1 - t) * (1 - t) * line.startX + 
                      2 * (1 - t) * t * line.midX + 
                      t * t * line.endX;
            const y = (1 - t) * (1 - t) * line.startY + 
                      2 * (1 - t) * t * line.midY + 
                      t * t * line.endY;
            
            // Calculate previous point for line direction
            const prevT = Math.max(0, t - 0.05);
            const prevX = (1 - prevT) * (1 - prevT) * line.startX + 
                          2 * (1 - prevT) * prevT * line.midX + 
                          prevT * prevT * line.endX;
            const prevY = (1 - prevT) * (1 - prevT) * line.startY + 
                          2 * (1 - prevT) * prevT * line.midY + 
                          prevT * prevT * line.endY;
            
            // Color based on side
            const color = line.side === 'left' ? this.leftColor : this.rightColor;
            
            // Fade out near vanishing point
            const fadeDistance = Math.sqrt(
                Math.pow(x - this.centerX, 2) + 
                Math.pow(y - this.centerY, 2)
            );
            const maxFade = 200;
            const fade = Math.min(1, fadeDistance / maxFade);
            const opacity = line.opacity * fade;
            
            // Draw line with glow
            ctx.save();
            
            // Outer glow
            const gradient = ctx.createLinearGradient(prevX, prevY, x, y);
            const colorStr1 = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.3})`;
            const colorStr2 = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.8})`;
            const colorStr3 = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.3})`;
            
            gradient.addColorStop(0, colorStr1);
            gradient.addColorStop(0.5, colorStr2);
            gradient.addColorStop(1, colorStr3);
            
            // Draw thick line for glow
            ctx.strokeStyle = gradient;
            ctx.lineWidth = line.width * 8;
            ctx.lineCap = 'round';
            ctx.shadowBlur = 20;
            ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(x, y);
            ctx.stroke();
            
            // Draw main line
            ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
            ctx.lineWidth = line.width;
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(x, y);
            ctx.stroke();
            
            ctx.restore();
        });
    }

    animate() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize for hero section
function initHyperspeed() {
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
        window.hyperspeedEffect = new SimpleHyperspeed(heroBg);
    }
}

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHyperspeed);
} else {
    initHyperspeed();
}

