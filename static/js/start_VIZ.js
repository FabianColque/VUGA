//name of the dataset
var name_dataset = d3.select("#namedb-vexus2").text()
var link_app = ""
//Variable vizualization of the projection
var viz_proj = "";
//Variable vizualization charts from object 1
var histograms_obj1 = ""

//variable visualization of Legend
var mylegend = null;

//variable to save obj1
var var_save_area = new draw_saveArea();
var original_save = []

/*variable to display the histograms of the heatmap*/
var comparison_matrices = null;
var flag_comparison = false;

//colors allowed
var colorsArray2 = ["#e6194b", "#3cb44b", "#ffe119", "#0082c8", "#f58231", "#911eb4", "#46f0f0", "#f032e6", "#d2f53c", "#fabebe", "#008080", "#e6beff", "#aa6e28", "#800000", "#aaffc3", "#808000", "#ffd8b1", "#000080", "#b15928", "#6a3d9a", "#33a02c"]                    

//variable to groups
var mynewGroups = null;

//headers of the viz
var headers_data = null;

//borrar
var all_values_rev = []

function start(){
  
  
  var data_projection = post_to_server_global({"dbname": name_dataset}, "get_data_projection");
  viz_proj = new vis_projection();
  viz_proj.init(data_projection);

  d3.select(".totalPoints").text("Total: " + data_projection.length + " users")

  /*aun no se si legend deba ir aqui o por ejemplo dentro de draw_charts*/
  mylegend = new legend();
  var da = post_to_server_global({"dbname": name_dataset, "dimension_num": 0, "select": "all"}, "getDimension_legend")
  mylegend.init(da);
  mylegend.start();

  /*otro que no se*/
  var data_options = post_to_server_global({"dbname": name_dataset}, "get_Details_options");
  headers_data = data_options
  draw_colors_dimensions_selectors(data_options)
}



function draw_colors_dimensions_selectors(data){
  d3.select(".select_color")
    .on("change", onchange_bycolor)
    .selectAll(".options_color")
    .data(data)
    .enter()
    .append("option")
      .text(function(d){return d.name})

  data = [{"name": "All"}].concat(data);
  d3.select(".select_proj")
    //.on("change", onchange_byProj)
    .selectAll(".options_proj")
    .data(data)
    .enter()
    .append("option")
    .text(function(d){return d.name})

  function onchange_bycolor(d, i){
    var election = d3.select(".select_color").property("selectedIndex");
    mylegend.init(post_to_server_global({"dbname": name_dataset, "dimension_num": election, "select": "all"}, "getDimension_legend"))
    mylegend.start()
  }  
    
}

function getlink_current(){
  var str = window.location.href;
  //http://localhost:8888/vexus2?g=Movielens
  var cs = 0;
  var res = "";
  for(var i = 0; i < str.length; i++){
    res+=str[i]
    if(str[i] == '/')
      cs++;
    if(cs == 3)break;
  }
  return res;
}
link_app = getlink_current();

function post_to_server_global(jsondata, service){
  var results = "";
  $.ajax({
    url             :   link_app + service,
    type            :   'POST',
    contentType     :   'application/json',
    data            :   JSON.stringify(jsondata),
    async           :   false,
    success         :   function(da){results = JSON.parse(da);}
  });
  return results;
}