//name of the dataset
var name_dataset = d3.select("#namedb-vexus2").text()
var link_app = ""
//Variable vizualization of the projection
var viz_proj = "";
//Variable vizualization charts from object 1
var histograms_obj1 = ""

//variable visualization of Legend
var mylegend = null;

//filtrar cualquier cosa, como filtro de topright o filtro de timechart en health1
var text_search_chart = null;

//names of users selected
var data_set_positions = {}
var data_set_positions1 = {}
var data_set_positions2 = {}
//variable to save obj1
var var_save_area = new draw_saveArea();
var original_save = []

/*variable to display the histograms of the heatmap*/
var flag_comparison = false;
var load_aux_original = false;

var comparison_original = null;
var comparison_groups = null;

var brush_health = null;
var redraw_timeChart = true;

//colors allowed
//var colorsArray2 = ["#e6194b", "#3cb44b", "#ffe119", "#0082c8", "#f58231", "#911eb4", "#46f0f0", "#f032e6", "#d2f53c", "#fabebe", "#008080", "#e6beff", "#aa6e28", "#800000", "#aaffc3", "#808000", "#ffd8b1", "#000080", "#b15928", "#6a3d9a", "#33a02c"]                    
var colorsArray2 = ["#e6194b", "#3cb44b", "#ffe119", "#0082c8", "#f58231", "#911eb4", "#46f0f0", "#f032e6", "#d2f53c", "#fabebe", "#008080", "#e6beff", "#aa6e28", "#800000", "#aaffc3", "#808000", "#ffd8b1", "#000080", "#808080  ", "#FFFFFF", "#000000"]
//variable to groups
var mynewGroups = null;

//headers of the viz
var headers_data = null;

//borrar
var all_values_rev = []

//mivarglobal
var fabian = null;

function start(){
  
  //some details
  if(name_dataset == "health1")
    d3.select("#name_obj2").text("Actions")
  else if(name_dataset == "NewBookCrossing")
    d3.select("#name_obj2").text("Books")
  else
    d3.select("#name_obj2").text("Movies")
  
  var data_projection = post_to_server_global({"dbname": name_dataset}, "get_data_projection");
  viz_proj = new vis_projection();
  viz_proj.init(data_projection);

  d3.select(".totalPoints").text("Total: " + data_projection.length + " users")

  /*aun no se si legend deba ir aqui o por ejemplo dentro de draw_charts*/
  mylegend = new legend();
  auxdefault = 4
  
  if(name_dataset == "health1")
    auxdefault = 3
  if(name_dataset == "NewBookCrossing")
    auxdefault = 2
  var da = post_to_server_global({"dbname": name_dataset, "dimension_num": auxdefault, "select": "all"}, "getDimension_legend")

  mylegend.init(da);
  mylegend.start();

  /*otro que no se*/
  var data_options = post_to_server_global({"dbname": name_dataset}, "get_Details_options");
  headers_data = data_options["intersection"].concat(data_options["dimensions"])
  draw_colors_dimensions_selectors(data_options)

  document.getElementsByClassName("select_color")[0].selectedIndex = auxdefault;
  d3.select("#parentsaveArea").attr("height", document.getElementById("projection_area").scrollHeight + "px")
}



function draw_colors_dimensions_selectors(data){
  //data2 = [{"name": "Gender"},{"name": "Age"},{"name": "Occupation"}].concat(data);
  d3.select(".select_color")
    .on("change", onchange_bycolor)
    .selectAll(".options_color")
    .data(data["charts"].concat(data["dimensions"]))
    .enter()
    .append("option")
      .text(function(d){return d.name})

  //data = [{"name": "All"}].concat(data);
  d3.select(".select_proj")
    //.on("change", onchange_byProj)
    .selectAll(".options_proj")
    .data([{"name": "All"}].concat(data["intersection"]).concat(data["dimensions"]))
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

function isEmptyOBJ(obj) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop))
      return false;
  }

  return true;
}

