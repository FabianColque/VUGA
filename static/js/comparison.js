function comparison_matriz(name_, div){

  /*
  Example of data

  data = [{val: val1, di: di1}, ...]
  */

  var nameChart = name_;
  var divChart = div;
  var divFather = "";

  var data_normal = []
  var data_simi = []

  var margin = {top: 20, right: 20, bottom: 120, left: 50};
  var width = 450;
  var height = 200;
  //hasta aqui bien
  var colores_movielens = ["#e6194b", "#3cb44b", "#ffe119", "#0082c8", "#f58231", "#911eb4", "#46f0f0", "#f032e6", "#d2f53c", "#fabebe", "#008080", "#e6beff", "#aa6e28", "#800000", "#aaffc3", "#808000", "#ffd8b1", "#000080", "#b15928", "#6a3d9a", "#33a02c"]


  var chart = d3.select(divChart)
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
    .text("% Similarity");
      
  chart
    .append("text")
    .attr("transform", "translate(" + (width/2) + "," + (height + margin.bottom - 5) + ")")
    .text("Dimensions");

  draw_legend();  

  this.update_comparison = function(data){
    update_(data);

    /*d3.select("#comparison-matrix").select(".y.axis")
      .selectAll("text")
      .*/
  }

  function update_(data){

    data_normal = data
    
    //d3.select("#rectNewgroup").style("fill-opacity", function(){if(flag_comparison)return 1;return 0;})
    //d3.select("#textNewgroup").style("fill-opacity", function(){if(flag_comparison)return 1;return 0;})    
    //d3.select("#selectModeComparison").style("visibility", function(){if(flag_comparison)return "visible";return "hidden";})
      //.property("value", "Default")
    d3.select("#selectModeComparison").style("visibility", "hidden")

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
        //if(flag_comparison)
          //if(i % 2 == 1)
            //return "rgb(251,180,174)"
        //return "rgb(179,205,227)"
        return colores_movielens[i];
      })
      .append("title")
      .text(function(d){
        return parseFloat(d.val).toFixed(3);
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
    .attr("id", "textOriginal")
    .text("Original")
    .attr("x", 1)
    .attr("y", 16)

    svg.append("rect")
    .attr("class", "cell-comparison")
    .attr("id", "rectOriginal")
    .attr("x", 55)
    .attr("width", lado*2)
    .attr("height", lado)
    .style("fill", "rgb(179,205,227)")


    svg.append("text")
      .attr("id", "textNewgroup")
      .text("New group")
      .attr("x", 111)
      .attr("y", 16)
      .style("visibility", false)

    svg.append("rect")
        .attr("class", "cell-comparison")
        .attr("id", "rectNewgroup")
        .attr("x", 182)
        .attr("width", lado*2)
        .attr("height", lado)
        .style("fill", "rgb(251,180,174)")
        .style("visibility", true)

    var comparison_options = ["Default", "Similarity"]
    d3.select("#comparison-legend")
      .append("select")
      .attr("id", "selectModeComparison")
      .on("change", function(){
        change_visComparison(this.value)
      })
      .selectAll("option")
      .data(comparison_options)
      .enter()
      .append("option")
      .attr("value", function(d){return d})
      .text(function(d){return d})


  }

  function change_visComparison(type){
    
    if(type == "Default"){
      update_(data_normal)
    }else{
      var newViz = {}
      for(var i = 0; i < data_normal.length; i++){
        if(data_normal[i]["di"] in newViz){
          newViz[data_normal[i]["di"]] = 1 - Math.abs(newViz[data_normal[i]["di"]] - data_normal[i]["val"])
        }else{
          newViz[data_normal[i]["di"]] = data_normal[i]["val"];
        }
      }

      var res = []
      for(var g in newViz){
        res.push({"di": g, "val": newViz[g]})
      }
      update_similarity(res)
    }

  }


  function update_similarity(data){

    

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
        return "rgb(190,174,212)"
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

}
