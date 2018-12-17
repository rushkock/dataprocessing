// Ruchella kock
// 12460796
// description: this script makes a map of the US and a bar chart with tooltips
// Realized with help from:
// https://bl.ocks.org/mbostock/4090848
// http://bl.ocks.org/micahstubbs/8e15870eb432a21f0bc4d3d527b2d14f
// note: sorry didnt have enough time to optimize my code

window.onload = function()
{
  var requests = [d3.json("https://d3js.org/us-10m.v1.json"), d3.json("disorders.json")];

  Promise.all(requests).then(function(response) {
     states = preprocessing(response)
     barMargins = {top: 0, right: 30, bottom: 50, left: 50}
     svgWH = makeSVG("bar", 300, 300, barMargins)
     makeMap(svgWH, response, states);

  }).catch(function(e){
      throw(e);
  });
}
var bars;

///////////////////////////////////////////////////////////////////////////////
/////////////////        Functions for the map          //////////////////////
//////////////////////////////////////////////////////////////////////////////

function makeMap(svgWH, response, states){
  // this functions makes a svg, draws a map of united states and has a tooltip
  // with data information
  // onclick update the barchart

  var margin = {top: 0, right: 0, bottom: 0, left: 0},
                width = 960 - margin.left - margin.right,
                height = 600 - margin.top - margin.bottom;

  var svg = d3.select(".map")
              .append("svg")
              .attr("width", width)
              .attr("height", height)
              .append('g')
              .attr('class', "map");

  var tooltip = d3.select("body")
                  .append("div")
                  .attr("class", "tooltip")
                  .style("opacity", 0);

  var path = d3.geoPath();

  var countryById = {};

  //http://colorbrewer2.org/#type=sequential&scheme=PuBu&n=5
  var color = d3.scaleLinear()
                .domain([15, 17, 19, 21, 23])
                .range(["#f1eef6", "#d0d1e6", "#74a9cf", "#2b8cbe", "#045a8d"]);

    svg.append("g")
       .attr("class", "states")
       .selectAll("path")
       .data(topojson.feature(response[0], response[0].objects.states).features)
       .enter()
       .append("path")
       .attr("d", path)
       .attr("fill", function(d, i) {
            foundColor = "";
            states.forEach(function(t) { if (t.FIPS == d.id){
            foundColor = color(t.percentage);}
        })
        return foundColor;})
       .style('stroke', 'white')
       .style('stroke-width', 1.5)
       .style("opacity",0.8)
       // on click show/make bar chart
       .on("click", function(d) {

            var y = d3.scaleLinear()
                      .domain([0, d3.max(states, function(d) { return d.upper_CI;})])
                      .range([svgWH["height"], 0]);

          // check if bars exist, if they don't make them, if they do update them
            if(bars === undefined){
              makeBarChart(selectedState, y, svgWH, tooltip)}
            else{
              update(selectedState, y, svgWH, tooltip)}
       })
       // on mouseover show tooltip
       .on("mouseover", function(d) {
           tooltip.transition()
                  .duration(10)
                  .style("opacity", 1)
                  .style("stroke","black")
                  .style("stroke-width", 5);

            selectedState = getSelectedState(d)
            tooltip.html("<div id='thumbnail'><span> State: "
                         + selectedState.state + "<br> Percentage: "
                         + selectedState.percentage + "%")
                   .style("left", (d3.event.pageX) + "px")
                   .style("top", (d3.event.pageY) + "px");
        })
       .on("mouseout", function(d) {
           tooltip.transition()
                  .duration(500)
                  .style("stroke","white")
                  .style("opacity", 0);
          });

  svg.append("path")
      .attr("class", "state-borders")
      .attr("d", path(topojson.mesh(response[0], response[0].objects.states,
          function(a, b) { return a !== b; })));
  makeLegend(svg, color, width);

};

// this functions makes the legends and writes the text
// source : https://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient.html
function makeLegend(svg, color, width)
{
  var defs = svg.append("defs");

  var linearGradient = defs.append("linearGradient")
                           .attr("id", "linear-gradient");

      // chosen horizontal gradient
      linearGradient.attr("x1", "0%")
                    .attr("y1", "0%")
                    .attr("x2", "100%")
                    .attr("y2", "0%");

      // set the color for the start
      linearGradient.append("stop")
                    .attr("offset", "0%")
                    .attr("stop-color", "#f1eef6");

      // set the color for the end
      linearGradient.append("stop")
                    .attr("offset", "100%")
                    .attr("stop-color", "#045a8d");

    // draw the rectangle and fill with gradient
    svg.append("rect")
        .attr("width", 300)
        .attr("x", width/3)
        .attr("y", 10)
        .attr("height", 20)
        .style("fill", "url(#linear-gradient)");

    // append title
    svg.append("text")
    	 .attr("class", "legendTitle")
    	 .attr("x", width/3)
    	 .attr("y", 10)
    	 .text("Percentage of people with a mental disorder");

    //Set scale for x-axis
    var xScale = d3.scaleLinear()
    	             .range([0, 300])
    	             .domain([15, 23]);

    // make xAxis
    var xAxis = d3.axisBottom(xScale);

    svg.append("g")
       .attr("class", "x axis")
       .attr("transform", "translate("+ width/3+ "," + 30 + ")")
       .call(xAxis);
}

