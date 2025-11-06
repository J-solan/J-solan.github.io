let pokemonData = [];
let selectedPokemon = [];
let chart = null;
let focusedPokemon = null;

const colors = [
    {bg: 'rgba(0, 255, 136, 0.2)', border: 'rgb(0, 255, 136)', solid: '#00ff88'},
    {bg: 'rgba(0, 212, 255, 0.2)', border: 'rgb(0, 212, 255)', solid: '#00d4ff'},
    {bg: 'rgba(123, 47, 247, 0.2)', border: 'rgb(123, 47, 247)', solid: '#7b2ff7'}
];

// Cargar datos del JSON
async function loadPokemonData() {
    try {
        const response = await fetch('pokemon.json');
        if (!response.ok) {
            throw new Error('No se pudo cargar el archivo pokemon.json');
        }
        pokemonData = await response.json();
        renderPokemonList();
    } catch (error) {
        console.error('Error al cargar los datos:', error);
        document.getElementById('pokemonList').innerHTML = `
            <div class="error">
                <strong>Error al cargar los datos de Pokémon.</strong><br>
                Asegúrate de que el archivo <code>pokemon.json</code> esté en la misma carpeta.
            </div>
        `;
    }
}

function renderPokemonList(filter = '') {
    const listContainer = document.getElementById('pokemonList');
    const filtered = pokemonData.filter(p => 
        p.name.toLowerCase().includes(filter.toLowerCase()) ||
        p.number.toString().includes(filter)
    );

    if (filtered.length === 0) {
        listContainer.innerHTML = '<div class="loading">No se encontraron Pokémon</div>';
        return;
    }

    listContainer.innerHTML = filtered.map(pokemon => {
        const isSelected = selectedPokemon.some(p => p.number === pokemon.number);
        const isDisabled = selectedPokemon.length >= 3 && !isSelected;
        return `
            <div class="pokemon-item ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''}" 
                 onclick="${!isDisabled ? `togglePokemon(${pokemon.number})` : ''}">
                <span class="pokemon-number">#${String(pokemon.number).padStart(3, '0')}</span>
                <span>${pokemon.name}</span>
            </div>
        `;
    }).join('');
}

function togglePokemon(number) {
    const pokemon = pokemonData.find(p => p.number === number);
    const index = selectedPokemon.findIndex(p => p.number === number);

    if (index > -1) {
        selectedPokemon.splice(index, 1);
    } else if (selectedPokemon.length < 3) {
        selectedPokemon.push(pokemon);
    }

    renderPokemonList(document.getElementById('searchInput').value);
    updateEnhancedLegend();
    updateChart();
}

