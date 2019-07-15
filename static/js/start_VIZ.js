//name of the dataset
var name_dataset = d3.select("#namedb-vexus2").text()
var link_app = ""
//Variable vizualization of the projection
var viz_proj = "";
//Variable vizualization charts from object 1
var histograms_obj1 = ""
var histograms_obj_ori = ""

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
//var colorsArray2 = ["#e6194b", "#3cb44b", "#ffe119", "#0082c8", "#f58231", "#911eb4", "#46f0f0", "#f032e6", "#d2f53c", "#fabebe", "#008080", "#e6beff", "#aa6e28", "#800000", "#aaffc3", "#808000", "#ffd8b1", "#000080", "#808080  ", "#FFFFFF", "#000000"]
var colorsArray2 = ["#e6194b", "#3cb44b", "#ffe119", "#0082c8", "#f58231", "#911eb4", "#46f0f0", "#f032e6", "#d2f53c", "#fabebe", "#008080", "#e6beff", "#aa6e28", "#800000", "#aaffc3", "#808000", "#ffd8b1", "#000080", "#808080  ", "#000000", "#000000"]
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
  if(name_dataset == "health1") {
    d3.select("#name_obj2").text("Actions Table")
    d3.select("#ori_name_obj2").text("Original Actions Table")
  }
  else if(name_dataset == "NewBookCrossing") {
    d3.select("#name_obj2").text("Books Table")
    d3.select("#ori_name_obj2").text("Original Books Table")
  }
  else {
    d3.select("#name_obj2").text("Movies Table")
    d3.select("#ori_name_obj2").text("Original Movies Table")
  }
  
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

  jQuery.fn.d3Click = function () {
    this.each(function (i, e) {
      var evt = new MouseEvent("click");
      e.dispatchEvent(evt);
    });
  };
  $("#switch-shadow").d3Click();
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
          "next #svg_projection": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Esta é a Projection Area.<br>Aqui, os usuários são representados por círculos.</p>",
			 "showSkip": false
      },
      {
          "next #mylegend": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Cada círculo recebe a cor do gênero do filme para o qual o usuário escreveu mais reviews. Cores mais claras indicam uma maior dominância do gênero cinematográfico.<br>Essa legenda também permite filtrar os usuários para facilitar a exploração:<br><text style='color: #00a6eb'>deselectAll</text> - Desselecionar todos.<br><text style='color: #00a6eb'>selectAll</text> - Selecionar todos.<br><text style='color: #00a6eb'>Check buttons <span style='background-color: #00a6eb' class='ui-icon ui-icon-check'></span></text> - Selecionar/desselecionar um gênero cinematográfico.</p>",
			 "showSkip": false
      },
      {
          "next .select_color": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Aqui é possível selecionar/mudar o atributo usado para o mapeamento das cores.</p>",
			 "showSkip": false
      },
      {
          "next #switch-shadow-label": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'><text style='color: #00a6eb'>Lasso on</text> - Para ativar a Lasso tool e selecionar um subconjunto de usuários.<br><text style='color: #00a6eb'>Lasso off</text> - Para aumentar o zoom da Projection Area, utilize o botão de rolagem do mouse e mova o mouse com o botão esquerdo pressionado.</p>",
			 "showSkip": false,
			 "shape": "circle"
      },
      {
          "next .btn_3_lassos": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'> Há 3 opções de uso do lasso tool para selecionar uma ou mais regiões na Projection Area:<br><text style='color: #00a6eb'>Lasso Reset</text> - Para desfazer seleções prévias.<br><text style='color: #00a6eb'>Select All</text> - Para selecionar todos os usuários mostrados.<br><text style='color: #00a6eb'>Reset All</text> - Para mostrar novamente todos os usuários na Projection Area.</p>",
			 "showSkip": false
      },
      {
          "next #svg_projection": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Agora, utilizando seu mouse, <text style='color: #00a6eb'><font size='7'><b>selecione</b></font></text> um conjunto de usuários (círculos).</p>",
			 "showSkip": false
      },
      {
          "click #explore-viz": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Clique aqui para mostrar as informações dos usuários selecionados. </p>",
			 "showSkip": false
      },
      {
          "next #dataTable_obj1": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Aqui temos a lista de usuários com suas informações.</p>",
			 "showSkip": false
      },
      {
          "next #charts_w_time": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Os diagramas mostram as informações dos usuários selecionados.</p>",
			 "showSkip": false
      },
      {
          "next #div_graphs_obj1_0": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Clique em uma das barras do diagrama para selecionar os usuários que têm aquela característica (valor de atributo).</p>",
			 "showSkip": false
      },
      {
          "next #dataTable_obj2": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Aqui é mostrada a " + d3.select("#name_obj2").text() + " com informações sobres os filmes avaliados pelos usuários selecionados.</p>",
			 "showSkip": false
      },
      {
           "next #charts_without_detail": "<p align ='right' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Nesta seção temos alguns diagramas que mostram a distribuição de usuários por atributo. </p>",
			 "showSkip": false
      },
      {
          "click #id_tabla_obj1>tbody>tr:eq(0)": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Selecione o usuário.</p>",
			 "showSkip": false
      },
      {
          "click #id_tabla_obj1>tbody>tr:eq(1)": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Selecione o usuário.</p>",
			 "showSkip": false
      },
      {
          "click #id_tabla_obj1>tbody>tr:eq(2)": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Selecione o usuário.</p>",
			 "showSkip": false
      },
      {
          "click #Save_obj1": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Clique aqui para salvar os usuários selecionados na 'Save Area'.<br>Ao clicar no botão <text style='color: #00a6eb'>Save All</text> todos os usuários selecionados serão salvos na 'Save Area'.</p>",
			 "showSkip": false
      },
      {
          "next #idsavearea_obj1": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Esta é a Save Area.<br>Aqui são mostrados os usuários salvos.</p>",
			 "showSkip": false,
          "right": 50
      },
      {
          "next #config_groups": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'> Há 4 possibilidades para explorar grupos.<br><text style='color: #00a6eb'>Max. Groups</text> - É o número de grupos de usuários que se deseja criar. <br><text style='color: #00a6eb'>Top Dimensions</text> - Para escolher a porcentagem de gêneros cinematográficos dominantes.<br><text style='color: #00a6eb'># of Users by Groups</text> - O número mínimo e máximo de usuários per grupo.<br><text style='color: #00a6eb'>New Group Types</text> - Permite escolher formar grupos com usuários mais similares ou dissimilares.</p>",
			 "showSkip": false
      },
      {
          "click #btn_ExploreGroups": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Clique aqui para explorar grupos de usuários.</p>",
			 "showSkip": false
      },
      {
          "next #vizArea_Groups": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Cada círculo é um novo grupo formado.<br>Os números mostram quantos usuários há em cada grupo, a similaridade em relação ao grupo original (chamado de “semente”), mostrado em roxo e a <br>interseção (número de usuários em comum) com o grupo semente. As linhas azuis representam que há usuários em comum entre os grupos.</p>",
			 "showSkip": false
      },
      {
          "click #node1": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Clique no grupo para visualizar suas informações.</p>",
			 "showSkip": false,
			 "shape": "circle"
      },
      {
           "next #dataTable_obj1": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Ao clicar no grupo, é mostrada a lista de usuários do grupo e informações sobre as características do grupo.</p>",
			 "showSkip": false
      },
      {
           "next #charts_w_time": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>E também os diagramas com informações do grupo.</p>",
			 "showSkip": false
      },
      {
          "next #charts_without_detail_compair": "<p align ='right' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Assim é possível comparer o grupo selecionado com o grupo semente.</p>",
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
          "next #svg_projection": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Esta é a Projection Area.<br>Aqui, os usuários são representados por círculos.</p>",
			 "showSkip": true
      },
      {
          "next #mylegend": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Cada círculo recebe a cor do gênero do filme para o qual o usuário escreveu mais reviews. Cores mais claras indicam uma maior dominância do gênero cinematográfico.<br>Essa legenda também permite filtrar os usuários para facilitar a exploração:<br><text style='color: #00a6eb'>deselectAll</text> - Desselecionar todos.<br><text style='color: #00a6eb'>selectAll</text> - Selecionar todos.<br><text style='color: #00a6eb'>Check buttons <span style='background-color: #00a6eb' class='ui-icon ui-icon-check'></span></text> - Selecionar/desselecionar um gênero cinematográfico.</p>",
			 "showSkip": true
      },
      {
          "next .select_color": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Aqui é possível selecionar/mudar o atributo usado para o mapeamento das cores.</p>",
			 "showSkip": true
      },
      {
          "click #switch-shadow-label": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'><text style='color: #00a6eb'>Lasso on</text> - Para ativar a Lasso tool e selecionar um subconjunto de usuários.<br><text style='color: #00a6eb'>Lasso off</text> - Para aumentar o zoom da Projection Area, utilize o botão de rolagem do mouse e mova o mouse com o botão esquerdo pressionado.</p>",
			 "showSkip": true,
			 "shape": "circle"
      },
      {
          "next .btn_3_lassos": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'> Há 3 opções de uso do lasso tool para selecionar uma ou mais regiões na Projection Area:<br><text style='color: #00a6eb'>Lasso Reset</text> - Para desfazer seleções prévias.<br><text style='color: #00a6eb'>Select All</text> - Para selecionar todos os usuários mostrados.<br><text style='color: #00a6eb'>Reset All</text> - Para mostrar novamente todos os usuários na Projection Area.</p>",
			 "showSkip": true
      },
      {
          "next #svg_projection": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Agora, utilizando seu mouse, <text style='color: #00a6eb'><font size='7'><b>selecione</b></font></text> um conjunto de usuários (círculos).</p>",
			 "showSkip": true
      },
      {
          "click #explore-viz": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Clique aqui para mostrar as informações dos usuários selecionados. </p>",
			 "showSkip": true
      },
      {
          "next #dataTable_obj1": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Aqui temos a lista de usuários com suas informações.</p>",
			 "showSkip": true
      },
      {
          "next #charts_w_time": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Os diagramas mostram as informações dos usuários selecionados.</p>",
			 "showSkip": true
      },
      {
          "next #div_graphs_obj1_0": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Clique em uma das barras do diagrama para selecionar os usuários que têm aquela característica (valor de atributo).</p>",
			 "showSkip": true
      },
      {
          "next #dataTable_obj2": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Aqui é mostrada a " + d3.select("#name_obj2").text() + " com informações sobres os filmes avaliados pelos usuários selecionados.</p>",
			 "showSkip": true
      },
      {
           "next #charts_without_detail": "<p align ='right' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Nesta seção temos alguns diagramas que mostram a distribuição de usuários por atributo.</p>",
			 "showSkip": true
      },
      {
          "click #id_tabla_obj1>tbody>tr:eq(0)": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Selecione o usuário.</p>",
			 "showSkip": true
      },
      {
          "click #id_tabla_obj1>tbody>tr:eq(1)": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Selecione o usuário.</p>",
			 "showSkip": true
      },
      {
          "click #id_tabla_obj1>tbody>tr:eq(2)": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Selecione o usuário.</p>",
			 "showSkip": true
      },
      {
          "click #Save_obj1": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Clique aqui para salvar os usuários selecionados na 'Save Area'.<br>Ao clicar no botão <text style='color: #00a6eb'>Save All</text> todos os usuários selecionados serão salvos na 'Save Area'.</p>",
			 "showSkip": true
      },
      {
          "next #idsavearea_obj1": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Esta é a Save Area.<br>Aqui são mostrados os usuários salvos.</p>",
			 "showSkip": true,
          "right": 50
      },
      {
          "next #config_groups": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'> Há 4 possibilidades para explorar grupos.<br><text style='color: #00a6eb'>Max. Groups</text> - É o número de grupos de usuários que se deseja criar. <br><text style='color: #00a6eb'>Top Dimensions</text> - Para escolher a porcentagem de gêneros cinematográficos dominantes.<br><text style='color: #00a6eb'># of Users by Groups</text> - O número mínimo e máximo de usuários per grupo.<br><text style='color: #00a6eb'>New Group Types</text> - Permite escolher formar grupos com usuários mais similares ou dissimilares.</p>",
			 "showSkip": true
      },
      {
          "click #btn_ExploreGroups": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Clique aqui para explorar grupos de usuários.</p>",
			 "showSkip": true
      },
      {
          "next #vizArea_Groups": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Cada círculo é um novo grupo formado.<br>Os números mostram quantos usuários há em cada grupo, a similaridade em relação ao grupo original (chamado de “semente”), mostrado em roxo e a <br>interseção (número de usuários em comum) com o grupo semente. As linhas azuis representam que há usuários em comum entre os grupos.</p>",
			 "showSkip": true
      },
      {
          "click #node1": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Clique no grupo para visualizar suas informações.</p>",
			 "showSkip": true,
			 "shape": "circle"
      },
      {
           "next #dataTable_obj1": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Ao clicar no grupo, é mostrada a lista de usuários do grupo e informações sobre as características do grupo.</p>",
			 "showSkip": true
      },
      {
           "next #charts_w_time": "<p align ='left' style='color: #33a02c; text-shadow: 0 0 1px #000;'>E também os diagramas com informações do grupo.</p>",
			 "showSkip": true
      },
      {
          "next #charts_without_detail_compair": "<p align ='right' style='color: #33a02c; text-shadow: 0 0 1px #000;'>Assim é possível comparer o grupo selecionado com o grupo semente.</p>",
			 "showSkip": true
      }
  ];

  //set script config
  enjoyhint_instance.set(enjoyhint_script_steps);

  //run Enjoyhint script
  enjoyhint_instance.run();
}
