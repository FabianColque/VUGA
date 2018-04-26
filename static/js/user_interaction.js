$( function() {
   var data_status = -1;
   var dialogStartAutoOpen = true;
   var dialogEndAutoOpen = false;
   $.post("/certified_user", function(data) {
      data_status = data;
      if (data_status == 0) {
         dialogStartAutoOpen = false;
      }
      if (data_status == 1) {
         dialogStartAutoOpen = false;
         dialogEndAutoOpen = true;
      }
      $( "#dialog-start" ).dialog({
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
                  $( this ).dialog( "close" );
               }
            }
         ],
         close: function(event, ui) {
            $.get("/start_user");
         }
      });
      $( "#dialog-end" ).dialog({
         modal: true,
         resizable: false,
         dialogClass: "no-close",
         closeOnEscape: false,
         autoOpen: dialogEndAutoOpen,
         draggable: false,
         my: "center",
         at: "center",
         of: window,
         title: "Thanks"
      });
   })
});
