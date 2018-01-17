/*some global variables*/
var dimensions_headers = [];

d3.select("#btn_generate")
  .on("click", function(){
    
    generate_all_data();
})





function generate_all_data(){

  /*********START *********** *DETAILS and dataViz GENERATE*/
  var res_dimensions = {"Dimensions_total": [], "Dimensions_charts": [], "features": []}
  
  //extacting the dimensions total

  var g = d3.selectAll("#tab-list-dims li")
  var dimensions_selected = []
  var features = []
  var setDimensions_selected = {}

  g[0].forEach(function(d, i){
    gg = d3.select(d).select("#tab-dims-ok").style("color"); 
    if(gg == "rgb(255, 0, 0)" || gg == "red"){
      dimensions_selected.push(i+1) 
      setDimensions_selected[i.toString()] = true;
    }
  })
  for(var i = 0; i < dimensions_selected.length; i++){
    res_dimensions["Dimensions_total"].push({"name": dimensions_headers[dimensions_selected[i]]})
    
  }


  //console.log("res_dimensions", res_dimensions)
  //extracting the dimensions charts

  var dimensions_charts = []
  var dim_permit = {}
  d3.selectAll("#tab-list-obj1 li")[0].forEach(function(d, i){
    var tt = d3.select(d).select("#tab-obj1-ok").style("color")
    if(tt == "red" || tt == "rgb(255, 0, 0)")
      dim_permit[i.toString()] = true;
    else
      dim_permit[i.toString()] = false;
  })
  //console.log("dim_permit", dim_permit);
  d3.selectAll("#tab-content-obj1 .tab-pane")[0].forEach(
    function(d, i){
      if(dim_permit[i.toString()] == true){
        //si es una dimension con check permitido
        var name = d3.select(d).select("#name_obj1").attr("value")
        var t_var = d3.select(d).select("#conf-obj1-"+ name +"-typeV").property("value")
        var t_chart = d3.select(d).select("#conf-obj1-"+ name +"-typeC").property("value")
        var dom = []
        var ran = []
        if(t_var == "Numerical"){
          dom = d3.select(d).select("#domain").property("value")
          if(dom == "" || dom == null)
            dom = []
          else
            dom = dom.split(",")
          
          ran = d3.select(d).select("#range").property("value")
          if(ran == "" || ran == null)
            ran = []
          else
            ran = ran.split(",")
        }

        dimensions_charts.push({"name": name, "type_chart": t_chart, "t_var": t_var, "dom": dom, "ran": ran, "idx": i+1})
      }
      //console.log("holis", d, i)
    }
  )

  //console.log("dimensions_charts", dimensions_charts)

  //extracting features

  d3.selectAll("#tab-content-dims .tab-pane")[0].forEach(
    function(d, i){
      if(setDimensions_selected[i.toString()] == true){
        
        var type = d3.select(d).select("#conf-dims-"+dimensions_headers[i+1]+"-typeVDim").property("value")
        var details = []
        if(type != "String"){
          var min = d3.select(d).select("#minimum").property("value")
          var max = d3.select(d).select("#maximum").property("value")
          if(min == "" || max == ""){
            details = []
          }else{
            details = [min, max]
          }
        }else{
          details = []
        }
        features.push({"type": type, "detail": details})
      }
    }
  );

  res_dimensions["Dimensions_charts"] = dimensions_charts;
  res_dimensions["features"] = features
  res_dimensions["dbname"] = $("#nameDB").val()

  post_to_server_global(res_dimensions, "save_and_generate_newData")


  /*********END *********** *DETAILS.JSON and dataViz GENERATE*/
  
}








//Button Load existing file
d3.select('#btn_load_existing_file')
  .on("click", function(d){
    //dataname = {"dbname": d3.select("#tagselect_Existing_dataset").property("value")}
    dataname = d3.select("#tagselect_Existing_dataset").property("value")
    window.open("/vexus2?g=" + dataname);
    //post_to_server_global(data, "start_new_template_Viz");
    //$.get("/vexus2?g=" + dataname);
    /*$.get("/vexus2?g=" + dataname, function(data, status){
        alert("Data: " + data + "\nStatus: " + status);
    });*/

    /*$.ajax({
      type  : "GET",
      url: "/vexus2?g=" + dataname,
      success : function(data){}
    })*/
  })





//Load existing dataset START tagselect_Existing_dataset

function load_existing_dataset(){

  //load directories
  var data_names = post_to_server_global("", "recover_name_datasets")
  data_names = [""].concat(data_names);
  //load dataset
  d3.select("#tagselect_Existing_dataset")
    .selectAll("option")
    .data(data_names)
    .enter()
    .append("option")
    .text(function(d){return d;})

}
load_existing_dataset();