function updateEnhancedLegend() {
    const container = document.getElementById('enhancedLegend');
    
    if (selectedPokemon.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = selectedPokemon.map((pokemon, index) => {
        const total = pokemon.hp + pokemon.attack + pokemon.defense + 
                     pokemon.spAttack + pokemon.spDefense + pokemon.speed;
        const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.number}.png`;
        
        return `
            <div class="legend-item" 
                 data-index="${index}" 
                 style="--legend-color: ${colors[index].solid}"
                 onmouseenter="focusPokemon(${index})"
                 onmouseleave="unfocusPokemon()">
                <button class="legend-remove-btn" onclick="event.stopPropagation(); togglePokemon(${pokemon.number});" title="Eliminar">×</button>
                <div class="legend-content">
                    <div class="legend-main">
                        <div class="legend-data">
                            <div class="legend-header">
                                <span class="legend-name">${pokemon.name}</span>
                                <span class="legend-number">#${String(pokemon.number).padStart(3, '0')}</span>
                            </div>
                            <div class="legend-total">${total}</div>
                            <div class="legend-label">Total Stats</div>
                            <div class="legend-stats">
                                <div class="mini-stat">
                                    <span class="mini-stat-label">HP</span>
                                    <span class="mini-stat-value">${pokemon.hp}</span>
                                </div>
                                <div class="mini-stat">
                                    <span class="mini-stat-label">ATK</span>
                                    <span class="mini-stat-value">${pokemon.attack}</span>
                                </div>
                                <div class="mini-stat">
                                    <span class="mini-stat-label">DEF</span>
                                    <span class="mini-stat-value">${pokemon.defense}</span>
                                </div>
                                <div class="mini-stat">
                                    <span class="mini-stat-label">SP.A</span>
                                    <span class="mini-stat-value">${pokemon.spAttack}</span>
                                </div>
                                <div class="mini-stat">
                                    <span class="mini-stat-label">SP.D</span>
                                    <span class="mini-stat-value">${pokemon.spDefense}</span>
                                </div>
                                <div class="mini-stat">
                                    <span class="mini-stat-label">SPD</span>
                                    <span class="mini-stat-value">${pokemon.speed}</span>
                                </div>
                            </div>
                        </div>
                        <div class="legend-sprite-container">
                            <img src="${spriteUrl}" alt="${pokemon.name}" class="pokemon-sprite" onerror="this.style.display='none'">
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function focusPokemon(index) {
    focusedPokemon = index;
    updateLegendFocus();
    
    if (chart && chart.data.datasets.length > 0) {
        // Atenuar todos los datasets
        chart.data.datasets.forEach((dataset, i) => {
            if (i !== index) {
                dataset.backgroundColor = dataset.backgroundColor.replace(/[\d.]+\)$/g, '0.05)');
                dataset.borderColor = dataset.borderColor.replace('rgb', 'rgba').replace(')', ', 0.2)');
                dataset.pointBackgroundColor = dataset.pointBackgroundColor.replace('rgb', 'rgba').replace(')', ', 0.2)');
            } else {
                // Realzar el dataset enfocado
                dataset.backgroundColor = colors[i].bg.replace(/[\d.]+\)$/g, '0.4)');
                dataset.borderWidth = 4;
            }
        });
        chart.update('none'); // Update sin animación
    }
}

function unfocusPokemon() {
    focusedPokemon = null;
    updateLegendFocus();
    
    if (chart && chart.data.datasets.length > 0) {
        // Restaurar todos los datasets
        chart.data.datasets.forEach((dataset, i) => {
            dataset.backgroundColor = colors[i].bg;
            dataset.borderColor = colors[i].border;
            dataset.pointBackgroundColor = colors[i].border;
            dataset.borderWidth = 3;
        });
        chart.update('none');
    }
}

function updateLegendFocus() {
    const legendItems = document.querySelectorAll('.legend-item');
    legendItems.forEach((item, i) => {
        if (focusedPokemon === null) {
            item.classList.remove('focused', 'dimmed');
        } else if (i === focusedPokemon) {
            item.classList.add('focused');
            item.classList.remove('dimmed');
        } else {
            item.classList.remove('focused');
            item.classList.add('dimmed');
        }
    });
}

function updateChart() {
    const canvas = document.getElementById('radarChart');
    const emptyState = document.getElementById('emptyState');

    if (selectedPokemon.length === 0) {
        canvas.style.display = 'none';
        emptyState.style.display = 'flex';
        if (chart) chart.destroy();
        return;
    }

    canvas.style.display = 'block';
    emptyState.style.display = 'none';

    const datasets = selectedPokemon.map((pokemon, index) => ({
        label: pokemon.name,
        data: [pokemon.hp, pokemon.attack, pokemon.defense, pokemon.spAttack, pokemon.spDefense, pokemon.speed],
        backgroundColor: colors[index].bg,
        borderColor: colors[index].border,
        borderWidth: 3,
        pointBackgroundColor: colors[index].border,
        pointBorderColor: '#1a1f3a',
        pointHoverBackgroundColor: '#1a1f3a',
        pointHoverBorderColor: colors[index].border,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBorderWidth: 2,
        pointHoverBorderWidth: 3
    }));

    if (chart) chart.destroy();

    const ctx = canvas.getContext('2d');
    chart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['HP', 'Ataque', 'Defensa', 'Atq. Esp.', 'Def. Esp.', 'Velocidad'],
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'dataset',
                intersect: false
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 160,
                    ticks: {
                        stepSize: 20,
                        color: '#64748b',
                        backdropColor: 'transparent',
                        font: {
                            size: 12,
                            family: "'JetBrains Mono', 'Courier New', monospace"
                        }
                    },
                    grid: {
                        color: 'rgba(0, 255, 136, 0.15)',
                        lineWidth: 1
                    },
                    pointLabels: {
                        color: '#e0e7ff',
                        font: {
                            size: 14,
                            family: "'JetBrains Mono', 'Courier New', monospace",
                            weight: '600'
                        },
                        padding: 15
                    },
                    angleLines: {
                        color: 'rgba(0, 255, 136, 0.15)',
                        lineWidth: 1
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
                            const pokemon = selectedPokemon[context.datasetIndex];
                            const total = pokemon.hp + pokemon.attack + pokemon.defense + 
                                        pokemon.spAttack + pokemon.spDefense + pokemon.speed;
                            return `Total: ${total}`;
                        }
                    }
                }
            },
            onHover: (event, activeElements) => {
                const chartArea = chart.chartArea;
                const x = event.x;
                const y = event.y;
                
                // Verificar si el mouse está dentro del área del gráfico
                const isInsideChart = x >= chartArea.left && x <= chartArea.right && 
                                     y >= chartArea.top && y <= chartArea.bottom;
                
                if (isInsideChart && activeElements.length > 0) {
                    const datasetIndex = activeElements[0].datasetIndex;
                    if (focusedPokemon !== datasetIndex) {
                        focusPokemon(datasetIndex);
                    }
                } else if (!isInsideChart && focusedPokemon !== null) {
                    unfocusPokemon();
                }
            }
        }
    });
    
    // Añadir evento mouseleave al canvas para asegurar que se quita el focus
    canvas.onmouseleave = () => {
        if (focusedPokemon !== null) {
            unfocusPokemon();
        }
    };
}

// Event listeners
document.getElementById('searchInput').addEventListener('input', (e) => {
    renderPokemonList(e.target.value);
});

// Inicializar
loadPokemonData();
updateEnhancedLegend();
updateChart();