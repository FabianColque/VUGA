function myBrush(namediv){
	
	var divmain = namediv;

	var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 650 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

  var x, y;
  var brushYearStart, brushYearEnd;

  var concepts = {}

  this.init = function(){
 		d3.select("#timerow").style("display", "block");
  }

  this.resetBrush_all = function(){
    resetBrush()
  }

  this.getConcepts = function(){
    return concepts;
  }

  this.resetConcepts = function(){
    concepts = {}
    console.log("sherlok", concepts)
  }

  this.update = function(data){

  	//formato data
		//data = [{"year": "1", "freq": "12", "enfalso": 1}, {"year": "2", "freq": "45", "enfalso": 1}] 
    //enfalso no sirve como dato, solo sirve para que no se malogre el brush 	
    d3.select(divmain).selectAll("*").remove();


  	//brushYearStart = 1931;
		//brushYearEnd = 2018;

    var maximini = d3.extent(data, function(d){return parseInt(d.year)})
    brushYearStart = maximini[0]
    brushYearEnd  =maximini[1]

    console.log("hols maximini", maximini)

		x = d3.scale.ordinal().rangeBands([35, width-20])//rangeRoundBands([25, width-20], .1);
		y = d3.scale.linear().range([height, 0]);

  	var barchart = d3.select(divmain).append("svg")
    .attr("class", "barchart")
    .attr("width", "100%")
		.attr("height", height + margin.top + margin.bottom)
		//.attr("y", height - height - 100)
		.append("g");
  	
  	var z = d3.scale.ordinal().range(["#66c2a5", "white"]);

  	var brushYears = barchart.append("g")
		brushYears.append("text")
    .attr("id", "brushYears")
    .classed("yearText", true)
    .text(brushYearStart + " - " + brushYearEnd)
    .attr("x", 35)
    .attr("y", 12);

    data.forEach(function (d) {
        d["freq"] = +d["freq"];
        //d["year"] = d3.time.format("%Y").parse(d["year"]).getFullYear();
        d["year"] = d["year"]
    });

    var freqs = d3.layout.stack()(["freq", "ef"].map(function (type) {
        return data.map(function (d) {
            return {
                x: d["year"],
                y: +d[type]
            };
        });
    }));

    x.domain(freqs[0].map(function (d) {
        return d.x;
    }));
    y.domain([0, d3.max(freqs[freqs.length - 1], function (d) {
        return d.y0 + d.y;
    })]);

    fabian  = x

    //arreglar por que no son los anhos correctos
    //x_axis = d3.svg.axis().scale(x).tickValues([1850, 1855, 1860, 1865, 1870, 1875, 1880, 1885, 1890, 1895, 1900]).orient("bottom");
    x_axis = d3.svg.axis().scale(x).orient("bottom");
    y_axis = d3.svg.axis().scale(y).orient("left");


    barchart.append("g")
      .attr("class", "x axis")
      .style("fill", "#000")
      .attr("transform", "translate("+(-x.rangeBand()/2)+"," + (height+2) + ")")//-x.rangeBand()
      .call(x_axis);

    // y axis
    barchart.append("g")
      .attr("class", "y axis")
      .style("fill", "#000")
      .attr("transform", "translate(" + 30 + ",0)")//(width - 85)
      .call(y_axis);

    // Add a group for each cause.
    var freq = barchart.selectAll("g.freq")
      .data(freqs)
    .enter().append("g")
      .attr("class", function(d, i){return "freq" + i})
      .style("fill", function (d, i) {
          return z(i);
      })
      .style("stroke", function(d, i){
        //console.log(d, i);
        if(i == 0 )
          return "#CCE5E5";
        //return null;  
      });

    // Add a rect for each date.
    rect = freq.selectAll("rect")
      .data(Object)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function (d) {
          return x(d.x);
      })
      .attr("y", function (d) {
          return y(d.y0) + y(d.y) - height;
      })
      .attr("height", function (d) {
          return height - y(d.y);
      })
      .attr("width", x.rangeBand())
      .attr("id", function (d) {
          return d["year"];
      });
    
    // Draw the brush
    brush = d3.svg.brush()
        .x(x)
        .on("brush", brushmove)
        .on("brushend", brushend);

    var arc = d3.svg.arc()
      .outerRadius(height / 15)
      .startAngle(0)
      .endAngle(function(d, i) { return i ? -Math.PI : Math.PI; });

    brushg = barchart.append("g")
      .attr("class", "brush")
      .call(brush);

    brushg.selectAll(".resize").append("path")
        .attr("transform", "translate(0," +  height / 2 + ")")
        .attr("d", arc);

    brushg.selectAll("rect")
        .attr("height", height);  



    d3.select(divmain).selectAll(".x.axis").style("font-size", function(d){
      if(data.length <= 5)
        return "19px"
      return "9px"
    })

  }


  // ****************************************
  // Brush functions
  // ****************************************

  function brushmove() {
      y.domain(x.range()).range(x.domain());
      b = brush.extent();

      var localBrushYearStart = (brush.empty()) ? brushYearStart : Math.ceil(y(b[0])),
          localBrushYearEnd = (brush.empty()) ? brushYearEnd : Math.ceil(y(b[1]));

      // Snap to rect edge
      d3.select(divmain).select("g.brush").call((brush.empty()) ? brush.clear() : brush.extent([y.invert(localBrushYearStart), y.invert(localBrushYearEnd)]));

      // Fade all years in the histogram not within the brush
      d3.select(divmain).selectAll("rect.bar").style("opacity", function(d, i) {
        return d.x >= localBrushYearStart && d.x < localBrushYearEnd || brush.empty() ? "1" : ".4";
      });
  }

  function brushend() {

    var localBrushYearStart = (brush.empty()) ? brushYearStart : Math.ceil(y(b[0])),
        localBrushYearEnd = (brush.empty()) ? brushYearEnd : Math.floor(y(b[1]));

      d3.select(divmain).selectAll("rect.bar").style("opacity", function(d, i) {
        return d.x >= localBrushYearStart && d.x <= localBrushYearEnd || brush.empty() ? "1" : ".4";
      });

    // Additional calculations happen here...
    // filterPoints();
    // colorPoints();
    // styleOpacity();

    // Update start and end years in upper right-hand corner of the map
    d3.select(divmain).select("#brushYears").text(localBrushYearStart == localBrushYearEnd ? localBrushYearStart : localBrushYearStart + " - " + localBrushYearEnd);

    //mandar a server
    var da_usu = evt.top(Infinity).map(function(d){return d.id})
    var dom_x = x.domain()
    var val = "";
    console.log("dom_x", dom_x, localBrushYearStart, localBrushYearEnd)
    var da_ye = []
    concepts = {}
    for(var ii = 0; ii < dom_x.length; ii++){
      if(dom_x[ii] >= localBrushYearStart && dom_x[ii] <= localBrushYearEnd){
        da_ye.push(dom_x[ii].toString())
        concepts[dom_x[ii].toString()] = 1;
        val += dom_x[ii].toString()
        val += "|"
      }
    }
    redraw_timeChart = false
    var da_res = post_to_server_global({"dbname": name_dataset, "data_selected": da_usu, "years_selected": da_ye}, "getUsersbyRangeYear");
    if(brush.empty()){
      text_search_chart.filterAll()
      dc.renderAll()
      /*$("#col0_filter").val("")
      $("#id_tabla_obj2").DataTable().column(2).search(
        "",
        true,
        true
      ).draw();*/
    }else{
      text_search_chart.filter(function(d){if(d in da_res)return true})
      dc.renderAll()
      /*if(val.length >= 5)
        val = val.slice(0, -1) 
      $("#col0_filter").val(val)
      $("#id_tabla_obj2").DataTable().column(2).search(
        val,
        true,
        true
      ).draw();*/
    }  
  }

  function resetBrush() {
    brush
      .clear()
      .event(d3.select(divmain).select(".brush"));
  }

}