// Ruchella kock
// 12460796
// This program makes a scatterplot of two data sets
// Realized with help from:
// https://bl.ocks.org/sebg/6f7f1dd55e0c52ce5ee0dac2b2769f4b
// http://bl.ocks.org/weiglemc/6185069
window.onload = function()
{
  var womenInScience = "msti.json"
  var consConf = "consconf.json"
  var requests = [d3.json(womenInScience), d3.json(consConf)];

  Promise.all(requests).then(function(response) {
    xny = formatAllData(response);
    svg = makeSVG();
    makeAxes(svg, xny);
    update(svg, response);
  }).catch(function(e){
      throw(e);
  });
};
function makeSVG()
{
  var margin = {top: 25, right: 20, bottom: 30, left: 60},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var svg = d3.select("body")
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  return svg
}
// this function makes the x and y axes
function makeAxes(svg, xny)
{
  svg.selectAll("*").remove();
  var margin = {top: 25, right: 20, bottom: 30, left: 60},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var x = d3.scaleLinear()
            .range([0, width]);

  var y = d3.scaleLinear()
            .range([height, 0]);
// source colors: http://colorbrewer2.org/#type=diverging&scheme=RdYlBu&n=3
  var color = d3.scaleOrdinal()
                .domain(["France", "Germany", "Korea", "Netherlands", "United Kingdom"])
                .range(["#4575b4", "#d73027", "#e0f3f8", "#fc8d59", "#fee090", "#91bfdb"]);

  var xAxis = d3.axisBottom(x);
  var yAxis = d3.axisLeft(y);

  x.domain(d3.extent(xny, function(d) { return d[0].datapoint; })).nice();
  y.domain(d3.extent(xny, function(d) { return d[1].datapoint; })).nice();

  // make xAxis
  svg.append("g")
     .attr("class", "x axis")
     .attr("transform", "translate(0," + height + ")")
     .call(xAxis)

 svg.append("text")
     .attr("y", height)
     .attr("x", width - margin.right - margin.left)
     .style("font-size", "20px")
     .text("MSTI");

  // make Y Axis
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)

  svg.append("text")
     .attr("transform", "rotate(-90)")
     .attr("y", -margin.right - 20)
     .attr("x", -(height / 2))
     .style("font-size", "20px")
     .text("Consconf");


  var countryColors = {"France" : "#4575b4", "Germany": "#d73027",
                      "Korea" : "#e0f3f8", "Netherlands" : "#fc8d59",
                      "Portugal" : "#91bfdb", "United Kingdom" : "#fee090"}

  // draw the dots and exis depending on what data was chosen
  if (xny.length > 9)
  {
    drawDots(svg, x, y, function(d) { return color(d[1].Country)})
    makeLegend(svg, color, width)
  }
  else
  {
    drawDots(svg, x, y, color(xny[0][1].Country))
    var color = d3.scaleOrdinal()
              .domain([xny[0][1].Country])
              .range([countryColors[xny[0][1].Country]]);
    makeLegend(svg, color, width)
  }
}

function drawDots(svg, x, y, color)
{
  var tooltip = d3.select("body")
                  .append("div")
                  .attr("class", "tooltip")
                  .style("opacity", 0);

  var r = d3.scaleLinear()
            .range([5, 15])
            .domain([2007, 2015]);

  svg.selectAll(".dot")
     .data(xny)
     .enter()
     .append("circle")
     .attr("class", "dot")
     .attr("r", function(d) { return (r(d[0].time));})
     .attr("cx", function(d) { return x(d[0].datapoint);})
     .attr("cy", function(d) { return y(d[1].datapoint);})
     .style("fill", color)
     .style("stroke", "black")
     .on("mouseover", function(d) {
          tooltip.transition()
                 .duration(200)
                 .style("opacity", .9);

          tooltip.html("<div id='thumbnail'><span> Year: " + d[0].time +
                       "<br> Consconf: " + Math.round(d[1].datapoint * 10) / 10 +
                       "<br/> Msti: " +  Math.round(d[0].datapoint * 10) / 10 +
                       "</span></div>")
                 .style("left", (d3.event.pageX + 10) + "px")
                 .style("top", (d3.event.pageY - 28) + "px");
      })
     .on("mouseout", function(d) {
          tooltip.transition()
                 .duration(500)
                 .style("opacity", 0);
      });
}

