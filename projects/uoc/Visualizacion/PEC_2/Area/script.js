// Configuración de archivos disponibles
const dataFiles = {
    'SP1': { // Primera División
        name: 'Primera División',
        seasons: {
            '14': { file: 'data/SP1-14.csv', label: '2014-15' },
            '15': { file: 'data/SP1-15.csv', label: '2015-16' },
            '16': { file: 'data/SP1-16.csv', label: '2016-17' },
            '17': { file: 'data/SP1-17.csv', label: '2017-18' },
            '18': { file: 'data/SP1-18.csv', label: '2018-19' },
            '19': { file: 'data/SP1-19.csv', label: '2019-20' },
            '20': { file: 'data/SP1-20.csv', label: '2020-21' },
            '21': { file: 'data/SP1-21.csv', label: '2021-22' },
            '22': { file: 'data/SP1-22.csv', label: '2022-23' },
            '23': { file: 'data/SP1-23.csv', label: '2023-24' }
        }
    },
    'SP2': { // Segunda División
        name: 'Segunda División',
        seasons: {
            '14': { file: 'data/SP2-14.csv', label: '2014-15' },
            '15': { file: 'data/SP2-15.csv', label: '2015-16' },
            '16': { file: 'data/SP2-16.csv', label: '2016-17' },
            '17': { file: 'data/SP2-17.csv', label: '2017-18' },
            '18': { file: 'data/SP2-18.csv', label: '2018-19' },
            '19': { file: 'data/SP2-19.csv', label: '2019-20' },
            '20': { file: 'data/SP2-20.csv', label: '2020-21' },
            '21': { file: 'data/SP2-21.csv', label: '2021-22' },
            '22': { file: 'data/SP2-22.csv', label: '2022-23' },
            '23': { file: 'data/SP2-23.csv', label: '2023-24' }
        }
    }
};

let allLoadedData = {}; // Almacena todos los datos cargados {leagueKey-seasonKey: {teams}}
let currentTeamsData = {}; // Datos de la liga/temporada actual mostrada
let selectedTeams = []; // Array de objetos {team, league, season, data}
let chart = null;
let focusedTeam = null;
let currentLeague = '';
let currentSeason = '';

const colors = [
    {bg: 'rgba(0, 255, 136, 0.2)', border: 'rgb(0, 255, 136)', solid: '#00ff88'},
    {bg: 'rgba(0, 212, 255, 0.2)', border: 'rgb(0, 212, 255)', solid: '#00d4ff'},
    {bg: 'rgba(123, 47, 247, 0.2)', border: 'rgb(123, 47, 247)', solid: '#7b2ff7'}
];

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

// ==================== INICIALIZACIÓN ====================
function initializeSelectors() {
    const leagueSelector = document.getElementById('leagueSelector');
    
    // Poblar selector de ligas
    Object.keys(dataFiles).forEach(leagueKey => {
        const option = document.createElement('option');
        option.value = leagueKey;
        option.textContent = dataFiles[leagueKey].name;
        leagueSelector.appendChild(option);
    });
}

// ==================== EVENT LISTENERS ====================
document.getElementById('leagueSelector').addEventListener('change', (e) => {
    const leagueKey = e.target.value;
    const seasonSelector = document.getElementById('seasonSelector');
    
    if (!leagueKey) {
        seasonSelector.disabled = true;
        seasonSelector.innerHTML = '<option value="">Primero selecciona una liga...</option>';
        currentLeague = '';
        currentSeason = '';
        currentTeamsData = {};
        document.getElementById('searchInput').disabled = true;
        document.getElementById('searchInput').value = '';
        document.getElementById('teamList').innerHTML = '<div class="loading">Selecciona una liga y temporada</div>';
        updateChartInfo();
        return;
    }

    currentLeague = leagueKey;
    
    // Poblar selector de temporadas
    seasonSelector.innerHTML = '<option value="">Selecciona una temporada...</option>';
    Object.keys(dataFiles[leagueKey].seasons).forEach(seasonKey => {
        const option = document.createElement('option');
        option.value = seasonKey;
        option.textContent = dataFiles[leagueKey].seasons[seasonKey].label;
        seasonSelector.appendChild(option);
    });
    
    seasonSelector.disabled = false;
    
    // Resetear vista pero NO los equipos seleccionados
    currentSeason = '';
    currentTeamsData = {};
    document.getElementById('searchInput').disabled = true;
    document.getElementById('searchInput').value = '';
    document.getElementById('teamList').innerHTML = '<div class="loading">Selecciona una temporada</div>';
    updateChartInfo();
});

