// ==================== SMOOTH SCROLL ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ==================== ACTIVE NAV LINK ====================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function highlightNavLink() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', highlightNavLink);

// ==================== STATS COUNTER ANIMATION ====================
const statNumbers = document.querySelectorAll('.stat-number');
let hasAnimated = false;

function animateStats() {
    if (hasAnimated) return;
    
    const statsSection = document.querySelector('.stats-bar');
    const rect = statsSection.getBoundingClientRect();
    
    if (rect.top < window.innerHeight && rect.bottom >= 0) {
        hasAnimated = true;
        
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            const duration = 2000; // 2 segundos
            const increment = target / (duration / 16); // 60 FPS
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    stat.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.textContent = target;
                }
            };

            updateCounter();
        });
    }
}

window.addEventListener('scroll', animateStats);

// ==================== PROJECT FILTERING ====================
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remover clase active de todos los botones
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const filter = button.getAttribute('data-filter');

        projectCards.forEach(card => {
            if (filter === 'all') {
                card.style.display = 'block';
                card.classList.add('fade-in');
            } else {
                const categories = card.getAttribute('data-category').split(' ');
                if (categories.includes(filter)) {
                    card.style.display = 'block';
                    card.classList.add('fade-in');
                } else {
                    card.style.display = 'none';
                }
            }
        });
    });
});

// ==================== THEME TOGGLE ====================
// Esta funcionalidad ahora está en components.js para reutilización
// Mantener solo para la página principal si no usa components.js

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    
    if (themeToggle && !window.themeInitialized) {
        window.themeInitialized = true;
        
        // Aplicar tema guardado
        const savedTheme = localStorage.getItem('theme') || 'dark';
        applyTheme(savedTheme);
        
        // Event listener para el toggle
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Animación del botón
            themeToggle.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                themeToggle.style.transform = 'rotate(0deg)';
            }, 300);
        });
    }
});

function applyTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
    }
    
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    const icon = themeToggle.querySelector('.icon');
    if (theme === 'light') {
        icon.textContent = '●';
        themeToggle.setAttribute('aria-label', 'Cambiar a tema oscuro');
    } else {
        icon.textContent = '☀';
        themeToggle.setAttribute('aria-label', 'Cambiar a tema claro');
    }
}

// ==================== TYPING EFFECT ====================
function typeText(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// ==================== INTERSECTION OBSERVER ====================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observar elementos
document.querySelectorAll('.project-card, .skill-category').forEach(el => {
    observer.observe(el);
});

// ==================== SKILL BARS ANIMATION ====================
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const progress = entry.target.querySelector('.skill-progress');
            if (progress && !progress.classList.contains('animated')) {
                progress.classList.add('animated');
                progress.style.width = progress.style.getPropertyValue('--progress');
            }
        }
    });
}, observerOptions);

document.querySelectorAll('.skill-item').forEach(skill => {
    skillObserver.observe(skill);
});

// ==================== PARALLAX EFFECT ====================
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.hero-visual');
    
    parallaxElements.forEach(element => {
        const speed = 0.5;
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// ==================== CURSOR TRAIL EFFECT (OPCIONAL) ====================
let cursorTrail = [];
const trailLength = 10;

document.addEventListener('mousemove', (e) => {
    cursorTrail.push({ x: e.clientX, y: e.clientY });
    
    if (cursorTrail.length > trailLength) {
        cursorTrail.shift();
    }
});

// ==================== GLITCH EFFECT ON HOVER (OPCIONAL) ====================
const glitchElements = document.querySelectorAll('.logo-text');

glitchElements.forEach(element => {
    const originalText = element.textContent;
    
    element.addEventListener('mouseenter', () => {
        let iteration = 0;
        const interval = setInterval(() => {
            element.textContent = originalText
                .split('')
                .map((char, index) => {
                    if (index < iteration) {
                        return originalText[index];
                    }
                    return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
                })
                .join('');
            
            iteration += 1/3;
            
            if (iteration >= originalText.length) {
                clearInterval(interval);
                element.textContent = originalText;
            }
        }, 30);
    });
});

// ==================== INITIALIZE ====================
window.addEventListener('load', () => {
    createNeuralNetwork();
    
    // Añadir clase de carga completada
    document.body.classList.add('loaded');
});

// Recrear neural network en resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        createNeuralNetwork();
    }, 250);
});

// ==================== LAZY LOADING ====================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img.lazy').forEach(img => {
        imageObserver.observe(img);
    });
}