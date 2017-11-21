//////////function auxiliar to disable and enable components into a tag
$.fn.disable = function() {
    return this.each(function() {
        if (typeof this.disabled != "undefined") this.disabled = true;
    });
}

$.fn.enable = function() {
    return this.each(function() {
        if (typeof this.disabled != "undefined") this.disabled = false;
    });
}

//Button Load existing file
d3.select('#btn_load_existing_file')
  .on("click", function(d){
    //dataname = {"dbname": d3.select("#tagselect_Existing_dataset").property("value")}
    dataname = d3.select("#tagselect_Existing_dataset").property("value")
    console.log("dataajnsdf", dataname)
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



// Method that checks that the browser supports the HTML5 File API
function browserSupportFileUpload() {
  var isCompatible = false;
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    isCompatible = true;
  }
  return isCompatible;
}

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


//configuration details OBJ 1 - START
function configuration_obj_1(headers){
  d3.selectAll("#tab-list-obj1 *").remove();
  d3.selectAll("#tab-content-obj1 *").remove();

  //tab of configuration

  d3.select("#tab-list-obj1")
    .selectAll("li")
    .data(headers)
    .enter()
    .append("li")
    .attr("class", function(d, i){
      if (i == 0) {return "active"}
      return "";
    })
    .attr("id", function(d, i){return "li-tab-obj1-"+d})
      .selectAll("a")
      .data(function(d){return [d]})
      .enter()
      .append("a")
      .attr("href", function(d){return "#tab-obj1-" + d})
      .attr("role", "tab")
      .attr("data-toggle", "tab")
      .text(function(d){return d})
      .selectAll("span")
      .data(function(d){return [d, d]})
      .enter()
      .append("span")
      .attr("class", function(d, i){
        if(i == 0)
          return "glyphicon glyphicon-ok"
        return "glyphicon glyphicon-remove"
      })
      .attr("id", function(d, i){
        if(i == 0)
          return "tab-obj1-ok"
        return "tab-obj1-remove"
      })
      .attr("type", "button")
      .attr("title", function(d, i){
        if (i == 0) {
          return "Consider this Attribute"
        }
        return "Not Consider this Attribute"
      }).style("color", function(d, i){
        if(i == 0)return "red"
        return "#bdbdbd";
      })
      .style("cursor", "pointer")
      .on("click", function(d, i){
        console.log("aqui function")
        if(i == 0){
          d3.select("#li-tab-obj1-" + d + " #tab-obj1-remove").style("color", "#bdbdbd");         
          $("#tab-obj1-"+d + " *").enable()
        }else{
          d3.select("#li-tab-obj1-" + d + " #tab-obj1-ok").style("color", "#bdbdbd");
          $("#tab-obj1-"+d + " *").disable()
        }
        d3.select(this)
            .style("color", "red");
      })

    //content of configuration

    d3.select("#tab-content-obj1")    
    .selectAll("div")
    .data(headers)
    .enter()
    .append("div")
    .attr("class", function(d, i){
      if(i == 0){
        return "tab-pane fade in active";
      }
      return "tab-pane fade";
    }).attr("id", function(d){
      return "tab-obj1-" + d;
    })/*.text(function(d){
      return "obj1-" + d;
    })*/

    d3.selectAll("#tab-content-obj1 .tab-pane")
      .each(function(d){
        d3.select(this)
          .append("label")
          .attr("class", "control-label")
          .attr("for", "name")
          .text("Name");

        d3.select(this)
          .append("input")
            .attr("class", "form-control")
            .attr("type", "text")
            .attr("value", function(d){return d})  

        d3.select(this)
          .append("label")
          .attr("class", "control-label")
          .attr("for", "name")
          .text("Type of Variable")

        d3.select(this)
          .append("select")
          .attr("class", "form-control")
          .attr("id", function(d){return "conf-obj1-" + d + "-typeV";})
          .on('change', onchange_select_V)
          .selectAll("option")
          .data(["", "Categorical", "Continuous"])
          .enter()
          .append("option")
          .text(function(d){return d})      

        d3.select(this)
          .append("label")
          .attr("class", "control-label")
          .attr("for", "name")
          .text("Chart Viz")

        d3.select(this)
          .append("select")
          .attr("class", "form-control")
          .attr("id", function(d){return "conf-obj1-" + d + "-typeC";})
          //.on("change", onchange_select_C) 
          .selectAll("option")
          .data(["", "Line Chart", "Row Chart", "Pie Chart"])
          .enter()
          .append("option")
          .text(function(d){return d}) 

      })


      ////////////
      function onchange_select_V(d){

        var direccion = "#conf-obj1-" + d + "-typeV";
        if(d3.select(direccion).property("value") != "Categorical"){
          d3.selectAll("#tab-obj1-" + d + " #tab-obj1-detail-categorical").remove();
          return;
        }

        var div = d3.select("#tab-obj1-" + d)
          .append("div")
            .attr("id", "tab-obj1-detail-categorical")
        
        div.append("label")
          .attr("for", "domain")
          .text("Domain");

        div.append('p')
          .text('Ex. val_1, val_2, val_3, ... val_n')  
          
        div.append("input")
          .attr("class", "form-control")
          .attr("id", "domain")
          .attr("type", "text")

        div.append("label")
          .attr('for', "range")
          .text("Range")  

        div.append("p")
          .text('Ex. val_1, val_2, val_3, ... val_n')  

        div.append("input")
          .attr("class", "form-control")
          .attr("id", "range")
          .attr("type", 'text')

            

      }
      /////////////

}
//configuration details OBJ 1 - END
//configuration details OBJ 2 - START
function configuration_obj_2(headers){
  d3.selectAll("#tab-list-obj2 *").remove();
  d3.selectAll("#tab-content-obj2 *").remove();

  d3.select("#tab-list-obj2")
    .selectAll("li")
    .data(headers)
    .enter()
    .append("li")
    .attr("class", function(d, i){
      if(i == 0)return "active";
      return "";
    })
    .attr("id", function(d){return "li-tab-obj2-" + d})
      .selectAll("a")
      .data(function(d){return [d]})
      .enter()
      .append("a")
      .attr("href", function(d){return "#tab-obj2-" + d})
      .attr("role", "tab")
      .attr("data-toggle", "tab")
      .text(function(d){return d})
      .selectAll("span")
      .data(function(d){return [d, d]})
      .enter()
      .append("span")
      .attr("class", function(d, i){
        if(i == 0)return "glyphicon glyphicon-ok"
        return "glyphicon glyphicon-remove"
      })
      .attr('id', function(d, i){
        if(i == 0)return "tab-obj2-ok"
        return "tab-obj2-remove"
      })
      .attr("type", "button")
      .attr("title", function(d, i){
        if(i == 0) return "Consider this Attribute"
        return "Not consider this "
      })
      .style("color", function(d, i){
        if(i == 0 )return "red"
        return "#bdbdbd";
      }).style("cursor", "pointer")
      .on("click", function(d, i){
        if(i == 0){
          d3.select("#li-tab-obj2-" + d + " #tab-obj2-remove").style("color", "#bdbdbd");
          $("#tab-obj2-" + d + " *").enable();
        }else{
          d3.select("#li-tab-obj2-" + d + " #tab-obj2-ok").style("color", "#bdbdbd")
          $("#tab-obj2-" + d + " *").disable();
        }
        d3.select(this)
          .style("color", "red");
      })


    d3.select("#tab-content-obj2")
      .selectAll("div")
      .data(headers)
      .enter()
      .append("div")
      .attr("class", function(d, i){
        if(i == 0) return "tab-pane fade in active";
        return "tab-pane fade";
      }).attr("id", function(d){
        return "tab-obj2-" + d;
      })

    d3.selectAll("#tab-content-obj2 .tab-pane")
      .each(function(d){
        d3.select(this)
          .append("label")
            .attr("class", "control-label")
            .attr("for", "name")
            .text("Variable");
        
        d3.select(this)
          .append('select')
            .attr("class", "form-control")
            .attr("id", function(d){return "conf-obj2-" + d + "-var";})
            .on('change', onchange_select_var)
            .selectAll("option")
            .data(['', "Number", "String", "List"])
            .enter()
            .append('option')
              .text(function(d){return d;})

        d3.select(this)
          .append("label")
            .attr("class", "control-label")
            .attr("for", "name")
            .text("Chart Viz")

        d3.select(this)
          .append("select")
            .attr("class", "form-control")
            .attr("id", function(d){return "conf-obj2-" + d + "-typeC"})
            .selectAll("option")
            .data(["", "Line Chart"])
            .enter()
            .append("option")
            .text(function(d){return d;})

        function onchange_select_var(d){
          var direccion = "#conf-obj2-" + d + "-var";
          if(d3.select(direccion).property("value") != "Number"){
            d3.selectAll("#tab-obj2-" + d + " #tab-obj2-detail-number").remove();
            return;
          }

          var div = d3.select("#tab-obj2-" + d)
            .append("div")
              .attr("id", "tab-obj2-detail-number");
          
          div.append("p")
            .text("This type will be considered as categorical, we need one domain and one range")
                
          div.append("label")
            .attr("for", "name")
            .text("Domain")
          
          div.append('p')
            .text('Ex. val_1, val_2, val_3, ... val_n')  
            
          div.append("input")
            .attr("class", "form-control")
            .attr("id", "name")
            .attr("type", "text")

          div.append("label")
            .attr('for', "range")
            .text("Range")  

          div.append("p")
            .text('Ex. val_1, val_2, val_3, ... val_n')  

          div.append("input")
            .attr("class", "form-control")
            .attr("id", "range")
            .attr("type", 'text')
        }         
      })
}
//configuration details OBJ 2 - END


//configuration details RATING - START

function configuration_rating(headers){
  d3.selectAll("#tab-list-rating *").remove();
  d3.selectAll("#tab-content-rating *").remove();

  d3.select("#tab-list-rating")
    .selectAll("li")
    .data(headers)
    .enter()
    .append("li")
      .attr("class", function(d, i){
        if (i == 0) {return "active"};
        return "";
      }).attr("id", function(d, i){return "li-tab-rating-" + d})
      .selectAll("a")
      .data(function(d){return [d]})
      .enter()
      .append("a")
      .attr("href", function(d){return "#tab-rating-" + d})
      .attr("role", "tab")
      .attr("data-toggle", "tab")
      .text(function(d){return d})
      .selectAll("span")
      .data(function(d){return [d,d]})
      .enter()
      .append("span")
      .attr("class", function(d, i){
        if (i == 0) {return "glyphicon glyphicon-ok"}
        return "glyphicon glyphicon-remove";
      }).attr("id", function(d, i){
        if (i == 0) {return "tab-rating-ok"}
        return "tab-rating-remove";
      }).attr("type", "button")
      .attr("title", function(d, i){
        if (i == 0) {return "Consider this Attribute"};
        return "Not consider this Attribute";
      }).style("color", function(d, i){
        if (i == 0) {return "red"};
        return "#bdbdbd";
      }).style("cursor", "pointer")
      .on("click", function(d, i){
        if (i == 0) {
          d3.select("#li-tab-rating-" + d + " #tab-rating-remove").style("color", "#bdbdbd");
          $("#tab-rating-" + d + " *").enable();
        }else{
          d3.select("#li-tab-rating-" + d + " #tab-rating-ok").style("color", "#bdbdbd");
          $("#tab-rating-" + d + " *").disable();
        }
        d3.select(this)
          .style("color", "red");
      })

    d3.select("#tab-content-rating")
      .selectAll("div")
      .data(headers)
      .enter()
      .append("div")
      .attr("class", function(d, i){
        if (i == 0) {return "tab-pane fade in active"};
        return "tab-pane fade";
      }).attr("id", function(d){
        return "tab-rating-" + d;
      })

      d3.selectAll("#tab-content-rating .tab-pane")
        .each(function(d){
          d3.select(this)
            .append("label")
            .attr("class", "control-label")
            .attr("for", "name")
            .text("Minimum number rating")
          
          d3.select(this)
            .append("input")
            .attr("class", "form-control")
            .attr("type", "text")
            .attr("id", "minimum")
            .attr("value", "1");
          
          d3.select(this)
            .append("label")    
            .attr("class", "control-label")
            .attr("for", "name")
            .text("Maximum number rating")

          d3.select(this)
            .append("input")
            .attr("class", "form-control")
            .attr("type", "text")
            .attr("id", "maximum")
            .attr("value", "5")
        })
}

//configuration details RATING - END

//configuration details DIMENSIONS - START

function configuration_dimensions(headers){
  d3.selectAll("#tab-list-dims *").remove();
  d3.selectAll("#tab-content-dims *").remove();

  d3.select("#tab-list-dims")
    .selectAll("li")
    .data(headers)
    .enter()
    .append("li")
    .attr("class", function(d, i){
      if(i == 0)return 'active';
      return "";
    }).attr("id", function(d, i){return "li-tab-dims-" + d})
      .selectAll("a")
      .data(function(d){return [d]})
      .enter()
      .append("a")
      .attr("href", function(d){return "#tab-dims-" + d})
      .attr("role", "tab")
      .attr("data-toggle", "tab")
      .text(function(d){return d})
      .selectAll("span")
      .data(function(d){return [d, d]})
      .enter()
      .append("span")
      .attr("class", function(d, i){
        if(i == 0)
          return "glyphicon glyphicon-ok"
        return "glyphicon glyphicon-remove"
      })
      .attr("id", function(d, i){
        if(i == 0)
          return "tab-dims-ok"
        return "tab-dims-remove"
      })
      .attr("type", "button")
      .attr("title", function(d, i){
        if (i == 0) {
          return "Consider this Attribute"
        }
        return "Not Consider this Attribute"
      }).style("color", function(d, i){
        if(i == 0)return "red"
        return "#bdbdbd";
      })
      .style("cursor", "pointer")
      .on("click", function(d, i){
        console.log("aqui function")
        if(i == 0){
          d3.select("#li-tab-dims-" + d + " #tab-dims-remove").style("color", "#bdbdbd");         
          $("#tab-dims-"+d + " *").enable()
        }else{
          d3.select("#li-tab-dims-" + d + " #tab-dims-ok").style("color", "#bdbdbd");
          $("#tab-dims-"+d + " *").disable()
        }
        d3.select(this)
            .style("color", "red");
      })

    d3.select("#tab-content-dims")    
    .selectAll("div")
    .data(headers)
    .enter()
    .append("div")
    .attr("class", function(d, i){
      if(i == 0){
        return "tab-pane fade in active";
      }
      return "tab-pane fade";
    }).attr("id", function(d){
      return "tab-dims-" + d;
    })

    d3.selectAll("#tab-content-dims .tab-pane")
      .each(function(d){
        d3.select(this)
          .append("label")
          .attr("class", "control-label")
          .attr("for", "name")
          .text("Type")

        d3.select(this)
          .append("select")
          .attr("class", "form-control")
          .attr("id", function(d){return "conf-dims-" + d + "-typeVDim";})
          .on('change', onchange_select_number_dim)
          .selectAll("option")
          .data(["", "String", "Number"])
          .enter()
          .append("option")
          .text(function(d){return d})  
      })

    function onchange_select_number_dim(d){
      var direccion = "#conf-dims-" + d + "-typeVDim";
      if (d3.select(direccion).property("value") != "Number") {
        d3.selectAll("#tab-dims-" + d + " #tab-dim-detail-Number").remove();
        return;
      };

      var div = d3.select("#tab-dims-" + d)
        .append("div")
          .attr("id", "tab-dims-detail-number");

      div.append('label')
        .attr("for", "name")
        .text("Minimum value")

      div.append("input")
        .attr("class", 'form-control')
        .attr("type", "text")
        .attr("id", "minimum")

      div.append("label")
        .attr("for", "name")
        .text("Maximum value")

      div.append("input")
        .attr("class", "form-control")
        .attr("type", "text")
        .attr("id", "maximum")
    }

}

//configuration details DIMENSIONS - END


//The event listener for the file upload
document.getElementById('fileUploadObj1').addEventListener('change', upload_object1, false);
document.getElementById('fileUploadObj2').addEventListener('change', upload_object2, false);
document.getElementById('fileUploadRatings').addEventListener('change', upload_ratings, false);
document.getElementById('fileUploadDims').addEventListener('change', upload_dimensions, false);

//Method that reads and processes the selected file
//Here I upload the csv file and send it to server.
function upload_object1(evt){

  if($("#nameDB").val() == ""){
    console.log("que pasas");
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

  console.log("estoy aqui obj2");

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
      console.log("aqui data pls", data)
      if(data && data.length > 0){
        console.log('Imported - ' + data.length + ' - rows successfully!');
      }else{
        console.log('No data to import!');
      }

      //sending to server
      var jsondata = {"dbname": $("#nameDB").val(), "filename": "dimensions", "data": data};
      send_to_server_files_configuration(JSON.stringify(jsondata));

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
    data            :   jsondata,
    async           :   false,
    success         :   function(da){results = JSON.parse(da);}
  });
  return results;
}