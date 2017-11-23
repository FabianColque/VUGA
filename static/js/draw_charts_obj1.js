function drawing_histo_obj1(){
  
  var ndx;
  var ndxAll;
  var array_charts = [];

  var idTag_chart = "#chart_Obj1_"
  var dims_groups = []

  /*variable with dimensions allowed*/
  data_dimensions = null;
  data_instances = null;
  /*variable for searching by text*/
  var text_search_chart = null;
  
  /*variable for count dcjs*/
  var count = null;

  /*variable for table object 1*/
  var dataTable_obj1 = ""
  var dataTable_obj2 = ""
/*
  The data received must to have the next details:
  data = 
  {"dimensions": [{"name": "name_1", "type_chart": "type_1", "titles": [a,b,c]}, ...]
   "instances": [[a, b, c,..., #dims], [a1, b1, c1,...,#dims], ...]  
  }

  a = b = c = ? => They have to be Integers, because they are indexes for titles in dimensions
*/
  this.init = function(data){
    ndx = "";
    ndxAll = "";
    dims_groups = [];
    array_charts = [];
    //data["dimensions"] = [data["dimensions"][0]]
    console.log("nilaedad", data)

    data_dimensions = data.dimensions;
    data_instances = data.instances;

    prepare_divs_obj1(data.dimensions.length)

    ndx = crossfilter(data.instances);
    ndxAll = ndx.groupAll();

    /*Drawing the Charts fixed*/
    drawing_chartText(data.dimensions);
    draw_datatable_obj1(data);
    drawing_chartCount(data.instances.length);
    draw_datatable_obj2();

    button_resetAll_dcjs(); 

    /*Drawing the generic charts*/
    init_chartsDC(data.dimensions);
    init_dim_group(data.dimensions);
    drawing(data.dimensions);
  }

  this.refresh_All_Data = function(data){
    refresh_all_data(data)
  }

  /****START****DRAW THE HEATMAP***********/
  function draw_table_heatmap(){

    d3.selectAll("#heatmap *").remove();

    var cores = ['#ffffb2','#fecc5c','#fd8d3c','#f03b20','#bd0026'];
    draw_legend_table(cores);

    var data_selected = evt.top(Infinity).map(function(d){return d.idx})
    data_dim = post_to_server_global({"dbname": name_dataset, "data_selected": data_selected}, "get_heatmap")
    
    var margin = {top: 140, right: 0, bottom: 10, left: 0},
    width = 400,
    height = 720;

    var heat_headers = data_dim["headers"];

    matrix = [];
    var sums_x = new Array(heat_headers.length).fill(0);
    var sums_y = [];

    var i_i = 0;
    for(var ds in data_selected){

      var auxsum = 0;

      matrix[i_i] = d3.range(heat_headers.length).map(function(d){
        auxsum += data_dim["body"][i_i][d];
        sums_x[d] += data_dim["body"][i_i][d];
        return {x: d, y: i_i, z: data_dim["body"][i_i][d]};
      })
     i_i += 1; 
     sums_y.push(auxsum)
    }

    width = 15*heat_headers.length;
    height = 15*data_selected.length;

    var xw = d3.scale.ordinal().rangeBands([0, width]),
    xh = d3.scale.ordinal().rangeBands([0, height]),
    c = d3.scale.linear().domain([0, 0.25, 0.5, 0.75, 1]).range(cores); 

    var orders = {
      nameA: d3.range(data_selected.length).sort(function(a,b){return d3.ascending(data_selected[a], data_selected[b])}),
      nameH: d3.range(heat_headers.length).sort(function(a,b){return d3.ascending(heat_headers[a], heat_headers[b])}),
      types: [0, 1, 2, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39],
      freqx: d3.range(heat_headers.length).sort(function(a, b){return sums_x[a] - sums_x[b]}),
      freqy: d3.range(data_selected.length).sort(function(a, b){return sums_y[a] - sums_y[b]}),
    };

    //var data_options = [["nameH", "Name"], ["types", "Type"], ["freqx", "Frequency"], ["cluster", "Cluster"]];
    var data_options = [["nameH", "Name"], ["freqx", "Frequency"]];

    d3.select("#legend-heatmap")
    .append("select")
      .attr("id", "order")
      .selectAll("option")
      .data(data_options)
      .enter()
      .append("option")
      .attr("value", function(d){return d[0];})
      .text(function(d){return d[1]});

    d3.select("#legend-heatmap #order")
    .on("change", function(d){
      //clearTimeout(timeout);
      order(this.value);
    })      

    xw.domain(d3.range(heat_headers.length).map(function(d){return d}));
    xh.domain(orders.nameA)

    var svg = d3.select("#heatmap").append("svg")
    .attr("width", width + margin.left + margin.right+80)
    .attr("height", height + margin.top + margin.bottom+80)
    .style("margin-left", margin.left + "px")
    .append("g")
    .attr("transform", "translate(" + 50 + "," + margin.top + ")");    

    svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height);

    var row = svg.selectAll(".row")
    .data(matrix)
    .enter()
    .append("g")
    .attr("class", "row")
    .attr("transform", function(d, i){return "translate(0," + xh(i) + ")";})
    .each(row)  

    row.append("line")
    .attr("x2", width);

    row.append("text")
    .attr("x", -6)
    .attr("y", xh.rangeBand()/2)
    .attr("dy", ".32em")
    .attr("text-anchor", "end")
    .style("font-size", "12px")
    .text(function(d, i){return data_selected[i]}) 


    var column = svg.selectAll(".column")
    .data(d3.range(heat_headers.length))
    .enter()
    .append("g")
    .attr("class", "column")
    .attr("transform", function(d, i){return "translate(" + xw(i) + ")rotate(-90)";})

    column.append("line")
    .attr("x1", -height);

    column.append("text")
    .attr("x", 6)
    .attr("y", xw.rangeBand()/2)
    .attr("dy", ".32em")
    .attr("text-anchor", "start")
    .style("font-size", "12px")
    .text(function(d, i){return heat_headers[i];});

    function row(row){
      var cell = d3.select(this).selectAll(".cell")
      .data(row.filter(function(d){return d.z > -1}))
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", function(d){return xw(d.x);})
      .attr("width", xw.rangeBand())
      .attr("height", xh.rangeBand())
      .style("fill", function(d){
          return c(d.z)
        })

    }


    function order(value){
      xw.domain(orders[value]);
      if(value == "freqx")
        xh.domain(orders["freqy"])
      else
        xh.domain(orders["nameA"])  
      

      var t = svg.transition().duration(2500);

      t.selectAll(".row")
        .delay(function(d, i){return xh(i)*4;})
        .attr("transform", function(d, i){return "translate(0, " + xh(i) + ")";})
        .selectAll(".cell")
          .delay(function(d){return xw(d.x) * 4})
          .attr("x", function(d){return xw(d.x); });

      t.selectAll(".column")
        .delay(function(d, i){return xw(i) * 4})
        .attr("transform", function(d, i){return "translate(" + xw(i) + ")rotate(-90)"; })
    }

    function draw_legend_table(cores){

      d3.selectAll("#legend-heatmap *").remove();

      d3.select("#legend-heatmap")
        .append("p")
          .text("The 100 first Users");

      //var cores = ['#d7191c','#fdae61','#ffffbf','#abd9e9','#2c7bb6'];
      var lado = 20;

      var svg = d3.select("#legend-heatmap")
      .append("svg")
      .attr("width", 300)
      .attr("height", 100)
      .append("g")
      .attr("transform", "translate(30,30)")

      svg.append("text")
      .text("Normalization")  
      .attr("x", 127)
      .attr("y", -18)

      svg.selectAll(".textlegend")
      .data(cores)
      .enter()
      .append("text")
      .attr("class", "textlegend")
      .attr("x", function(d, i){return lado*i*2 + 63})
      .text(function(d,i){return i/4})  

      svg.selectAll(".cell-legend")
      .data(cores)
      .enter()
      .append("rect")
      .attr("class", "cell-legend")
      .attr("x", function(d, i){return lado*i*2 + 45})
      .attr("width", lado*2)
      .attr("height", lado)
      .style("fill", function(d){return d;})
    } 

  }
  /*****END*****DRAW THE HEATMAP***********/

  /***START*****TABLE OBJECT 2*************/ 
  function draw_datatable_obj2(){
    var data_obj2 = getDataViz_obj2();
    data_obj2.headers[0]= "ID"

    draw_TableHtml_obj2(data_obj2.headers);
    data_util = []
    for(var i in data_obj2["body"]){
      data_util.push(data_obj2["body"][i].dat)
    }
    var count2 = 0;
    var my_columns_obj2 = [
      {
        "searchable"  : false,/*indice*/
        "orderable"   : false,
        "targets"     : 0,
        data          : function(row, type, val, meta){
          count2++;
          return count2;
        }
      }  
    ];

    for(var i = 1; i < data_obj2.headers.length; i++){
      var aux = {};
      aux["searchable"]     = true;
      aux["orderable"]      = true;
      aux["targets"]        = i;
      aux["defaultContent"] = "N/A";
      aux["data"] = function(row, type, val, meta){
        return row[meta.col];
      }
      my_columns_obj2.push(aux);
    }

    dataTable_obj2 = $("#id_tabla_obj2").dataTable({
      "columnDefs"  :  my_columns_obj2,
      "iDisplayLength" : 10,
      "bPaginate": true,
      "bLengthChange": true,
      "bFilter": true,
      "order": [[ 0, "desc" ]],
      "bSort": true,
      "bInfo": false,
      "bAutoWidth": false,
      "bDeferRender": true,
      "aaData": data_util,
      "bDestroy": true,
    });

    dataTable_obj2.DataTable().on( 'order.dt search.dt page.dt draw.dt', function () {
      var thispage = $('.paginate_button.current').html();            
      var rowi = 0;
      dataTable_obj2.DataTable().column(0, {search:'applied', order:'applied'}).nodes().each( function (cell, i) {
        if(rowi >= 100){
          rowi = 0;
        }
        rowi ++;
        if(thispage > 1){
          cell.innerHTML = (rowi) + (100*(thispage-1));
        } else {
          cell.innerHTML = (rowi);
        }
      } );

    });
  }

  function getDataViz_obj2(){
    var data_sel = []
    for(var i = 0; i < data_instances.length; i++){
      data_sel.push(data_instances[i].id)
    }
    
    return post_to_server_global({"dbname": name_dataset, "data_selected": data_sel}, "getDataObj2_table")
  }

  function draw_TableHtml_obj2(headers){
    d3.select("#dataTable_obj2")
      .append("table")
      .attr("id", "id_tabla_obj2")
      .style("overflow-x", "scroll")
      .attr("class", "table table-hover dc-data-table")
      .append("thead")
        .append("tr")
          .attr("class", "header")
          .selectAll("th")
          .data(headers)
          .enter()
          .append("th")
          .attr("class", "header")
          .text(function(d){return d});  
  }

  function refreshTable_obj2(){
    
    dc.events.trigger(function(){
      var aux = evt.top(Infinity)
      var aux2 = []
      for(var gg in aux){
        aux2.push(aux[gg].id)
      }
      var alldata2 = post_to_server_global({"dbname": name_dataset, "data_selected": aux2}, "getDataObj2_table")
      var data_util = []
      for(var i in alldata2["body"]){
        data_util.push(alldata2["body"][i].dat)
      }

      dataTable_obj2.fnClearTable();
      dataTable_obj2.fnAddData(data_util);
      dataTable_obj2.fnDraw();

    })
  }


  /***END*****TABLE OBJECT 2****/

  function refresh_all_data(data){

    data_instances = data

    //var textfilter  = text_search_chart.filters()
    var countfilter = count.filters();

    var filters_arr = [];
    for(var i = 0; i < data_dimensions.length; i++){
      filters_arr.push(array_charts[i].filters());
      array_charts[i].filter(null);
    }

    text_search_chart.filter(null);
    count.filter(null)

    ndx.remove()

    //text_search_chart.filter([textfilter]);
    count.filter([countfilter]);

    for(var i = 0; i < data_dimensions.length; i++){
      array_charts[i].filter([filters_arr[i]])
    }

    ndx.add(data);
  /*  drawing_chartText(data_dimensions)
    draw
*/
    dc.redrawAll();


    data_sz = data.length;
    d3.select("#idSelectionTotalStrong")
      .text(data_sz)
  }

  function drawing_chartCount(data_sz){
    count = dc.dataCount("#data-count")
      .dimension(ndx)
      .group(ndxAll);

    count.on("renderlet.resetall", function(c){
      var total     = c.dimension().size();
      var filtered  = c.group().value();
      var disabled  = (total == filtered);
      $(".resetall").attr("disabled", disabled);

      refreshTable_obj1();
      refreshTable_obj2();
      //var sub_data = evt.top(Infinity).map(function(d){return d.idx})
      //viz_proj.drawn_color_subselected(sub_data);
      draw_table_heatmap();      
    })

    evt = ndx.dimension(function(d){return d.idx;})
    d3.select("#idSelectionTotalStrong")
      .text(data_sz)
  }

  function button_resetAll_dcjs(){
    $(".resetall").click(function() {
      text_search_chart.filter(null);
      evt.filter(function(d){return d;})
      dc.filterAll();
      dc.renderAll();
      $("#search-input").val("");
      $(".resetall").attr("disabled",true);

    });
  }

  function drawing_chartText(data){
    text_search_chart = ndx.dimension(function(d){
      var str = "";
      str += d.n.toLowerCase();
      str += " ";
      for(var i = 0; i < data.length; i++){
        str += data[i].titles[d.values[i]];
      }
      return str;
    })

    $("#search-input").keyup(function(){
      var s = $(this).val().toLowerCase();
      text_search_chart.filter(function(d){
        return d.indexOf(s) !== -1;
      });
      $(".resetall").attr("disabled",false);  
      throttle();

      var throttleTimer;
      function throttle(){
        window.clearTimeout(throttleTimer);
        throttleTimer = window.setTimeout(function(){
          dc.renderAll();
        }, 250);
      }
    })

  }//End of drawing_chartText()

  function drawing(data){
    for(var i = 0; i < dims_groups.length; i++){
      switch(data[i]["type_chart"]){
        case "Row Chart":
          draw_rowChart(i);
          break;
        case "Bar Chart":
          draw_barChart(i, data);
          break;
        case "Pie Chart":
          draw_pieChart(i, data);
          break;
        default:
          break;
      }
    }
    dc.renderAll();
  }

  /*---START--------- Table Object 1*/

  function draw_datatable_obj1(data){
    
    /*Extracting the headers to table Object 1*/
    var headers = [];
    headers.push("ID")
    headers.push("name")
    for(var i = 0; i < data.dimensions.length; i++){
      headers.push(data.dimensions[i].name)
    }

    draw_TableHtml(headers);
    var count = 0;
    var my_columns = [
      {
        "searchable"  : false,/*indice*/
        "orderable"   : false,
        "targets"     : 0,
        data          : function(row, type, val, meta){

          count++;
          return count;
        }
      },{
        "searchable"  : true,/*name*/
        "orderable"   : true,
        "targets"     : 1,
        "defaultContent": "N/A",
        "data"          : "n",
      }  
    ]

    for(var i = 0; i < data.dimensions.length; i++){
      var aux = {};
      aux["searchable"]     = true;
      aux["orderable"]      = true;
      aux["targets"]        = i+2;
      aux["defaultContent"] = "N/A";
      aux["data"] = function(row, type, val, meta){
        return data.dimensions[meta.col-2].titles[row.values[meta.col-2]];
      }
      my_columns.push(aux);
    }

   
    dataTable_obj1 = $("#id_tabla_obj1").dataTable({
      "columnDefs"  :  my_columns,
      "iDisplayLength" : 10,
      "bPaginate": true,
      "bLengthChange": true,
      "bFilter": true,
      "order": [[ 1, "desc" ]],
      "bSort": true,
      "bInfo": false,
      "bAutoWidth": false,
      "bDeferRender": true,
      "aaData": text_search_chart.top(Infinity),
      "bDestroy": true,
    });

    dataTable_obj1.DataTable().on( 'order.dt search.dt page.dt draw.dt', function () {
      var thispage = $('.paginate_button.current').html();            
      var rowi = 0;
      dataTable_obj1.DataTable().column(0, {search:'applied', order:'applied'}).nodes().each( function (cell, i) {
        if(rowi >= 100){
          rowi = 0;
        }
        rowi ++;
        if(thispage > 1){
          cell.innerHTML = (rowi) + (100*(thispage-1));
        } else {
          cell.innerHTML = (rowi);
        }
      } );

    });

    $("#id_tabla_obj1 tbody").off("click", "tr").on("click", "tr", function(d){
      //$(this).toggleClass("selected");
      if($(d.target).is('input')) { return; }
      if($(this).hasClass("selected")){
        $(this).removeClass("selected");
      }else{
        $(this).addClass("selected")
      }
      //fabian = [d,this]
      var subddd = [dataTable_obj1.DataTable().row(this).data().idx];
      console.log("chance me", subddd)
      
      var isselected = $(this).hasClass("selected");
      if(isselected)
        viz_proj.modify_size_circles(subddd, true)
      else
        viz_proj.modify_size_circles(subddd, false)
    })

    function draw_TableHtml(headers){
      d3.select("#dataTable_obj1")
        .append("table")
        .attr("id", "id_tabla_obj1")
        .attr("class", "table table-hover dc-data-table")
        .append("thead")
          .append("tr")
            .attr("class", "header")
            .selectAll("th")
            .data(headers)
            .enter()
            .append("th")
            .attr("class", "header")
            .text(function(d){return d});
    }
  }

  function refreshTable_obj1(){
    dc.events.trigger(function(){
      alldata  =evt.top(Infinity);
      dataTable_obj1.fnClearTable();
      dataTable_obj1.fnAddData(alldata);
      dataTable_obj1.fnDraw();
    })
  }

  /*---END--------- Table Object 1*/

  function prepare_divs_obj1(tam){
    d3.select("#div_graphs_obj1")

      .selectAll("div")
      .data(d3.range(tam).map(function(d){return d}))
      .enter()
      .append("div")
      .attr("class", "row")
      
      .selectAll("div")
      .data(function(d){return [d]})
      .enter()
      .append("div")
        .attr("class", "col-sm-12")
        
        .selectAll("div")
        .data(function(d){return [d]})
        .enter()
        .append("div")
          .attr("class", "chart-wrapper")
          .attr("id", function(d){return "div_graphs_obj1_" + d})
          .each(function(d){
            d3.select(this)
              .append("div")
                .attr('class', "chart-title")
            d3.select(this)
              .append("div")
                .attr("class", "chart-stage")
                .attr("id", "chart_Obj1_" + d)
            d3.select(this)
              .append("div")
                .attr("class", "chart-notes")
          })
  }



  function draw_pieChart(id_dim, data){
    var colorGender = ['#7fc97f','#beaed4','#fdc086'];
    array_charts[id_dim]
      .width(180)
      .height(180)
      .radius(80)
      .dimension(dims_groups[id_dim]["dim"])
      .group(dims_groups[id_dim]["group"])
      .colors(d3.scale.ordinal().domain(data[id_dim].titles).range(colorGender))
      .label(function(d){
        if(array_charts[id_dim].hasFilter() && !array_charts[id_dim].hasFilter(d.key)){
          return d.key + "0%";
        }
        var label = d.key;
        if(ndxAll.value()){
          label += '(' + Math.floor(d.value / ndxAll.value()*100) + '%)';
        }
        return label;
      })  
  }

  function draw_barChart(id_dim, data){
    array_charts[id_dim]
      .width(600)
      .height(180)
      .margins({top: 20, right: 50, bottom: 50, left: 50})
      .dimension(dims_groups[id_dim]["dim"])
      .group(dims_groups[id_dim]["group"])
      .ordering(function(t){return t.value})
      .colors("#0082c8")
      .elasticY(true)
      .centerBar(false)
      .gap(1)
      .round(dc.round.floor)
      .alwaysUseRounding(true)
      .x(d3.scale.ordinal().domain(data[id_dim].titles))   
      .xUnits(dc.units.ordinal)
      .renderHorizontalGridLines(true)
      .xAxisLabel(data[id_dim].name)
  }

  function draw_rowChart(id_dim){
    array_charts[id_dim]
      .width(300)
      .height(600)
      .dimension(dims_groups[id_dim]["dim"])
      .group(dims_groups[id_dim]["group"])
      .elasticX(true)
      .xAxis()
      .ticks(6)
  }

  function init_dim_group(data){
    nosemayor = []
    h = 0
    for(let i = 0; i < data.length; i++){
      var aux = tebusque(i);
      dims_groups.push(aux);  
    }  
  }

  function tebusque(i){
    var aux = {"dim": "", "group": ""};
    switch(data_dimensions[i]["type_chart"]){
      case "Row Chart":
        //aux.dim = ndx.dimension(function(d){return data[nosemayor[h]].titles[d.values[nosemayor[h]]]});
        aux.dim = ndx.dimension(function(d){return data_dimensions[i].titles[d.values[i]]})
        aux.group = aux["dim"].group();
        break;
      case "Bar Chart":
        //aux.dim = ndx.dimension(function(d){return data[nosemayor[h]].titles[d.values[nosemayor[h]]]});
        aux.dim = ndx.dimension(function(d){return data_dimensions[i].titles[d.values[i]]})
        aux.group = aux["dim"].group();
        break;  
      case "Pie Chart":
        //aux.dim = ndx.dimension(function(d){return data[nosemayor[h]].titles[d.values[nosemayor[h]]]});
        aux.dim = ndx.dimension(function(d){return data_dimensions[i].titles[d.values[i]]})
        aux.group = aux["dim"].group();
        break;
      default:
        break; 
    }
    return aux
  }

  function algo(i, d){
    return function(){
      return function(){return data_dimensions[i].titles[d.values[i]]}
    }
  }


  function init_chartsDC(data){
    for(var i = 0; i < data.length; i++){
      switch(data[i]["type_chart"]){
        case "Row Chart":
              array_charts.push(dc.rowChart(idTag_chart + i));
              break;
        case "Bar Chart":
              array_charts.push(dc.barChart(idTag_chart + i));
              break;
        case "Pie Chart":
              array_charts.push(dc.pieChart(idTag_chart + i));
              break;
        default:
              break;
      }
    }
  }

}//End function drawi