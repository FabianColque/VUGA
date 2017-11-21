var vis_projection = function(){
  var width = 600;
  var height = 450;

  var selector = "#areaMainsvg_projection";
  var id = "svg_projection" 

  //Scales for this class
  var xScale = d3.scale.linear().range([10,width-30]);
  var yScale = d3.scale.linear().range([10, height-30]);
  var scaleCircle;

  //variacle for the total data
  var data_proj = []

  //Minimum scale for each circle, we use to zoom
  var scalemax = 12;
  var scalemin = 1;
  var scalemax_range = 3;
  var scalemin_range = 1;

  //properties of circle
  var border_default_circle = "0.3px";

  //variable for lasso flag
  var lasso_active = false;

  //Variable for data selected with lasso
  var data_selected = []
  var explore_clicked = false;


  this.init = function(data){
    scalecircle = d3.scale.linear().domain([scalemin, scalemax]).range([scalemax_range,scalemin_range]);
    zoom = d3.behavior.zoom().scaleExtent([scalemin, scalemax]).on("zoom", zoommed);

    d3.selectAll(selector + " *").remove();

    d3.select(selector)
      .append("svg")
      .attr("class", "svgmain")
      .attr("id", id)
      .attr("width", width)
      .attr("height", height)
      .style("position", "relative")
      .style("left", "20%")
      .call(zoom)
      .append("g")
      .attr("class","chart_visUsers")
      .attr("id", "chart_visUsers"+id)
      .attr("transform", "translate(" + 0 + "," + 0 + ")");

    d3.select("#chart_visUsers"+id)
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")

    xScale.domain(d3.extent(data.map(function(d){return d[0]})));
    yScale.domain(d3.extent(data.map(function(d){return d[1]})));   

    data_proj = data.map(function(d,i){
      var f = [];
      f.push(xScale(d[0]));
      f.push(yScale(d[1]));
      f.push(i);
      return f;
    });

    this.draw_points();

    active_buttons();
  }

  /*****************GET DATA SELECTED*********************/
  this.getDataSelected =function(){
    return getdataselected();
  }

  var getdataselected = function(){
    data_selected = [...new Set(data_selected)];
    return data_selected;
  }
  /***********************************************************/

  this.draw_points = function(){
    d3.select("#chart_visUsers"+id)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .selectAll(".pointDots")
    .data(data_proj)
    .enter()
    .append("circle")
    .attr("class", "pointDots")
    .attr("id", function(d, i){return "pointDots"+d[2]})
    .attr("r", function(d){return scalecircle(1)})
    .attr("transform", function(d) { return "translate(" + d[0] + "," + d[1] + ")"; })
    .style("visibility", "visible")
    .style("opacity", 1)
    .style("fill", "#bdbdbd")
    .append("svg:title")
    .text(function(d){
      return d[2];
    });  
  }

  var zoommed = function() {
    var root = d3.select(selector + " #chart_visUsers"+id);  
    root.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    root.selectAll(".pointDots")
    .style("r", function(d){return scalecircle(zoom.scale())})
    .style("stroke-width", function(d, i){
      if(this.style.strokeWidth !== border_default_circle && this.style.strokeWidth){
        return scalecircle(zoom.scale())/2+"px";
      }
      return border_default_circle;
    })

  }

  //function to turn on/off the zoom/lasso
  var zoomSwitch = function(flat){
    var root = d3.select(selector + " #"+id);
    if(flat){//zoom on
      root.call(zoom);
    }else{//zoom off
      root.on(".zoom", null);
    }
  }

  //function to buttons switch - lassoreset - selectall - resetall
  var active_buttons = function(){
    d3.select("#switch-shadow")
    .on("click", function(){
      if(this.checked == true){
        lasso_on();
        zoomSwitch(false);
        lasso_active = true;

        d3.select("#btn_lassoreset").style("display", "block")
        d3.select("#btn_selectall").style("display", "block")
      }else{
        zoomSwitch(true);
        lasso_off();
        lasso_active = false;

        d3.select("#btn_lassoreset").style("display", "none")
        d3.select("#btn_selectall").style("display", "none")
      }
    })

    d3.select("#btn_lassoreset")
    .on("click", function(){
      resetLasso();
    })

    d3.select("#btn_selectall")
    .on("click", function(){
      selection_all_points();
    })

    d3.select("#btn_resetall")
    .on("click", function(){
      resetAll_projection();
    })  

  }

  var lasso_on = function(){
    var root = d3.select("#" + id);
    lasso = d3.lasso()
      .closePathDistance(2000)   // max distance for the lasso loop to be closed
      .closePathSelect(true)     // can items be selected by closing the path?
      .hoverSelect(true)         // can items by selected by hovering over them?
      .area(root)
      .items(d3.selectAll(selector + " .pointDots"))
      .on("start", function() { lasso_start(lasso); })   // lasso start function
      .on("draw", function() { lasso_draw(lasso); })     // lasso draw function
      .on("end", function() { lasso_end(lasso); });      // lasso end function
      root.call(lasso);
  }

  var lasso_off = function(){
    var root = d3.select("#" + id);
    root.on(".dragstart", null);
    root.on(".drag", null);
    root.on(".dragend", null);
  }

  var lasso_start = function(lasso){
    lasso.items()
    .classed("selected", false)
    //.attr("r", function(d){return scalecircle(zoom.scale()) + 2});
  }

  var lasso_draw = function(lasso){
    lasso.items().filter(function(d) {return d.possible===true})
    //.classed({"not_possible":false,"possible":true});
    // Style the not possible dot
    lasso.items().filter(function(d) {return d.possible===false})
    //.classed({"not_possible":true,"possible":false});
  }

  var lasso_end = function(lasso){
    var misitems = lasso.items();
    misitems
    .filter(function(d, i){
      if(d.selected === true && misitems[0][i].style.visibility == "visible"){
        data_selected.push(d[2]);
      }
      return (d.selected === true && misitems[0][i].style.visibility == "visible");
    })
    //.attr("r", function(d){return scalecircle(zoom.scale()) + 2})
    .style("stroke-width", scalecircle(zoom.scale())/2+"px")
    //.classed("not-possible", false)
    //.classed("possible", true);

    console.log("data_selected", data_selected)
  }

  var resetLasso = function(){
    d3.select(selector + " #chart_visUsers"+id)
    .selectAll(".pointDots")
    .style("stroke-width", border_default_circle)
    data_selected = [];
  }

  var selection_all_points = function(){
    var misitems = lasso.items();
    misitems
    .filter(function(d, i){
      //if(i==0)var_prova = misitems[0][i];
      if(misitems[0][i].style.visibility == "visible"){
          data_selected.push(d[2]);
      }
      return (misitems[0][i].style.visibility == "visible");
    })
    //.attr("r", function(d){return scalecircle(zoom.scale()) + 2})
    .style("stroke-width", scalecircle(zoom.scale())/2+"px")
  }

  var resetAll_projection = function(){
    var root = d3.select(selector + " #chart_visUsers"+id);
    root.selectAll(".pointDots")
    .style("visibility", "visible")
    .style("stroke-width", border_default_circle)
    .attr("r", function(d){return scalecircle(zoom.scale())});

    //d3.selectAll(tooldiv + " .tooltipA input")
    //.style("visibility", "visible")
    //.property("checked", true);   

    data_selected = [];   

    explore_clicked = false;    

    /*******************/
    //newhist.removeAll();
    /************************/     
  }


}//End of the main function