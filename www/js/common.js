/** @file common.js
 *	Purpose:  contains all of the common javascript for the index files
 *
 * @author Keith Gudger
 * @copyright  (c) 2014, Keith Gudger, all rights reserved
 * @license    http://opensource.org/licenses/BSD-2-Clause
 * @version    Release: 1.0
 * @package    GLBTNearMe
 *
 */

/**
 *	type of listing
 */
	var listingType = {
		fulllist: 0, // table w/ pin, name, infoicon
		map: 1,		 // listing w/ name, address, no links.
		infolist: 2, // full listing with clickable links (no map pin)
		natlist: 3,  // table w/ name, infoicon
	};
	
	var national = false;

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
			console.log(e);
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
	 *	creates html entries for all list items
	 *	
	 *	@param i is position in returned list
	 *	@param listing is boolean, true if for detailed list
	 *	or blank if for map or national.
	 *	@returns html formated list for page
	 */
	function listhtml(i, listing) {
		listing = (typeof listing === "undefined") ? listingType.fulllist : listing;
		var namedist = returnedList[i].Name;
//		console.log("namedist before is " + namedist);
		var newnamedist = '<div>' ;
		var name2 = returnedList[i].Name2;
		if ( name2 && name2.length > 0)
			namedist += "<br>" + name2;
		var dist = returnedList[i].Distance;
		if (dist > 0)
			namedist += ' - ' + dist + ' Miles';
		else { 
			if ( (listing != listingType.natlist) &&
				 (!national) )
				namedist += ' - <1 mile';
		}

		switch (listing) {
			case listingType.fulllist:
				var c = "A"; // start with an 'A', then move thru alphabet
				var iconchar = "images/purple_Marker" + String.fromCharCode(c.charCodeAt(0) + i%26) + '.png"></a>';
				newnamedist+= '<div id="mappin"><a onclick="mapone(' + i + ')"><img src="' + iconchar +'</div>';
				// drop into natlist for rest of div
			case listingType.natlist:
				newnamedist += '<div><div class="ilist"><a onclick="full_list(' + i + ')">' + namedist + '</div><div class="iicon"><img class = "isize" src="images/iOS_7_info_button.jpg"></a></div></div>';
				return newnamedist;
				break;
			case listingType.map:
				newnamedist += '<div id="mappin"><a onClick="mapDirectFn(' + i + ')"value="Directions"><img src="images/car.png"></a></div><table><td><a onClick="mapListFn(' + i + ')"value="More Info">' + namedist + '</a></td><td style="width:30px;float:right"><a onClick="mapListFn(' + i + ')"value="More Info"><img src="images/iOS_7_info_button.jpg"></a></td></table>' ;
				return newnamedist;
				break;
			case listingType.infolist:
			default:
				namedist = restOfList(namedist,i);
//				console.log("namedist after is " + namedist);
				break;
			} // end of switch
		return namedist ;
	};

/**
 *	Rest of full listing
 *	@param namedist is already started list
 *	@param i is index into returned data
 *	@return list with new info in it.
 */
	function restOfList(namedist,i) {

		namedist = "<p><b>Name</b><br>" + namedist + "</p>"
		var address1 = returnedList[i].Address1;
		if (address1 && address1.length > 0) {
			namedist += '<p><b>Address</b><br>' + address1;
			var address2 = returnedList[i].Address2;
			if (address2 && address2.length > 0)
				namedist += "<br>" + address2;
			var city = returnedList[i].City;
			var state = returnedList[i].State;
			var zip  = returnedList[i].Zip;
			if (city && city.length > 0)
				namedist += "<br>" + city + ', ' + state + ' ' + zip;
			namedist += "</p>" ;
		}
		var phone = returnedList[i].Phone;
		if (phone && phone.length > 0) {
			namedist += '<p><b>Phone</b>' ;
			namedist += '<br>Phone: <a href="tel:+' + phone + '">' + phone + '</a>';
			var fax = returnedList[i].Fax;
			if (fax && fax.length > 0) {
				namedist += '<br>Fax: ' + fax ;
			}				
			var hotline = returnedList[i].Hotline;
			if (hotline && hotline.length > 0) {
				var c = hotline.substr(0,1);
				if (c >= '0' && c <= '9') {
					namedist += '<br>Hotline: <a href="tel:+' + hotline + '">' + hotline + '</a>';;
				}
			}
			namedist += "</p>" ;
		}
		var internet = returnedList[i].Internet;
		var web = returnedList[i].Web;

		if ( internet || web ) {
			namedist += '<p><b>Web</b>';
			if (internet && internet.length > 0)
				namedist += '<br>Email: <a href="#" onclick="emailclick(' + "'" + internet + "'" + ')">' + internet + '</a>';
			if (web && web.length > 0) 
				namedist += '<br>Web: <a href="#" onclick="moreclick(' + "'" + web + "'" + ')">' + web + '</a>';
			namedist += "</p>";
		}

		var descript = returnedList[i].Descript ;
		var moreinfo = returnedList[i].moreInformation;
		var subcat = returnedList[i]['sub-cat'] ;

		if ( descript || moreinfo || subcat ) {
			namedist += '<p><b>Description</b>';
			if (descript && descript.length > 0) {
				namedist += '<br>' + descript ;
			}
			if (moreinfo && moreinfo.length > 0) {
				moreinfo = moreinfo.replace(/\n/g, "<br>");
				moreinfo = moreinfo.replace(/["']/g, "");
				namedist += '<br>' + moreinfo;
			}
			if (subcat && subcat.length > 0) {
				namedist += '<br><br>Sub-categories: ' + subcat ;
			}
		}
		return namedist;
	} // end of restOfList

/**
 *	opens browser window when clicked
 */
	function moreclick(url) {
		url = "http://" + url ;
		if (typeof (intel.xdk.device) === 'undefined') 
			window.open(url,'_system');
		else
			intel.xdk.device.launchExternal(url);
	};

/**
 *	opens email client when clicked
 */
	function emailclick(url) {
		url = "mailto:" + url ;
		if (typeof (intel.xdk.device) === 'undefined') 
			window.open(url,'_system');
		else
			intel.xdk.device.launchExternal(url);
	};

	/**
	 *	opens info page.
	 */
	function infoFn() {
//		intel.xdk.device.launchExternal("http://www.volunteerlogin.org/GLBTNearMe/donate.html");
//		window.location('info.html');
		var locstring = GETform("info.html");
		location.href = locstring;
	};

	/** formats GET query string
	 */
	function GETform(infourl) {
		var locstring = infourl + "?lat=" + currentLatitude + "&lon=" + currentLongitude ;
		locstring += "&zipcode=" + document.getElementById('distform').elements["zipcode"].value;
		locstring += "&milesdist=" + document.getElementById('distform').elements["milesdist"].value;
		var cat = document.getElementById('distform').elements["catselect"].value;
		cat = cat.replace(/ /g,"+"); 
		locstring += "&category=" + cat;
		return locstring ;
	}
	/**
	 *	gets category from form and adds to GET request
	 *	@return GET string
	 */
	function startlist() {
		var params = getinitparams();
		cat = document.getElementById('distform').elements["category"].value;
		params += "&category=" + encodeURIComponent(cat);
		return params;
	}
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

