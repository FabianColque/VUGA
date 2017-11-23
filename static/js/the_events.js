

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

	console.log("holis save", aux);
	var_save_area.update(aux);
}	

//Click to explore the data selected in projection area
d3.select("#explore-viz")
	.on("click", function(d){
		var data_selected = viz_proj.getDataSelected();
		if(data_selected.length != 0){
			var datahisto = post_to_server_global({"data_selected": data_selected, "dbname": name_dataset}, "getData_Viz")
			if(histograms_obj1 == ""){//if histograms_obj1 not exist
				histograms_obj1 = new drawing_histo_obj1();
				histograms_obj1.init(datahisto);
			}else{//otherwise
				histograms_obj1.refresh_All_Data(datahisto.instances)
			}
		}

		viz_proj.draw_only_selected();		
	});