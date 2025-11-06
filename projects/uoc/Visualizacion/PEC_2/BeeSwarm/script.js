let data = [];
let currentSubject = '';
let currentCategory = '';
let selectedCategories = new Set();

// Mapeo de columnas a nombres amigables
const subjectMapping = {
    'math score': 'Matemáticas',
    'reading score': 'Lectura',
    'writing score': 'Escritura'
};

const categoryMapping = {
    'gender': 'Género',
    'parental level of education': 'Educación Parental',
    'lunch': 'Tipo de Almuerzo',
    'test preparation course': 'Preparación'
};

// Paleta de colores
const colorPalettes = {
    'gender': {
        'female': '#ff006e',
        'male': '#00d4ff'
    },
    'parental level of education': {
        'some high school': '#ff006e',
        'high school': '#ff8500',
        'some college': '#ffbd00',
        'associate\'s degree': '#00ff88',
        'bachelor\'s degree': '#00d4ff',
        'master\'s degree': '#7b2ff7'
    },
    'lunch': {
        'standard': '#00ff88',
        'free/reduced': '#ff006e'
    },
    'test preparation course': {
        'none': '#64748b',
        'completed': '#00ff88'
    }
};

// ==================== EFECTO MATRIX ====================
const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const letters = '01';
const fontSize = 14;
const columns = canvas.width / fontSize;
const drops = Array(Math.floor(columns)).fill(1);

function drawMatrix() {
    ctx.fillStyle = 'rgba(10, 14, 39, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff88';
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

setInterval(drawMatrix, 35);

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// ==================== PARSING Y INICIALIZACIÓN ====================
function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
        if (!values) continue;
        
        const row = {};
        headers.forEach((header, index) => {
            if (values[index]) {
                row[header] = values[index].trim().replace(/"/g, '');
            }
        });
        data.push(row);
    }

    initializeSelectors();
    updateStats();
}

function initializeSelectors() {
    const subjectSelector = document.getElementById('subjectSelector');
    const categorySelector = document.getElementById('categorySelector');

    // Poblar selector de materias
    subjectSelector.innerHTML = '<option value="">Selecciona una materia...</option>';
    Object.keys(subjectMapping).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = subjectMapping[key];
        subjectSelector.appendChild(option);
    });

    // Poblar selector de categorías
    categorySelector.innerHTML = '<option value="">Selecciona una categoría...</option>';
    Object.keys(categoryMapping).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = categoryMapping[key];
        categorySelector.appendChild(option);
    });
}

