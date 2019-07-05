function drawing_histo_obj_ori(){

   var ndx;
   var ndxAll;
   var array_charts = [];

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
   this.init = function(data) {

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

      ndx = crossfilter(data.instances);
      ndxAll = ndx.groupAll();

      /*Drawing the Charts fixed*/
      draw_datatable_obj1(data);

      button_resetAll_dcjs(); 

      if (tabla_refresh) {
         refreshTable_obj1();
      }
      tabla_refresh = true;
   }

   this.refresh_All_Data = function(data){
      refresh_all_data(data)
   }

   /***START*****TABLE OBJECT 2*************/ 
   function draw_datatable_obj2(){

      var data_obj2 = getDataViz_obj2();

      data_obj2.headers[0]= "ID"

      if(name_dataset == "health1")
         data_obj2.headers.push("# Events")
      else
         data_obj2.headers.push("# Reviews")
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

      dataTable_obj2 = $("#ori_id_tabla_obj2").dataTable({
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

      var res = []
      //if(name_dataset !== "health1")
      //res = post_to_server_global({"dbname": name_dataset, "data_selected": data_sel}, "getDataObj2_table")
      //else
      res = post_to_server_global({"dbname": name_dataset, "data_selected": data_sel}, "getDataObj2_and_concepts")
      if(redraw_timeChart){//name_dataset == "health1" && 
         health_timeChart_logic(res["years"]);
      }




      return res;
   }

   function draw_TableHtml_obj2(headers){
      d3.select("#ori_dataTable_obj2")
         .append("table")
         .attr("id", "ori_id_tabla_obj2")
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


   $("#ori_col0_filter").on('keyup click', function(){
      $("#ori_id_tabla_obj2").DataTable().column(2).search(
         $("#ori_col0_filter").val(),
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
         var alldata2 = []
         //if(name_dataset !== "health1")
         //alldata2 = post_to_server_global({"dbname": name_dataset, "data_selected": aux2}, "getDataObj2_table")
         //else{
         var vamo = {}
         if(!redraw_timeChart)
            vamo = brush_health.getConcepts()
         alldata2 = post_to_server_global({"dbname": name_dataset, "data_selected": aux2, "concepts_selected": vamo}, "getDataObj2_and_concepts")
         //}
         if(redraw_timeChart){//name_dataset == "health1" && 
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
      yyy = dataset
      brush_health.update(yyy)

   }

   /***END*****TABLE OBJECT 2****/

   function refresh_all_data(data){
      /*
      data_instances = data


      data_set_positions = {}
      for(var i = 0; i < data.length; i++){
         data_set_positions["" + data[i]["idx"]] = data[i]["id"]
      }



      //var textfilter  = text_search_chart.filters()
      //var countfilter = count.filters();


      text_search_chart.filter(null);
      //count.filter(null)

      ndx.remove()

      //text_search_chart.filter([textfilter]);
      //count.filter([countfilter]);
      ndx.add(data);
      dc.redrawAll();
      */
   }

   function button_resetAll_dcjs(){
      $(".resetall").click(function() {
         resetfn();
      });
   }

   function resetfn(){
      //console.log("RESETALL");
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

   /*---START--------- Table Object 1*/

   function draw_datatable_obj1(data){


      /*para timechart*/
      var yy = data["instances"].map(function(d){return d.id})
      var NroUsersbyConcept = post_to_server_global({"dbname": name_dataset, "data_selected": yy}, "getNroUsersbyConcept")

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


      dataTable_obj1 = $("#ori_id_tabla_obj1").dataTable({
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

      function draw_TableHtml(headers){
         d3.select("#ori_dataTable_obj1")
            .append("table")
            .attr("id", "ori_id_tabla_obj1")
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

      draw_datatable_obj2();
   }

   function refreshTable_obj1(){
      dc.events.trigger(function(){
         alldata  =evt.top(Infinity);
         dataTable_obj1.fnClearTable();
         dataTable_obj1.fnAddData(alldata);
         dataTable_obj1.fnDraw();
         window.dispatchEvent(new Event('resize'));
         refreshTable_obj2();
      })
   }

   this.refreshTables = function (data) {
      dc.events.trigger(function () {
         dataTable_obj1.fnClearTable();
         dataTable_obj1.fnAddData(data);
         dataTable_obj1.fnDraw();
         window.dispatchEvent(new Event("resize"));
         dc.events.trigger(function(){
            var aux = data;
            var aux2 = []
            for(var gg in aux){
               aux2.push(aux[gg].id)
            }
            var alldata2 = []
            //if(name_dataset !== "health1")
            //alldata2 = post_to_server_global({"dbname": name_dataset, "data_selected": aux2}, "getDataObj2_table")
            //else{
            var vamo = {}
            if(!redraw_timeChart)
               vamo = brush_health.getConcepts()
            alldata2 = post_to_server_global({"dbname": name_dataset, "data_selected": aux2, "concepts_selected": vamo}, "getDataObj2_and_concepts")
            //}
            if(redraw_timeChart){//name_dataset == "health1" && 
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
         });
      });
   }

   /*---END--------- Table Object 1*/

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
            aux.dim = ndx.dimension(function(d){
               //console.log("search opcupation movielens: ", data_dimensions[i].titles[d.values[i]], name_dataset)
               return data_dimensions[i].titles[d.values[i]];
            })
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
}//End function drawi
