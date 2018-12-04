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
    update(response)
  }).catch(function(e){
      throw(e);
  });
};

// this function makes the x and y axes
function makeAxes(xny)
{
  d3.select("svg").remove();
  // add the tooltip area to the webpage
  var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  var margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var x = d3.scaleLinear()
      .range([0, width]);

  var y = d3.scaleLinear()
      .range([height, 0]);

  var cValue = function(d)
  {
    console.log(d.Country)
    return d.Country;
  };
  var color = d3.scaleOrdinal(d3.schemeCategory10);

  var xAxis = d3.axisBottom(x);

  var yAxis = d3.axisLeft(y);

  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  // consconf is on x Axis
  consconf = xny[0]

  // msti is on y Axis
  msti = xny[1]

  x.domain(d3.extent(xny, function(d) { return d[0].datapoint; })).nice();
  y.domain(d3.extent(xny, function(d) { return d[1].datapoint; })).nice();

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Sepal Width (cm)");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Sepal Length (cm)")

  svg.selectAll(".dot")
      .data(xny)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", function(d)
      {
        console.log(d[0].datapoint)
        return x(d[0].datapoint);
      })
      .attr("cy", function(d) { return y(d[1].datapoint); })
      .style("fill", function(d) { return color(d[1].Country);})
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html("<div id='thumbnail'><span>" + "Consconf: " + Math.round(d[0].datapoint * 10) / 10
          + "<br/> Msti: " +  Math.round(d[1].datapoint * 10) / 10 +  "</span></div>")
               .style("left", (d3.event.pageX + 10) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });

     var legend = svg.selectAll(".legend")
         .data(color.domain())
       .enter().append("g")
         .attr("class", "legend")
         .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

     legend.append("rect")
         .attr("x", width - 18)
         .attr("width", 18)
         .attr("height", 18)
         .style("fill", color);

     legend.append("text")
         .attr("x", width - 24)
         .attr("y", 9)
         .attr("dy", ".35em")
         .style("text-anchor", "end")
         .text(function(d) { return d; });
}

// this function loads the data into one array xny
function loadData(response, country)
{
    xny = []
    consconf = response[1]
    var i = 0;
    index = consconf.findIndex(function(element)
    {
      if (element.Country === country) {return element};
    });
    consconf = consconf.slice(index, index + 9);
    xny.push(consconf)

    msti =  response[0]
    indexes = getAllIndexes(msti, "2007", "2015")
    countryIndexes = {"France" : 0, "Germany": 2, "Korea" : 4, "Netherlands" : 6,
                        "Portugal" : 8, "United Kingdom" : 10}

    start = indexes[countryIndexes[country]]
    end = indexes[countryIndexes[country] + 1]
    msti = msti.slice(start, end + 1)
    xny.push(msti)
    return xny
}

function update(response)
{
  //On click, update with new data
     d3.selectAll(".m")
       .on("click", function()
       {
         var country = this.getAttribute("value");

         var str;
         if(country == "All")
         {
           xny = formatAllData(response)
           makeAxes(xny)
         }
         else if(country == "France")
         {
           callFunctions(response, "France")
         }
         else if(country == "Germany")
         {
          callFunctions(response, "Germany")
         }
         else if(country == "Korea")
         {
             callFunctions(response, "Korea")
         }
         else if(country == "Netherlands")
         {
             callFunctions(response, "Netherlands")
         }
         else if(country == "Portugal")
         {
            callFunctions(response, "Portugal")
         }
         else
         {
           callFunctions(response, "United Kingdom")
         }
       });
}

function callFunctions(response, country)
{
  xny = loadData(response, country);
  xny = formatData(xny)
  makeAxes(xny)
}

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

function getAllIndexes(arr, start, end)
{
  var indexes = [], i;
  for(i = 0; i < arr.length; i++)
  {
      if (arr[i].time === start)
      {
          indexes.push(i);
      }
      else if (arr[i].time === end)
      {
          indexes.push(i);
      }
  }
  return indexes;
}
