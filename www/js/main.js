/** @file main.js
 *	Purpose:  contains all of the javascript for the index file
 *
 * @author Keith Gudger
 * @copyright  (c) 2014, Keith Gudger, all rights reserved
 * @license    http://opensource.org/licenses/BSD-2-Clause
 * @version    Release: 1.0
 * @package    GLBTNearMe
 *
 */
	var currentLatitude = "";
	var currentLongitude = "";
	var options = {			// Intel GPS options
	    timeout: 10000,
	    maximumAge: 11000,
	    enableHighAccuracy: true
	};
	var returnedList; // returned JSON list from GET
	var cat = "" ;		// category from form
	var queryType = {
		list: 0,
		map: 1,
		date: 2,
	};
	var waittext = "<br><b><i>PLEASE WAIT FOR LIST TO LOAD</i></b><br>"

	/* Intel native bridge is available */
	/** 
	 *	Fires when intel code says device is ready
	 */
	var onDeviceReady=function(){
		try {
    		if (intel.xdk.device.platform.indexOf("Android") != -1) {
       		    intel.xdk.display.useViewport(480, 480);
       		} else if (intel.xdk.device.platform.indexOf("iOS") != -1) {
       		    if (intel.xdk.device.model.indexOf("iPhone") != -1 || intel.xdk.device.model.indexOf("iPod") != -1) {
       		        intel.xdk.display.useViewport(320, 320);
       		    } else if (intel.xdk.device.model.indexOf("iPad") != -1) {
       		        intel.xdk.display.useViewport(768, 768);
       		    }
       		}
       		if (intel.xdk.iswin8) {
       		}
	    } catch (e) {
//		        alert(e.message);
	    }
		if ( ( typeof QueryString["lat"] === "undefined" ) ||
			 ( QueryString["lat"] == "" ) ||
			 ( QueryString["lat"] == 0 ) ) {
			try {
		        if (intel.xdk.geolocation !== null) {
	     	      intel.xdk.geolocation.watchPosition(suc, fail, options);
				  console.log("geolocation !== null", 4);
				}
			} catch(e) { 
				alert(e.message);
				console.log("geo watch failed",1);
			}
		} else {
			queryReady();
		}			
	    try {
        //lock orientation
	        intel.xdk.device.setRotateOrientation("portrait");
	        intel.xdk.device.setAutoRotate(false);
	    } catch (e) {}
	    try {
	        //manage power
	        intel.xdk.device.managePower(true, false);
	    } catch (e) {}
	    try {
			//hide splash screen
			intel.xdk.device.hideSplashScreen();
	    } catch (e) {}
	};

	/**
	 *	Fires when DOM page loaded
	 */
    function ready() {
		if ( typeof QueryString["lat"] === "undefined" ) {
		    if (navigator.geolocation) {
    	      	navigator.geolocation.getCurrentPosition(showPosition);
			}
		} else 
			queryReady();
	};

	/** 
	 * function to take care of QueryString if exists
	 * set up latitude and longitude and fill form.
	 */
	function queryReady() {
		currentLatitude = QueryString["lat"];
		currentLongitude = QueryString["lon"];
	    initialize(); // assigns google map

		if ( typeof QueryString["category"] !== "undefined" ) {
		  var elmnt = document.getElementById('catselect')
		  var value = decodeURI(QueryString["category"]);
		  value = value.replace(/[+]/g, " ");
//		  alert("Category is " + value);
		  for(var i=0; i < elmnt.options.length; i++)
		  {
		    if(elmnt.options[i].value === value) {
		      elmnt.selectedIndex = i;
		      break;
		    }
		  }
		}
		if ( typeof QueryString["zipcode"] !== "undefined" ) 
			document.getElementById('distform').elements["zipcode"].value = QueryString["zipcode"];
		if ( typeof QueryString["milesdist"] !== "undefined" ) 
			document.getElementById('distform').elements		["milesdist"].value = QueryString["milesdist"];
	
//		alert("End of queryReady");
/*		af.ui.autoLaunch = true; // stops splashscreen
		af.ui.launch();
*/	}
		
	/** 
	 *	sets current latitude and longitude from ready() function
	 */
	function showPosition(position) {
	    currentLatitude = position.coords.latitude;
	    currentLongitude = position.coords.longitude;
	    initialize(); // assigns google map
	};

	if(typeof intel === 'undefined') {
	    document.addEventListener( "DOMContentLoaded", ready, false );
	} else {
		document.addEventListener("intel.xdk.device.ready",onDeviceReady,false);
	}
    //Success callback
	/**
	 *	function to set current latitude and longitude from GPS
	 *	@param p is passed from intel library function
	 */
	var suc = function(p) {
	    console.log("geolocation success", 4);
	    //Draws the map initially
    	currentLatitude = p.coords.latitude;
    	currentLongitude = p.coords.longitude;
		initialize();
	};
	/**
	 *	fail function for intel gps routine - does nothing 
	 */			    
	var fail = function() {
	    console.log("Geolocation failed. \nPlease enable GPS in Settings.", 1);
	};
	/**
	 *	opens window in browser for the donate button
	 */
	function donateFn() {
		if (typeof (intel.xdk.device) === 'undefined') 
			window.open('https://donatenow.networkforgood.org/1210845','_system');
		else
			intel.xdk.device.launchExternal('https://donatenow.networkforgood.org/1210845');
	};

	/** formats map page with the one marker
	 *	@param i is index into listing
	 */
	function mapone(i) {
		var locstring = GETform("index2.html");
		locstring += "&lindex=" + i ;
		location.href = locstring;
	}

	/**
	 * back button
	 */
	function backtostart() {
		window.location.hash = "mainsub";
	};
	/**
	 *	Sets up GET parameters for the REQUEST from the form
	 *	@return GET string
	 */
	function getinitparams() {
		var zip = document.getElementById('distform').elements["zipcode"].value;
		var params = "" ;
		var miles = document.getElementById('distform').elements["milesdist"].value;
		if ( zip != "" ) 
			params = "zip=" + zip;
		else
			params = "latitude=" + currentLatitude + "&longitude=" + currentLongitude;
		if ((miles.length > 0) && (miles > 0))
			params+= "&miles=" + miles;
		return params;
	};
	/**
	 *	gets category from form and adds to GET request
	 *	@return GET string
	 */
	function startlist() {
		var params = getinitparams();
		cat = document.getElementById('distform').elements["category"].value;
		params += "&category=" + encodeURI(cat);
		return params;
	}
	/**
	 *	onclick function for "list" button
	 */
	function listformFn() {
		if ( checkZip() ) {
			document.getElementById('waitlist').innerHTML = waittext;
			var params = startlist() ;
			listpagefunc(params,cat,queryType.list);
		}
	};

	/**
	 * Function checks whether zip and navigation are on
	 * @return true if so, false otherwise
	 */
	function checkZip() {
		var zip = document.getElementById('distform').elements["zipcode"].value;
	    if ( (zip == null || zip == "") &&
			 (currentLatitude == "") ) {
	        alert("You must enter a zip code or turn on navigation (GPS).");
			return false;
		} else
			return true;
	}
	
	/**
	 *	onclick function for "National Organizations" button
	 */
	function nationalFn() {
		document.getElementById('waitlist').innerHTML = waittext;
		var params = "national=Yes";
		listpagefunc(params,"National",queryType.list);
	};
	/**
	 *	formats date field
	 */
	function formatdate() {
		var retstring = "Data Last Updated: " + returnedList ;
 		document.getElementById('updatedate').innerHTML = retstring;
		update_date = retstring;
	};

	/**
	 *	formats listing after data returned from API
	 *	@param params is GET request string
	 *	@param natnl is category
	 */
	function formatlist(params, natnl) {
		var numberList = document.getElementById("natlisting");
	    var i;
		var oldcat = "" ;
		var namedist = "" ;
		var natlist = (natnl == "National") ? listingType.natlist : listingType.fulllist;
	    for(i = 0; i<returnedList.length; i++) {
			if ( oldcat != returnedList[i].Type ) {
				oldcat = returnedList[i].Type ;
//				console.log("In formatlist, category is " + oldcat + " and length is " + returnedList.length + " and i is " + i);
				namedist+= '<p class="nlist">' + oldcat + '</p>';
			}
            //create new text node
			namedist += listhtml(i,natlist);
			namedist += "<br>";
	    }
		numberList.innerHTML=namedist;
		document.getElementById('waitlist').innerHTML = "<br>&nbsp<br>";

		activate_subpage("#natsp"); // slides in list sub-page
	};

	/**
	 *	formats data for individual listing and calls sub-page swap
	 *	@param i is index into list
	 */
	function full_list(i) {
		var listdata = document.getElementById("natsinglelist");
		var listing = listhtml(i, listingType.infolist);
		listdata.innerHTML=listing;
		activate_subpage("#uib_page_detail"); // slides in sub-list detail page.
	}

	/**
	 *	sets up form to latitude and longitude
	 */
    function initialize() {
		document.getElementById("latin").value = currentLatitude;
		document.getElementById("lonin").value = currentLongitude;
    };


