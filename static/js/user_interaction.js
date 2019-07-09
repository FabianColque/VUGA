$( function() {
	$.post("/is_developer", function(is_d) {
		if (is_d == 0) {
			$("#dialog-interactive-tour").show();
			$("#dialog-start").show();
			$("#dialog-end").show();
			$("#dialog-form").show();
			$("#dialog-thanks").show();
			$("#tasks_div").show();
			$("#help_div").show();
			var dialogInteractiveTourOpen = true;
			var dialogStartAutoOpen = false;
			var dialogFormAutoOpen = false;
			var dialogThanksAutoOpen = false;
			$.post("/certified_user", function(data_status) {
				if (data_status == 1) {
					dialogInteractiveTourOpen = true;
					dialogStartAutoOpen = false;
					dialogFormAutoOpen = false;
					dialogThanksAutoOpen = false;
				}
				else if (data_status == 2) {
					dialogInteractiveTourOpen = false;
					dialogStartAutoOpen = true;
					dialogFormAutoOpen = false;
					dialogThanksAutoOpen = false;
				}
				else if (data_status == 3) {
					dialogInteractiveTourOpen = false;
					dialogStartAutoOpen = false;
					dialogFormAutoOpen = true;
					dialogThanksAutoOpen = false;
				}
				else if (data_status == 4) {
					dialogInteractiveTourOpen = false;
					dialogStartAutoOpen = false;
					dialogFormAutoOpen = false;
					dialogThanksAutoOpen = true;
				}
				$("#dialog-interactive-tour").dialog({
					modal: true,
					resizable: false,
					dialogClass: "no-close",
					closeOnEscape: false,
					autoOpen: dialogInteractiveTourOpen,
					draggable: false,
					position: {
						my: "center",
						at: "center",
						of: window
					},
					title: "Interactive guided tour",
					buttons: [
						{
							text: "START",
							click: function() {
								$(this).dialog("close");
							}
						}
					],
					close: function(event, ui) {
						$.get("/register_user");
						test_enjoyhint();
					}
				});
				$("#dialog-start").dialog({
					modal: true,
					resizable: false,
					dialogClass: "no-close",
					closeOnEscape: false,
					autoOpen: dialogStartAutoOpen,
					draggable: false,
					position: {
						my: "center",
						at: "center",
						of: window
					},
					title: "Welcome to VugA",
					buttons: [
						{
							text: "START",
							click: function() {
								$(this).dialog("close");
							}
						}
					],
					open: function(event, ui) {
						$.post("/have_task", function(is_load) {
							if (is_load == 1) {
								$("#dialog-start").dialog("close");
							}
						});
					},
					close: function(event, ui) {
						$.get("/start_user");
						$("#tasks_button").button("option", "disabled", false);
						$("#help_button").button("option", "disabled", false);
						$("#sidenav_tasks").css("width", "400px");
						$("#tasks_button").addClass("ui-state-active");
						$.post("/get_form_url", function(forms_url) {
							forms_url = jQuery.parseJSON(forms_url);
							if (forms_url.length!=0) {
								$.post("/start_task", {id_dataset: forms_url[0]["id_dataset"], id_task: forms_url[0]["id_task"]});
								document.getElementById("iframe_tasks").src = forms_url[0]["form_url"];
								var tasks = forms_url;
								$("#iframe_tasks").load(function() {
									if (tasks.length==0) {
										$.get("/end_user");
										$("#sidenav_tasks").css("width", "0");
										$("#tasks_button").removeClass("ui-state-active");
										$("#tasks_button").button("option", "disabled", true);
										$("#help_button").button("option", "disabled", true);
										$("#dialog-end").dialog("open");
									}
									else {
										$.post("/is_load_spreadsheet", {id_dataset: tasks[0]["id_dataset"], id_task: tasks[0]["id_task"]}, function(is_load) {
											if (is_load == 1) {
												$.post("/end_task", {id_dataset: tasks[0]["id_dataset"], id_task: tasks[0]["id_task"]});
												tasks.splice(0, 1);
												if (tasks.length==0) {
													$.get("/end_user");
													$("#sidenav_tasks").css("width", "0");
													$("#tasks_button").removeClass("ui-state-active");
													$("#tasks_button").button("option", "disabled", true);
													$("#help_button").button("option", "disabled", true);
													$("#dialog-end").dialog("open");
												}
												else {
													$.post("/start_task", {id_dataset: tasks[0]["id_dataset"], id_task: tasks[0]["id_task"]});
													document.getElementById("iframe_tasks").src = tasks[0]["form_url"];
												}
											}
										});
									}
								});
							}
							else {
								$.get("/end_user");
								$("#sidenav_tasks").css("width", "0");
								$("#tasks_button").removeClass("ui-state-active");
								$("#tasks_button").button("option", "disabled", true);
								$("#help_button").button("option", "disabled", true);
								$("#dialog-end").dialog("open");
							}
						});
					}
				});
				$("#dialog-end").dialog({
					modal: true,
					resizable: false,
					dialogClass: "no-close",
					closeOnEscape: false,
					autoOpen: dialogFormAutoOpen,
					draggable: false,
					position: {
						my: "center",
						at: "center",
						of: window
					},
					title: "Evaluation questions",
					open: function(event, ui) {
						$.get("/start_form");
					},
					buttons: [
						{
							text: "CONTINUE",
							click: function() {
								$(this).dialog( "close" );
								$("#dialog-form").dialog("open");
							}
						}
					],
				});
				$("#dialog-form").dialog({
					modal: true,
					resizable: false,
					dialogClass: "no-close",
					closeOnEscape: false,
					autoOpen: false,
					draggable: false,
					position: {
						my: "center bottom-10",
						at: "center bottom-10",
						of: window
					},
					width: "90%",
					height: ($(window).height() - 100),
					title: "VugA Questions",
					open: function(event, ui) {
						$.post("/get_email", function(email) {
							document.getElementById("iframe_form").src = "https://docs.google.com/forms/d/e/1FAIpQLSdvagDwi3UsroT7xViFJwJh8ILlJwXAHUEPViFqmuHCiV_emw/viewform?embedded=true&entry.945529671=" + email;
							$("#iframe_form").load(function() {
								$.post("/is_load_spreadsheet_w_id", {id: "1_8iMR6JHGnhGS9BLorcCkmSPd74wS8KCRZkvBAsZymU"}, function(is_load) {
									if (is_load == 1) {
										$("#dialog-form").dialog("close");
									}
								});
							});
						});
					},
					close: function(event, ui) {
						$.get("/end_form");
						$("#dialog-thanks").dialog("open");
					}
				});
				$("#dialog-thanks").dialog({
					modal: true,
					resizable: false,
					dialogClass: "no-close",
					closeOnEscape: false,
					autoOpen: dialogThanksAutoOpen,
					draggable: false,
					position: {
						my: "center",
						at: "center",
						of: window
					},
					title: "Thanks"
				});
				var buttonsDisabled = false;
				if (dialogInteractiveTourOpen || dialogStartAutoOpen || dialogFormAutoOpen || dialogThanksAutoOpen) {
					buttonsDisabled = true;
				}
				$("#tasks_button").button({
					disabled: buttonsDisabled
				});
				$("#tasks_button").click(function(event) {
					if ($("#sidenav_tasks").css("width") == "0px") {
						$("#sidenav_tasks").css("width", "400px");
						$("#tasks_button").addClass("ui-state-active");
					}
					else {
						$("#sidenav_tasks").css("width", "0");
						$("#tasks_button").removeClass("ui-state-active");
					}
				});
				$("#help_button").button({
					disabled: buttonsDisabled
				});
				$("#help_button").click(function(event) {
					test_enjoyhint_with_skip();
				});
				$("#help_button").css("height", $("#tasks_button").css("height"));
			});
		}
		else if (is_d == 1) {
			$("#dialog-interactive-tour").hide();
			$("#dialog-start").hide();
			$("#dialog-end").hide();
			$("#dialog-form").hide();
			$("#dialog-thanks").hide();
			$("#tasks_div").hide();
			$("#help_div").hide();
		}
	});
});