document.getElementById('seasonSelector').addEventListener('change', (e) => {
    const seasonKey = e.target.value;
    
    if (!seasonKey) {
        currentSeason = '';
        currentTeamsData = {};
        document.getElementById('searchInput').disabled = true;
        document.getElementById('searchInput').value = '';
        document.getElementById('teamList').innerHTML = '<div class="loading">Selecciona una temporada</div>';
        updateChartInfo();
        return;
    }

    currentSeason = seasonKey;
    loadSeasonData(currentLeague, seasonKey);
});

document.getElementById('searchInput').addEventListener('input', (e) => {
    renderTeamList(e.target.value);
});
// ==================== CARGA DE DATOS ====================
async function loadSeasonData(leagueKey, seasonKey) {
    const dataKey = `${leagueKey}-${seasonKey}`;
    
    // Si ya tenemos estos datos cargados, solo actualizamos la vista
    if (allLoadedData[dataKey]) {
        currentTeamsData = allLoadedData[dataKey];
        renderTeamList();
        updateChartInfo();
        document.getElementById('searchInput').disabled = false;
        return;
    }
    
    const fileName = dataFiles[leagueKey].seasons[seasonKey].file;
    
    try {
        const response = await fetch(fileName);
        if (!response.ok) {
            throw new Error(`No se pudo cargar el archivo ${fileName}`);
        }
        const text = await response.text();
        const parsedData = parseCSV(text);
        
        // Guardar datos con metadata
        allLoadedData[dataKey] = parsedData;
        currentTeamsData = parsedData;
        
        renderTeamList();
        updateChartInfo();
        document.getElementById('searchInput').disabled = false;
        
    } catch (error) {
        console.error('Error al cargar los datos:', error);
        document.getElementById('teamList').innerHTML = `
            <div class="error">
                <strong>Error al cargar los datos.</strong><br>
                Asegúrate de que el archivo <code>${fileName}</code> existe.
            </div>
        `;
    }
}

function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const teamsData = {};
    headers.forEach(team => {
        if (team) teamsData[team] = [];
    });

    // Los datos vienen en acumulativo, necesitamos calcular puntos por jornada
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        headers.forEach((team, index) => {
            if (team && values[index]) {
                const currentAccumulated = parseFloat(values[index].trim()) || 0;
                
                if (i === 1) {
                    teamsData[team].push(currentAccumulated);
                } else {
                    const previousLine = lines[i - 1].split(',');
                    const previousAccumulated = parseFloat(previousLine[index].trim()) || 0;
                    const pointsThisRound = currentAccumulated - previousAccumulated;
                    teamsData[team].push(pointsThisRound);
                }
            }
        });
    }

    return teamsData;
}

// Ya no necesitamos la función resetData

