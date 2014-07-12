(function()
{
 "use strict";
 /*
   hook up event handlers 
 */
 function register_event_handlers()
 {
    
    
         $(document).on("click", ".uib_w_3", function(evt)
        {
         activate_subpage("#mainsub"); 
        });
        
        $(document).on("click", ".uib_w_5", function(evt)
        {
         activate_subpage("#natsp"); 
        });
}
 $(document).ready(register_event_handlers);
})();
