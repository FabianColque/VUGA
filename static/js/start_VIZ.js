//name of the dataset
var name_dataset = d3.select("#namedb-vexus2").text()
var link_app = ""
//Variable vizualization of the projection
var viz_proj = "";
//Variable vizualization charts from object 1
var histograms_obj1 = ""

function start(){
  
  console.log("name db", name_dataset)

  var data_projection = post_to_server_global({"dbname": name_dataset}, "get_data_projection");
  viz_proj = new vis_projection();
  viz_proj.init(data_projection);
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