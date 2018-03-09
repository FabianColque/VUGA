function drawComparison(div_){
  var div = div_;
  var comparison_matrices = null;
  var resume_comparison = null;
  var stack_heatmap = null;
  var mipiechart = null;
  var sorted_resume = [];

  var colores = ["#e6194b", "#3cb44b", "#ffe119", "#0082c8", "#f58231", "#911eb4", "#46f0f0", "#f032e6", "#d2f53c", "#fabebe", "#008080", "#e6beff", "#aa6e28", "#800000", "#aaffc3", "#808000", "#ffd8b1", "#000080", "#b15928", "#6a3d9a", "#33a02c"];

  this.init = function(){/*div_comparison, div_resume, div_heatmap, div_pie*/
    if(comparison_matrices == null)
      comparison_matrices = new comparison_matriz("Original", div + " #comparison-matrix")
    if(resume_comparison == null){
      resume_comparison = new stackBarVis();
      resume_comparison.setDimensionsChart(400, 10);
      resume_comparison.init(div + " #stack_resume_comparison")
    }
    if(stack_heatmap == null){
      stack_heatmap = new stackBarVis();
      stack_heatmap.setDimensionsChart(400, 10);
      stack_heatmap.init(div + " #stack-heatmap");
    }
    if(mipiechart == null){
      mipiechart = new pieChartVis();
      mipiechart.init(div + " #piechartmio")
    }
  }

  this.getOrderbyPriority = function(){
    return sorted_resume;
  }

  this.change_name = function(name){
    d3.select(div).select("#name_block")
      .text(name)
  }
  
  this.update = function(data_nose){
    //primero cargamos la nueva data
    
    var data_selected = data_nose;
    if(data_nose == undefined){
      data_selected = evt.top(Infinity).map(function(d){return d.idx});
    }
    
    data_selected = data_selected.slice(0,100);
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

    var dim_data_ready = [];
    var resume = [];
    for(var i = 0 ; i < dim_porcen.length; i++){
      dim_data_ready.push({"di": headers_data[i].name, "val": dim_porcen[i] / totalSum, "nada": Math.random()})
      resume.push(dim_porcen[i] / totalSum);
    }

    resume = [resume];

    sorted_resume = d3.range(resume[0].length).sort(function(a, b){return resume[0][b] - resume[0][a]});  
    var sorted_rows = d3.range(data_heatmap["body"].length).sort(function(a, b){return data_heatmap["body"][b][sorted_resume[0]] - data_heatmap["body"][a][sorted_resume[0]]})
    
    comparison_matrices.update_comparison(dim_data_ready);
    resume_comparison.update(resume, ["histogram"], sorted_resume)
    mipiechart.update(resume);

    
    var new_names = data_selected.map(function(d){return data_set_positions[d]})
    new_names = sorted_rows.map(function(d){return new_names[d]});
    var data_sorted = sorted_rows.map(function(d){return data_heatmap["body"][d]})

    stack_heatmap.update(data_sorted, new_names, sorted_resume)

  } 

}