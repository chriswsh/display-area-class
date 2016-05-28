// This is the Browse Menu object.
// It holds span names, keeps tracks of internal vars, and POST info
// Requires jQuery w/ AJAX
// SAMPLE CODE FOR DISPLAY

function display_area() {

  // Increment the number of displays
  this.constructor.population++;
  
  // ************
  // PRIVATE VARS
  // ************
  var total_items = 0,
      items_per_page = 0,
      pages_per_spread = 0,
      max_page = 0,
      current_page = 1,
      offset = 0;
      display_div_id = "",
      menu_div_id = "",
      serving_page = "",
      search_filter = "",
      initialized = false,
      attached = false
      ;

  // *****************    
  // PRIVATE FUNCTIONS
  // *****************
  function checkTagFormat(o){
    if ((typeof (o.attrib_type) == 'undefined') || (typeof (o.attrib_name) == 'undefined')) return false;
    var querent = o.attrib_name;
    
    switch (o.attrib_type.toLowerCase()) {
      case 'id':
        // May or may not be started by a #, and it must follow the rules for id attribute names
        if (querent.match(/^#?[a-zA-Z][\w\-:.]+$/) == "null") return false;
        break;
      case 'php':
        if (querent.match(/^[\w\/][\w.\/]+.php(\?(\w+=\w+)(&\w+=\w+)*)?$/) == "null") return false;
        break;
      default:
        return false; 
        break;
    }
    
    return true;
  }
  
  // ** Function **
  // Generates the display for the area
  // Format for o.page: [(int) page number]&filter=[this.search_filter]
  function generateDisplay(o){
    $.post(o.server + '?page=' + o.page, function(data){
    	$(o.div).html(data);
    	// Display the Nav bar
    	// Use parseInt on page to drop search filter info
    	generateNav({page: parseInt(o.page), max: o.max, spread: o.spread, off: o.off, div: o.menu_div, parent: o.parent});
    	// o.parent_class.total_items = -5;
    	o.post();
    });
    return true;
  }
  
  // ** Function **
  // Generates the Nav bar for the area
  function generateNav(o){
    // If there isn't more than one max, don't show the spread
    if (o.max == 0){
      $(o.div).addClass("hidden");
      return false;
    }
    // Initialize vars
    var page_spread_modulo = 1 - o.spread % 2; // Correct for an odd number of pages
    var adjust = 0; // Holds the amount to adjust the page listings by if you're close to the beginning/end
    
    // Get the provisional range
    var first_page = o.page - o.off + page_spread_modulo;
    var last_page = o.page + o.off;
    
    // Adjust the range
    
    // Check first to see if there are fewer pages than the page spread minimum
    if (first_page < 1 && last_page > o.max){
      first_page = 1;
      last_page = o.max;
    }
    // Then to see if we're near page 1
    else if (first_page <= 1){
      adjust = 1 - first_page;
      first_page = 1;
      last_page = last_page + adjust;
    }
    // And finally if we're near the last page
    else if (last_page >= o.max){
      adjust = last_page - o.max;
      first_page = first_page - adjust;
      last_page = o.max;
    }
    else {
    }
    
    // Show/Hide the Prev Page/Next Page anchors
    
    // If there's only one or no pages, hide both previous and next pages
    if (o.max == 1 || o.max == 0){
      $(o.div + " span.menu_previous").addClass("hidden");
      $(o.div + " span.menu_next").addClass("hidden");
    }
    // If we're at the first page, hide the previous page anchor
    else if (o.page == 1){
      $(o.div + " span.menu_previous").addClass("hidden");
      $(o.div + " span.menu_next").removeClass("hidden");
    }
    // If we're at the last page, hide the next page anchor
    else if (o.page == o.max){
      $(o.div + " span.menu_previous").removeClass("hidden");
      $(o.div + " span.menu_next").addClass("hidden");
    }
    // Otherwise, show both anchors
    else {
      $(o.div + " span.menu_previous").removeClass("hidden");
      $(o.div + " span.menu_next").removeClass("hidden");
    }
   
    // Now that we have a range, show/hide the appropriate anchors...
    
    if (o.max == 1) {
      $(o.div + " span.menu_browse_1").addClass("hidden");
    }
    else {
      for (i = 1; i < first_page; i++){
        $(o.div + " span.menu_browse_" + i).addClass("hidden");
      }
      for (i = first_page; i <= last_page; i++){
        $(o.div + " span.menu_browse_" + i).removeClass("hidden");
        $(o.div + " span.menu_browse_" + i + " > a").html(i);
      }
      for (i = last_page + 1; i <= o.max; i++){
        $(o.div + " span.menu_browse_" + i).addClass("hidden");
      }
      // ...and highlight the anchor corresponding to the current page
      $(o.div + " span.menu_browse_" + o.page + " > a").html("[" + o.page + "]");
    }
    
    return true;
  }
    
  // ** Function **
  // Creates NAV Bar HTML
  function createNav(o){
    navhtml = '<p class="menu" id="' + display_area.prototype.getName(o.parent) + '_menu">';
    navhtml += '<span title="previous" class="menu_previous"><a href="#" class="menu_prev_link"><<</a> </span>';
    for (i = 1; i <= o.max; i++){
      navhtml += '<span class="menu_browse_' + i + '"> <a class="menu_page_link" href="#" title="' + i + '">' + i + '</a> </span>';
    }
    navhtml += '<span title="next" class="menu_next"> <a href="#" class="menu_next_link">>></a></span>';
    navhtml += '</p>';
    $("div" + o.div).html(navhtml);
    return true;
  }
  
  // ** Function **
  // Bind handlers to the menu bar links
  function bindHandlers(o){
    // Update the linked events
    // Previous page
    $('p#' + display_area.prototype.getName(o.parent) + '_menu a.menu_prev_link').live('click', function(event){
      event.preventDefault();
      o.parent.previousPage();
    });
    // Jump to page
    $('p#' + display_area.prototype.getName(o.parent) + '_menu a.menu_page_link').live('click', function(event){
      event.preventDefault();
      o.parent.displayPage($(this).attr("title"));
    });
    // Next page
    $('p#' + display_area.prototype.getName(o.parent) + '_menu a.menu_next_link').live('click', function(event){
      event.preventDefault();
      o.parent.nextPage();
    });
  }
  
  // ** Function **
  // Unbind all assigned handlers
  function unbindHandlers(o){
    $('p#' + display_area.prototype.getName(o.parent) + '_menu a.menu_prev_link').die('click');
    // Jump to page
    $('p#' + display_area.prototype.getName(o.parent) + '_menu a.menu_page_link').die('click');
    // Next page
    $('p#' + display_area.prototype.getName(o.parent) + '_menu a.menu_next_link').die('click');
  
  }
  
  // ******************
  // PRIVILEGED METHODS - can be called publicly but not changed, only overwritten
  // ******************
  
  // ** Function **
  // Initializes the menu object. MUST be done first
  // Takes an object with .items, .itemsperpage, .pagespread, .servingpage

  this.initialize = function(o){
    // Check for valid parameter reference    
    if ((typeof (o.items) == "undefined") || (typeof (o.itemsperpage) == "undefined") || (typeof (o.pagespread) == "undefined") || (typeof (o.servingpage) == "undefined")) return false;
    
    // Check for valid data
    if ((parseInt(o.items) < 0) || (parseInt(o.itemsperpage) < 1) || (parseInt(o.pagespread) < 1)) return false;
    if (!checkTagFormat({attrib_type: 'php', attrib_name: o.servingpage})) return false;
    
    this.total_items = parseInt(o.items);
    this.items_per_page = parseInt(o.itemsperpage);
    this.pages_per_spread = parseInt(o.pagespread);
    this.offset = parseInt(this.pages_per_spread / 2);
    this.max_page = this.total_items / this.items_per_page;
    if (this.max_page != parseInt(this.max_page)) this.max_page = parseInt(this.max_page) + 1;
    this.serving_page = o.servingpage;
    this.current_page = 1;
    this.initialized = true;
    this.search_filter = "%";
    return true;
  }

  // ** Function **
  // Resets the object to initial state
  this.unset = function(){
    if (!this.initialized) return false;
  
    // If the object hasn't been detached, do so
    if (this.attached) this.detach();
    
    this.total_items = 0;
    this.items_per_page = 0;
    this.pages_per_spread = 0;
    this.offset = 0;
    this.serving_page = "";
    this.initialized = false;
    return true;    
  }

  // ** Function **
  // Attaches the ID of a menubar DIV and a display area DIV to the object
  // Takes an object with .menudiv and .displaydiv

  this.attachDIV = function(o){
    // Check to see if the object has been initialized
    if (!this.initialized) return false;
    
    // Check for valid parameter reference
    if ((typeof (o.menudiv) != "string") || (typeof (o.displaydiv) != "string")) return false;
  
    // Check for proper ID format; accept either bare ID tag or "#tag" format    
    if (!checkTagFormat({attrib_type: 'id', attrib_name: o.menudiv})) return false;
    if (!checkTagFormat({attrib_type: 'id', attrib_name: o.displaydiv})) return false;
    
    // Add the "#" if the div IDs don't already have it
    this.display_div_id = o.displaydiv.substr(0, 1) == "#" ? o.displaydiv : "#" + o.displaydiv;
    this.menu_div_id = o.menudiv.substr(0, 1) == "#" ? o.menudiv : "#" + o.menudiv;
           
    // Create NAV Bar HTML
    createNav({max: this.max_page, div: this.menu_div_id, parent: this});
    // Attach event handlers
    bindHandlers({parent: this});
    this.attached = true;
    return true;    
  }
  
  // ** Function **
  // Detaches the menu bar DIV and the display area DIV
  
  this.detachDIV = function(){
    if (!this.initialized || !this.attached) return false;

    // Set the html of the DIVs to indicate unbound status
    $("div#" + display_div_id).html('unbound');
    $("div#" + menu_div_id).html('unbound');
    // Unbind handlers
    unbindHandlers({parent: this});
    // Reset vars
    this.display_div_id = "";
    this.menu_div_id = "";
    this.attached = false;
    return true;
  }
  
  // ** Function **
  // Displays a specific page of results
  // If no page is passed, display the current page
  
  this.displayPage = function(page){
    // Check to see if the object has been initialized and attached
    if (!this.initialized || !this.attached) return false;
    
    // If the page value isn't passed, just display the current page
    this.current_page = typeof(page) == "undefined" ? this.current_page : parseInt(page);
    
    // If the page value is outside of the allowed bounds, put it back inside
    if (this.current_page < 1) this.current_page = 1;
    if (this.current_page > this.max_page) this.current_page = this.max_page;
    
    // Display the data
    generateDisplay({server: this.serving_page, page: this.current_page + "&filter=" + this.search_filter, max: this.max_page, off: this.offset, spread: this.pages_per_spread, div: this.display_div_id, menu_div: this.menu_div_id, per_page: this.items_per_page, post: this.afterDisplay, parent: this});
    
    return true;
  }
    
  // ** Function **
  // Display the previous page
  
  this.previousPage = function(){
    this.current_page = this.current_page > 1 ? this.current_page - 1 : 1;
    this.displayPage();    
  }
  
  // ** Function **
  // Display the next page
  
  this.nextPage = function(){
    this.current_page = this.current_page < this.max_page ? this.current_page + 1 : this.max_page;
    this.displayPage();
  }
  
  // ** Function **
  // Display the first page
  this.firstPage = function(){
    this.current_page = 0;
    this.displayPage();
  }
  
  // ** Function **
  // Set search filter
  this.setFilter = function(text){
    if (typeof(text) != 'undefined') {
      this.search_filter = text;
      if (this.search_filter.substr(-1) != '%') this.search_filter = this.search_filter + '%';
    }
    else {
      this.search_filter = "%";
    }
  }
  
  // ** Function **
  // A function to run after the content has been displayed
  
  this.afterDisplay = function(){
  }
  
}

// *****************
// PUBLIC PROPERTIES
// *****************

display_area.prototype.getName = function(x){
    for(var i in window){
       if(x === window[i]){return i;}
    }
}

// *****************
// STATIC PROPERTIES
// *****************

display_area.population = 0;
