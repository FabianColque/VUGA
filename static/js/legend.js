/*
  data  = {selector: "", title: "",names: ["", "", ...], colors: ["", "", ...], hasChecks: 1 or 0}
*/

var legend = function(){
  var width = 185;
  var height = 130;
  var data;
  var id = "mylegend"

  this.init = function(data_){

    
    data = data_;

    d3.select(data.selector + " #" + id).remove();
    d3.select(data.selector)
      .append("div")
      .attr("class", "container")
      .attr("id", id)
      .style("text-align","center")
      .style("width", width + "px")
      .style("height", height + "px")
      .style("padding","2px")
      .style("font","12px sans-serif")
      .style("background","#fff")
      .style("border","1px dashed #1b1a19")
      .style("position", "absolute")
      .style("top", "8px")
      .style("left", "8px")

      if(data.colors.length > 7)
        d3.select(data.selector + " .container")
          .style("overflow-y", "scroll")      
      
  }

  this.start = function(){

    
    d3.selectAll(data.selector + " #" + id + " *").remove();
    var midiv = d3.select(data.selector + " #" + id);
    if(data.mode == "dynamic"){
      var str = "";
      str += "<strong>" + "<u>" + data.title + "</u>" + "</strong>";
      midiv.html(str);
      legend_dynamic();
      
    }else{
      var info = get_divFormatToolTip()
      
      midiv.html(info);
      if(data.hasChecks == 1)
        click_checkbox();  
    }

    update_points();
  }

  this.updateAll = function(data_){
    data = data_;
    d3.selectAll(data.selector + " #" + id + " *").remove();
    var midiv = d3.select(data.selector + " #" + id);
    var info = get_divFormatToolTip()
    midiv.html(info)
  }

  function update_points(){
    var liminf = 0;
    var limsup = 0;
    var scaleColor = d3.scale.linear();
    if(data.mode == "static"){
      var sol = data.names.length-1;
      var eu = d3.range(sol+1).map(function(d){return d * 1/sol})
      scaleColor.domain(eu).range(get_array_consecutives(data.names.length))
    }else{
      newdom = []
      limsup = data.outlier[0] + data.outlier[3]
      liminf = data.outlier[0] - data.outlier[3]
      if(liminf < 0)liminf = 0
      if(limsup > 1)limsup = 1
      hdelta = (limsup - liminf)/8;//9-1
      newdom = d3.range(9).map(function(d, i){return liminf + hdelta*i})
      //scaleColor.domain([0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1]).range(get_array_consecutives(5))
      scaleColor.domain(newdom).range(get_array_consecutives(9))
    }  
    //console.log("outlier", data.outlier)
    //res["outlier"] = [med, q1, q3, lim]
    

    all_values_rev = []
    d3.selectAll(data.selector + " .pointDots")
      .style("fill", function(d, i){
        
        val_aux = data.body[d[2]]
        all_values_rev.push(val_aux)
        var aux = data.body[d[2]];
        
        if(data.mode == 'dynamic'){
          if(val_aux >= data.outlier[0]){
            if(val_aux > limsup)aux = limsup
          }else{
            if(val_aux < liminf)aux = liminf
          }
        }
        return data.colors[Math.round(scaleColor(aux))]
        /*var  aux = 0;
        if(data.body[d[2]] > 0.125)
          aux = 1
        else
          aux = 8 * data.body[d[2]]
        //return "#081d58"
        return data.colors[Math.round(scaleColor(aux))]*/
        //return data.colors[Math.round(scaleColor(data.body[d[2]]))]
    })
  }

  function get_array_consecutives(num){
    var res = []
    res = d3.range(num).map(function(d){return d})
    return res;
  }

  function legend_dynamic(){
    var svg = d3.select(data.selector + " #" + id)
      .append("svg")
      .attr("width", 160)
      .attr("height", 100);

    var gradient = svg.append("defs")
      .append("linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%")
        .attr("spreadMethod", "pad");

    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", data.colors[0])
        .attr("stop-opacity", 1);

    gradient.append("stop")
        .attr("offset", "12.5%")
        .attr("stop-color", data.colors[1])
        .attr("stop-opacity", 1);

    gradient.append("stop")
        .attr("offset", "25%")
        .attr("stop-color", data.colors[2])
        .attr("stop-opacity", 1);

    gradient.append("stop")
        .attr("offset", "37.5%")
        .attr("stop-color", data.colors[3])
        .attr("stop-opacity", 1);

    gradient.append("stop")
        .attr("offset", "50%")
        .attr("stop-color", data.colors[4])
        .attr("stop-opacity", 1);

    gradient.append("stop")
        .attr("offset", "62.5%")
        .attr("stop-color", data.colors[5])
        .attr("stop-opacity", 1);

    gradient.append("stop")
        .attr("offset", "75%")
        .attr("stop-color", data.colors[6])
        .attr("stop-opacity", 1);

    gradient.append("stop")
        .attr("offset", "87.5%")
        .attr("stop-color", data.colors[7])
        .attr("stop-opacity", 1);    

    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", data.colors[8])
        .attr("stop-opacity", 1);

    svg.append("rect")
        .attr("width", 160)
        .attr("height", 60)
        .attr("y", "30%")
        .style("fill", "url(#gradient)"); 
       

    svg.append("text")
      .text(data.names[0])
      .attr("y", "20%")
      .attr("x", "5%")    
    svg.append("text")
      .text(data.names[1])
      .attr("y", "20%")
      .attr("x", "84%")  
  }

  function get_divFormatToolTip(){
    
    //explore_clicked = mychartNew.getExplore_Clicked();
    explore_clicked = false;
    var str = "";
    str += "<strong>";
    str += "<u>";
    str += data.title;
    str += "</u>";
    str += "</strong>";
    
    str += "<div class=\"col-sm-12\">";


    var visi = "visible";
    if(!data.hasChecks)visi = "hidden";
    
    for (var i = 0; i < data.names.length; i++) {
    
        str += "<div class=\"row\">"
        
        str += "<input class=\"col-sm-1\" id = \"check"+i+"\" style=\"width:11px;height:11px;visibility:" + visi + "\" type=\"checkbox\" name=\"mycheckbox\" value=\""+i+"\" checked>";
        
        str += "<div id = \"nom"+i+"\" class=\"col-sm-9\" style=\"top:4px\">";
        str += data.names[i];
        str += "</div>";

        str += "<div id = \"color"+i+"\" class=\"col-sm-2\" style=\"background-color: "+data.colors[i]+"; height: 13px; width:6px; top:4px; padding-right: 0px \">";
        str += "</div>";


        str += "</div>";            
    };

    str += "</div>";

    

    return str;
  }

  var click_checkbox = function(){
        
        d3.selectAll(data.selector + " #mylegend input")
            .on("click", function(d,i){
                

                var rec_color = d3.select(data.selector + " #mylegend #color"+i).style("background-color");
                //if now is checked
                if(this.checked){
                    
                    d3.selectAll(data.selector + " .pointDots")
                        .style("visibility", function(d, u){
                            
                            if(this.style.fill == rec_color){
                                
                                return "visible";
                            }
                            return this.style.visibility;
                        })
                }else{
                    d3.selectAll(data.selector + " .pointDots")
                        .style("visibility", function(d, u){
                            if(this.style.fill == rec_color){
                                return "hidden";
                            }
                            return this.style.visibility;
                        })
                }
            })
    }
}