// this functions makes the legends and writes the text
function makeLegend(svg, color, width)
{
  var r = d3.scaleLinear()
            .range([2.5, 3.5])
            .domain([2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015]);

  // make legend for the countries
  var legend = svg.selectAll(".legend")
                  .data(color.domain())
                  .enter()
                  .append("g")
                  .attr("class", "legend")
                  .attr("transform", function(d, i) {
                         return "translate(0," + i * 20 + ")";
                       });

      legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color)
            .style("stroke", "black");

      legend.append("text")
            .attr("x", width - 24)
            .attr("y", 10)
            .attr("dy", ".60em")
            .style("text-anchor", "end")
            .text(function(d) { return d; });

      // make legend for the circle radius
      // smaller value is a lower year, higher value is a higher year
      var legendR = svg.selectAll(".legend1")
                       .data(r.domain())
                       .enter()
                       .append("g")
                       .attr("class", "legend1")
                       .attr("transform", function(d, i) {
                             return "translate(0," + i * 20 + ")";
                           });

          legendR.append("circle")
                 .attr("cx", 13)
                 .attr("cy", 10)
                 .attr("r", function(d){ return r(d);} )
                 .style("fill", "white")
                 .style("stroke", "black");

          legendR.append("text")
                 .attr("x", 65)
                 .attr("y", 10)
                 .attr("dy", ".35em")
                 .style("text-anchor", "end")
                 .text(function(d) { return d; });
}

// this functions updates the data based on the chosen selection
function update(svg, response)
{
 d3.selectAll(".m")
   .on("click", function()
   {
     var country = this.getAttribute("value");

     if(country == "All"){
       xny = formatAllData(response)
       makeAxes(svg, xny)
     }else if(country == "France"){
       callFunctions(svg, response, "France")
     }else if(country == "Germany"){
      callFunctions(svg, response, "Germany")
     }else if(country == "Korea"){
         callFunctions(svg, response, "Korea")
     }else if(country == "Netherlands"){
         callFunctions(svg, response, "Netherlands")
     }else if(country == "Portugal"){
        callFunctions(svg, response, "Portugal")
     }else{
       callFunctions(svg, response, "United Kingdom")
     }
   });
}

// This function calls the necessary functions in the right order
function callFunctions(svg, response, country)
{
  xny = loadData(response, country);
  xny = formatData(xny)
  makeAxes(svg, xny)
}

// this function loads the data into one array x and y (xny)
function loadData(response, country)
{
    xny = []
    msti =  response[0]
    indexes = getAllIndexes(msti, "2007", "2015")
    countryIndexes = {"France" : 0, "Germany": 2, "Korea" : 4, "Netherlands" : 6,
                      "Portugal" : 8, "United Kingdom" : 10}

    start = indexes[countryIndexes[country]]
    end = indexes[countryIndexes[country] + 1]
    msti = msti.slice(start, end + 1)
    xny.push(msti)

    consconf = response[1]
    var i = 0;
    index = consconf.findIndex(function(element)
    {
      if (element.Country === country) {return element};
    });
    consconf = consconf.slice(index, index + 9);
    xny.push(consconf)

    return xny
}

// formats the data when a country is chosen
function formatData(xny)
{
  newXny = []

  times = ["2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015"]
  var i = 0;
  for (i in times)
  {
    list = []
    consconf = xny[0].findIndex(function(element){
      if (element.time === times[i]){return element}
    });

    msti = xny[1].findIndex(function(element){
      if (element.time === times[i]){return element}
    });

    if (msti !== -1 && consconf !== -1)
    {
      list.push(xny[0][consconf])
      list.push(xny[1][msti])
      newXny.push(list)
    }
  }
  return newXny
}

// formats the data when "all" is selected
function formatAllData(xny)
{
  newXny = []
  for (i in xny[0])
  {
    list = []
    list.push(xny[0][i])
    list.push(xny[1][i])
    newXny.push(list)
  }
  return newXny
}

// loops over the data to get the index of the years (2007 - 2015)
function getAllIndexes(arr, start, end)
{
  var indexes = [], i;
  for(i = 0; i < arr.length; i++)
  {
      if (arr[i].time === start){ indexes.push(i); }
      else if (arr[i].time === end){ indexes.push(i); }
  }
  return indexes;
}