function test_enjoyhint() {

  // initialize instance
  var enjoyhint_instance = new EnjoyHint({
    onEnd: function() {
      $.get("/end_tour");
      location.reload();
    },
    onSkip: function() {
      location.reload();
    }
  });

  // config steps
  var enjoyhint_script_steps = [
      {
          "next #svg_projection": "<p align ='left'>This is the Projection Area.<br>Here, we display the users represented by circles.</p>",
			 "showSkip": false
      },
      {
          "next #mylegend": "<p align ='left'>Users use this set of colors. Each user is colored by the dominant dimension.<br>Also, This legend helps us to filter the dimensions for a best exploration:<br><text style='color: #00a6eb'>deselectAll</text> - Deselect all the dimensions.<br><text style='color: #00a6eb'>selectAll</text> - Select all the dimensions.<br><text style='color: #00a6eb'>Check buttons <span style='background-color: #00a6eb' class='ui-icon ui-icon-check'></span></text> - Select/deselect one dimension.</p>",
			 "showSkip": false
      },
      {
          "next .select_color": "<p align ='left'>Here, we can change the dimensions.</p>",
			 "showSkip": false
      },
      {
          "click #switch-shadow-label": "<p align ='left'>You need to click here to continue the exploration:<br><text style='color: #00a6eb'>Lasso on</text> - For active the Lasso tool to select a subset of users.<br><text style='color: #00a6eb'>Lasso off</text> - Zoom the Projection Area with the scroll mouse button and move it with the pressed left mouse button.</p>",
			 "showSkip": false,
			 "shape": "circle"
      },
      {
          "next .btn_3_lassos": "<p align ='left'>Also, we have 3 options to use the Lasso tool for select one or more regions in the Projection Area:<br><text style='color: #00a6eb'>Lasso Reset</text> - For clear a previous selection.<br><text style='color: #00a6eb'>Select All</text> - For select all visible users.<br><text style='color: #00a6eb'>Reset All</text> - For return at the complete projection.</p>",
			 "showSkip": false
      },
      {
          "next #svg_projection": "<p align ='left'>Please, using your mouse, select a set of users (circles).</p>",
			 "showSkip": false
      },
      {
          "click #explore-viz": "<p align ='left'>Click here to display the information of the users selected.</p>",
			 "showSkip": false
      },
      {
          "next #dataTable_obj1": "<p align ='left'>Here, we have the list of users and the general information of each one.</p>",
			 "showSkip": false
      },
      {
          "next #charts_w_time": "<p align ='left'>Now, the information of users but summarized are displayed with the charts.</p>",
			 "showSkip": false
      },
      {
          "next #div_graphs_obj1_0": "<p align ='left'>Click in a category inside the chart to filter the users based in that attribute.</p>",
			 "showSkip": false
      },
      {
          "next #dataTable_obj2": "<p align ='left'>Here, we display a list of " + d3.select("#name_obj2").text() + " about the users currently selected.</p>",
			 "showSkip": false
      },
      {
          "next #charts_without_detail": "<p align ='right'><text style='color: white; background-color: #00a6eb;'>In this part, we have some charts with the distribution of users by each attribute.</text></p>",
			 "showSkip": false
      },
      {
          "click #id_tabla_obj1>tbody>tr:first": "<p align ='left'>Select one user.</p>",
			 "showSkip": false
      },
      {
          "click #id_tabla_obj1>tbody>tr:last": "<p align ='left'>Select another user.</p>",
			 "showSkip": false
      },
      {
          "click #Save_obj1": "<p align ='left'>Click here to save the selected users into 'Save Area'.<br>Also, we can click in <text style='color: #00a6eb'>Save All</text> button to save all users into 'Save Area'.</p>",
			 "showSkip": false
      },
      {
          "next #idsavearea_obj1": "<p align ='left'>This is the Save Area.<br>Here, we display a list of the saved users.</p>",
			 "showSkip": false,
          "right": 50
      },
      {
          "next #config_groups": "<p align ='left'> Also, we have 3 options of configuration to explore groups:<br><text style='color: #00a6eb'>Max. Groups</text> - It is the number of user groups that you want as result.<br><text style='color: #00a6eb'>Top Dimensions</text> - For choose the percentage of relevant dimensions.<br><text style='color: #00a6eb'>+ Similarity/- Similarity</text> - If you want find the more similar/less similar users.</p>",
			 "showSkip": false
      },
      {
          "click #btn_ExploreGroups": "<p align ='left'>Click here to explore groups.</p>",
			 "showSkip": false
      },
      {
          "next #vizArea_Groups": "<p align ='left'>The result is a set of user groups with the number of users in each group, the similarity with the original group (purple) and<br>the intersection (number of users in common) with the original group. The light blue lines are the groups with users in common.</p>",
			 "showSkip": false
      },
      {
          "click #node1": "<p align ='left'>Click in this group for visualize its information.</p>",
			 "showSkip": false,
			 "shape": "circle"
      },
      {
          "next #dataTable_obj1": "<p align ='left'>Clicking in a group, we have the list of users and the general information of the selected group.</p>",
			 "showSkip": false
      },
      {
          "next #charts_w_time": "<p align ='left'>Also, the charts of the selected group.</p>",
			 "showSkip": false
      },
      {
          "next #charts_without_detail_compair": "<p align ='right'><text style='color: white; background-color: #00a6eb;'>Finally, we can compare the original group and the group selected.</text></p>",
			 "showSkip": false
      }
  ];

  //set script config
  enjoyhint_instance.set(enjoyhint_script_steps);

  //run Enjoyhint script
  enjoyhint_instance.run();
}

