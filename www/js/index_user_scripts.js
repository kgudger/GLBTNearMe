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
        
        
        $(document).on("click", ".uib_w_4", function(evt)
        {
         activate_subpage("#natsp"); 
        });
        $(document).on("click", ".uib_w_5", function(evt)
        {
         activate_subpage("#uib_page_detail"); 
        });
}
 $(document).ready(register_event_handlers);
})();
