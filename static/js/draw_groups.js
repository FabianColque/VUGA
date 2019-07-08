var draw_groups = function(){

  /*Variables to initial configuration*/
  var selector = "#vizArea_Groups";
  //document.getElementById("projection_area").scrollWidth;//600;
  var width = document.getElementById("vizArea_Groups").scrollWidth;//700;
  var height = width - width*0.2786//500;
  var id = "G1";

  /*Variables to force layout*/
  var force;
  var interval;
  var links = [];
  var nodes = {};
  var matrizmia = [];
  var scala_grosor;

  /*Variable to data Groups*/
  var dataGroups = null;

  /*Scales*/
  var tamCircleScaleGroup = d3.scale.linear()
    .range([width-width*0.94142, width-width*0.91285])//.range([20, 60]);
  var new_scale_x = d3.scale.linear();
  var new_scale_y = d3.scale.linear();  

  var buck_pos = [-1, -1, -1, -1];//[idgroup, radio, cx, cy]
  var mylastCircle = -1;
  var lastCircle = null;
  var selectionDataGroups = [];

  var flag_zoom = false;

  this.init = function(data){

    clearAll();

    /*dataGroups = {"cluster": [], "content": []}
    var iiii = 0;
    data["content"].forEach(function(d){
      if(d.objects.length > 0){
        dataGroups["cluster"].push(0);
        dataGroups["content"].push({"id": iiii, "objects": d.objects, "similarity": d.similarity * 100})
        iiii += 1
      }
    })*/

    
    dataGroups = data;

    d3.select(selector)
      .append("svg")
        .attr("id", id)
        .attr("width", width)
        .attr("height", height)
        .style("position", "relative")
        .style("left", "0%")

    this.processData();
    this.process_points();    

  }

  this.clearAll = function(){
    clearAll();
  }

  function clearAll(){
    d3.selectAll(selector + " *").remove();
    force = null;
    interval = null;
    links = [];
    nodes = {};
    matrizmia = [];
    scala_grosor = null;
    dataGroups = null;
  }

  function ini_var_comparison_newgroups()
  {
    if(comparison_groups == null){
      comparison_groups = new drawComparison("#groupComparison");
      comparison_groups.init();
    }

    /*if(comparison_matrices2 == null)
        comparison_matrices2 = new comparison_matriz("New Group", "#comparison-matrix2", ".groupComparison")
      if(resume_comparison2 == null){
        resume_comparison2 = new stackBarVis();
        resume_comparison2.setDimensionsChart(700, 10)
        resume_comparison2.init("stack_resume_comparison2")
      }
      if(stack_heatmap2 == null){
        stack_heatmap2 = new stackBarVis();
        stack_heatmap2.init("stack-heatmap2")
      }

      if(mipiechart2 == null){
        mipiechart2 = new pieChartVis();
        mipiechart2.init("piechartmio2")
      }*/
  }

  function draw(data){
    
    
    var as = d3.extent(dataGroups.content, function(d){return d.objects.length});
    tamCircleScaleGroup.domain([0, as[0]]);

    force.on("tick", tick)

    var svg = d3.select(selector + " #" + id);

    var auxx = d3.extent(force.nodes(), function(d){return d.x});
    var auxy = d3.extent(force.nodes(), function(d){return d.y});

    new_scale_x.domain(auxx).range([50, width-150]);
    new_scale_y.domain(auxy).range([50, height-150]);

    var links = [];
    var flink = force.links();
    for (var i = 0; i < flink.length; i++) {
      var res = flink[i];
      var a = parseInt(res.source.name);
      var b = parseInt(res.target.name);
      //var o = findGroup_inDataGroup(a);
      //var dd = findGroup_inDataGroup(b);
      var k = Math.max(matrizmia[1][a][b].length, matrizmia[1][b][a].length);

      if(k){
        res.value = k;
        links.push(res);
      } 
    };

    svg.append("svg:defs").selectAll("marker")
      .data(["end"])      // Different link/path types can be defined here
      .enter().append("svg:marker")    // This section adds in the arrows
      .attr("id", String)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", -1.5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");

    var path = svg.append("svg:g").selectAll("path")
      .data(links)
      .enter().append("svg:path")
      .attr("class", "link")
      .attr("id", function(d,i){return "edgepath"+i})
      .attr("stroke", "#8dd3c7")
      .style("stroke-width", function(d){
        var a = parseInt(d.source.name);
        var b = parseInt(d.target.name);
        var k = Math.max(matrizmia[1][a][b].length, matrizmia[1][b][a].length);
        if(!k)return "0px";
        return scala_grosor(k) + "px";
      }).on("click", function(d){
         
      });

    path.append("title")
    .text(function(d){
      return "("+d.value+")"
    })

    var node = svg.selectAll(".node")
    .data(force.nodes())
    .enter()
    .append("g")
      .attr("class", "node")
      .attr("id", function(d){return "node"+d.name})
      .style("cursor", "pointer")
      .attr("transform", function(d){return "translate("+new_scale_x(d.x)+", "+new_scale_y(d.y)+")"})

    node.append("circle")
      .attr("class", "pointGroup")
      .attr("id", function(d){return 'pointGroup' + d.name})
      .attr("r", function(d){return tamCircleScaleGroup(dataGroups.content[parseInt(d.name)].objects.length)})
      .style("stroke", "black")
      .style("stroke-width", "0.3px")
      .style("fill", function(d, i){
        if(i == 0)return "#BEBADA";
        return "#e2e1e1"
      })
      .on("click", function(d, i){
        flag_comparison = true;
        ini_var_comparison_newgroups();
        var name_group = "New Group "+i;
        if(i == 0)name_group = "Original Group";
        comparison_groups.change_name(name_group)

        ra = d3.select("#pointGroup"+d.name).attr("r")
        
        
        if(buck_pos[0] != d.name){
          
          if(flag_zoom){
            desactive_circle_zoom();
          }

          var cc = d3.transform(d3.select(selector).select("#node"+d.name).attr("transform"));

          buck_pos = [d.name, ra, cc.translate[0], cc.translate[1]];
        }
        d3.select("#pointGroup"+lastCircle)
          .style("stroke", "black")
          .style("stroke-width", "0.3px");
        lastCircle = parseInt(d.name);
        d3.select("#pointGroup"+lastCircle)
          .style("stroke", "#20b3b3")
          .style("stroke-width", "5px");
        selectionDataGroups = [];
        selectionDataGroups.push(parseInt(d.name));


        /*************Update are projection and histograms*************************/
        histograms_obj1.resetAllBtn()
        histograms_obj_ori.resetAllBtn()
        var datahisto_ori = post_to_server_global({"data_selected": dataGroups.content[0].objects, "dbname": name_dataset, "original_group": original_save}, "getData_Viz")
        var datahisto = post_to_server_global({"data_selected": dataGroups.content[selectionDataGroups[0]].objects, "dbname": name_dataset, "original_group": original_save}, "getData_Viz")
        viz_proj.setDataSelected(dataGroups.content[selectionDataGroups[0]].objects)
        viz_proj.draw_only_selected()
        histograms_obj1.refresh_All_Data(datahisto.instances)
        histograms_obj_ori.refreshTables(datahisto_ori.instances)

        d3.select("#ori_card_1").style("display", "block");
        d3.select("#ori_card_2").style("display", "block");
        /*histos = [];
        for(var i = 0; i < dataGroups["histo_ori"].length; i++){
          histos.push({"val": dataGroups["histo_ori"][i], "di": headers_data[i].name, "nada": Math.random()})
          histos.push({"val": dataGroups.content[selectionDataGroups[0]].histo[i], "di": headers_data[i].name, "nada": Math.random()})
        }
        flag_comparison = true
        comparison_matrices.update_comparison(histos, true)
        */
        //drawn_newVISProjection(dataGroups.content[selectionDataGroups[0]].users);  
        /*************************************/
      });

    if(mylastCircle){
      d3.select("#pointGroup"+mylastCircle)
        .style("stroke", "black")
        .style("stroke-width", "5px");
      lastCircle = mylastCircle;
      mylastCircle = -1;      
    }

    
    node.selectAll("g")
      .data(function(d){return [d.name]})
      .enter()
      .append("g")
      //.attr("stroke", "black")
      .attr("transform", function(d){return "translate("+0+", "+0+")"})
      .style("pointer-events", "none")
    .selectAll("text")
      .data(function(d, i){
        
        gru = dataGroups.content[parseInt(d)];

        var ar1 = gru.objects;
        var ar2 = []

        for(ds in data_selected_save)
          ar2.push(parseInt(ds))
        var ggg  = ar1.filter((n) => ar2.includes(n))
        ggg = ggg.length;
        ggg = ggg/gru.objects.length
        ggg = ggg*100;
        ggg = parseFloat(ggg).toFixed(1);
        var fc = gru.similarity*100
        fc = parseFloat(fc).toFixed(1)
        var name_group = "New Group "+i;
        if(i == 0)name_group = "Original Group";
        return [name_group, gru.objects.length + " Users", "Similarity: " + fc, "Intersection: " + ggg + "%"]
      })
      .enter()
      .append("text")
      .text(function(d){return d})
      .attr("x", "-40px")
      .attr("y", function(d, i){return (-24 + i*12) + "px"})
    node.selectAll("g")
      .append("rect")
      .attr("width", "120px")
      .attr("height", "60px")
      .attr("x", "-45")
      .attr("y", "-40px")
      .style("stroke", 'black')
      .style("fill", "transparent")
    /*node.append("rect")
      .attr("x", "0px")
      .attr("y", "")
      .attr("width", "100px")
      .attr("height", "100px")
      .attr("stroke", "red")
      .attr("fill", "white")
      .append("text")
      .text("lsdfnlas")
*/
    node.append("title")
      .text(function(d) { 
        gru = dataGroups.content[parseInt(d.name)];

        var ar1 = gru.objects;
        var ar2 = []

        for(ds in data_selected_save)
          ar2.push(parseInt(ds))
        var ggg  = ar1.filter((n) => ar2.includes(n))
        ggg = ggg.length;
        ggg = ggg/gru.objects.length
        ggg = ggg*100;
        ggg = parseFloat(ggg).toFixed(3);
        //console.log("ivanov", dataGroups);


        return gru.objects.length + " Users \n Similarity: " + gru.similarity*100 + "% \n Intersection: " + ggg + "%";
      })

    var edgelabels = svg.selectAll(".edgelabel")
      .data(links)
      .enter()
      .append('text')
      .style("pointer-events", "none")
      .attr({'class':'edgelabel',
             'id':function(d,i){return 'edgelabel'+i},
             'dx':180,
             'dy':0,
             'font-size':15,
             'fill':'#636363'});

    // add the curvy lines
    function tick() {
      path.attr("d", function(d) {
        var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = Math.sqrt(dx * dx + dy * dy);
        return "M" + 
            d.source.x + "," + 
            d.source.y + "A" + 
            dr + "," + dr + " 0 0,1 " + 
            d.target.x + "," + 
            d.target.y;
      });

      node
          .attr("transform", function(d) { 
          return "translate(" + d.x + "," + d.y + ")"; });   
    }    

    clearInterval(interval); 
  }

  this.process_points = function(){
    force = d3.layout.force()
      .nodes(d3.values(nodes))
      .links(links)
      .size([width, height])
      .linkDistance(width - width*0.57)//.linkDistance(300)
      .start();

    interval = setInterval(draw, 800)

    auxx = d3.extent(force.nodes(), function(d){return d.x});
    auxy = d3.extent(force.nodes(), function(d){return d.y});   
  }

  this.processData = function(){
    matrizmia = getMatchUsers();

    var nose = Array.from(new Set(dataGroups.cluster));
      
    var len = nose.length;

    var matriz = [];
    for (var i = 0; i < len; i++) {
      matriz.push([]);    
    };

    for (var i = 0; i < dataGroups.content.length; i++) {
      matriz[dataGroups.cluster[i]].push(dataGroups.content[i].id);    
    };


    for (var i = 0; i < matriz.length; i++) {
      for (var ii = 0; ii < matriz[i].length; ii++) {
        for (var iii = 0; iii < matriz[i].length; iii++) {
          if(iii>ii){
            var jj = {"source": (""+matriz[i][ii]), "target": (""+matriz[i][iii]), "value": 3};
            links.push(jj);
          }
        };  
      };
    };

    scala_grosor = d3.scale.linear().domain([0,matrizmia[0]]).range([0,10]);

    // Compute the distinct nodes from the links.
    links.forEach(function(link) {
        link.source = nodes[link.source] || 
            (nodes[link.source] = {name: link.source});
        link.target = nodes[link.target] || 
            (nodes[link.target] = {name: link.target});
        link.value = +link.value;
    });
  }

  function getMatchUsers(){
    var matr = [];
    var maxi = 0;
    for (var i = 0; i < dataGroups.content.length; i++) {
      var aux = [];
      for (var j = 0; j < dataGroups.content.length; j++) {
        aux.push([]);
      }
      matr.push(aux)
    }
    for (var i = 0; i < dataGroups.content.length; i++) {
      for (var j = 0; j < dataGroups.content.length; j++) {
        if(i < j){
          var simi = common_elements(dataGroups.content[i].objects, dataGroups.content[j].objects);
          matr[i][j] = simi;
          maxi = Math.max(simi.length, maxi);
        }        
      };
    };
    return [maxi, matr];
  }

  function common_elements(ar,br){
    var res = [];
    ar.sort(function(a,b){return a-b});
    br.sort(function(a,b){return a-b});

    var i = 0;
    var j = 0;

    while(i< ar.length && j < br.length){
      if(ar[i] == br[j]){
          res.push(ar[i]);
          i++;
          j++;
      }else if(ar[i] < br[j]){
          i++;
      }else{
          j++;
      }
    }
    return res;
  }

}