///////////////////////////////////////////////////////////////////////////////
/////////////////        Functions for the bar chart    //////////////////////
//////////////////////////////////////////////////////////////////////////////

function makeSVG(classname, w, h, margin)
{
  var width = w - margin.left - margin.right,
      height = h - margin.top - margin.bottom;

  var svg = d3.select(".CIbox")
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr('class', classname)
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  return {"width": width, "height": height};
}

function makeBarChart(data, y, svgWH, tooltip)
{
  var width = svgWH["width"];
  var height = svgWH["height"];
  var processedData = processBarData(data, y, svgWH);
  var CIs = processedData[0];
  var x = processedData[1];
  var svg = processedData[2];

  // add the x Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  // add x label
  svg.append("text")
     .attr("y", height + 35)
     .attr("x", width / 4)
     .style("font-size", "15px")
     .text("Confidence Interval");

  // add the y Axis
  svg.append("g")
      .call(d3.axisLeft(y));

  // add y label
  svg.append("text")
     .attr("transform", "rotate(-90)")
     .attr("y", -25)
     .attr("x", - 200)
     .style("font-size", "15px")
     .text("Percentage");

     // width, height, x and y
     function makeX(d) {return x(d[0]);};
     function makeY(d) {return  y(d[1]);};
     var widthRect = x.bandwidth();
     var heightRect = function(d) {return height - y(d[1])};

   bars = svg.selectAll("rect");

   bars.data(CIs)
       .enter()
       .append("rect")
       .attr("x", makeX)
       .attr("y", makeY)
       .attr("width", widthRect)
       .attr("height", heightRect)
       .attr("fill", "#0c2c84")
       .on("mouseover", function(d) {
            tooltip.transition()
                   .duration(200)
                   .style("opacity", .9);
            tooltip.html("<div id='thumbnail'><span>" + d[0] +": <br>"+ d[1] + "%")
                   .style("left", (d3.event.pageX) + "px")
                   .style("top", (d3.event.pageY) + "px");
        })
       .on("mouseout", function(d) {
            tooltip.transition()
                   .duration(500)
                   .style("opacity", 0);
      });
}

// this function updates the barchart onclick
function update(data, y, svgWH, tooltip)
{
  var width = svgWH["width"];
  var height = svgWH["height"];
  var processedData = processBarData(data, y, svgWH);
  var CIs = processedData[0];
  var x = processedData[1];
  var svg = processedData[2];

  function makeX(d) {return x(d[0]);};
  function makeY(d) {return  y(d[1]);};
  var widthRect = x.bandwidth();
  var heightRect = function(d) {return height - y(d[1])};

  svg.selectAll("rect")
     .data(CIs)
     .attr("x", makeX)
     .attr("y", makeY)
     .attr("width", widthRect)
     .attr("height", heightRect)
     .attr("fill", "#0c2c84")
     .on("mouseover", function(d) {
          tooltip.transition()
                 .duration(200)
                 .style("opacity", .9);
          tooltip.html("<div id='thumbnail'><span>" + d[0] +": <br>"+ d[1] + "%")
                 .style("left", (d3.event.pageX) + "px")
                 .style("top", (d3.event.pageY) + "px");
      })
     .on("mouseout", function(d) {
          tooltip.transition()
                 .duration(500)
                 .style("opacity", 0);
    });
}

///////////////////////////////////////////////////////////////////////////////
/////////////////        Functions that process data    //////////////////////
//////////////////////////////////////////////////////////////////////////////

// this function processes the data for the barchart
function processBarData(data, y, svgWH){
  var svg = d3.select(".bar");
  var CIs = [];
  CIs.push(["Upper CI", data.upper_CI]);
  CIs.push(["Lower CI", data.lower_CI]);

  var width = svgWH["width"];
  // set the ranges
  var x = d3.scaleBand()
            .range([0, width])
            .padding(0.1);
  x.domain(["Upper CI", "Lower CI"]);
  return [CIs, x, svg];
}

// this function processes the whole data set (states)
function preprocessing(response){
  var states = [];
  for (var i in response[1]){
    if (response[1][i].state === response[1][i].substate){
      states.push(response[1][i]); }
  }
  return states;
};

// this functions gets the states that the mouse is hovering over
function getSelectedState(d){
   selectedState = "";
   states.forEach(function(e) {
     if (e.FIPS == d.id){ selectedState = e;}
   })
   return selectedState;
};