function test_enjoyhint_with_skip() {

  // initialize instance
  var enjoyhint_instance = new EnjoyHint({
    onEnd: function() {
    },
    onSkip: function() {
    }
  });

  // config steps
  var enjoyhint_script_steps = [
      {
          "next #svg_projection": "<p align ='left'>This is the Projection Area.<br>Here, we display the users represented by circles.</p>",
			 "showSkip": true
      },
      {
          "next #mylegend": "<p align ='left'>Users use this set of colors. Each user is colored by the dominant dimension.<br>Also, This legend helps us to filter the dimensions for a best exploration:<br><text style='color: #00a6eb'>deselectAll</text> - Deselect all the dimensions.<br><text style='color: #00a6eb'>selectAll</text> - Select all the dimensions.<br><text style='color: #00a6eb'>Check buttons <span style='background-color: #00a6eb' class='ui-icon ui-icon-check'></span></text> - Select/deselect one dimension.</p>",
			 "showSkip": true
      },
      {
          "next .select_color": "<p align ='left'>Here, we can change the dimensions.</p>",
			 "showSkip": true
      },
      {
          "click #switch-shadow-label": "<p align ='left'>You need to click here to continue the exploration:<br><text style='color: #00a6eb'>Lasso on</text> - For active the Lasso tool to select a subset of users.<br><text style='color: #00a6eb'>Lasso off</text> - Zoom the Projection Area with the scroll mouse button and move it with the pressed left mouse button.</p>",
			 "showSkip": true,
			 "shape": "circle"
      },
      {
          "next .btn_3_lassos": "<p align ='left'>Also, we have 3 options to use the Lasso tool for select one or more regions in the Projection Area:<br><text style='color: #00a6eb'>Lasso Reset</text> - For clear a previous selection.<br><text style='color: #00a6eb'>Select All</text> - For select all visible users.<br><text style='color: #00a6eb'>Reset All</text> - For return at the complete projection.</p>",
			 "showSkip": true
      },
      {
          "next #svg_projection": "<p align ='left'>Please, using your mouse, select a set of users (circles).</p>",
			 "showSkip": true
      },
      {
          "click #explore-viz": "<p align ='left'>Click here to display the information of the users selected.</p>",
			 "showSkip": true
      },
      {
          "next #dataTable_obj1": "<p align ='left'>Here, we have the list of users and the general information of each one.</p>",
			 "showSkip": true
      },
      {
          "next #charts_w_time": "<p align ='left'>Now, the information of users but summarized are displayed with the charts.</p>",
			 "showSkip": true
      },
      {
          "next #div_graphs_obj1_0": "<p align ='left'>Click in a category inside the chart to filter the users based in that attribute.</p>",
			 "showSkip": true
      },
      {
          "next #dataTable_obj2": "<p align ='left'>Here, we display a list of " + d3.select("#name_obj2").text() + " about the users currently selected.</p>",
			 "showSkip": true
      },
      {
          "next #charts_without_detail": "<p align ='right'><text style='color: white; background-color: #00a6eb;'>In this part, we have some charts with the distribution of users by each attribute.</text></p>",
			 "showSkip": true
      },
      {
          "click #id_tabla_obj1>tbody>tr:first": "<p align ='left'>Select one user.</p>",
			 "showSkip": true
      },
      {
          "click #id_tabla_obj1>tbody>tr:last": "<p align ='left'>Select another user.</p>",
			 "showSkip": true
      },
      {
          "click #Save_obj1": "<p align ='left'>Click here to save the selected users into 'Save Area'.<br>Also, we can click in <text style='color: #00a6eb'>Save All</text> button to save all users into 'Save Area'.</p>",
			 "showSkip": true
      },
      {
          "next #idsavearea_obj1": "<p align ='left'>This is the Save Area.<br>Here, we display a list of the saved users.</p>",
			 "showSkip": true,
          "right": 50
      },
      {
          "next #config_groups": "<p align ='left'> Also, we have 3 options of configuration to explore groups:<br><text style='color: #00a6eb'>Max. Groups</text> - It is the number of user groups that you want as result.<br><text style='color: #00a6eb'>Top Dimensions</text> - For choose the percentage of relevant dimensions.<br><text style='color: #00a6eb'>+ Similarity/- Similarity</text> - If you want find the more similar/less similar users.</p>",
			 "showSkip": true
      },
      {
          "click #btn_ExploreGroups": "<p align ='left'>Click here to explore groups.</p>",
			 "showSkip": true
      },
      {
          "next #vizArea_Groups": "<p align ='left'>The result is a set of user groups with the number of users in each group, the similarity with the original group (purple) and<br>the intersection (number of users in common) with the original group. The light blue lines are the groups with users in common.</p>",
			 "showSkip": true
      },
      {
          "click #node1": "<p align ='left'>Click in this group for visualize its information.</p>",
			 "showSkip": true,
			 "shape": "circle"
      },
      {
          "next #dataTable_obj1": "<p align ='left'>Clicking in a group, we have the list of users and the general information of the selected group.</p>",
			 "showSkip": true
      },
      {
          "next #charts_w_time": "<p align ='left'>Also, the charts of the selected group.</p>",
			 "showSkip": true
      },
      {
          "next #charts_without_detail_compair": "<p align ='right'><text style='color: white; background-color: #00a6eb;'>Finally, we can compare the original group and the group selected.</text></p>",
			 "showSkip": true
      }
  ];

  //set script config
  enjoyhint_instance.set(enjoyhint_script_steps);

  //run Enjoyhint script
  enjoyhint_instance.run();
}
