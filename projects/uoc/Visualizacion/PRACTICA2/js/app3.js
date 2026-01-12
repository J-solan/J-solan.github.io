// 1. Configuración - RESPONSIVO
const margin = { top: 50, right: 50, bottom: 60, left: 70 };
const containerWidth = document.getElementById('chart-container').offsetWidth;
const width = containerWidth - margin.left - margin.right - 60;
const height = 550 - margin.top - margin.bottom;

const svg = d3.select("#chart-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Tooltip
const tooltip = d3.select("body").append("div").attr("class", "tooltip");

// 2. Cargar Datos
d3.json("data/evolucion_genero.json").then(data => {

    // --- PREPARACIÓN DEL SELECTOR ---
    const countries = [...new Set(data.map(d => d.region))].sort();
    const selector = d3.select("#country-selector");
    selector.html(""); 

    countries.forEach(country => {
        selector.append("option").text(country).attr("value", country);
    });

    // País por defecto interesante
    selector.property("value", "China");
    updateChart("China");

    selector.on("change", function() {
        updateChart(this.value);
    });

    // --- FUNCIÓN DE DIBUJADO ---
    function updateChart(selectedCountry) {
        
        // 1. Filtrar y Ordenar por año
        let countryData = data.filter(d => d.region === selectedCountry);
        countryData.sort((a, b) => a.Year - b.Year);

        svg.selectAll("*").remove(); // Limpiar

        // 2. Escalas
        const x = d3.scaleLinear()
            .domain(d3.extent(countryData, d => d.Year))
            .range([0, width]);

        // Buscamos el máximo de medallas en un solo género para ajustar la altura
        const maxMedals = d3.max(countryData, d => Math.max(d.Medals_M, d.Medals_F));
        
        // Escala Y Divergente: De -Max a +Max
        // El 0 estará en el centro (height / 2)
        const y = d3.scaleLinear()
            .domain([-maxMedals, maxMedals])
            .range([height, 0]);

        // 3. Ejes
        const xAxis = d3.axisBottom(x).tickFormat(d3.format("d"));
        const yAxis = d3.axisLeft(y).tickFormat(d => Math.abs(d));

        svg.append("g")
            .attr("transform", `translate(0,${height/2})`)
            .call(xAxis)
            .attr("class", "axis")
            .select(".domain").remove();

        svg.append("g")
            .call(yAxis)
            .attr("class", "axis");

        // Línea central (Horizonte Cero)
        svg.append("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", y(0))
            .attr("y2", y(0))
            .attr("class", "zero-line");

        // Grid horizontal
        svg.append("g")
            .attr("class", "grid")
            .call(d3.axisLeft(y).tickSize(-width).tickFormat(""))
            .selectAll("line")
            .attr("class", "grid-line");

        // 4. Generadores de Áreas
        // Área Hombres (abajo, negativa)
        const areaMen = d3.area()
            .x(d => x(d.Year))
            .y0(y(0))
            .y1(d => y(-d.Medals_M))
            .curve(d3.curveMonotoneX);

        // Área Mujeres (arriba, positiva)
        const areaWomen = d3.area()
            .x(d => x(d.Year))
            .y0(y(0))
            .y1(d => y(d.Medals_F))
            .curve(d3.curveMonotoneX);

        // 5. Dibujar
        // Capa Hombres
        svg.append("path")
            .datum(countryData)
            .attr("fill", "#7A3E2E")
            .attr("fill-opacity", 0.8)
            .attr("d", areaMen)
            .style("cursor", "crosshair")
            .on("mousemove", function(event) {
                const pointerX = d3.pointer(event)[0];
                const year = Math.round(x.invert(pointerX));
                
                const d = countryData.find(item => Math.abs(item.Year - year) < 2);
                
                if (d) {
                    tooltip.style("opacity", 1)
                        .html(`<strong>${d.Year}</strong><br>
                               Hombres: ${d.Medals_M}<br>
                               Mujeres: ${d.Medals_F}`)
                        .style("left", (event.pageX + 15) + "px")
                        .style("top", (event.pageY - 28) + "px");
                    
                    // Línea vertical guía
                    svg.selectAll(".guide-line").remove();
                    svg.append("line")
                        .attr("class", "guide-line")
                        .attr("x1", x(d.Year))
                        .attr("x2", x(d.Year))
                        .attr("y1", 0)
                        .attr("y2", height)
                        .attr("stroke", "white")
                        .attr("stroke-dasharray", "2,2");
                }
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0);
                svg.selectAll(".guide-line").remove();
            });

        // Capa Mujeres
        svg.append("path")
            .datum(countryData)
            .attr("fill", "#5A2A5E")
            .attr("fill-opacity", 0.8)
            .attr("d", areaWomen)
            .style("cursor", "crosshair");

        // 6. Etiquetas
        svg.append("text")
            .attr("x", 10)
            .attr("y", 20)
            .text("MUJERES")
            .attr("fill", "#5A2A5E")
            .attr("class", "legend");

        svg.append("text")
            .attr("x", 10)
            .attr("y", height - 10)
            .text("HOMBRES")
            .attr("fill", "#7A3E2E")
            .attr("class", "legend");

    } // Fin updateChart

}).catch(err => console.log(err));