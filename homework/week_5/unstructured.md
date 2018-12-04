// Ruchella kock
// 12460796
window.onload = function()
{
  load()
};

function load()
{
  var padding = 5;
  var margin = {top: 20, right: 30, bottom: 70, left: 0};
  var width = 1000 - margin.left - margin.right;
  var height = 1000 - margin.top - margin.bottom;

  var myTool = d3.select("body")
      .append("div")
      .attr("class", "mytooltip")
      .style("display", "none");

   // make SVG
   var svg =   d3.select("body")
               .append("svg")
               .attr("class", "chart")
               .attr("width", width + margin.left + margin.right)
               .attr("height", height + margin.top + margin.bottom);

  // get the x data
  d3.json("consconf.json")
  .then(function(data)
  {
    // data.forEach(function (x) {console.log(x.time)})
    var xScale = d3.scaleLinear().domain([0, d3.max(data, function(d) { return d.datapoint; })]).range([0, width]);
    console.log(xScale(99.09))
    console.log("msti")

    // get the y data
    d3.json("msti.json")
    .then(function(data)
    {
      // data.forEach(function (x) {console.log(x.datapoint)})
      var yScale = d3.scaleLinear().domain([0, d3.max(data, function(d) { return d.datapoint; })]).range([0, height]);
      console.log(yScale(10))
      var yAxis = d3.axisLeft()
                    .scale(yScale);
                  svg.append("g")
                     .attr("transform", "translate(0," + (height - padding) + ")")
                     .call(yAxis);
    });



     // make xAxis
      var xAxis = d3.axisBottom()
                     .scale(xScale);

                  svg.append("g")
                     .attr("transform", "translate(20, 50)")

                     .call(xAxis);
  });



  // consconf.then(function(result){
  //   console.log(result)
  // })

  // msti.then(function(result){
  //   console.log(result.time)
  // })
}
