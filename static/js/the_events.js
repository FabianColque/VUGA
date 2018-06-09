
/*Select type of projection by dimension*/
d3.select(".select_proj")
	.on("change", function(d, i){
		var opt_se = d3.select(".select_proj").property('selectedIndex');
		opt_se -= 1;
		var new_dim_proj = post_to_server_global({"dim": opt_se, "dbname": name_dataset}, "getOtherProj")
		viz_proj.update_data_proj(new_dim_proj)
	})



/*Visualize the data original*/
d3.select("#btn_back_Projection")
	.on("click", function(){
		fn_loading(true);
		setTimeout(function(){
			//var_save_area.getData_idx();
			flag_comparison = false
			original_save = var_save_area.getData_idx()
			if(original_save.length > 0){
				var datahisto = post_to_server_global({"data_selected": original_save, "dbname": name_dataset}, "getData_Viz")
		        viz_proj.setDataSelected(original_save)
		        viz_proj.draw_only_selected()
		        histograms_obj1.refresh_All_Data(datahisto.instances)	
			}
			fn_loading(false)
		})
	})

/*Clear All save area*/
d3.select("#btn_clearAll")
	.on("click", function(){
		var_save_area.clearAll()
	})

/*Explore new group since the save area*/
d3.select("#btn_ExploreGroups")
	.on("click", function(){
		if (var_save_area.getData_idx().length == 0) {
			window.alert("There aren't data for exploring.");
			return ;
		}

		fn_loading(true);

		var pro = comparison_original.getOrderbyPriority()
		var perce = comparison_original.getVectorPercent()
		var simi = d3.select(".optionSimi").property("selectedIndex");

		var data_selected = [];
		data_selected = var_save_area.getData_idx();
		
		comparison_original.update(data_selected)
		
		//setTimeout(function(){
			//histograms_obj1.resetAllBtn();
			
			load_aux_original = true;
			
			//if(data_selected.length == 0)return;	
			var iK_groups = parseInt(d3.select("#iK_groups").property("value"))
			var iP_groups = parseInt(d3.select("#iP_groups").property("value"))
			
			var sz  =  pro.length;

			var porcentage = Math.round((iP_groups*sz)/100.0)

			original_save = data_selected
			var groups = post_to_server_global({"dbname": name_dataset, "data_selected": data_selected, "K": iK_groups, "P": pro.slice(0, porcentage+1), "per": perce, "type_simi": simi}, "getNewGroups")
			groups["content"] = [{"objects": data_selected, "id": 0, "histo": perce, "similarity": 1.0}].concat(groups["content"]);
			for(var i = 1; i < groups["content"].length; i++)
				groups["content"][i]["id"]++;
			groups["cluster"].push(0);
			
			if(!mynewGroups)
				mynewGroups = new draw_groups();
			mynewGroups.init(groups)
			fn_loading(false)
		//}, 0)
	})


/*Click to save All Data in Object_1 table*/
d3.select("#Save_All_obj1")
	.on("click", function(d){
		btnSave_Obj1_All();
	})



function btnSave_Obj1_All(){
	var data_save = []
	data_save = $("#id_tabla_obj1").DataTable();
	data_save = data_save.rows().data();
	if(data_save.length > 300){
		alert("Recommendation\nTry saving less users");
		return;
	}
	var aux = {}
	for(var  i = 0 ; i < data_save.length; i ++ ){
		aux[data_save[i]["idx"].toString()] = {"id": data_save[i]["id"], "n": data_save[i]["n"]}
	}

	var_save_area.update(aux);
}

/**Click to save one set of Objects_1*/
d3.select("#Save_obj1")
	.on("click", function(d){
		btnSave_Obj1_individuals();
	})

function btnSave_Obj1_individuals(){
	var data_save = []
	data_save = $("#id_tabla_obj1").DataTable()
	data_save = data_save.rows(".selected")
	data_save = data_save.data();
	if(data_save.length == 0){
		alert("Recommendation\nThere are 0 users selected\nSelect some users in Table of Users");
		return;
	}
	if(data_save.length > 300){
		alert("Recommendation\nTry saving less users");
		return;
	}
	var aux = {}
	for(var  i = 0 ; i < data_save.length; i ++ ){
		aux[data_save[i]["idx"].toString()] = {"id": data_save[i]["id"], "n": data_save[i]["n"]}
	}

	//data_save = data_save.map(function(d){return {"id": d.id, "idx": d.idx, "n": d.n}})

	var_save_area.update(aux);
}	

//Click to explore the data selected in projection area
d3.select("#explore-viz")
	.on("click", function(d){
		
		d3.select("#Save_obj1").style("display", "initial")
		d3.select("#Save_All_obj1").style("display", "initial")				


		//if(name_dataset == "health1"){
			if(brush_health == null){
				brush_health = new myBrush("#timeChart");
				brush_health.init();
			}else{
				brush_health.resetConcepts();	
			}
			redraw_timeChart = true;
		//}
			
		

		if(mynewGroups){
			mynewGroups.clearAll();
			if(comparison_groups)
				comparison_groups.clearAll();
			var_save_area.clearAll()
		}

		if(comparison_original == null){
			comparison_original = new drawComparison("#originalComparison");
			comparison_original.init();
			comparison_original.change_name("Original Group")
		}
		flag_comparison = false;
		load_aux_original = false;

		fn_loading(true);
		setTimeout(function(){
			var data_selected = viz_proj.getDataSelected();
			if(data_selected.length != 0){
				var datahisto = post_to_server_global({"data_selected": data_selected, "dbname": name_dataset}, "getData_Viz")
				if(histograms_obj1 == ""){//if histograms_obj1 not exist
					histograms_obj1 = new drawing_histo_obj1();
					histograms_obj1.init(datahisto);
				}else{//otherwise
					histograms_obj1.refresh_All_Data(datahisto.instances)
				}
				viz_proj.draw_only_selected();	
			}else{
				window.alert("Zero users selected. Please, select users using Lasso");
				//eturn;
			}
				
			fn_loading(false);
		}, 0)
	});
