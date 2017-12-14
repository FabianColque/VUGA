function draw_saveArea(){

  data_selected_save = [];
  
  this.update = function(newData){
    updating(newData)
  }

  this.getData_idx = function(){
    var dat = []
    for(ds in data_selected_save)
      dat.push(parseInt(ds))
    return dat;
  }

  this.clearAll = function(){
    data_selected_save = []
    updating([])
  }

  function updating(newData){
    var data_idx = []
    for(nd in newData){
      data_selected_save[nd] = newData[nd]
    }

    for(nd in data_selected_save){
      data_idx.push(parseInt(nd));
    }

    d3.selectAll("#idsavearea_obj1 *").remove()

    var selection = d3.select("#idsavearea_obj1")
      .selectAll("p")
      .data(data_idx);

    selection.enter()
      .append("p")
      .text(function(d){
        return 'Object_' + data_selected_save[d.toString()].n })
      .style("background-color", function(){
        return "#bebada";
      })
      .style("border-radius", "10px")
      .style("padding-left", "8px")
      .style("padding-right", "8px")
      .selectAll("span")
        .data(function(d){return [d]})
        .enter()
        .append("span")
        .attr("class", "glyphicon glyphicon-remove")
        .style("float", "right")
        .on("click", function(d){
          delete data_selected_save[d.toString()]
          updating({})
          //delete_element_inSave(d);
          //draw_saveArea();
        });    

    selection.exit().remove();    
  }
}



function delete_element_inSave(iddd){
  data_selected_save.delete(iddd[0])
}