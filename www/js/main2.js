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
	var options = {			// Intel GPS options
	    timeout: 10000,
	    maximumAge: 11000,
	    enableHighAccuracy: true
	};
	var markers = []; // markers array to clear
	var returnedList; // returned JSON list from GET
	var cat = "" ;		// category from form
	var infoWindow;		// holder for all infoWindows

	/* Intel native bridge is available */
	/**
	 *	Fires when DOM page loaded
	 */
		function ready() {
			currentLatitude = QueryString["lat"];
			currentLongitude = QueryString["lon"]
			document.getElementById("latin").value = currentLatitude;
			document.getElementById("lonin").value = currentLongitude;
			if ( typeof QueryString["category"] !== "undefined" )  {
				var firstval = QueryString["category"];			
				var decodeval = decodeURI(firstval);
				decodeval = decodeval.replace(/[+]/g, " ");
//				alert("Values are " + firstval + "," + decodeval);
				document.getElementById('backform').elements["category"].value = decodeval;
			}
			if ( typeof QueryString["zipcode"] !== "undefined" ) 
				document.getElementById('backform').elements["zipcode"].value = QueryString["zipcode"];
			if ( typeof QueryString["milesdist"] !== "undefined" ) 
				document.getElementById('backform').elements		["milesdist"].value = QueryString["milesdist"];
			var params = startlist() ;
			listpagefunc(params);
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
	 *	"Ajax" function that sends and processes xmlhttp request
	 *	@param params is GET request string
	 *	@param natnl is category for list
	 *	@makelist is whether list or map
	 */
	function listpagefunc(params) {
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
				formatmap();
			  }
			}
//			alert(params);
			xmlhttp.open("GET","https://www.volunteerlogin.org/GLBTNearMe/AppResults.php" + '?' + params, true);
			xmlhttp.send(null);
		}
	}; // listpagefunc
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



