/**
 * particles.js
 * Interactive Particle Background - Digital Network Visualization
 * Vanilla JavaScript Canvas implementation
 */

(function() {
    'use strict';

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    // Configuration
    const CONFIG = {
        particleCount: 120,
        connectionDistance: 160,
        mouseInfluenceRadius: 200,
        particleSize: { min: 1, max: 3 },
        particleSpeed: { min: 0.15, max: 0.4 },
        colors: {
            particle: 'rgba(184, 102, 255, 0.5)',
            particleHover: 'rgba(184, 102, 255, 0.9)',
            particleCyan: 'rgba(8, 208, 232, 0.5)',
            particleCyanHover: 'rgba(8, 208, 232, 0.9)',
            line: 'rgba(184, 102, 255, 0.08)',
            lineHover: 'rgba(184, 102, 255, 0.3)',
            lineCyan: 'rgba(8, 208, 232, 0.06)',
            lineCyanHover: 'rgba(8, 208, 232, 0.25)',
            spotlight: 'rgba(184, 102, 255, 0.03)',
            spotlightCyan: 'rgba(8, 208, 232, 0.02)'
        },
        grid: {
            size: 80,
            color: 'rgba(184, 102, 255, 0.015)',
            colorCyan: 'rgba(8, 208, 232, 0.01)'
        }
    };

    // State
    let canvas = null;
    let ctx = null;
    let particles = [];
    let mouse = { x: -10000, y: -10000, active: false };
    let animationId = null;
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    // Particle class
    class Particle {
        constructor() {
            this.reset(true);
        }

        reset(initializing = false) {
            this.x = initializing ? Math.random() * width : (Math.random() < 0.5 ? -20 : width + 20);
            this.y = initializing ? Math.random() * height : Math.random() * height;
            this.vx = (Math.random() - 0.5) * (CONFIG.particleSpeed.max - CONFIG.particleSpeed.min) + CONFIG.particleSpeed.min;
            this.vy = (Math.random() - 0.5) * (CONFIG.particleSpeed.max - CONFIG.particleSpeed.min) + CONFIG.particleSpeed.min;
            this.size = Math.random() * (CONFIG.particleSize.max - CONFIG.particleSize.min) + CONFIG.particleSize.min;
            this.isCyan = Math.random() < 0.3;
            this.baseOpacity = this.isCyan ? 0.3 : 0.5;
            this.currentOpacity = this.baseOpacity;
            this.targetOpacity = this.baseOpacity;
            this.brightness = 0;
        }

        update() {
            // Apply mouse influence
            if (mouse.active) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONFIG.mouseInfluenceRadius) {
                    const force = (1 - dist / CONFIG.mouseInfluenceRadius) * 0.8;
                    this.vx += dx * force * 0.005;
                    this.vy += dy * force * 0.005;
                    this.targetOpacity = this.isCyan ? 0.9 : 0.95;
                    this.brightness = Math.max(this.brightness, 1 - dist / CONFIG.mouseInfluenceRadius);
                } else {
                    this.targetOpacity = this.baseOpacity;
                    this.brightness *= 0.95;
                }
            } else {
                this.targetOpacity = this.baseOpacity;
                this.brightness *= 0.95;
            }

            // Smooth opacity transition
            this.currentOpacity += (this.targetOpacity - this.currentOpacity) * 0.1;

            // Update position
            this.x += this.vx;
            this.y += this.vy;

            // Wrap around edges
            if (this.x < -20) this.x = width + 20;
            if (this.x > width + 20) this.x = -20;
            if (this.y < -20) this.y = height + 20;
            if (this.y > height + 20) this.y = -20;

            // Limit velocity
            const maxSpeed = 1.5;
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speed > maxSpeed) {
                this.vx = (this.vx / speed) * maxSpeed;
                this.vy = (this.vy / speed) * maxSpeed;
            }
        }

        draw() {
            const color = this.isCyan ?
                `rgba(8, 208, 232, ${this.currentOpacity})` :
                `rgba(184, 102, 255, ${this.currentOpacity})`;

            const glowColor = this.isCyan ?
                `rgba(8, 208, 232, ${this.currentOpacity * 0.5})` :
                `rgba(184, 102, 255, ${this.currentOpacity * 0.5})`;

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();

            // Draw glow when bright
            if (this.brightness > 0.1) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * (2 + this.brightness * 3), 0, Math.PI * 2);
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * (2 + this.brightness * 3));
                gradient.addColorStop(0, glowColor);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.fill();
            }
        }
    }

    // Initialize canvas
    function initCanvas() {
        canvas = document.getElementById('particleCanvas');
        if (!canvas) return false;

        ctx = canvas.getContext('2d');
        if (!ctx) return false;

        resizeCanvas();
        return true;
    }

    function resizeCanvas() {
        if (!canvas) return;

        dpr = window.devicePixelRatio || 1;
        width = window.innerWidth;
        height = window.innerHeight;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        ctx.scale(dpr, dpr);
    }

    // Initialize particles
    function initParticles() {
        particles = [];
        for (let i = 0; i < CONFIG.particleCount; i++) {
            particles.push(new Particle());
        }
    }

    // Draw grid
    function drawGrid() {
        const gridSize = CONFIG.grid.size;
        const cols = Math.ceil(width / gridSize) + 1;
        const rows = Math.ceil(height / gridSize) + 1;

        ctx.strokeStyle = CONFIG.grid.color;
        ctx.lineWidth = 0.5;

        // Vertical lines
        for (let i = 0; i <= cols; i++) {
            const x = i * gridSize;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Horizontal lines
        for (let i = 0; i <= rows; i++) {
            const y = i * gridSize;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Cyan grid overlay (offset)
        ctx.strokeStyle = CONFIG.grid.colorCyan;
        ctx.lineWidth = 0.5;

        for (let i = 0; i <= cols; i++) {
            const x = i * gridSize + gridSize / 2;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        for (let i = 0; i <= rows; i++) {
            const y = i * gridSize + gridSize / 2;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }

    // Draw spotlight
    function drawSpotlight() {
        if (!mouse.active) return;

        const gradient = ctx.createRadialGradient(
            mouse.x, mouse.y, 0,
            mouse.x, mouse.y, CONFIG.mouseInfluenceRadius * 1.5
        );
        gradient.addColorStop(0, CONFIG.colors.spotlight);
        gradient.addColorStop(0.5, CONFIG.colors.spotlightCyan);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    // Draw connections
    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const p1 = particles[i];
                const p2 = particles[j];

                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONFIG.connectionDistance) {
                    const opacity = (1 - dist / CONFIG.connectionDistance) * 0.15;

                    // Check if near mouse
                    let nearMouse = false;
                    if (mouse.active) {
                        const mx1 = mouse.x - p1.x;
                        const my1 = mouse.y - p1.y;
                        const mx2 = mouse.x - p2.x;
                        const my2 = mouse.y - p2.y;
                        const d1 = Math.sqrt(mx1 * mx1 + my1 * my1);
                        const d2 = Math.sqrt(mx2 * mx2 + my2 * my2);
                        nearMouse = (d1 < CONFIG.mouseInfluenceRadius || d2 < CONFIG.mouseInfluenceRadius);
                    }

                    const isCyan = p1.isCyan || p2.isCyan;
                    const color = nearMouse ?
                        (isCyan ? CONFIG.colors.lineCyanHover : CONFIG.colors.lineHover) :
                        (isCyan ? CONFIG.colors.lineCyan : CONFIG.colors.line);

                    const lineOpacity = nearMouse ? opacity * 3 : opacity;

                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = color.replace(/[\d.]+\)$/, lineOpacity + ')');
                    ctx.lineWidth = nearMouse ? 1.2 : 0.6;
                    ctx.stroke();
                }
            }
        }
    }

    // Animation loop
    function animate() {
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw grid (static background)
        drawGrid();

        // Draw spotlight
        drawSpotlight();

        // Update and draw particles
        particles.forEach(p => p.update());
        drawConnections();
        particles.forEach(p => p.draw());

        animationId = requestAnimationFrame(animate);
    }

    // Mouse event handlers
    function handleMouseMove(e) {
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.active = true;
    }

    function handleMouseLeave() {
        mouse.active = false;
        mouse.x = -10000;
        mouse.y = -10000;
    }

    function handleTouchMove(e) {
        if (!canvas) return;
        if (e.touches.length > 0) {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.touches[0].clientX - rect.left;
            mouse.y = e.touches[0].clientY - rect.top;
            mouse.active = true;
        }
    }

    function handleTouchEnd() {
        mouse.active = false;
    }

    // Public init function
    window.initParticles = function() {
        // Skip if reduced motion or touch device (optional: still show static)
        if (prefersReducedMotion) {
            // Still render static background once
            if (initCanvas()) {
                initParticles();
                // Single render for static view
                ctx.clearRect(0, 0, width, height);
                drawGrid();
                particles.forEach(p => p.draw());
            }
            return;
        }

        if (!initCanvas()) return;

        initParticles();

        // Event listeners
        document.addEventListener('mousemove', handleMouseMove, { passive: true });
        document.addEventListener('mouseleave', handleMouseLeave);

        // Touch support - simplified
        if (isTouchDevice) {
            document.addEventListener('touchmove', handleTouchMove, { passive: true });
            document.addEventListener('touchend', handleTouchEnd);
        }

        // Resize handler
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const oldWidth = width;
                const oldHeight = height;
                resizeCanvas();
                // Reposition particles proportionally
                particles.forEach(p => {
                    p.x = (p.x / oldWidth) * width;
                    p.y = (p.y / oldHeight) * height;
                });
            }, 100);
        }, { passive: true });

        // Start animation
        animate();
    };

    // Auto-init on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.initParticles);
    } else {
        window.initParticles();
    }
})();