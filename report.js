var margin = {top: 10, right: 245, bottom: 60, left: 255},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleLog()
    .domain([0.01, 100])
    .range([0, width]);

var y = d3.scaleLinear()
    .domain([0, 80])
    .range([ height, 0]);

svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickFormat(d3.format(".2")))
    .selectAll("text")
    .attr("y", 0)
    .attr("x", 9)
    .attr("dy", ".35em")
    .attr("transform", "rotate(90)")
    .style("text-anchor", "start");

svg.append("g")
    .call(d3.axisLeft(y));

svg.append("text")             
    .attr("transform",
          "translate(" + (width/2) + " ," + 
                        (height + margin.top + 40) + ")")
    .style("text-anchor", "middle")
    .text("Concentration (uM)");

svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - 50)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Binding function");     

d3.json("data.json")
.then((data)=> {
    console.log(data);

    svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) { return x(d.concentration); } )
    .attr("cy", function (d) { return y(d.binding); } )
    .attr("r", 3)
    .style("fill", "#111111");

    var lineGenerator = d3.line()
    .x(d => x(d[0]))
    .y(d => y(d[1]));

    var regressionGenerator = d3.regressionPoly()
        .x(d => d.concentration)
        .y(d => d.binding)
        .domain([0.01, 100])(data);

    svg.append("path")
      .datum(regressionGenerator)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", lineGenerator);
    
    console.log(regressionGenerator);
});