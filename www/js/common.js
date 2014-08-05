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
	 *	creates html entries for all list items
	 */
	function listhtml(i, listing) {
		listing = (typeof listing === "undefined") ? false : listing;
		var namedist = returnedList[i].Name;
		var dist = returnedList[i].Distance;
		if (dist > 0)
			namedist += ' - ' + dist + ' Miles';
		var address1 = returnedList[i].Address1;
		if (address1.length > 0) {
			if ( listing) 
				namedist += '<br><a href="#" onclick="mapone(' + i + ')">' + address1 + "</a>";
			else
				namedist += '<br>' + address1;
		}
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

