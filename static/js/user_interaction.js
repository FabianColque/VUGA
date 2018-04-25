$( function() {
   $( "#dialog-start" ).dialog({
      modal: true,
      resizable: false,
      dialogClass: "no-close",
      closeOnEscape: false,
      autoOpen: true,
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
         console.log("Se cerró.")
      }
   });
} );