// ==================== RENDERIZADO ====================
function renderTeamList(filter = '') {
    const listContainer = document.getElementById('teamList');
    const teams = Object.keys(currentTeamsData);

    if (teams.length === 0) {
        listContainer.innerHTML = '<div class="loading">Selecciona una liga y temporada</div>';
        return;
    }

    const filtered = teams.filter(team => team.toLowerCase().includes(filter.toLowerCase()));

    if (filtered.length === 0) {
        listContainer.innerHTML = '<div class="loading">No se encontraron equipos</div>';
        return;
    }

    listContainer.innerHTML = filtered.map(team => {
        const totalPoints = currentTeamsData[team].reduce((a, b) => a + b, 0);
        
        // Verificar si este equipo ya está seleccionado en esta liga/temporada
        const isSelected = selectedTeams.some(
            st => st.team === team && st.league === currentLeague && st.season === currentSeason
        );
        const isDisabled = selectedTeams.length >= 3 && !isSelected;
        
        return `
            <div class="team-item ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''}" 
                 onclick="${!isDisabled ? `toggleTeam('${team.replace(/'/g, "\\'")}')` : ''}">
                <span class="team-name">${team}</span>
                <span class="team-points">${totalPoints} pts</span>
            </div>
        `;
    }).join('');
}

function toggleTeam(teamName) {
    // Buscar si este equipo de esta liga/temporada ya está seleccionado
    const existingIndex = selectedTeams.findIndex(
        st => st.team === teamName && st.league === currentLeague && st.season === currentSeason
    );

    if (existingIndex > -1) {
        // Quitar el equipo
        selectedTeams.splice(existingIndex, 1);
    } else if (selectedTeams.length < 3) {
        // Añadir el equipo con toda su metadata
        selectedTeams.push({
            team: teamName,
            league: currentLeague,
            season: currentSeason,
            leagueName: dataFiles[currentLeague].name,
            seasonLabel: dataFiles[currentLeague].seasons[currentSeason].label,
            data: currentTeamsData[teamName]
        });
    }

    renderTeamList(document.getElementById('searchInput').value);
    updateEnhancedLegend();
    updateChart();
}

function updateChartInfo() {
    const infoContainer = document.getElementById('chartInfo');
    
    if (!currentLeague || !currentSeason) {
        infoContainer.innerHTML = '';
        return;
    }
}

function updateEnhancedLegend() {
    const container = document.getElementById('enhancedLegend');
    
    if (selectedTeams.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = selectedTeams.map((teamObj, index) => {
        const points = teamObj.data;
        const totalPoints = points.reduce((a, b) => a + b, 0);
        const avgPoints = (totalPoints / points.length).toFixed(1);
        const maxPoints = Math.max(...points);
        const minPoints = Math.min(...points);
        
        return `
            <div class="legend-item" 
                 data-index="${index}" 
                 style="--legend-color: ${colors[index].solid}"
                 onmouseenter="focusTeam(${index})"
                 onmouseleave="unfocusTeam()">
                <button class="legend-remove-btn" onclick="event.stopPropagation(); removeTeamByIndex(${index});" title="Eliminar">×</button>
                <div class="legend-content">
                    <span class="legend-name">${teamObj.team}</span>
                    <div class="legend-context">
                        <span class="legend-context-text">${teamObj.leagueName} • ${teamObj.seasonLabel}</span>
                    </div>
                    <div class="legend-stats">
                        <div class="mini-stat">
                            <span class="mini-stat-label">Total</span>
                            <span class="mini-stat-value" style="color: ${colors[index].solid}">${totalPoints}</span>
                        </div>
                        <div class="mini-stat">
                            <span class="mini-stat-label">Media</span>
                            <span class="mini-stat-value" style="color: ${colors[index].solid}">${avgPoints}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function removeTeamByIndex(index) {
    selectedTeams.splice(index, 1);
    renderTeamList(document.getElementById('searchInput').value);
    updateEnhancedLegend();
    updateChart();
}

// ==================== FOCUS/UNFOCUS ====================
function focusTeam(index) {
    focusedTeam = index;
    updateLegendFocus();
    
    if (chart && chart.data.datasets.length > 0) {
        chart.data.datasets.forEach((dataset, i) => {
            if (i !== index) {
                dataset.borderColor = dataset.borderColor.replace('rgb', 'rgba').replace(')', ', 0.2)');
                dataset.backgroundColor = dataset.backgroundColor.replace(/[\d.]+\)$/g, '0.05)');
            } else {
                dataset.borderWidth = 4;
                dataset.backgroundColor = colors[i].bg.replace(/[\d.]+\)$/g, '0.4)');
            }
        });
        chart.update('none');
    }
}

