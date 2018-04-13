function drawing_histo_obj1(){
  
  var ndx;
  var ndxAll;
  var array_charts = [];

  var idTag_chart = "#chart_Obj1_"
  var dims_groups = []

  /*variable with dimensions allowed*/
  data_dimensions = null;
  data_instances = null;
  
  //var data_set_positions = {}

  /*variable for searching by text*/
  //var text_search_chart = null;
  
  /*variable for count dcjs*/
  var count = null;

  /*variable for table object 1*/
  var dataTable_obj1 = ""
  var dataTable_obj2 = ""


  /*variable que evita caragar dos veces las tablas*/
  var tabla_refresh = false
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
    
    data_dimensions = data.dimensions;
    data_instances = data.instances;

    /*data positions*/
    data_set_positions = {}
    for(var i = 0; i < data.instances.length; i++){
      data_set_positions["" + data.instances[i]["idx"]] = data.instances[i]["id"];
    }



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

    if(flag_comparison == false){//graficar solo the original charts
      comparison_original.update();
    }else{
      comparison_groups.update();
    }


    //no se donde poner esta parte de timeChart para Health database
    /*if(name_dataset == "health1"){
      //var miauxdata = [{"year":1847,"freq":2},{"year":1848,"freq":0},{"year":1849,"freq":14},{"year":1850,"freq":46},{"year":1851,"freq":113},{"year":1852,"freq":83},{"year":1853,"freq":54},{"year":1854,"freq":98},{"year":1855,"freq":81},{"year":1856,"freq":58},{"year":1857,"freq":73},{"year":1858,"freq":101},{"year":1859,"freq":54},{"year":1860,"freq":77},{"year":1861,"freq":90},{"year":1862,"freq":80},{"year":1863,"freq":71},{"year":1864,"freq":122},{"year":1865,"freq":71},{"year":1866,"freq":121},{"year":1867,"freq":124},{"year":1868,"freq":140},{"year":1869,"freq":153},{"year":1870,"freq":190},{"year":1871,"freq":222},{"year":1872,"freq":205},{"year":1873,"freq":205},{"year":1874,"freq":225},{"year":1875,"freq":204},{"year":1876,"freq":181},{"year":1877,"freq":186},{"year":1878,"freq":296},{"year":1879,"freq":350},{"year":1880,"freq":372},{"year":1881,"freq":406},{"year":1882,"freq":428},{"year":1883,"freq":367},{"year":1884,"freq":371},{"year":1885,"freq":212},{"year":1886,"freq":298},{"year":1887,"freq":396},{"year":1888,"freq":525},{"year":1889,"freq":404},{"year":1890,"freq":573},{"year":1891,"freq":420},{"year":1892,"freq":508},{"year":1893,"freq":249},{"year":1894,"freq":375},{"year":1895,"freq":345},{"year":1896,"freq":345},{"year":1897,"freq":184},{"year":1898,"freq":386},{"year":1899,"freq":297},{"year":1900,"freq":475},{"year":1901,"freq":369},{"year":1902,"freq":358}];
      var miauxdata = [{"year":1847,"freq":2,"ef":1},{"year":1848,"freq":0,"ef":1},{"year":1852,"freq":83,"ef":1},{"year":1853,"freq":54,"ef":1},{"year":1854,"freq":98,"ef":1},{"year":1855,"freq":81,"ef":1},{"year":1856,"freq":58,"ef":1},{"year":1857,"freq":73,"ef":1},{"year":1858,"freq":101,"ef":1},{"year":1859,"freq":54,"ef":1},{"year":1860,"freq":77,"ef":1},{"year":1861,"freq":90,"ef":1},{"year":1862,"freq":80,"ef":1},{"year":1863,"freq":71,"ef":1},{"year":1864,"freq":122,"ef":1},{"year":1865,"freq":71,"ef":1},{"year":1866,"freq":121,"ef":1},{"year":1867,"freq":124,"ef":1},{"year":1868,"freq":140,"ef":1},{"year":1869,"freq":153,"ef":1},{"year":1870,"freq":190,"ef":1},{"year":1871,"freq":222,"ef":1},{"year":1872,"freq":205,"ef":1},{"year":1873,"freq":205,"ef":1},{"year":1874,"freq":225,"ef":1},{"year":1875,"freq":204,"ef":1},{"year":1876,"freq":181,"ef":1},{"year":1877,"freq":186,"ef":1},{"year":1878,"freq":296,"ef":1},{"year":1879,"freq":350,"ef":1},{"year":1880,"freq":372,"ef":1},{"year":1881,"freq":406,"ef":1},{"year":1882,"freq":428,"ef":1},{"year":1883,"freq":367,"ef":1},{"year":1884,"freq":371,"ef":1},{"year":1885,"freq":212,"ef":1},{"year":1886,"freq":298,"ef":1},{"year":1887,"freq":396,"ef":1},{"year":1888,"freq":525,"ef":1},{"year":1889,"freq":404,"ef":1},{"year":1890,"freq":573,"ef":1},{"year":1891,"freq":420,"ef":1},{"year":1892,"freq":508,"ef":1},{"year":1893,"freq":249,"ef":1},{"year":1894,"freq":375,"ef":1},{"year":1895,"freq":345,"ef":1},{"year":1896,"freq":345,"ef":1},{"year":1897,"freq":184,"ef":1},{"year":1898,"freq":386,"ef":1},{"year":1899,"freq":297,"ef":1},{"year":1900,"freq":475,"ef":1},{"year":1901,"freq":369,"ef":1},{"year":1902,"freq":358,"ef":1}]
      miauxdata = miauxdata.slice(0,39)
      miauxdata = miauxdata.map(function(d){return {"year": d.year.toString(), "freq": d.freq, "ef": 40}})
      var elegidos = new Set()
      var sz = parseInt(miauxdata.length/2);
      for(var i = 0; i < sz; i++){
        elegidos.add(parseInt(Math.random()*miauxdata.length-1));
      }
      var seleaux = []
      elegidos.forEach(function(d){
        seleaux.push(miauxdata[d])
      })
      seleaux = miauxdata
      brush_health.update(seleaux)
    }*/

/*
    d3.selectAll("#heatmap *").remove();


    

    //var cores = ['#ffffb2','#fecc5c','#fd8d3c','#f03b20','#bd0026'];
    var cores = ['#ffffd9','#edf8b1','#c7e9b4','#7fcdbb','#41b6c4','#1d91c0','#225ea8','#253494','#081d58'];
    //draw_legend_table(cores);

    var data_selected = evt.top(Infinity).map(function(d){return d.idx})
    console.log("data_selected ahora: ", data_selected);

    data_dim = post_to_server_global({"dbname": name_dataset, "data_selected": data_selected}, "get_heatmap")
    data_selected = data_selected.slice(0, 100)
    data_dim["body"] = data_dim["body"].slice(0, 100)
    data_dim["ori"] = data_dim["ori"].slice(0, 100)
    var sorted_resume = [];
    var sorted_rows = [];
    if(flag_comparison == false){
      
      var ori = new Array(data_dim["headers"].length).fill(0.0);
      for(var i = 0; i < data_selected.length; i++){
        for(var j = 0; j < data_dim["headers"].length; j++){
          var fab = parseFloat(data_dim["body"][i][j])
          if(fab < 0.0)fab = 0.0
          if(fab > 1.0)fab = 1.0
          ori[j] += fab
        }
      }
      oriori = []
      for(var i = 0 ; i < ori.length; i++){
        oriori.push({"di": headers_data[i].name, "val": ori[i] / data_dim["body"].length, "nada": Math.random()})
      }
      

      comparison_matrices.update_comparison(oriori)
      resume = [];
      for(var i = 0; i < oriori.length; i++){
        resume.push(oriori[i].val)
      }
      resume = [resume]
      sorted_resume = d3.range(resume[0].length).sort(function(a, b){return resume[0][b] - resume[0][a]});  
      sorted_rows = d3.range(data_dim["body"].length).sort(function(a, b){return data_dim["body"][b][sorted_resume[0]] - data_dim["body"][a][sorted_resume[0]]})
      console.log("teletubi", sorted_rows)
      console.log("sorted_resume ini", resume, sorted_resume)
      resume_comparison.update(resume, ["histogram"], sorted_resume)  
      mipiechart.update(resume);
    }else{
      var ori = new Array(data_dim["headers"].length).fill(0.0);
      for(var i = 0; i < data_selected.length; i++){
        for(var j = 0; j < data_dim["headers"].length; j++){
          var fab = parseFloat(data_dim["body"][i][j])
          if(fab < 0.0)fab = 0.0
          if(fab > 1.0)fab = 1.0
          ori[j] += fab
        }
      }
      oriori = []
      for(var i = 0 ; i < ori.length; i++){
        oriori.push({"di": headers_data[i].name, "val": ori[i] / data_dim["body"].length, "nada": Math.random()})
      }
      

      comparison_matrices2.update_comparison(oriori)
      resume = [];
      for(var i = 0; i < oriori.length; i++){
        resume.push(oriori[i].val)
      }
      resume = [resume]
      sorted_resume = d3.range(resume[0].length).sort(function(a, b){return resume[0][b] - resume[0][a]});  
      sorted_rows = d3.range(data_dim["body"].length).sort(function(a, b){return data_dim["body"][b][sorted_resume[0]] - data_dim["body"][a][sorted_resume[0]]})
      console.log("teletubi2", sorted_rows)
      console.log("sorted_resume ini2", resume, sorted_resume)
      resume_comparison2.update(resume, ["histogram"], sorted_resume)  
      mipiechart2.update(resume);
    }


    
    
    
    new_names_o = data_selected.map(function(d){return data_set_positions[d]})

    var new_names = sorted_rows.map(function(d){return new_names_o[d]});
    var data_sorted = sorted_rows.map(function(d){return data_dim["body"][d]})
    
    if(flag_comparison == false)
      stack_heatmap.update(data_sorted, new_names, sorted_resume)
    else
      stack_heatmap2.update(data_sorted, new_names, sorted_resume)


    */
/*
    var margin = {top: 140, right: 0, bottom: 10, left: 0},
    width = 800,
    height = 720;

    var heat_headers = data_dim["headers"];

    matrix = [];
    var sums_x = new Array(heat_headers.length).fill(0.0);
    var sums_y = [];

    var i_i = 0;
    //for(var ds in data_selected){
    for(var i_i; i_i < data_selected.length; i_i++){

      var auxsum = 0;
      var sumTotal_ori = 0;
      for(var fa = 0; fa < data_dim["ori"][i_i].length-1; fa++){
        sumTotal_ori += parseInt(data_dim["ori"][i_i][fa+1]);
      }
      matrix[i_i] = d3.range(heat_headers.length).map(function(d){
        auxsum += data_dim["body"][i_i][d];
        sums_x[d] += data_dim["body"][i_i][d];
        return {x: d, y: i_i, z: data_dim["body"][i_i][d], o: parseInt(data_dim["ori"][i_i][d+1])/parseFloat(sumTotal_ori)};
      })
     //i_i += 1; 
     sums_y.push(auxsum)
    }

    //width = 15*heat_headers.length;
    height = 20*data_selected.length;

    var divs_scales = d3.range(cores.length).map(function(d){return d/(cores.length - 1)})

    var xw = d3.scale.ordinal().rangeBands([0, width]),
    xh = d3.scale.ordinal().rangeBands([0, height]),
    c = d3.scale.linear().domain(divs_scales).range(cores); 

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
    .text(function(d, i){return data_set_positions["" + data_selected[i]]}) 


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
      //var cell = d3.select(this).selectAll(".cell")
      //.data(row.filter(function(d){return d.z >= 0.0 && d.z <= 1.0}))
      //.enter()
      //.append("rect")
      //.attr("class", "cell")
      //.attr("x", function(d){return xw(d.x);})
      //.attr("width", xw.rangeBand())
      //.attr("height", xh.rangeBand())
      //.style("fill", function(d){
       //   return c(d.z)
        //})
      //.append("title")
       // .text(function(d){
          //console.log("hola", d);
        //  return d.z;
        //})

      var cell2 = d3.select(this).selectAll(".cell")
        .data(row.filter(function(d){return d.z >= 0.0 && d.z <= 1.0}))
        .enter()
        .append("g")
        .attr("class", "cell")
        .attr("transform", function(d){return "translate(" + xw(d.x) + ", 0)"})
          .selectAll(".rectcell")
          .data(function(d){return [d]})
          .enter()
          .append('rect')
            .attr("class", "rectcell")
            .attr("width", function(d){return xw.rangeBand()})
            .attr("height", function(d){return xh.rangeBand()})
            .style("fill", function(d){
              return c(d.z);
            })

        d3.select(this).selectAll(".cell")
          .append("g")
          .attr("transform", function(d){return "translate(0,0)"})
          .append("text")
          .text(function(d){return parseFloat(d.z).toFixed(3);})
          .attr("y", "12px")
          .attr("x", "3px")
          .style("fill", function(d){if(d.z >= 0.8)return "white";return "black"})
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
          .attr("transform", function(d){return "translate(" + xw(d.x) + ", 0)";})
          //.attr("x", function(d){return xw(d.x); });

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
      .attr("width", 500)
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
      .text(function(d,i){return i/(cores.length - 1)})  

      svg.selectAll(".cell-legend")
      .data(cores)
      .enter()
      .append("rect")
      .attr("class", "cell-legend")
      .attr("x", function(d, i){return lado*i*2 + 45})
      .attr("width", lado*2)
      .attr("height", lado)
      .style("fill", function(d){return d;})
    } */

  }
  /*****END*****DRAW THE HEATMAP***********/

  /***START*****TABLE OBJECT 2*************/ 
  function draw_datatable_obj2(){

    var data_obj2 = getDataViz_obj2();

    data_obj2.headers[0]= "ID"

    if(name_dataset == "health1")
      data_obj2.headers.push("# Events")
    else
      data_obj2.headers.push("# Reviews")
    //console.log("noooo puede serrrr", data_obj2.headers)
    draw_TableHtml_obj2(data_obj2.headers);
    data_util = []
    for(var i in data_obj2["body"]){
      data_util.push(data_obj2["body"][i].dat)
      data_util[data_util.length - 1].push(data_obj2["body"][i].len)
    }
    
    order_by_ind = data_obj2['headers'].length-1;

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
      "order": [[ order_by_ind, "desc" ]],
      "bSort": true,
      "bInfo": true,
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
    
    var res =  post_to_server_global({"dbname": name_dataset, "data_selected": data_sel}, "getDataObj2_table")
    
    if(name_dataset == "health1" && redraw_timeChart){
      health_timeChart_logic(res["years"]);
    }
    



    return res;
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


  $("#col0_filter").on('keyup click', function(){
      $("#id_tabla_obj2").DataTable().column(2).search(
        $("#col0_filter").val(),
        true,
        true
      ).draw();
    })

  function refreshTable_obj2(){
    dc.events.trigger(function(){
      var aux = evt.top(Infinity)
      var aux2 = []
      for(var gg in aux){
        aux2.push(aux[gg].id)
      }
      
      var alldata2 = post_to_server_global({"dbname": name_dataset, "data_selected": aux2}, "getDataObj2_table")
      
      if(name_dataset == "health1" && redraw_timeChart){
        health_timeChart_logic(alldata2["years"]);
      }

      var data_util = []
      for(var i in alldata2["body"]){
        data_util.push(alldata2["body"][i].dat)
        data_util[data_util.length - 1].push(alldata2["body"][i].len)
      }

      dataTable_obj2.fnClearTable();
      dataTable_obj2.fnAddData(data_util);
      dataTable_obj2.fnDraw();

    })
  }


  function health_timeChart_logic(dataset){
    console.log("see you", redraw_timeChart)
    /*para agregar la timechart principal*/
    //f = {"name5878": 1, "name3477": 1, "name312": 1}
    //fabian.filter(function(d){if(d in f)return true})
    //dc.renderAll()
    /*var yy = {}
    for(var i in dataset["body"]){
      if(name_dataset == "health1"){
        cadena = dataset["body"][i].dat[2].toString()
        if(!(cadena in yy))
          yy[cadena] = 1
        else
          yy[cadena] += 1  
      }
      
    }*/
    //data = [{"year": "1", "freq": "12", "enfalso": 1}, {"year": "2", "freq": "45", "enfalso": 1}]

    
    
      /*yyy = []
      for(var ii in yy){
        yyy.push({"year": ii, "freq": yy[ii], "ef": 1})
      }*/
      //fabian = yyy
      var miauxdata = [{"year":1847,"freq":2,"ef":1},{"year":1848,"freq":0,"ef":1},{"year":1852,"freq":83,"ef":1},{"year":1853,"freq":54,"ef":1},{"year":1854,"freq":98,"ef":1},{"year":1855,"freq":81,"ef":1},{"year":1856,"freq":58,"ef":1},{"year":1857,"freq":73,"ef":1},{"year":1858,"freq":101,"ef":1},{"year":1859,"freq":54,"ef":1},{"year":1860,"freq":77,"ef":1},{"year":1861,"freq":90,"ef":1},{"year":1862,"freq":80,"ef":1},{"year":1863,"freq":71,"ef":1},{"year":1864,"freq":122,"ef":1},{"year":1865,"freq":71,"ef":1},{"year":1866,"freq":121,"ef":1},{"year":1867,"freq":124,"ef":1},{"year":1868,"freq":140,"ef":1},{"year":1869,"freq":153,"ef":1},{"year":1870,"freq":190,"ef":1},{"year":1871,"freq":222,"ef":1},{"year":1872,"freq":205,"ef":1},{"year":1873,"freq":205,"ef":1},{"year":1874,"freq":225,"ef":1},{"year":1875,"freq":204,"ef":1},{"year":1876,"freq":181,"ef":1},{"year":1877,"freq":186,"ef":1},{"year":1878,"freq":296,"ef":1},{"year":1879,"freq":350,"ef":1},{"year":1880,"freq":372,"ef":1},{"year":1881,"freq":406,"ef":1},{"year":1882,"freq":428,"ef":1},{"year":1883,"freq":367,"ef":1},{"year":1884,"freq":371,"ef":1},{"year":1885,"freq":212,"ef":1},{"year":1886,"freq":298,"ef":1},{"year":1887,"freq":396,"ef":1},{"year":1888,"freq":525,"ef":1},{"year":1889,"freq":404,"ef":1},{"year":1890,"freq":573,"ef":1},{"year":1891,"freq":420,"ef":1},{"year":1892,"freq":508,"ef":1},{"year":1893,"freq":249,"ef":1},{"year":1894,"freq":375,"ef":1},{"year":1895,"freq":345,"ef":1},{"year":1896,"freq":345,"ef":1},{"year":1897,"freq":184,"ef":1},{"year":1898,"freq":386,"ef":1},{"year":1899,"freq":297,"ef":1},{"year":1900,"freq":475,"ef":1},{"year":1901,"freq":369,"ef":1},{"year":1902,"freq":358,"ef":1}]
      miauxdata = miauxdata.slice(0,39)//39
      miauxdata = miauxdata.map(function(d){return {"year": d.year.toString(), "freq": d.freq, "ef": 40}})
      //yyy = miauxdata
      //yyy = [{"year":"1900" ,"freq":12 ,"ef":1 },{"year":"1905" ,"freq": 34,"ef": 1},{"year":"2000" ,"freq":23 ,"ef": 1}]
      yyy = dataset
      brush_health.update(yyy)
     
  }

  /***END*****TABLE OBJECT 2****/

  function refresh_all_data(data){
    
    data_instances = data


    /*data positions*/
    data_set_positions = {}
    for(var i = 0; i < data.length; i++){
      data_set_positions["" + data[i]["idx"]] = data[i]["id"]
    }

    

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
      console.log("RENDELET RESETALL", redraw_timeChart);
      
      mouse_wait(true)

      setTimeout(function(){
        var total     = c.dimension().size();
        var filtered  = c.group().value();
        var disabled  = (total == filtered);
        $(".resetall").attr("disabled", disabled);

        if(tabla_refresh){
          refreshTable_obj1();
          refreshTable_obj2();  
        }

        tabla_refresh = true;
        
        var sub_data = evt.top(Infinity).map(function(d){return d.idx})
        viz_proj.setDataSelected(sub_data)
        viz_proj.draw_only_selected_aux(sub_data);
        draw_table_heatmap();     
        mouse_wait(false) 
        redraw_timeChart = true
      }, 0)
    
      
    })

    evt = ndx.dimension(function(d){return d.idx;})
    d3.select("#idSelectionTotalStrong")
      .text(data_sz)
  }

  function button_resetAll_dcjs(){
    $(".resetall").click(function() {
      resetfn();
    });
  }

  function resetfn(){
    console.log("RESETALL");
    text_search_chart.filter(null);
    evt.filter(function(d){return d;})
    dc.filterAll();
    dc.renderAll();
    $("#search-input").val("");
    $(".resetall").attr("disabled",true);
  }

  this.resetAllBtn = function(){
    resetfn();
  }

  function drawing_chartText(data){
    text_search_chart = ndx.dimension(function(d){
      var str = "";
      str += d.n.toLowerCase();
      /*str += " ";
      for(var i = 0; i < data.length; i++){
        str += data[i].titles[d.values[i]];
      }*/
      return str;
    })

    //f = {"name5878": 1, "name3477": 1, "name312": 1}
    //fabian.filter(function(d){if(d in f)return true})
    //dc.renderAll()
    //fabian = text_search_chart;

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
      "bInfo": true,
      "bAutoWidth": false,
      "bDeferRender": true,
      "aaData": text_search_chart.top(Infinity),
      "bDestroy": true,
    });
    //todo bien hasta aqui

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
                .text(function(d){
                  return data_dimensions[d]["name"];
                })
            d3.select(this)
              .append("div")
                .attr("class", "chart-stage")
                .append("div")
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
    var colores_generales = ["#e6194b", "#3cb44b", "#ffe119", "#0082c8", "#f58231", "#911eb4", "#46f0f0", "#f032e6", "#d2f53c", "#fabebe", "#008080", "#e6beff", "#aa6e28", "#800000", "#aaffc3", "#808000", "#ffd8b1", "#000080", "#b15928", "#6a3d9a", "#33a02c"]
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
      .renderlet(function(chart){
        var colors =d3.scale.ordinal().domain(data[id_dim].titles)
            .range(colores_generales.slice(0, data[id_dim].titles.length));
        chart.selectAll('rect.bar').each(function(d, i){
             //console.log("miraadsadasd", d, colors(d.key), d.key)
             d3.select(this).attr("fill", colors(d.data.key)); // use key accessor if you are using a custom accessor
        });
      });
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