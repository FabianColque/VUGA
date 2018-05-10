/*
  data  = {selector: "", title: "",names: ["", "", ...], colors: ["", "", ...], hasChecks: 1 or 0}
*/

var legend = function(){
  var width = 126;
  var height = 330;
  var multiplicador = 15.5
  var data;
  var id = "mylegend";
  var scaleColor;

  var caso_genre = false;

  this.init = function(data_){

    data = data_;
    if("brightness" in data){
      caso_genre = true;
    }else{
      caso_genre = false
    }
    
    height = multiplicador * data.colors.length;
    var outra_h = document.getElementById("projection_area").scrollHeight * 0.6;
    if(height > outra_h){
      height = outra_h;
    }
    d3.select(data.selector + " #" + id).remove();
    d3.select(data.selector)
      .append("div")
      .attr("class", "container")
      .attr("id", id)
      //.style("text-align","center")
      .style("width", width + "px")
      .style("height", height + "px")
      //.style("padding","2px")
      .style("font","10px sans-serif")
      .style("background","transparent")//"#fff"
      .style("border","1px dashed #1b1a19")
      .style("position", "absolute")
      .style("top", "8px")
      .style("left", "8px")

      //if(data.colors.length > 7)
        //d3.select(data.selector + " .container")
          //.style("overflow-y", "scroll")      
      
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

  function gerar_ranges(num){
    var res = []
    num = num - 1
    for(var i = 0; i < num+1; i++)
      res.push(parseFloat(i/num))
    return res
  }

  function update_points(){
    
    if(data.mode == 'dynamic'){
      scaleColor = d3.scale.linear().domain(gerar_ranges(data.colors.length)).range(data.colors)
      all_values_rev = []
      d3.selectAll(data.selector + " .pointDots")
        .style("fill", function(d, i){
          if(data.body[d[2]] < 0 || data.body[d[2]] > 1)
            return "white"
          return scaleColor(data.body[d[2]])
      })
    }else{
      scaleColor = d3.scale.linear().domain(gerar_ranges(data.colors.length)).range(data.colors)
      all_values_rev = []
      d3.selectAll(data.selector + " .pointDots")
        .style("fill", function(d, i){
          if(d.length < 5)
            d.push(data.body[i])
          else
            d[4] = data.body[i];

          if(caso_genre){
            //var color_aux = scaleColor(data.body[d[2]]);
            var color_aux = data.colors[data.body[d[2]]];
            color_aux = tinycolor(color_aux)
            color_aux = color_aux.toHsv()
            color_aux.v = data["brightness"][i]*100
            color_aux = tinycolor(color_aux)

            return color_aux.toRgbString()
          }

          //if(data.body[d[2]] < 0 || data.body[d[2]] > 1)
            //return "white"
          //return scaleColor(data.body[d[2]])
          return data.colors[data.body[d[2]]];
      })
    }

  }

  function get_array_consecutives(num){
    var res = []
    res = d3.range(num).map(function(d){return d})
    return res;
  }

  function legend_dynamic(){
    var svg = d3.select(data.selector + " #" + id)
      .append("svg")
      .attr("width", width - 50)
      .attr("height", 90);

    var gradient = svg.append("defs")
      .append("linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%")
        .attr("spreadMethod", "pad");

    

    gradient.selectAll("stop")
      .data(data.colors)
      .enter()
      .append("stop")
      .attr("offset", function(d, i){return ((i/(data.colors.length - 1))*100.0) + "%"})
      .attr("stop-color", function(d){return d})
      .attr("stop-opacity", 1)

    svg.append("rect")
        .attr("width", width - 50)
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
      .attr("x", "70%")  
  }


  function get_divFormatToolTip(){
    //explore_clicked = mychartNew.getExplore_Clicked();
    explore_clicked = false;
    var str = "";
    str += "<div class=\"row\" style=\"text-align: center\"><strong>";
    str += "<u>";
    str += data.title;
    str += "</u>";
    str += "</strong></div>";
    
    //str += "<div class=\"row\"><div class=\"col-sm-12\">";
   // str += "<div class=\"row\">";

    var visi = "visible";
    if(!data.hasChecks)visi = "hidden";
    
    //selectAll and deselectAll
    str += "<div class=\"row\" style = \"margin-left: -25px\">"
    str += "<div class=\"col-sm-6\">"
    str += "<span class=\"selectAllBtn\">selectAll</span>"
    str += "</div>"
    str += "<div class=\"col-sm-6\" style= \"padding-left:4px\">"
    str += "<span class=\"deselectAllBtn\">deselectAll</span>"
    str += "</div>"
    str += "</div>"

    for(var i = 0; i < data.names.length; i++){
      str += "<div class=\"row\">";//style=\"display:-webkit-inline-box\"
      str += "<div style=\"display:inline-flex;\">";//margin-left: -35%
      //str += "<div class=\"col-sm-12\">";
      //str += "<div class=\"col-sm-2\">";
      str += "<div id = \"color"+i+"\" style=\"margin-left: 2px; background-color: "+data.colors[i]+"; height: 13px; width:14px; top:4px; padding-right: 0px; border:1px solid #000000 \"></div>";
      //str += "</div>";
      //str += "<div class=\"col-sm-10\">";
      str += "<input class=\"checks_leg\" id=\"check" + i + "\" style = \"margin-top:2px; margin-left:2px; width:11px;height:11px;visibility:" + visi + "\" type=\"checkbox\" name=\"mycheckbox\" value=\""+ i + "\" checked>";
      
      str += "<div id = \"nom"+i+"\" style=\"margin-top:1px\">";
      str += data.names[i];
      str += "</div>";

      //str += "</div>";
      str += "</div>";
      //str += "</div>"
      str += "</div>";
    }
    return str;

  }


  function get_divFormatToolTip2(){
    
    //explore_clicked = mychartNew.getExplore_Clicked();
    explore_clicked = false;
    var str = "";
    str += "<div class=\"row\"><strong>";
    str += "<u>";
    str += data.title;
    str += "</u>";
    str += "</strong></div>";
    
    //str += "<div class=\"row\"><div class=\"col-sm-12\">";
   // str += "<div class=\"row\">";

    var visi = "visible";
    if(!data.hasChecks)visi = "hidden";
    
    //selectAll and deselectAll
    str += "<div class=\"row\">"
    str += "<div class=\"col-sm-6\">"
    str += "<span class=\"selectAllBtn\">selectAll</span>"
    str += "</div>"
    str += "<div class=\"col-sm-6\">"
    str += "<span class=\"deselectAllBtn\">deselectAll</span>"
    str += "</div>"
    str += "</div>"

    for (var i = 0; i < data.names.length; i++) {
    
        str += "<div class=\"row\"><div class=\"col-sm-12\">"
        
        str += "<div class=\"col-sm-2\"><input class=\"checks_leg\" id = \"check"+i+"\" style=\"width:11px;height:11px;visibility:" + visi + "\" type=\"checkbox\" name=\"mycheckbox\" value=\""+i+"\" checked></div>";
        
        str += "<div id = \"nom"+i+"\" class=\"col-sm-8\" style=\"top:4px\">";
        str += data.names[i];
        str += "</div>";

        str += "<div id = \"color"+i+"\" class=\"col-sm-2\" style=\"background-color: "+data.colors[i]+"; height: 13px; width:4px; top:4px; padding-right: 0px \">";
        str += "</div>";


        str += "</div></div>";            
    };

    //str += "</div></div>";
    //str += "</div>";

    

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
              //if(scaleColor(data["body"][d[2]]) == rec_color || scaleColor(data["body"][d[2]]) == tinycolor(rec_color).toHexString())return "visible"
              if(d[4] == i)return "visible";
              return this.style.visibility;                              
            })
        }else{
          d3.selectAll(data.selector + " .pointDots")
            .style("visibility", function(d, u){
              //if(scaleColor(data["body"][d[2]]) == rec_color || scaleColor(data["body"][d[2]]) == tinycolor(rec_color).toHexString())return "hidden"
              if(d[4] == i)return "hidden";
              return this.style.visibility;                                
            })
        }
      })

    d3.select(data.selector + " .selectAllBtn")
      .style("cursor", "pointer")
      .style("color", "#005580")
      .on("click", function(){
        d3.selectAll(data.selector + " .pointDots")
          .style("visibility", "visible")
        d3.selectAll(".checks_leg").property("checked", true)
      })
    d3.select(data.selector + " .deselectAllBtn")
    .style("cursor", "pointer")
    .style("color", "red")
      .on("click", function(){
        d3.selectAll(data.selector + " .pointDots")
          .style("visibility", "hidden")
        d3.selectAll(".checks_leg").property("checked", false)
      })

    d3.select("#mylegend")
      .style("overflow-y", function(){
          if(data.colors.length >= 18)return "scroll"
          return "initial"
      })
    d3.select("#mylegend").style("height", function() {
         if(data.colors.length < 18) {
            return "auto"
         }
         return d3.select("#mylegend").style("height")
      })
  }
}