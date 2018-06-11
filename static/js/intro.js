$( function() {
	$.post("/get_email", function(email) {
		document.getElementById("iframe_intro").src = "https://docs.google.com/forms/d/e/1FAIpQLScw1wpzcHxZUSqyt3LhrVmQv2UVqK9diFjcnGhRwq0UPCzcog/viewform?embedded=true&entry.1273304451=" + email;
		$("#iframe_intro").load(function() {
			$.post("/is_load_spreadsheet_w_id", {id: "1D4AIL7Ex8kD6K-NvVLdA42-Bs_kyiswOnOiu3AXGnYU"}, function(is_load) {
				if (is_load == 1) {
					$.get("/pre_register_user");
					$.post("/choose_dataset", function(dataset) {
						window.location.replace("../vexus2?g="+dataset);
					});
				}
			});
		});
	});
});
