// 1. Configuración del Lienzo
const margin = { top: 60, right: 120, bottom: 100, left: 300 }; 
const container = document.getElementById('chart-container');
const containerWidth = container.offsetWidth;
const width = containerWidth - margin.left - margin.right;
const height = 650 - margin.top - margin.bottom;

const svg = d3.select("#chart-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("body").append("div").attr("class", "tooltip");
const colorScale = d3.scaleOrdinal(d3.schemeSet3);

// Variables Globales
let countryDataRaw = [];
let globalDataRef = {};
let currentMetric = 'dominance'; // 'dominance' (Eficiencia) o 'won' (Total)

// Exponer función para el botón HTML
window.setMetric = function(metric) {
    currentMetric = metric;
    
    // Actualizar clases visuales de los botones
    document.getElementById('btn-metric-eff').classList.toggle('active', metric === 'dominance');
    document.getElementById('btn-metric-total').classList.toggle('active', metric === 'won');
    
    // Redibujar
    handleUpdateGlobal();
};

// Función auxiliar para llamar al update desde fuera o dentro
function handleUpdateGlobal() {
    const countrySelect = d3.select("#country-selector");
    const yearFrom = d3.select("#year-from");
    const yearTo = d3.select("#year-to");

    const c = countrySelect.property("value");
    const f = +yearFrom.property("value");
    const t = +yearTo.property("value");

    if (f > t) {
        alert("El año inicial no puede ser mayor al final");
        return;
    }
    updateChart(c, f, t);
}

// 2. Cargar Datos
Promise.all([
    d3.json("data/data_acto2_country.json"),
    d3.json("data/data_acto2_global.json")
]).then(([cData, gData]) => {
    
    countryDataRaw = cData;
    globalDataRef = gData;

    // --- A. Selectores ---
    const countries = [...new Set(cData.map(d => d.country))].sort();
    const countrySelect = d3.select("#country-selector");
    
    countries.forEach(c => {
        countrySelect.append("option").text(c).attr("value", c);
    });

    let allYears = new Set();
    Object.values(globalDataRef).forEach(yearObj => {
        Object.keys(yearObj).forEach(y => allYears.add(+y));
    });
    const olympicYears = [...allYears].sort((a,b) => a-b);

    const yearFrom = d3.select("#year-from");
    const yearTo = d3.select("#year-to");

    yearFrom.html(""); yearTo.html("");
    olympicYears.forEach(y => {
        yearFrom.append("option").text(y).attr("value", y);
        yearTo.append("option").text(y).attr("value", y);
    });

    // --- B. URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const urlCountry = urlParams.get('country');
    const urlYear = urlParams.get('year');

    let currentCountry = "Spain";
    let currentFrom = d3.min(olympicYears);
    let currentTo = d3.max(olympicYears);

    if (urlCountry && countries.includes(urlCountry)) {
        currentCountry = urlCountry;
        document.getElementById('breadcrumb').style.display = 'flex';
        document.getElementById('source-info').textContent = urlCountry;
    }

    if (urlYear) {
        currentFrom = urlYear;
        currentTo = urlYear;
        yearFrom.property("value", urlYear);
        yearTo.property("value", urlYear);
        document.getElementById('source-info').textContent += ` (${urlYear})`;
    } else {
        yearFrom.property("value", currentFrom);
        yearTo.property("value", currentTo);
    }

    countrySelect.property("value", currentCountry);

    // Listeners
    countrySelect.on("change", handleUpdateGlobal);
    yearFrom.on("change", handleUpdateGlobal);
    yearTo.on("change", handleUpdateGlobal);

    // Dibujar inicial
    handleUpdateGlobal();

}).catch(error => console.error("Error cargando JSONs:", error));


// 3. Función de Actualización
function updateChart(country, yearStart, yearEnd) {
    
    const myEvents = countryDataRaw.filter(d => d.country === country);

    let processedData = myEvents.map(d => {
        const medalsWonInRange = d.history
            .filter(h => h.y >= yearStart && h.y <= yearEnd)
            .reduce((sum, h) => sum + h.w, 0);

        if (medalsWonInRange === 0) return null;

        const key = `${d.sport}|${d.event}`;
        const globalRef = globalDataRef[key]; 
        let globalTotalInRange = 0;
        
        if (globalRef) {
            Object.entries(globalRef).forEach(([yearStr, count]) => {
                const year = +yearStr;
                if (year >= yearStart && year <= yearEnd) {
                    globalTotalInRange += count;
                }
            });
        }

        if (globalTotalInRange === 0) globalTotalInRange = medalsWonInRange;
        const dominance = (medalsWonInRange / globalTotalInRange) * 100;

        return {
            sport: d.sport,
            event: d.event,
            won: medalsWonInRange,       // Dato bruto
            globalTotal: globalTotalInRange,
            dominance: dominance         // Dato porcentual
        };
    }).filter(d => d !== null); 

    // LOGICA DE ORDENACIÓN SEGÚN MÉTRICA
    // Si estamos en 'won', ordenamos por total medallas, luego por dominancia
    // Si estamos en 'dominance', ordenamos por % dominancia, luego por total
    processedData = processedData
        .sort((a, b) => b[currentMetric] - a[currentMetric] || b.dominance - a.dominance)
        .slice(0, 15);

    // --- ESCALAS DINÁMICAS ---
    
    let xDomainMax;
    if (currentMetric === 'dominance') {
        // Modo Porcentaje: Tope 100% o máx data con aire
        const maxVal = d3.max(processedData, d => d.dominance) || 0;
        xDomainMax = Math.min(100, Math.max(15, maxVal * 1.2)); 
    } else {
        // Modo Absoluto: Tope medallas ganadas con aire
        const maxVal = d3.max(processedData, d => d.won) || 0;
        xDomainMax = Math.max(5, maxVal * 1.1); // Mínimo 5 para que el eje no se rompa con 1 medalla
    }
    
    const x = d3.scaleLinear()
        .domain([0, xDomainMax])
        .range([0, width]);

    const y = d3.scaleBand()
        .range([0, height])
        .domain(processedData.map(d => d.event))
        .padding(0.4);

    // --- EJES ---
    svg.selectAll(".my-axis").remove();

    svg.append("g")
        .attr("class", "my-axis axis-x")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x)
            .ticks(5)
            // Formato condicional: añade '%' solo si es dominancia
            .tickFormat(d => currentMetric === 'dominance' ? d + "%" : d)
        )
        .selectAll("text")
        .style("fill", "#aaaaaa")
        .style("font-size", "12px");

    svg.append("g")
        .attr("class", "my-axis axis-y")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("fill", "#f0f0f0")
        .style("font-size", "13px")
        .style("font-family", "'Roboto', sans-serif");


    // --- DIBUJADO (ARQUITECTURA DE GRUPOS) ---

    const groups = svg.selectAll(".lollipop-group")
        .data(processedData, d => d.event);

    groups.exit()
        .transition().duration(500)
        .style("opacity", 0)
        .remove();

    const groupsEnter = groups.enter()
        .append("g")
        .attr("class", "lollipop-group")
        .attr("transform", d => `translate(0, ${y(d.event)})`);

    groupsEnter.append("line")
        .attr("class", "l-line")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", y.bandwidth() / 2)
        .attr("y2", y.bandwidth() / 2)
        .attr("stroke", "#999")
        .attr("stroke-width", "2px");

    groupsEnter.append("circle")
        .attr("class", "l-circle")
        .attr("cx", 0)
        .attr("cy", y.bandwidth() / 2)
        .attr("r", 0)
        .style("stroke", "black")
        .style("stroke-width", "1.5px");

    const groupsMerge = groupsEnter.merge(groups);

    // Animación A: Posición Y (Orden)
    groupsMerge.transition().duration(750)
        .attr("transform", d => `translate(0, ${y(d.event)})`);

    // Animación B: Línea (Longitud basada en métrica actual)
    groupsMerge.select(".l-line")
        .transition().duration(750)
        .attr("x2", d => Math.max(2, x(d[currentMetric]))); // Usamos d[currentMetric] dinámicamente

    // Animación C: Círculo (Posición basada en métrica actual)
    groupsMerge.select(".l-circle")
        .style("fill", d => colorScale(d.sport))
        .attr("pointer-events", "all") 
        .transition().duration(750)
        .attr("cx", d => x(d[currentMetric]))
        .attr("r", 7);

    // Reaplicar Tooltips (Igual que antes)
    groupsMerge.select(".l-circle")
        .on("mouseover", function(event, d) {
            d3.select(this).transition().attr("r", 9).style("stroke", "white");
            tooltip.transition().duration(200).style("opacity", 1);
            
            // Destacamos visualmente la métrica activa en el tooltip
            const domStyle = currentMetric === 'dominance' ? 'color:#D4AF37; font-size:1.2em' : 'color:#ccc';
            const wonStyle = currentMetric === 'won' ? 'color:#D4AF37; font-size:1.2em' : 'color:#ccc';

            tooltip.html(`
                <strong>${d.event}</strong><br>
                <span style="color:${colorScale(d.sport)}">${d.sport}</span><br>
                <hr style="border-color:#555; margin:5px 0;">
                Dominancia: <strong style="${domStyle}">${d.dominance.toFixed(2)}%</strong><br>
                Ganadas: <strong style="${wonStyle}">${d.won}</strong> 
                <span style="font-size:0.9em; color:#ccc">/ Global: ${d.globalTotal}</span><br>
                <span style="font-size:0.8em; color:#777">Periodo: ${yearStart}-${yearEnd}</span>
            `)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).transition().attr("r", 7).style("stroke", "black");
            tooltip.transition().duration(500).style("opacity", 0);
        });

    // --- ETIQUETA INFERIOR ---
    svg.selectAll(".chart-label").remove();
    
    // Texto dinámico según selección
    const labelText = currentMetric === 'dominance' 
        ? `% de Medallas Totales Entregadas (${yearStart}-${yearEnd})`
        : `Total de Medallas Ganadas (${yearStart}-${yearEnd})`;

    svg.append("text")
        .attr("class", "chart-label")
        .attr("x", width)
        .attr("y", height + 50) 
        .attr("text-anchor", "end")
        .style("fill", "#999")
        .style("font-size", "14px")
        .style("font-style", "italic")
        .text(labelText);
}