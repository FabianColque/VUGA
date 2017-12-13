function comparison_matriz(){

  /*
  Example of data

  data = [{val: val1, di: di1}, ...]
  */


  var margin = {top: 20, right: 20, bottom: 120, left: 50};
  var width = 650;
  var height = 200;

  var chart = d3.select("#comparison-matrix")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom + 70)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  xChart = d3.scale.ordinal()
      .rangeRoundBands([0, width], 0.05);
          
  yChart = d3.scale.linear()
          .range([height, 0]);

  var xAxis = d3.svg.axis().scale(xChart).orient("bottom");
  var yAxis = d3.svg.axis().scale(yChart).orient("left");

  chart.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      
  //bottom axis
  chart.append("g")
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", function(d){
        return "rotate(-65)";
      });

  //add labels
  chart
    .append("text")
    .attr("transform", "translate(-35," +  (height+margin.bottom)/2 + ") rotate(-90)")
    .text("% Ocurrence");
      
  chart
    .append("text")
    .attr("transform", "translate(" + (width/2) + "," + (height + margin.bottom - 5) + ")")
    .text("Dimensions");

  this.update_comparison = function(data){

    draw_legend();

    
    xChart.domain(data.map(function(d){return d.di;}))
    yChart.domain([0, d3.max(data, function(d){return +d.val;})])

    var barWidth = width / data.length;

    chart.selectAll(".bar").remove();

    var bars = chart.selectAll(".bar")
      .data(data)

    //bars.exit().remove();  

    bars.enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", function(d, i){return i*barWidth + 1})
      .attr("y", function(d){return yChart( d.val); })
      .attr("height", function(d){return height - yChart(d.val)})
      .attr("width", barWidth - 1)
      .attr("fill", function(d, i){
        if(flag_comparison)
          if(i % 2 == 1)
            return "rgb(251,180,174)"
        return "rgb(179,205,227)"
      })

    

    chart.select(".y")
      .call(yAxis)

    chart.select(".xAxis")
      .attr("transform", "translate(0, " + height + ")")
      .call(xAxis)
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d){
          return "rotate(-65)";
        })
  }

  function draw_legend(){
    d3.selectAll("#comparison-legend *").remove();
    var lado = 25;

    var svg = d3.select("#comparison-legend")
      .append("svg")
      .attr("width", 300)
      .attr("height", 100)
      .append("g")
      .attr("transform", "translate(30,30)")

    svg.append("text")
    .text("Original")
    .attr("x", 1)
    .attr("y", 16)

    svg.append("rect")
    .attr("class", "cell-comparison")
    .attr("x", 55)
    .attr("width", lado*2)
    .attr("height", lado)
    .style("fill", "rgb(179,205,227)")


    if(flag_comparison){
      svg.append("text")
      .text("New group")
      .attr("x", 111)
      .attr("y", 16)

      svg.append("rect")
        .attr("class", "cell-comparison")
        .attr("x", 182)
        .attr("width", lado*2)
        .attr("height", lado)
        .style("fill", "rgb(251,180,174)")
    }


  }
}
