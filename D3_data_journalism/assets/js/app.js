function makeResponsive() {

    var svgArea = d3.select("body").select("svg");

    // clear svg is not empty
    if (!svgArea.empty()) {
      svgArea.remove();
    }
    var svgWidth = window.innerWidth/1.82857;
    var svgHeight = 400;
    console.log(window.innerWidth)/1.82857;
    console.log(svgWidth);
    var margin = {
    top: 20,
    right: 10,
    bottom: 60,
    left: 50
    };

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
    var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    // .attr("style", "background-color:green");

    var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Import Data
    d3.csv("./assets/data/data.csv").then(function(censusData) {
        censusData.forEach(function(data) {
            data.id = +data.id;
            data.poverty = +data.poverty;
            data.povertyMoe = +data.povertyMoe;
            data.age = +data.age;
            data.ageMoe = +data.ageMoe;
            data.income = +data.income;
            data.income = +data.incomeMoe;
            data.healthcare = +data.healthcare;
            data.healthcareLow = +data.healthcareLow;
            data.healthcareHigh = +data.healthcareHigh;
            data.obesity = +data.obesity;
            data.obesityLow = +data.obesityLow;
            data.obesityHigh = +data.obesityHigh;
            data.smokes = +data.smokes;
            data.smokesLow = +data.smokesLow;
            data.smokesHigh = +data.smokesHigh;
        });
        
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(censusData, d => d.poverty) -2, d3.max(censusData, d => d.poverty) +2])
            .range([0, width]);

        var yLinearScale = d3.scaleLinear()
            .domain([0, d3.max(censusData, d => d.healthcare)])
            .range([height, 0]);

        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        chartGroup.append("g")
             .call(leftAxis);    


        var circlesGroup = chartGroup.selectAll("circle")
            .data(censusData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d.poverty))
            .attr("cy", d => yLinearScale(d.healthcare))
            .attr("r", "15")
            .attr("fill", "red")
            .attr("opacity", ".5");

        // Data labels
        chartGroup.append("g")
            .selectAll('text')
            .data(censusData)
            .enter()
            .append("text")
            .text(d=>d.abbr)
            .attr("x",d=>xLinearScale(d.poverty))
            .attr("y",d=>yLinearScale(d.healthcare))
            .classed(".stateText", true)
            .attr("font-family", "sans-serif")
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .attr("font-size", "10px")
            .style("font-weight", "bold")
            .attr("alignment-baseline", "central");

        // Create axes labels
        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height/2))
            .attr("dy", "1em")
            .attr("class", "axisText")
            .text("Lacks Healthcare (%)");
    
        
        chartGroup.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
            .attr("class", "axisText")
            .text("Poverty (%)");

        // End of svg graph
        // Setup tooltip


        var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state}<br>Poverty: ${d.poverty}%<br>Healthcare: ${d.healthcare}%`);
        });

        chartGroup.call(toolTip);

        circlesGroup.on("click", function(data) {
            toolTip.show(data, this);
        })

        // onmouseout event
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        }); 
    }).catch(function(error) {
        console.log(error);
    });
}
// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);