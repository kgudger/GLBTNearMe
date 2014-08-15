/** @file main2.js
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
	 *	Fires when DOM page loaded
	 */
		function ready() {
		    try {
        		if (intel.xdk.device.platform.indexOf("Android") != -1) {
        		    intel.xdk.display.useViewport(480, 480);
        		    document.getElementById("map_canvas").style.width = "480px";
        		} else if (intel.xdk.device.platform.indexOf("iOS") != -1) {
        		    if (intel.xdk.device.model.indexOf("iPhone") != -1 || intel.xdk.device.model.indexOf("iPod") != -1) {
        		        intel.xdk.display.useViewport(320, 320);
        		        document.getElementById("map_canvas").style.width = "320px";
        		    } else if (intel.xdk.device.model.indexOf("iPad") != -1) {
        		        intel.xdk.display.useViewport(768, 768);
        		        document.getElementById("map_canvas").style.width = "768px";
        		    }
        		}
        		if (intel.xdk.iswin8) {
        		    document.getElementById("map_canvas").style.width = screen.width + "px";
        		    document.getElementById("map_canvas").style.height = screen.height + "px";
        		}
		        if (intel.xdk.geolocation !== null) {
		            document.getElementById("map_canvas").style.height = (screen.height-250) + "px";
		        }
		    } catch (e) {
//		        alert(e.message);
		    }
			currentLatitude = QueryString["lat"];
			currentLongitude = QueryString["lon"]
			document.getElementById("latin").value = currentLatitude;
			document.getElementById("lonin").value = currentLongitude;
			if ( typeof QueryString["category"] !== "undefined" )  {
				var firstval = QueryString["category"];			
				var decodeval = decodeURI(firstval);
				decodeval = decodeval.replace(/[+]/g, " ");
//				alert("Values are " + firstval + "," + decodeval);
				document.getElementById('distform').elements["catselect"].value = decodeval;
			}
			if ( typeof QueryString["zipcode"] !== "undefined" ) 
				document.getElementById('distform').elements["zipcode"].value = QueryString["zipcode"];
			if ( typeof QueryString["milesdist"] !== "undefined" ) 
				document.getElementById('distform').elements		["milesdist"].value = QueryString["milesdist"];
			var params = startlist() ;
			listpagefunc(params,"",queryType.map);
		}
	/**
	 *	Sets up GET parameters for the REQUEST from the form
	 *	@return GET string
	 */
	function getinitparams() {
		var zip = QueryString["zipcode"] ; // from GET params
		var params = "" ;
		var miles = ""
		miles += QueryString["milesdist"];
		if ( zip != "" ) 
			params = "zip=" + zip;
		else { 
			params = "latitude=" + currentLatitude + "&longitude=" + currentLongitude ;
		}
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
		cat = QueryString["category"];
		params += "&category=" + encodeURI(cat);
		return params;
	}

	/**
	 *	formats map page, deletes old markers, checks to see if
	 *	you've entered a zip code, if you have, then ignore
	 *	GPS data and recenter map on zipcode lat / long
	 *	@param params is GET string
	 */
	function formatmap() {
	    var i;
	    var bounds = new google.maps.LatLngBounds();
		deleteMarkers(); // hopefully removes all markers
//		var zip = document.getElementById('distform').elements["zipcode"].value;
		var zip = QueryString["zipcode"] ; // from GET params
		if (zip == "") { // no zip entered, use GPS if available
			currentLatitude = QueryString["lat"];
			currentLongitude = QueryString["lon"];
			var latlng = new google.maps.LatLng(currentLatitude, currentLongitude);
			initialize(latlng);
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
		document.getElementById("geostat").innerHTML="";
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
		var i ;
		if ( (typeof QueryString["lindex"] !== "undefined" ) &&
			 ((i = QueryString["lindex"]) >= 0) ) {
			createMarker(i,bounds);
		    _map.fitBounds(bounds);
		} else {
			for(i = 0; i<returnedList.length; i++) 
				createMarker(i,bounds);
			if ( i > 0 ) // some markers added
			    _map.fitBounds(bounds);
		}
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
	 *	sets up google map to _map
	 *	@param latlng is latitude and longitude values in array
	 */
    function initialize(latlng) {
        var mapCanvas = document.getElementById('map_canvas');
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
        _map = new google.maps.Map(mapCanvas, mapOptions);
//		setTimeout("$('#map_canvas').gmap('refresh')",500);
    };



