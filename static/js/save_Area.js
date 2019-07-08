function draw_saveArea(){

  data_selected_save = [];
  d3.select("#btn_ExploreGroups")
    .style("background-color", "#cccccc")
    .style("border-color", "#cccccc")
    .style("pointer-events", "none")
  
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

    d3.select("#num_elements_saveArea")
      .text(function(){
        return "There are " + data_idx.length + " elements";
      })

    d3.select("#iemin_groups").property("value", data_idx.length);
    d3.select("#iemax_groups").property("value", data_idx.length);
    d3.select("#iemin_groups").property("max", data_idx.length)
    d3.select("#iemax_groups").property("max", data_idx.length)

    if(data_idx.length > 0){
      d3.select("#btn_ExploreGroups")
        .style("background-color", "#5cb85c")
        .style("border-color", "#4cae4c")
        .style("pointer-events", "all")
    }else{
      d3.select("#btn_ExploreGroups")
        .style("background-color", "#cccccc")
        .style("border-color", "#cccccc")
        .style("pointer-events", "none")
    }


    d3.selectAll("#idsavearea_obj1 *").remove()
    var selection = d3.select("#idsavearea_obj1")
      .style("height", function(d){
        return document.getElementById("projection_area").scrollHeight * 0.3 + "px";
      })
      .style("overflow-y", "scroll")  
      .selectAll("p")
      .data(data_idx)

      

    selection.enter()
      .append("p")
      .text(function(d){
        return data_selected_save[d.toString()].n })
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
