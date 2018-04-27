$( function() {
   $.post("/is_developer", function(is_d) {
      if (is_d == 0) {
         $("#dialog-start").show();
         $("#dialog-end").show();
         $("#dialog-thanks").show();
         $("#end_interaction_div").show();
         var data_status = -1;
         var dialogStartAutoOpen = true;
         var dialogThanksAutoOpen = false;
         $.post("/certified_user", function(data) {
            data_status = data;
            if (data_status == 0) {
               dialogStartAutoOpen = false;
            }
            else if (data_status == 1) {
               dialogStartAutoOpen = false;
               dialogThanksAutoOpen = true;
            }
            $("#dialog-start").dialog({
               modal: true,
               resizable: false,
               dialogClass: "no-close",
               closeOnEscape: false,
               autoOpen: dialogStartAutoOpen,
               draggable: false,
               my: "center",
               at: "center",
               of: window,
               title: "Start interaction",
               buttons: [
                  {
                     text: "START",
                     click: function() {
                        $(this).dialog("close");
                     }
                  }
               ],
               close: function(event, ui) {
                  $.get("/start_user");
                  $("#end_interaction").button("option", "disabled", false);
               }
            });
            $("#dialog-end").dialog({
               modal: true,
               resizable: false,
               closeOnEscape: true,
               autoOpen: false,
               draggable: false,
               my: "center",
               at: "center",
               of: window,
               title: "End interaction",
               buttons: [
                  {
                     text: "Conclude",
                     click: function() {
                        $(this).dialog( "close" );
                        $.get("/end_user");
                        $("#end_interaction").button("option", "disabled", true);
                        $("#dialog-thanks").dialog("open");
                     }
                  },
                  {
                     text: "Cancel",
                     click: function() {
                        $(this).dialog("close");
                     }
                  }
               ],
            });
            $("#dialog-thanks").dialog({
               modal: true,
               resizable: false,
               dialogClass: "no-close",
               closeOnEscape: false,
               autoOpen: dialogThanksAutoOpen,
               draggable: false,
               my: "center",
               at: "center",
               of: window,
               title: "Thanks"
            });
            var endInteractionDisabled = false;
            if (dialogStartAutoOpen || dialogThanksAutoOpen) {
               endInteractionDisabled = true;
            }
            $("#end_interaction").button({
               disabled: endInteractionDisabled
            });
            $("#end_interaction").click(function(event) {
               $("#dialog-end").dialog("open");
            });
         })
      }
      else if (is_d == 1) {
         $("#dialog-start").hide();
         $("#dialog-end").hide();
         $("#dialog-thanks").hide();
         $("#end_interaction_div").hide();
      }
   })
});