function unfocusTeam() {
    focusedTeam = null;
    updateLegendFocus();
    
    if (chart && chart.data.datasets.length > 0) {
        chart.data.datasets.forEach((dataset, i) => {
            dataset.borderColor = colors[i].border;
            dataset.backgroundColor = colors[i].bg;
            dataset.borderWidth = 3;
        });
        chart.update('none');
    }
}

function updateLegendFocus() {
    const legendItems = document.querySelectorAll('.legend-item');
    legendItems.forEach((item, i) => {
        if (focusedTeam === null) {
            item.classList.remove('focused', 'dimmed');
        } else if (i === focusedTeam) {
            item.classList.add('focused');
            item.classList.remove('dimmed');
        } else {
            item.classList.remove('focused');
            item.classList.add('dimmed');
        }
    });
}

// ==================== ACTUALIZACIÓN DEL GRÁFICO ====================
function updateChart() {
    const canvas = document.getElementById('lineChart');
    const emptyState = document.getElementById('emptyState');

    if (selectedTeams.length === 0) {
        canvas.style.display = 'none';
        emptyState.style.display = 'flex';
        if (chart) chart.destroy();
        return;
    }

    canvas.style.display = 'block';
    emptyState.style.display = 'none';

    const maxJornadas = Math.max(...selectedTeams.map(t => t.data.length));
    const labels = Array.from({length: maxJornadas}, (_, i) => `J${i + 1}`);

    const datasets = selectedTeams.map((teamObj, index) => {
        const data = teamObj.data;
        let cumulativePoints = [];
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += data[i];
            cumulativePoints.push(sum);
        }

        return {
            label: `${teamObj.team} (${teamObj.seasonLabel})`,
            data: cumulativePoints,
            backgroundColor: colors[index].bg,
            borderColor: colors[index].border,
            borderWidth: 3,
            pointBackgroundColor: colors[index].border,
            pointBorderColor: '#1a1f3a',
            pointHoverBackgroundColor: '#1a1f3a',
            pointHoverBorderColor: colors[index].border,
            pointRadius: 4,
            pointHoverRadius: 7,
            pointBorderWidth: 2,
            pointHoverBorderWidth: 3,
            tension: 0.3,
            fill: true
        };
    });

    if (chart) chart.destroy();

    const ctx = canvas.getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 255, 136, 0.1)',
                        lineWidth: 1
                    },
                    ticks: {
                        color: '#94a3b8',
                        font: {
                            size: 12,
                            family: "'JetBrains Mono', 'Courier New', monospace"
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 255, 136, 0.1)',
                        lineWidth: 1
                    },
                    ticks: {
                        color: '#94a3b8',
                        font: {
                            size: 12,
                            family: "'JetBrains Mono', 'Courier New', monospace"
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1a1f3a',
                    titleColor: '#00ff88',
                    bodyColor: '#e0e7ff',
                    borderColor: '#00ff88',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    titleFont: {
                        size: 13,
                        family: "'JetBrains Mono', 'Courier New', monospace",
                        weight: '600'
                    },
                    bodyFont: {
                        size: 12,
                        family: "'JetBrains Mono', 'Courier New', monospace"
                    },
                    callbacks: {
                        afterLabel: function(context) {
                            const teamObj = selectedTeams[context.datasetIndex];
                            const jornada = context.dataIndex;
                            if (jornada < teamObj.data.length) {
                                const puntosJornada = teamObj.data[jornada];
                                return `Puntos jornada: ${puntosJornada}`;
                            }
                            return '';
                        }
                    }
                }
            }
        }
    });
}

// ==================== INICIALIZACIÓN ====================
initializeSelectors();