//Load existing dataset END




//The event listener for the file upload
document.getElementById('fileUploadObj1').addEventListener('change', upload_object1, false);
document.getElementById('fileUploadObj2').addEventListener('change', upload_object2, false);
document.getElementById('fileUploadRatings').addEventListener('change', upload_ratings, false);
document.getElementById('fileUploadDims').addEventListener('change', upload_dimensions, false);

//Method that reads and processes the selected file
//Here I upload the csv file and send it to server.
function upload_object1(evt){

  if($("#nameDB").val() == ""){
    alert("Dataset name missed");
    return;
  }

  if(!browserSupportFileUpload()){
    console.log('The File APIs are not fully supported in this browser!');
  }else{
    var data = null;
    var file = evt.target.files[0];
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function(event){
      var csvData = event.target.result;
      data = $.csv.toArrays(csvData);
      if(data && data.length > 0){
        console.log('Imported - ' + data.length + ' - rows successfully!');
      }else{
        console.log('No data to import!');
      }

      //sending to server
      var jsondata = {"dbname": $("#nameDB").val(), "filename": "object_1", "data": data};
      send_to_server_files_configuration(JSON.stringify(jsondata));
      
      configuration_obj_1(data[0].slice(2));
    };
    reader.onerror = function(){
      console.log('Unable to read ' + file.filename);
    }
  }
}

///////////////////////////////////

function upload_object2(evt){

  
  if(!browserSupportFileUpload()){
    console.log('The File APIs are not fully supported in this browser!');
  }else{
    var data = null;
    var file = evt.target.files[0];
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function(event){
      var csvData = event.target.result;
      data = $.csv.toArrays(csvData);
      if(data && data.length > 0){
        console.log('Imported - ' + data.length + ' - rows successfully!');
      }else{
        console.log('No data to import!');
      }

      //sending to server
      var jsondata = {"dbname": $("#nameDB").val(), "filename": "object_2", "data": data};
      send_to_server_files_configuration(JSON.stringify(jsondata));


      configuration_obj_2(data[0].slice(2));

    };
    reader.onerror = function(){
      console.log('Unable to read ' + file.filename);
    }
  }
}

///////////////////////////////

function upload_ratings(evt){
  
  if(!browserSupportFileUpload()){
    console.log('The File APIs are not fully supported in this browser!');
  }else{
    var data = null;
    var file = evt.target.files[0];
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function(event){
      $("body").css("opacity", 0.3)
      var csvData = event.target.result;
      data = $.csv.toArrays(csvData);
      if(data && data.length > 0){
        console.log('Imported - ' + data.length + ' - rows successfully!');
      }else{
        console.log('No data to import!');
      }

      //sending to server
      var jsondata = {"dbname": $("#nameDB").val(), "filename": "ratings", "data": data};
      send_to_server_files_configuration(JSON.stringify(jsondata));

      configuration_rating(data[0].slice(2));
      $("body").css("opacity", 1)
    };
    reader.onerror = function(){
      console.log('Unable to read ' + file.filename);
    }
  }
  
}
//////////////////////////////////

function upload_dimensions(evt){

  if(!browserSupportFileUpload()){
    console.log('The File APIs are not fully supported in this browser!');
  }else{
    var data = null;
    var file = evt.target.files[0];
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function(event){
      var csvData = event.target.result;
      data = $.csv.toArrays(csvData);
      if(data && data.length > 0){
        console.log('Imported - ' + data.length + ' - rows successfully!');
      }else{
        console.log('No data to import!');
      }

      //sending to server
      var jsondata = {"dbname": $("#nameDB").val(), "filename": "dimensions", "data": data};
      send_to_server_files_configuration(JSON.stringify(jsondata));
      dimensions_headers = data[0];
      configuration_dimensions(data[0])
    };
    reader.onerror = function(){
      console.log('Unable to read ' + file.filename);
    }
  }
}

function send_to_server_files_configuration(jsondata){
  var results = "";
  $.ajax({
    url             :   "/save_new_dataset_configuration",
    type            :   'POST',
    contentType     :   'application/json',
    data            :   jsondata,
    async           :   false,
    success         :   function(da){results = JSON.parse(da);}
  });
  return results;
}


function post_to_server_global(jsondata, service){
  var results = "";
  $.ajax({
    url             :   "/" + service,
    type            :   'POST',
    contentType     :   'application/json',
    data            :   JSON.stringify(jsondata),
    async           :   false,
    success         :   function(da){results = JSON.parse(da);}
  });
  return results;
}
