function drawComparison(div_){
  var div = div_;
  var comparison_matrices = null;
  var resume_comparison = null;
  var stack_heatmap = null;
  var mipiechart = null;
  var sorted_resume = [];
  var dim_data_ready = [];

  //var colores = ["#e6194b", "#3cb44b", "#ffe119", "#0082c8", "#f58231", "#911eb4", "#46f0f0", "#f032e6", "#d2f53c", "#fabebe", "#008080", "#e6beff", "#aa6e28", "#800000", "#aaffc3", "#808000", "#ffd8b1", "#000080", "#b15928", "#6a3d9a", "#33a02c"];
  var colores = colorsArray2;

  this.init = function(){/*div_comparison, div_resume, div_heatmap, div_pie*/
    var w_ = document.getElementById(div.slice(1)).scrollWidth;
    if(comparison_matrices == null)
      comparison_matrices = new comparison_matriz("Original", div + " #comparison-matrix")
      comparison_matrices.setDimensionsChart(w_ - 100, 200);
      comparison_matrices.init();
    if(resume_comparison == null){
      resume_comparison = new stackBarVis();
      resume_comparison.setDimensionsChart(w_ - 100, 10);//w = 400
      resume_comparison.init(div + " #stack_resume_comparison")
    }
    if(stack_heatmap == null){
      stack_heatmap = new stackBarVis();
      stack_heatmap.setDimensionsChart(w_ - 100, 10);//w = 400
      stack_heatmap.init(div + " #stack-heatmap");
    }
    if(mipiechart == null){
      mipiechart = new pieChartVis();
      mipiechart.init(div + " #piechartmio")
    }
  }


  this.clearAll = function(){
    comparison_matrices.clearAll();
    resume_comparison.clearAll();
    stack_heatmap.clearAll();
    mipiechart.clearAll();
    d3.select(div).select("#name_block").style("visibility", "hidden")
  }

  //todo bien hasta aqui
  this.getOrderbyPriority = function(){
    return sorted_resume;
  }

  this.getVectorPercent = function(){
    return dim_data_ready.map(function(d){return d.val})
  }

  this.change_name = function(name){
    d3.select(div).select("#name_block")
      .text(name)
  }
  

  this.update = function(data_nose){
    //primero cargamos la nueva data
    d3.select(div).select("#name_block").style("visibility", "visible")
    var data_selected = data_nose;
    if(data_nose == undefined){
      data_selected = evt.top(Infinity).map(function(d){return d.idx});
    }
    //console.log("cuando sucede esto")
    //data_selected = data_selected.slice(0,100);
    data_heatmap = post_to_server_global({"dbname": name_dataset, "data_selected": data_selected}, "get_heatmap");

    var dim_porcen = new Array(data_heatmap["headers"].length).fill(0.0);
    var totalSum = 0.0;
    for(var i = 0; i < data_selected.length; i++){
      for(var j = 0; j < data_heatmap["headers"].length; j++){
        var fab = parseFloat(data_heatmap["body"][i][j]);
        if(fab < 0.0)fab = 0.0
        if(fab > 1.0)fab = 1.0
        dim_porcen[j] += fab
        totalSum += fab;
      }
    }

    dim_data_ready = []
    var resume = [];
    for(var i = 0 ; i < dim_porcen.length; i++){
      dim_data_ready.push({"di": headers_data[i].name, "val": dim_porcen[i] / totalSum, "nada": Math.random()})
      resume.push(dim_porcen[i] / totalSum);
    }

    resume = [resume];

    sorted_resume = d3.range(resume[0].length).sort(function(a, b){return resume[0][b] - resume[0][a]});  
    //var sorted_rows = d3.range(data_heatmap["body"].length).sort(function(a, b){return data_heatmap["body"][b][sorted_resume[0]] - data_heatmap["body"][a][sorted_resume[0]]})
    
    var num_col = data_heatmap["body"][0].length;
    var sorted_rows = d3.range(data_heatmap["body"].length)
      .sort(function(a, b){
        for(var i = 0; i < num_col; i++){
          if(data_heatmap["body"][b][sorted_resume[i]] != data_heatmap["body"][a][sorted_resume[i]])
            return data_heatmap["body"][b][sorted_resume[i]] - data_heatmap["body"][a][sorted_resume[i]]
        }
        return sorted_resume[b] - sorted_resume[a];
      })


    comparison_matrices.update_comparison(dim_data_ready);
    resume_comparison.update(resume, ["All"], sorted_resume)
    mipiechart.update(resume);

    

    if(div == "#originalComparison"){
      if(data_selected_save.length != 0){
        data_set_positions = {}
        for(var ds in data_selected_save)
          data_set_positions[String(ds)] = data_selected_save[ds].id;
        
      }
    }
    var new_names = data_selected.map(function(d){return data_set_positions[d]})
    new_names = sorted_rows.map(function(d){return new_names[d]});
    var data_sorted = sorted_rows.map(function(d){return data_heatmap["body"][d]})
    maximum_len = 100
    if(data_sorted.length < 100)
      maximum_len = data_sorted.length
    olas = shuffle(maximum_len)
    console.log("impo: ", olas)
    olas = olas.slice(0, maximum_len)
    console.log("impo2: ", olas)
    olas.sort(function(a,b){return a-b});
    console.log("impo3: ", olas)

    data_sorted1 = d3.range(maximum_len).map(function(d){return data_sorted[olas[d]]})
    
    data_sorted = data_sorted1
    fabian = data_sorted
    //data_sorted = data_sorted.slice(0, 100)
    stack_heatmap.update(data_sorted, new_names, sorted_resume)

  }

  function shuffle(maxElements) {
    //create ordered array : 0,1,2,3..maxElements
    for (var temArr = [], i = 0; i < maxElements; i++) {
        temArr[i] = i;
    }

    for (var finalArr = [maxElements], i = 0; i < maxElements; i++) {
        //remove rundom element form the temArr and push it into finalArrr
        finalArr[i] = temArr.splice(Math.floor(Math.random() * (maxElements - i)), 1)[0];
    }

    return finalArr
  } 

}