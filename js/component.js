// ==================== FOOTER COMPONENT ====================
const footerHTML = `
    <footer id="contacto">
        <div class="footer-content">
            <div class="footer-section">
                <h3 class="footer-title">Conecta conmigo</h3>
            </div>
            
            <div class="footer-links">
                <a href="https://github.com/J-solan" target="_blank" class="footer-link">
                    <span class="link-icon">→</span> GitHub
                </a>
                <a href="https://www.linkedin.com/in/jorge-solan/" target="_blank" class="footer-link">
                    <span class="link-icon">→</span> LinkedIn
                </a>
                <a href="mailto:jorgesolanmorote@gmail.com" class="footer-link">
                    <span class="link-icon">✉</span> Email
                </a>
            </div>
        </div>
        
        <div class="footer-bottom">
            <p class="copyright">
                <br>
                © 2025 | Jorge Solán Portfolio
            </p>
        </div>
    </footer>
`;

// Cargar footer si existe el placeholder
document.addEventListener('DOMContentLoaded', () => {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = footerHTML;
    }
});

// ==================== THEME SYNC ACROSS PAGES ====================
// Aplicar tema guardado inmediatamente (antes de DOMContentLoaded para evitar flash)
(function() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.documentElement.classList.add('light-theme');
    }
})();

// Configurar el botón de tema una vez cargado el DOM
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    
    if (themeToggle) {
        // Aplicar tema guardado
        const savedTheme = localStorage.getItem('theme') || 'dark';
        applyThemeToButton(savedTheme);
        
        // Event listener para el toggle
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.classList.contains('light-theme') ? 'light' : 'dark';
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
        document.documentElement.classList.add('light-theme');
        document.body.classList.add('light-theme');
    } else {
        document.documentElement.classList.remove('light-theme');
        document.body.classList.remove('light-theme');
    }
    applyThemeToButton(theme);
}

function applyThemeToButton(theme) {
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