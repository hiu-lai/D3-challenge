function makeResponsive() {
  var svgArea = d3.select("body").select("svg");
  
  // clear svg is not empty
  if (!svgArea.empty()) {
    svgArea.remove();
  }
  var svgWidth = window.innerWidth/1.82857;
  var svgHeight = 400;
  console.log(svgArea)
  var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
  };
  
  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;
  
  // Create an SVG wrapper, append an SVG group that will hold our chart,
  // and shift the latter by left and top margins.
  var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    // .attr("style", "background-color:black");
  
  // Append an SVG group
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
  // Initial Params
  var chosenXAxis = "poverty";
  var chosenYAxis = "healthcare";
  
  // function used for updating x-scale var upon click on axis label
  function xScale(censusData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
        d3.max(censusData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
    return xLinearScale;
  }
  
  function yScale(censusData, chosenYAxis) {
      // create scales
      var yLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenYAxis]) -4,
          d3.max(censusData, d => d[chosenYAxis]) +2
        ])
        .range([height, 0]);
      return yLinearScale;
  }
  
  // function used for updating xAxis var upon click on axis label
  function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }
  
  function renderYAxes(newYScale, yAxis) {
      var leftAxis = d3.axisLeft(newYScale);
    
      yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    
      return yAxis;
    }
  // function used for updating circles group with a transition to
  // new circles
  function renderXCircles(circlesGroup, newXScale, chosenXAxis) {
  
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("dx", d => newXScale(d[chosenXAxis]));
    return circlesGroup;
  }
  
  function renderXText(circlesGroup, newXScale, chosenXAxis) {
  
    circlesGroup.transition()
      .duration(1000)
      .attr("dx", d => newXScale(d[chosenXAxis]));
  
    return circlesGroup;
  }
  
  function renderYCircles(circlesGroup, newYScale, chosenYAxis) {
  
      circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]))
        .attr("dy", d => newYScale(d[chosenYAxis]));
      return circlesGroup;
    }
    function renderYText(circlesGroup, newYScale, chosenYAxis) {
  
      circlesGroup.transition()
        .duration(1000)
        .attr("dy", d => newYScale(d[chosenYAxis]));
    
      return circlesGroup;
    }
    
  // function used for updating circles group with new tooltip
  function updateToolTip(chosenXAxis, circlesGroup) {
  
    var xlabel;
    var x_perc;
    var ylabel;
  
    if (chosenXAxis === "poverty") {
      xlabel = "In Poverty (%)"
      x_label = "Poverty (%): "
    }
    else if (chosenXAxis === "age") {
      xlabel = "Age (Median)"
      x_label = "Age: "
    } 
    else  if (chosenXAxis === "income") {
      xlabel = "Household income (median)"
      x_label = "Income: $";
    }
  
    if (chosenYAxis === "healthcare") {
      ylabel = "Lacks Healthcare (%)"
      y_label = "Healthcare: ";
    }
    else if (chosenYAxis === "smokes") {
      ylabel = "Smokes (%)"
      y_label = "Smokes: ";
    } 
    else if (chosenYAxis === "Obese") {
      ylabel = "Obese (%)"
      y_label = "Obese: ";
    }
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${x_label} ${d[chosenXAxis]} <br>${y_label} ${d[chosenYAxis]}%`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
  }
  
  // Retrieve data from the CSV file and execute everything below
  d3.csv("./assets/data/data.csv").then(function(censusData, err) {
    if (err) throw err;
  
    // parse data
    censusData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.income = +data.income;
      data.age = +data.age;
      // y axis - parse int
      data.healthcare = +data.healthcare;
      data.obese = +data.obesity;
      data.smokes = +data.smokes;
    });
    // xLinearScale function above csv import
    var xLinearScale = xScale(censusData, chosenXAxis);
    // var yLinearScale = yScale(censusData, chosenYAxis);
    // Create y scale function
    var yLinearScale = yScale(censusData, chosenYAxis);
  
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // append y axis
    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .attr("transform", `translate(0, 0)`)
      .call(leftAxis);
  
    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(censusData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 17)
      .attr("fill", "red")
      .attr("opacity", ".5");
  
    var circlesText = chartGroup.append("g")
      .selectAll('text')
      .data(censusData)
      .enter()
      .append("text")
      .text(d => d.abbr)
      .attr("dx", d=> xLinearScale(d[chosenXAxis]))
      .attr("dy", d=> yLinearScale(d[chosenYAxis]))
      .classed(".stateText", true)
      .attr("font-family", "sans-serif")
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "10px")
      .style("font-weight", "bold")
      .attr("alignment-baseline", "central");
  
    // Create group for three x-axis labels
    var xlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    var povertyLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("xValue", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");
  
    var ageLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("xValue", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (median)");
  
      var incomeLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("xValue", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household income (median)");
  
  
    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
  
    // x axis labels event listener
    xlabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var xValue = d3.select(this).attr("xValue");
        if (xValue !== chosenXAxis) {
  
          // replaces chosenXAxis with value
          chosenXAxis = xValue;
  
          // console.log(chosenXAxis)
  
          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(censusData, chosenXAxis);
  
          // updates x axis with transition
          xAxis = renderXAxes(xLinearScale, xAxis);
  
          // updates circles with new x values
          circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);
          circlesText = renderXText(circlesText, xLinearScale, chosenXAxis);
  
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
  
          // changes classes to change bold text
          if (chosenXAxis === "poverty") {
              povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "age") {
              povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "income") {
              povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });
  
      // Y-axis
      var ylabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(0, ${height / 2})`);
  
    var healthcareLabel = ylabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", 0)
      .attr("y", -30)
      .attr("yValue", "healthcare") // value to grab for event listener
      .classed("active", true)
      .text("Lacks Healthcare (%)");
  
      var smokesLabel = ylabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", 0)
      .attr("y", -50)
      .attr("yValue", "smokes")
      .classed("inactive", true)
      .text("Smokes(%)");
  
    var obeseLabel = ylabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", 0)
      .attr("y", -70)
      .attr("yValue", "obese") // value to grab for event listener
      .classed("inactive", true)
      .text("Obese (%)");
  
    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenYAxis, circlesGroup);
  
    // x axis labels event listener
    ylabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var yValue = d3.select(this).attr("yValue");
        if (yValue !== chosenYAxis) {
  
          // replaces chosenXAxis with value
          chosenYAxis = yValue;
  
          // console.log(chosenXAxis)
  
          // functions here found above csv import
          // updates x scale for new data
          yLinearScale = yScale(censusData, chosenYAxis);
  
          // updates x axis with transition
          yAxis = renderYAxes(yLinearScale, yAxis);
  
          // updates circles with new x values
          circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);
          circlesText = renderYText(circlesText, yLinearScale, chosenYAxis);
  
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenYAxis, circlesGroup);
  
          // changes classes to change bold text
          if (chosenYAxis === "healthcare") {
              healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            obeseLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "smokes") {
              healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);
            obeseLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "obese") {
              healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            obeseLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });
  }).catch(function(error) {
    console.log(error);
  });
  }
  
  makeResponsive();
  
  // Event listener for window resize.
  // When the browser window is resized, makeResponsive() is called.
  d3.select(window).on("resize", makeResponsive);