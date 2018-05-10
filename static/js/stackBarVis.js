function stackBarVis(){
  var width = 800;
  var height = 500;
  var margin = {top: 10, right: 0, bottom: 10, left: 30}

  var h_cell = 20;
  var divClass = ""
  var colores_movielens = colorsArray2//["#e6194b", "#3cb44b", "#ffe119", "#0082c8", "#f58231", "#911eb4", "#46f0f0", "#f032e6", "#d2f53c", "#fabebe", "#008080", "#e6beff", "#aa6e28", "#800000", "#aaffc3", "#808000", "#ffd8b1", "#000080", "#b15928", "#6a3d9a", "#33a02c"]
  var xw = null;
  var dataori = null;

  this.init = function(div){
    divClass = div;
    d3.select(divClass)
      .append("svg")
        .attr("width", width + margin.left + margin.right+50)
        .attr("height", height + margin.top + margin.bottom+50)
      .append("g")
      .attr("class", "stackBarClass")
      .attr("id", "idStack")
      .attr("transform", "translate(45,5)");
    //xw = d3.scale.ordinal().rangeBands([0, width])
    xw = d3.scale.linear().domain([0,1]).range([0, width]);
  }

  this.setDimensionsChart = function(w, h){
    width = w;
    height = h;
  }

  function transform_data(data, sorted_resume){
    var res = []
    for(var i = 0; i < data.length; i++){
      var aux = []
      var sum = 0.0;
      for(var j = 0; j < data[0].length; j++){
        var val_aux = data[i][sorted_resume[j]];
        if(val_aux > 1 || val_aux < 0)val_aux = 0.0
        aux.push({"val": val_aux, "x": i, "y": sorted_resume[j], "pos": sum})
        sum += val_aux;
      }
      res.push(aux);
    }

    return res;
  }

  this.clearAll= function(){
    d3.select(divClass).selectAll("#idStack" + " *").remove();
  }

  this.update = function(dat, names, sorted_resume){

    if(dat.length > 3){
      height = (h_cell+1) * dat.length+50;
      d3.select(divClass).select("svg").attr("height", height + margin.top + margin.bottom+80)
    }
    
    dataori = transform_data(dat, sorted_resume)
    
    //xw.domain(d3.range(dat[0].length).map(function(d){return d}))
    d3.select(divClass).selectAll("#idStack" + " *").remove();
    var rowStack = d3.select(divClass).select("#idStack").selectAll("#rowStack" + divClass)
      .data(dataori)
      .enter()
      .append("g")
        .attr("id", "rowStack" + divClass)
        .attr("transform", function(d, i){
          return "translate(0, " + i*h_cell +")";
        })
        .each(row_go)

    rowStack.append("line")
      .attr("x2", width)

    rowStack.append("text")
    .attr("x", -6)
    .attr("y", 10)
    .attr("dy", ".32em")
    .attr("text-anchor", "end")
    .style("font-size", "12px")
    .text(function(d, i){return names[i]}) 
   
    function row_go(row){
      var cell = d3.select(this).selectAll(".cellstack")
        .data(row)
        .enter()
        .append("g")
        .attr("class", "cellstack")
        .attr("transform", function(d, i){
          return "translate("+xw(d.pos) + ", 0)" 
        })
        .selectAll(".rectstack")
        .data(function(d){return [d]})
        .enter()
        .append("rect")
        .attr("class", "rectstack")
        .attr("width", function(d){
          if(xw(d.val) > 2)
            return xw(d.val)-0.8
          return xw(d.val)
        })
        .attr("height", function(d){return h_cell})
        .style("fill", function(d){return colores_movielens[d.y]})
        .attr("stroke", "black")
        .attr("stroke-width", "0.5")
        .append("title")
        .text(function(d){
          return parseFloat(d.val*100).toFixed(2) + " %"
        })
    }

  }
}