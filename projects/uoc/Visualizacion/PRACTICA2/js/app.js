// 1. Configuración del Lienzo (Canvas) - RESPONSIVO
const margin = { top: 40, right: 40, bottom: 60, left: 80 };
const containerWidth = document.getElementById('chart-container').offsetWidth;
const width = containerWidth - margin.left - margin.right - 60; // 60px extra de padding
const height = 600 - margin.top - margin.bottom;

// Creamos el SVG dentro del div
const svg = d3.select("#chart-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// 2. Creación de Escalas
// Eje X: Población (LOGARÍTMICA). Vital para ver países pequeños y grandes a la vez.
const x = d3.scaleLog()
    .range([0, width])
    .domain([40000, 1800000000]); // De 40k a 1.8 Billones de personas

// Eje Y: Eficiencia (Lineal). Cuanto más arriba, más "Cultura deportiva".
const y = d3.scaleLinear()
    .range([height, 0])
    .domain([0, 150]); // Eficiencia de 0 a 150

// Radio: Tamaño de la burbuja basado en el total de medallas
const r = d3.scaleSqrt()
    .range([2, 50])
    .domain([0, 120]); // De 0 a 120 medallas

// Color: Escala simple para diferenciar visualmente
const color = d3.scaleOrdinal(d3.schemeDark2);

// 3. Ejes y Etiquetas
// Eje X
svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(5, ",.1s"))
    .attr("class", "axis");

svg.append("text")
    .attr("class", "axis-label")
    .attr("x", width / 2)
    .attr("y", height + 45)
    .style("text-anchor", "middle")
    .text("Población (Escala Logarítmica)");

// Eje Y
svg.append("g")
    .call(d3.axisLeft(y))
    .attr("class", "axis");

svg.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -55)
    .style("text-anchor", "middle")
    .text("Eficiencia (Medallas / 10M hab.)");

// Grid lines
svg.append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(y).tickSize(-width).tickFormat(""))
    .style("stroke-dasharray", "2,2")
    .style("opacity", 0.1);

// Tooltip y Panel
const tooltip = d3.select("body").append("div").attr("class", "tooltip");
const panel = d3.select("#details-panel");
const closeBtn = d3.select("#close-panel");
let selectedCircle = null;

closeBtn.on("click", () => {
    panel.classed("visible", false);
    if(selectedCircle) d3.select(selectedCircle).style("stroke", "#fff").style("stroke-width", 1);
});

// 4. Carga de Datos y Lógica
d3.json("data/eficiencia.json").then(data => {
    
    data.forEach(d => {
        d.Year = +d.Year;
        d.Population = +d.Population;
        d.Efficiency = +d.Efficiency;
        d.Medals_Count = +d.Medals_Count;
    });

    let currentYear = 2024;

    function updateChart(year) {
        const filteredData = data.filter(d => d.Year === year && d.Population > 0 && d.Medals_Count > 0);
        const circles = svg.selectAll("circle").data(filteredData, d => d.region);

        circles.exit().transition().duration(500).attr("r", 0).remove();

        circles.transition().duration(500)
            .attr("cx", d => x(d.Population))
            .attr("cy", d => y(d.Efficiency))
            .attr("r", d => r(d.Medals_Count));

        circles.enter()
            .append("circle")
            .attr("cx", d => x(d.Population))
            .attr("cy", d => y(d.Efficiency))
            .attr("r", 0)
            .style("fill", d => color(d.region))
            .style("fill-opacity", 0.7)
            .style("stroke", "#fff")
            .style("stroke-width", 1)
            .style("cursor", "pointer")
            
            .on("mouseover", function(event, d) {
                if (!panel.classed("visible")) {
                    d3.select(this).style("stroke-width", 3).style("fill-opacity", 1);
                    tooltip.transition().duration(200).style("opacity", 1);
                    tooltip.html(`<strong>${d.region}</strong><br>Eficiencia: ${d.Efficiency.toFixed(1)}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                }
            })
            
            .on("mouseout", function() {
                if (this !== selectedCircle) {
                    d3.select(this).style("stroke-width", 1).style("fill-opacity", 0.7);
                }
                tooltip.transition().duration(500).style("opacity", 0);
            })

            .on("click", function(event, d) {
                event.stopPropagation();
                
                if(selectedCircle) d3.select(selectedCircle).style("stroke", "#fff").style("stroke-width", 1);
                selectedCircle = this;
                d3.select(this).style("stroke", "#D4AF37").style("stroke-width", 4).style("fill-opacity", 1);

                d3.select("#panel-country").text(d.region);
                d3.select("#panel-year").text(`Juegos Olímpicos de ${d.Year}`);
                d3.select("#panel-pop").text(d3.format(",")(d.Population));
                d3.select("#panel-medals").text(d.Medals_Count);
                d3.select("#panel-efficiency").text(d.Efficiency.toFixed(2));

                const peoplePerMedal = Math.round(d.Population / d.Medals_Count);
                const peopleFormatted = d3.format(",")(peoplePerMedal);
                
                let narrative = "";
                if (d.Efficiency > 50) {
                    narrative = `¡Increíble! <strong>${d.region}</strong> es una potencia de eficiencia. `;
                } else if (d.Efficiency < 1) {
                    narrative = `A pesar de su tamaño, a <strong>${d.region}</strong> le cuesta convertir población en medallas. `;
                } else {
                    narrative = `<strong>${d.region}</strong> mantiene un rendimiento constante. `;
                }
                
                narrative += `En ${d.Year}, ganaron <strong>1 medalla por cada ${peopleFormatted} habitantes</strong>.`;
                
                d3.select("#panel-fact").html(narrative);

                panel.classed("visible", true);
                
                // Configurar click en la caja de medallas para ir al Acto 2
                const medalsBox = document.getElementById('medals-box');
                medalsBox.onclick = function() {
                    window.location.href = `acto2.html?country=${encodeURIComponent(d.region)}&year=${d.Year}`;
                };
            })
            
            .transition().duration(500)
            .attr("r", d => r(d.Medals_Count));
    }

    updateChart(currentYear);

    d3.select("#year-slider").on("input", function() {
        currentYear = +this.value;
        d3.select("#year-display").text(currentYear);
        updateChart(currentYear);
    });

}).catch(error => {
    console.error("Error cargando el JSON:", error);
    d3.select("#chart-container").html("<p style='color:red'>Error cargando datos. Recuerda usar un servidor local (Live Server).</p>");
});