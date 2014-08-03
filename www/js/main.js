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
	var _map = null; // Google Map holder
	var currentLatitude = "";
	var currentLongitude = "";
	var options = {			// Intel GPS options
	    timeout: 10000,
	    maximumAge: 11000,
	    enableHighAccuracy: true
	};
	var markers = []; // markers array to clear
	var returnedList; // returned JSON list from GET
	var cat = "" ;		// category from form
	var infoWindow;		// holder for all infoWindows
	var queryType = {
		list: 0,
		map: 1,
		date: 2,
	};

	/* Intel native bridge is available */
	/** 
	 *	Fires when intel code says device is ready
	 */
	var onDeviceReady=function(){
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
	 * set up latituce and longitude and fill form.
	 */
	function queryReady() {
		currentLatitude = QueryString["lat"];
		currentLongitude = QueryString["lon"];
		var latlng = new google.maps.LatLng(currentLatitude, currentLongitude);
	    initialize(latlng); // assigns google map

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
//		document.getElementById("geostat").innerHTML="Browser nav ready";
		var latlng = new google.maps.LatLng(currentLatitude, currentLongitude);
	    initialize(latlng); // assigns google map
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
	    if (_map === null) {
	    	currentLatitude = p.coords.latitude;
	    	currentLongitude = p.coords.longitude;
			var latlng = new google.maps.LatLng(currentLatitude, currentLongitude);
			initialize(latlng);
	    } else {
	    }
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
//		intel.xdk.device.launchExternal("http://www.volunteerlogin.org/GLBTNearMe/donate.html");
		window.open('http://www.volunteerlogin.org/GLBTNearMe/donate.html');
	};
	/**
	 *	opens window in browser for the donate button
	 */
	function infoFn() {
//		intel.xdk.device.launchExternal("http://www.volunteerlogin.org/GLBTNearMe/donate.html");
//		window.location('info.html');
		var locstring = "info.html?lat=" + currentLatitude + "&lon=" + currentLongitude ;
		locstring += "&zipcode=" + document.getElementById('distform').elements["zipcode"].value
		locstring += "&milesdist=" + document.getElementById('distform').elements["milesdist"].value
		locstring += "&category=" + document.getElementById('distform').elements["catselect"].value
		location.href = locstring;
	};

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
	 *	onclick function for "Map" button starts GET request
	 *	and redirects to bottom of page
	 */
	function mapformredirect() {
		if ( checkZip() ) {
			var params = startlist();
			listpagefunc(params,cat,queryType.map);
			window.location.hash = "map_canvas";
		}	
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
		var params = "national=Yes";
		listpagefunc(params,"National",queryType.list);
	};
	/**
	 *	"Ajax" function that sends and processes xmlhttp request
	 *	@param params is GET request string
	 *	@param natnl is category for list
	 *	@makelist is whether list or map
	 */
	function listpagefunc(params,natnl,makelist) {
	    var xmlhttp;
		try {
		    xmlhttp=new XMLHttpRequest();
		} catch(e) {
			xmlhttp = false;
		}
		if (xmlhttp) {
		    xmlhttp.onreadystatechange=function()
		    {
		      if (xmlhttp.readyState==4 && xmlhttp.status==200)
			  {
//				alert(xmlhttp.responseText);
				returnedList = JSON.parse(xmlhttp.responseText);
				switch (makelist) {
					case queryType.list:
						formatlist(params,natnl);
						break;
					case queryType.map:
						formatmap(params);
						break;
					case queryType.date:
						formatdate();
						break;
				}
			  }
			}
			xmlhttp.open("GET","https://www.volunteerlogin.org/GLBTNearMe/AppResults.php" + '?' + params, true);
			xmlhttp.send(null);
		}
	}; // listpagefunc
	/**
	 *	formats date field
	 */
	function formatdate() {
		var retstring = "Data Last Updated: " + returnedList ;
		document.getElementById('updatedate').innerHTML = retstring;
	};

	/**
	 *	formats map page, deletes old markers, checks to see if
	 *	you've entered a zip code, if you have, then ignore
	 *	GPS data and recenter map on zipcode lat / long
	 *	@param params is GET string
	 */
	function formatmap(params) {
	    var i;
	    var bounds = new google.maps.LatLngBounds();
		deleteMarkers(); // hopefully removes all markers
		var zip = document.getElementById('distform').elements["zipcode"].value;
		if (zip == "") { // no zip entered, use GPS if available
			var latlng = new google.maps.LatLng(currentLatitude, currentLongitude);
			var marker = new google.maps.Marker({
				position: latlng,
				map: _map,
				title: 'Current Position'
			});
			marker.setMap(_map);
			bounds.extend(latlng);
			endmapformat(bounds);
		} // we have geolocation
		else { // use zip code center instead
			var geocoder = new google.maps.Geocoder();
			geocoder.geocode( {'address': zip},function(results, status) {
			 	if (status == google.maps.GeocoderStatus.OK) {
		        //Got result, center the map and put it out there
					latlng = results[0].geometry.location;
					initialize(latlng);
			        var marker = new google.maps.Marker({
			            map: _map,
			            position: latlng,
						title: 'Current Position'
       				});
					bounds.extend(latlng);
					endmapformat(bounds);
				}// ends if
			});
		} // ends else
/*		var atext = "i is " + i ;
		alert(atext);
		document.getElementById("geostat").innerHTML=i;*/
	};
	/**
	 *	end of map format function 
	 *	needed because retrieving lat / long for zip code
	 *	is an asynchronous task, so need to call this function
	 *	at end of getting data function
	 *	@param bounds is bounds parameter for Google Map
	 */
	function endmapformat(bounds) {
		for(i = 0; i<returnedList.length; i++) 
			createMarker(i,bounds);
		if ( i > 0 ) // some markers added
		    _map.fitBounds(bounds);
	};
	/**
	 *	creates markers from returnedList, needed because
	 *	markers wouldn't show up if placed in same function
	 *	@param i is where in list we are in processing
	 *	@bounds is google map bounds to set
	 */
	function createMarker(i,bounds) {
		var latitude = returnedList[i].latitude;
		var longitude = returnedList[i].longitude;
		var latlng = new google.maps.LatLng(latitude, longitude);
		var pname = returnedList[i].Name;
		var c = "A";
		var iconchar = "images/purple_Marker" + String.fromCharCode(c.charCodeAt(0) + i%26) + ".png";
		var marker = new google.maps.Marker({
			position: latlng,
			map: _map,
			title: pname,
			icon: iconchar/*,
			zIndex: 1000*/
		});
		marker.setMap(_map);
		markers.push(marker); // array of all known markers
						// this is so we can call them all and
						// delete them when doing a new search
		bounds.extend(latlng);
	    infoWindow = new google.maps.InfoWindow();
		pname = '<div style="color: black;">' +listhtml(i) + '</div>';
        google.maps.event.addListener(marker, 'click', function() {
            infoWindow.close();
	        infoWindow.setContent(pname);
/*	        infoWindow.setOptions({
	            content: pname
    		});*/
        	infoWindow.open(_map, marker);
        });
	}; // createMarker end

	/** Sets the map on all markers in the array.
	 *	@param map is google map variable
	 *	only used to delete all markers by setting "map" to null
	 */
	function setAllMap(map) {
	  for (var i = 0; i < markers.length; i++) {
	    markers[i].setMap(map);
	  }
	};

/** Removes the markers from the map, but keeps them in the array.*/
	function clearMarkers() {
	  setAllMap(null);
	};
/** Deletes all markers in the array by removing references 
 *	to them and setting markers[] array to empty.
 */
	function deleteMarkers() {
	  clearMarkers();
	  markers = [];
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
	    for(i = 0; i<returnedList.length; i++) {
			if ( oldcat != returnedList[i].Type ) {
				oldcat = returnedList[i].Type ;
				namedist+= '<p class="nlist">' + oldcat + '</p>';
			}
            //create new text node
			namedist += listhtml(i);
			namedist += "<br><br>";
	    }
		numberList.innerHTML=namedist;
		activate_subpage("#natsp"); // slides in list sub-page
	};
	/**
	 *	creates html entries for all list items
	 */
	function listhtml(i) {
		var namedist = returnedList[i].Name;
		var dist = returnedList[i].Distance;
		if (dist > 0)
			namedist += ' - ' + dist + ' Miles';
		var address1 = returnedList[i].Address1;
		if (address1.length > 0)
			namedist += "<br>" + address1;
		var address2 = returnedList[i].Address2;
		if (address2.length > 0)
			namedist += "<br>" + address2;
		var city = returnedList[i].City;
		var state = returnedList[i].State;
		var zip  = returnedList[i].Zip;
		if (city.length > 0)
			namedist += "<br>" + city + ', ' + state + ' ' + zip;
		var phone = returnedList[i].Phone;
		if (phone.length > 0)
			namedist += "<br>Phone: " + phone;
		var hotline = returnedList[i].Hotline;
		if (hotline.length > 0) {
			var c = hotline.substr(0,1);
			if (c >= '0' && c <= '9') {
				namedist += "<br>Hotline: " + hotline;
			}
		}
		var internet = returnedList[i].Internet;
		if (internet.length > 0)
			namedist += "<br>Email: " + internet;
		var web = returnedList[i].Web;
		if (web.length > 0)
			namedist += '<br>Web: <a href="' + web + '">' + web + '</a>';
		var moreinfo = returnedList[i].moreInformation;
		if (moreinfo.length > 0) {
			moreinfo = moreinfo.replace(/\n/g, "");
			moreinfo = moreinfo.replace(/["']/g, "");
			namedist += '<br><a href="#" onclick="alert(' + "'" +moreinfo + "'" + ')">More Information</a>' ;
		}
/*		var subcat = returnedList[i].sub-cat;
		if (subcat.length > 0)
			namedist += "<br>Sub-category: " + subcat; // can't use sub-cat */
		return namedist ;
	};
	/**
	 *	sets up google map to _map
	 *	@param latlng is latitude and longitude values in array
	 */
    function initialize(latlng) {
/*        var mapCanvas = document.getElementById('map_canvas');
	    var mapOptions = {
			center: latlng,
			zoomControl: true,
	        zoomControlOptions: {
	            style: google.maps.ZoomControlStyle.SMALL,
//	          position: google.maps.ControlPosition.LEFT_TOP
		    },
    	    zoom: 12,
    	    mapTypeId: google.maps.MapTypeId.ROADMAP
    	};
        _map = new google.maps.Map(mapCanvas, mapOptions);*/
//		setTimeout("$('#map_canvas').gmap('refresh')",500);
		document.getElementById("latin").value = currentLatitude;
		document.getElementById("lonin").value = currentLongitude;
    };


