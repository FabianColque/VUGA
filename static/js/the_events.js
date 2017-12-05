

/*Explore new group since the save area*/
d3.select("#btn_ExploreGroups")
	.on("click", function(){
		fn_loading(true);
		setTimeout(function(){
			var data_selected = var_save_area.getData_idx();
			var groups = post_to_server_global({"dbname": name_dataset, "data_selected": data_selected}, "getNewGroups")
			console.log("mis nuevos grupos", groups)
			if(!mynewGroups)
				mynewGroups = new draw_groups();
			mynewGroups.init(groups)
			fn_loading(false)
		}, 0)
	})


/*Click to save All Data in Object_1 table*/
d3.select("#Save_All_obj1")
	.on("click", function(d){
		console.log("rules Save_All_obj1")
		btnSave_Obj1_All();
	})

function btnSave_Obj1_All(){
	var data_save = []
	data_save = $("#id_tabla_obj1").DataTable();
	data_save = data_save.rows().data();
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
		fn_loading(true);
		setTimeout(function(){
			var data_selected = viz_proj.getDataSelected();
			if(data_selected.length != 0){
				var datahisto = post_to_server_global({"data_selected": data_selected, "dbname": name_dataset}, "getData_Viz")
				console.log("data Viz", datahisto)
				if(histograms_obj1 == ""){//if histograms_obj1 not exist
					histograms_obj1 = new drawing_histo_obj1();
					histograms_obj1.init(datahisto);
				}else{//otherwise
					histograms_obj1.refresh_All_Data(datahisto.instances)
				}
			}

			viz_proj.draw_only_selected();		
			fn_loading(false);
		}, 0)
	});