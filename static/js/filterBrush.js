function myBrush(namediv){
	
	var divmain = namediv;

	var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

  

  this.init = function(){
 		d3.select("#timerow").style("display", "block");
 		
 		var barChart = d3.select(divmain)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)	 	
    var context = svg.append('g')
			.attr('class', 'context')
			.attr('transform', "translate("+margin.left+", "+(margin.top)+")")

		


  }

  this.update = function(data){

  	//formato data
		//data = [{"id": "1", "tam": "12"}, {"id": "2", "tam": "45"}]  	

  	var brushYearStart = 1931;
		var brushYearEnd = 2018;

		var x = d3.scale.ordinal().rangeRoundBands([0, width - 60], .1);
		var y = d3.scale.linear().range([height, 0]);

  	var barchart = d3.select(divmain).append("svg")
    .attr("class", "barchart")
    .attr("width", "100%")
		.attr("height", height + margin.top + margin.bottom)
		.attr("y", height - height - 100)
		.append("g");
  	
  	var z = d3.scale.ordinal().range(["steelblue", "indianred"]);

  	var brushYears = barchart.append("g")
		brushYears.append("text")
    .attr("id", "brushYears")
    .classed("yearText", true)
    .text(brushYearStart + " - " + brushYearEnd)
    .attr("x", 35)
    .attr("y", 12);




  }
}