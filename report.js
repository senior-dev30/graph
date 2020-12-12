var widthW = window.innerWidth;
var heightW = window.innerHeight;

var margin = {top: 20, right: 20, bottom: 100, left: 50},
    width = widthW * 3 / 4 - margin.left - margin.right,
    height = heightW * 3 / 4 - margin.top - margin.bottom;

var y = d3.scaleLog()
    .range([height, 0]);

var zoom = d3.zoom()
.scaleExtent([1, 4])
.on("zoom", zoomed);

var container = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .call(zoom)

var svg = container
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var x = d3.scaleLog()
    .domain([0.01, 100])
    .range([0, width]);

var x0 = d3.scaleLog()
    .domain([0.01, 100])
    .range([0, width]);

var y = d3.scaleLinear()
    .domain([0, 80])
    .range([ height, 0]);

var y0 = d3.scaleLinear()
    .domain([0, 80])
    .range([ height, 0]);

var line = d3.line()
    .x(d => x(d[0]))
    .y(d => y(d[1]));

var xAsix = d3.axisBottom(x)
            .tickFormat(d3.format(""));

svg.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(xAsix);

svg.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("class", "axis-title")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end");

svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - 50)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Binding function");  

svg.append("text")             
    .attr("transform",
          "translate(" + (width/2) + " ," + 
                        (height + margin.top + 40) + ")")
    .style("text-anchor", "middle")
    .text("Concentration (uM)");

svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var path;
var dots;

var ticks = d3.select(".axis--x").selectAll(".tick text");
ticks.each(function(_,i){
    // console.log(_);
    // if(i%9 !== 0) d3.select(this).remove();
    var arr = [0.01, 0.1, 1, 10, 100, 100];

    if (!arr.includes(_)){
        d3.select(this).text("");
    }
});

d3.json("data.json")
.then((data)=> {
    var regressionGenerator = d3.regressionPoly()
        .x(d => d.concentration)
        .y(d => d.binding)
        .domain([0.01, 200])(data);

    dots =
        svg
        .append("g")
        .attr("class","g-line")
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x(d.concentration); } )
        .attr("cy", function (d) { return y(d.binding); } )
        .attr("r", 3)
        .style("fill", "#111111")
        .on("mouseover", function(d, i) {
            div.transition()
             .duration(200)
             .style("opacity", .9);
    
            div.html(`<div><span class="title">x:</span> ${d.concentration}</div><div><span class="title">y:</span>${d.binding}</div>`)
             .style("left", (d3.event.pageX) + "px")
             .style("top", (d3.event.pageY - 58) + "px");

             d3.select(this).attr("r", 5);
        })
        .on("mouseout", function(d) {
            div.transition()
            .duration(500)
            .style("opacity", 0);

            d3.select(this).attr("r", 3);
        });

    path =     
        svg
        .append("path")
        .attr("class","g-line")
        .datum(regressionGenerator)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", line);

    const pathLength = path.node().getTotalLength();
    const transitionPath = d3
        .transition()
        .ease(d3.easeSin)
        .duration(2500);

    path
        .attr("stroke-dashoffset", pathLength)
        .attr("stroke-dasharray", pathLength)
        .transition(transitionPath)
        .attr("stroke-dashoffset", 0);

    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        // .style("pointer-events", "all")
        // .call(d3.zoom()
        // .scaleExtent([1 / 2, 4])
        // .on("zoom", zoomed));
});

function zoomed() {
    var t = d3.event.transform;
    x.domain(t.rescaleX(x0).domain());
    y.domain(t.rescaleY(y0).domain());
    path.attr("d", line);
    dots.attr("cx", function (d) { return x(d.concentration); } )
    .attr("cy", function (d) { return y(d.binding); } );

    svg.select(".axis--x").call(xAsix);
    svg.select(".axis--y").call(d3.axisLeft(y));

    if (t.k <= 1.5) {
        var ticks = d3.select(".axis--x").selectAll(".tick text");
        ticks.each(function(_,i){
            // console.log(_);
            // if(i%9 !== 0) d3.select(this).remove();
            console.log(t.k);
            var arr = [0.01, 0.1, 1, 10, 100, 100];
            if (!arr.includes(_)){
                d3.select(this).text("");
            }
        });
    }
}  

var btnReset = document.getElementById("btn-reset");
btnReset.addEventListener("click", () => {
    console.log("AAA");

    container.transition()
    .duration(750)
    .call(zoom.transform, d3.zoomIdentity);
});