// Cargar datos desde archivo CSV local al iniciar
async function loadCSV() {
    try {
        const response = await fetch('StudentsPerformance.csv');
        if (!response.ok) {
            throw new Error('No se pudo cargar el archivo CSV');
        }
        const text = await response.text();
        parseCSV(text);
    } catch (error) {
        console.error('Error al cargar el CSV:', error);
        document.getElementById('emptyState').innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>Error: No se pudo cargar StudentsPerformance.csv</p>
            <p style="font-size: 0.8rem; margin-top: 0.5rem;">Asegúrate de que el archivo esté en el mismo directorio</p>
        `;
    }
}

// Cargar datos al iniciar la página
loadCSV();

// ==================== EVENT LISTENERS ====================
document.getElementById('subjectSelector').addEventListener('change', (e) => {
    currentSubject = e.target.value;
    if (currentSubject) {
        createBeeswarm();
    } else {
        clearVisualization();
    }
});

document.getElementById('categorySelector').addEventListener('change', (e) => {
    currentCategory = e.target.value;
    selectedCategories.clear();
    if (currentCategory) {
        createLegend();
    } else {
        document.getElementById('legendContainer').innerHTML = '';
    }
    if (currentSubject) {
        createBeeswarm();
    }
});

// ==================== LEGEND ====================
function createLegend() {
    const container = document.getElementById('legendContainer');
    
    if (!currentCategory) {
        container.innerHTML = '';
        return;
    }

    const uniqueValues = [...new Set(data.map(d => d[currentCategory]))].sort();
    const colors = colorPalettes[currentCategory];
    
    let html = `<div class="legend-title">${categoryMapping[currentCategory]}</div>`;
    
    uniqueValues.forEach(value => {
        const count = data.filter(d => d[currentCategory] === value).length;
        const color = colors[value] || '#64748b';
        
        html += `
            <div class="legend-item" data-value="${value}" onclick="toggleCategory('${value}')">
                <div class="legend-color" style="background-color: ${color}"></div>
                <span class="legend-label">${value}</span>
                <span class="legend-count">${count}</span>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function toggleCategory(value) {
    if (selectedCategories.has(value)) {
        selectedCategories.delete(value);
    } else {
        selectedCategories.add(value);
    }
    
    updateLegendUI();
    updateBeeswarmOpacity();
}

function updateLegendUI() {
    const items = document.querySelectorAll('.legend-item');
    items.forEach(item => {
        const value = item.getAttribute('data-value');
        if (selectedCategories.size === 0) {
            item.classList.remove('active', 'dimmed');
        } else if (selectedCategories.has(value)) {
            item.classList.add('active');
            item.classList.remove('dimmed');
        } else {
            item.classList.remove('active');
            item.classList.add('dimmed');
        }
    });
}

// ==================== STATS ====================
function updateStats() {
    const container = document.getElementById('statsContainer');
    
    if (data.length === 0) {
        container.innerHTML = '';
        return;
    }

    const totalStudents = data.length;
    const avgMath = d3.mean(data, d => +d['math score']).toFixed(1);
    const avgReading = d3.mean(data, d => +d['reading score']).toFixed(1);
    const avgWriting = d3.mean(data, d => +d['writing score']).toFixed(1);

    container.innerHTML = `
        <div class="stats-title">Estadísticas Generales</div>
        <div class="stat-item">
            <span class="stat-label">Total estudiantes</span>
            <span class="stat-value">${totalStudents}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Media Matemáticas</span>
            <span class="stat-value">${avgMath}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Media Lectura</span>
            <span class="stat-value">${avgReading}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Media Escritura</span>
            <span class="stat-value">${avgWriting}</span>
        </div>
    `;
}

// ==================== BEESWARM CHART ====================
function createBeeswarm() {
    const svg = d3.select('#beeswarm');
    const emptyState = document.getElementById('emptyState');
    
    if (!currentSubject || data.length === 0) {
        svg.selectAll('*').remove();
        emptyState.style.display = 'flex';
        return;
    }

    emptyState.style.display = 'none';

    // Dimensiones
    const container = document.querySelector('.chart-wrapper');
    const width = container.clientWidth - 60;
    const height = container.clientHeight - 60;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };

    svg.attr('width', width + margin.left + margin.right)
       .attr('height', height + margin.top + margin.bottom);

    svg.selectAll('*').remove();

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Escalas
    const xScale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, width]);

    // Ejes
    const xAxis = d3.axisBottom(xScale).ticks(10);

    g.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis);

    // Grid lines verticales
    g.selectAll('.grid-line-x')
        .data(xScale.ticks(10))
        .enter()
        .append('line')
        .attr('class', 'grid-line')
        .attr('x1', d => xScale(d))
        .attr('x2', d => xScale(d))
        .attr('y1', 0)
        .attr('y2', height);

    // Labels
    g.append('text')
        .attr('class', 'axis-label')
        .attr('x', width / 2)
        .attr('y', height + 45)
        .attr('text-anchor', 'middle')
        .text('Puntuación');

    // Preparar datos con posiciones iniciales
    const nodes = data.map(d => ({
        ...d,
        x: xScale(+d[currentSubject]),
        y: height / 2
    }));

    // Simulación de fuerza para beeswarm
    const simulation = d3.forceSimulation(nodes)
        .force('x', d3.forceX(d => xScale(+d[currentSubject])).strength(1))
        .force('y', d3.forceY(height / 2).strength(0.05))
        .force('collide', d3.forceCollide(5))
        .stop();

    for (let i = 0; i < 120; i++) simulation.tick();

    // Tooltip
    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip');

    // Círculos
    const circles = g.selectAll('circle')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 4)
        .attr('fill', d => {
            if (currentCategory) {
                const colors = colorPalettes[currentCategory];
                return colors[d[currentCategory]] || '#64748b';
            }
            return '#00ff88';
        })
        .attr('opacity', 0.7)
        .attr('stroke', 'rgba(255, 255, 255, 0.3)')
        .attr('stroke-width', 1)
        .on('mouseover', function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('r', 7)
                .attr('opacity', 1);

            tooltip.html(`
                <div class="tooltip-row">
                    <span class="tooltip-label">Género:</span>
                    <span class="tooltip-value">${d.gender}</span>
                </div>
                <div class="tooltip-row">
                    <span class="tooltip-label">Matemáticas:</span>
                    <span class="tooltip-value">${d['math score']}</span>
                </div>
                <div class="tooltip-row">
                    <span class="tooltip-label">Lectura:</span>
                    <span class="tooltip-value">${d['reading score']}</span>
                </div>
                <div class="tooltip-row">
                    <span class="tooltip-label">Escritura:</span>
                    <span class="tooltip-value">${d['writing score']}</span>
                </div>
                ${currentCategory ? `
                <div class="tooltip-row">
                    <span class="tooltip-label">${categoryMapping[currentCategory]}:</span>
                    <span class="tooltip-value">${d[currentCategory]}</span>
                </div>` : ''}
            `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px')
            .classed('visible', true);
        })
        .on('mouseout', function() {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('r', 4)
                .attr('opacity', 0.7);

            tooltip.classed('visible', false);
        });

    // Actualizar info
    updateChartInfo();
}

function updateBeeswarmOpacity() {
    const svg = d3.select('#beeswarm');
    
    svg.selectAll('circle')
        .transition()
        .duration(300)
        .attr('opacity', d => {
            if (selectedCategories.size === 0) {
                return 0.7;
            }
            return selectedCategories.has(d[currentCategory]) ? 0.9 : 0.1;
        })
        .attr('r', d => {
            if (selectedCategories.size === 0) {
                return 4;
            }
            return selectedCategories.has(d[currentCategory]) ? 5 : 3;
        });
}

function updateChartInfo() {
    const container = document.getElementById('chartInfo');
    
    if (!currentSubject) {
        container.innerHTML = '';
        return;
    }

    const scores = data.map(d => +d[currentSubject]);
    const avg = d3.mean(scores).toFixed(1);
    const min = d3.min(scores);
    const max = d3.max(scores);

    container.innerHTML = `
        <span>Media: ${avg}</span>
        <span>Mín: ${min}</span>
        <span>Máx: ${max}</span>
    `;
}

function clearVisualization() {
    const svg = d3.select('#beeswarm');
    const emptyState = document.getElementById('emptyState');
    
    svg.selectAll('*').remove();
    emptyState.style.display = 'flex';
    document.getElementById('chartInfo').innerHTML = '';
}