// ==================== CONFIGURACIÓN GLOBAL ====================
const canvas = document.getElementById('matrix-bg');
if (!canvas) {
    console.warn('Canvas #matrix-bg no encontrado - efectos desactivados');
}

const ctx = canvas ? canvas.getContext('2d') : null;

// Configuración del canvas
function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

if (canvas) {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

// ==================== PARTÍCULAS FLOTANTES CON CONEXIONES ====================
class Particle {
    constructor() {
        this.reset();
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.4 + 0.2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around screen
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
    }

    draw() {
        if (!ctx) return;
        
        // Partícula con glow sutil
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        // Glow effect
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
        gradient.addColorStop(0, `rgba(0, 255, 136, ${this.opacity})`);
        gradient.addColorStop(1, `rgba(0, 255, 136, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

// ==================== STREAM DE DATOS (MINIMALISTA) ====================
class DataStream {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -50;
        this.speed = Math.random() * 1.5 + 0.8;
        this.data = this.generateData();
        this.opacity = Math.random() * 0.2 + 0.15;
        this.fadeOut = false;
        this.fadeSpeed = 0.005;
    }

    generateData() {
        const types = ['0x', '1x', 'Δ', '∑', 'π', 'λ', '∫', '∂'];
        const values = ['A', 'B', 'C', 'D', 'E', 'F', '0', '1', '2', '3'];
        const type = types[Math.floor(Math.random() * types.length)];
        const value = values[Math.floor(Math.random() * values.length)];
        return `${type}${value}`;
    }

    update() {
        this.y += this.speed;
        
        // Empezar fade out cerca del final
        if (this.y > canvas.height - 100) {
            this.fadeOut = true;
        }
        
        if (this.fadeOut) {
            this.opacity -= this.fadeSpeed;
        }
        
        if (this.y > canvas.height + 50 || this.opacity <= 0) {
            this.reset();
        }
    }

    draw() {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#00d4ff';
        ctx.font = '10px monospace';
        ctx.fillText(this.data, this.x, this.y);
        ctx.restore();
    }
}

// ==================== LÍNEAS GEOMÉTRICAS SUTILES ====================
class GeometricLine {
    constructor() {
        this.reset();
    }

    reset() {
        this.x1 = Math.random() * canvas.width;
        this.y1 = Math.random() * canvas.height;
        this.x2 = this.x1 + (Math.random() - 0.5) * 200;
        this.y2 = this.y1 + (Math.random() - 0.5) * 200;
        this.opacity = Math.random() * 0.05 + 0.02;
        this.speed = Math.random() * 0.3 + 0.1;
        this.angle = Math.random() * Math.PI * 2;
    }

    update() {
        this.angle += 0.001;
        this.x1 += Math.cos(this.angle) * this.speed;
        this.y1 += Math.sin(this.angle) * this.speed;
        this.x2 += Math.cos(this.angle + Math.PI) * this.speed;
        this.y2 += Math.sin(this.angle + Math.PI) * this.speed;

        // Wrap around
        if (this.x1 < 0 || this.x1 > canvas.width || this.y1 < 0 || this.y1 > canvas.height) {
            this.reset();
        }
    }

    draw() {
        if (!ctx) return;
        ctx.save();
        ctx.strokeStyle = `rgba(0, 212, 255, ${this.opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.stroke();
        ctx.restore();
    }
}

// ==================== MANAGER DE EFECTOS ====================
class EffectManager {
    constructor() {
        this.mode = 'minimal'; // Modo minimalista por defecto
        this.particles = [];
        this.dataStreams = [];
        this.geometricLines = [];
        this.mouse = { x: null, y: null, radius: 120 };
        this.isVisible = true;
        this.frameCount = 0;

        this.init();
        this.setupEventListeners();
    }

    init() {
        // Muy pocas partículas para un efecto sutil
        for (let i = 0; i < 25; i++) {
            this.particles.push(new Particle());
        }

        // Streams de datos minimalistas
        for (let i = 0; i < 12; i++) {
            this.dataStreams.push(new DataStream());
        }

        // Líneas geométricas sutiles
        for (let i = 0; i < 5; i++) {
            this.geometricLines.push(new GeometricLine());
        }
    }

    setupEventListeners() {
        if (!canvas) return;

        // Mouse tracking (muy sutil)
        canvas.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        canvas.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });

        // Visibility change
        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    handleResize() {
        this.particles.forEach(p => p.reset());
        this.dataStreams.forEach(s => s.reset());
        this.geometricLines.forEach(l => l.reset());
    }

    drawConnections() {
        if (!ctx) return;
        const maxDistance = 120;
        
        // Solo conectar partículas muy cercanas
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    const opacity = (1 - distance / maxDistance) * 0.15;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0, 255, 136, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    drawMouseEffect() {
        if (!ctx || !this.mouse.x || !this.mouse.y) return;

        // Efecto muy sutil al pasar el mouse
        this.particles.forEach(particle => {
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.mouse.radius) {
                const opacity = (1 - distance / this.mouse.radius) * 0.1;
                ctx.beginPath();
                ctx.strokeStyle = `rgba(0, 255, 136, ${opacity})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(this.mouse.x, this.mouse.y);
                ctx.stroke();
            }
        });
    }

    animate() {
        if (!ctx || !this.isVisible) return;

        this.frameCount++;

        // Fondo con fade muy sutil
        ctx.fillStyle = 'rgba(10, 14, 39, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Líneas geométricas de fondo (muy sutiles)
        this.geometricLines.forEach(line => {
            line.update();
            line.draw();
        });

        // Data streams (minimalistas)
        if (this.frameCount % 2 === 0) { // Actualizar cada 2 frames para mejor performance
            this.dataStreams.forEach(stream => {
                stream.update();
                stream.draw();
            });
        }

        // Partículas con conexiones
        this.particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        this.drawConnections();
        this.drawMouseEffect();
    }

    start() {
        const animate = () => {
            this.animate();
            requestAnimationFrame(animate);
        };
        animate();
    }

    // Método para cambiar intensidad
    setIntensity(level) {
        // 'minimal', 'medium', 'high'
        this.particles = [];
        this.dataStreams = [];
        
        const particleCount = level === 'minimal' ? 25 : level === 'medium' ? 40 : 60;
        const streamCount = level === 'minimal' ? 12 : level === 'medium' ? 20 : 30;
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(new Particle());
        }
        
        for (let i = 0; i < streamCount; i++) {
            this.dataStreams.push(new DataStream());
        }
    }
}

// ==================== INICIALIZACIÓN ====================
let effectManager = null;

if (canvas && ctx) {
    effectManager = new EffectManager();
    effectManager.start();

    console.log('%c✨ Efectos minimalistas activados', 'color: #00ff88; font-size: 14px;');
    console.log('%cModo: Limpio y profesional', 'color: #00d4ff; font-size: 12px;');
} else {
    console.log('%c⚠ Canvas no disponible - sin efectos de fondo', 'color: #ffaa00; font-size: 12px;');
}

// ==================== CONTROLES OPCIONALES ====================
// Descomenta para cambiar la intensidad de los efectos:
// effectManager.setIntensity('minimal');  // Muy sutil (por defecto)
// effectManager.setIntensity('medium');   // Moderado
// effectManager.setIntensity('high');     // Más visible

// Exportar para uso global si es necesario
if (typeof window !== 'undefined') {
    window.effectManager = effectManager;
}
