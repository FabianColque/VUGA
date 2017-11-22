

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