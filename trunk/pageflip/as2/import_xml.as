// create a new XML object
var pageXML = new XML();

// create a new array to store XML node order
var pageOrder = new Array();	
var pageCanTear = new Array();
var pageSpread = new Array();
var pagePreLoad = new Array();
var pageAfterTear = new Array();

// set the ignoreWhite property to true (default value is false)
pageXML.ignoreWhite = true;

// After loading is complete, trace the XML object
pageXML.onLoad = function(success) {
	if (success) {
		var i = 0;
		pw = (pageXML.firstChild.attributes.width) ? Number(pageXML.firstChild.attributes.width) : 475; // set to value in xml, or default to hard-coded value
		ph = (pageXML.firstChild.attributes.height) ? Number(pageXML.firstChild.attributes.height) : 672; // set to value in xml, or default to hard-coded value
		hcover = (pageXML.firstChild.attributes.hcover=="true") ? true : false;		// hard cover on/off
		transparency = (pageXML.firstChild.attributes.transparency=="true") ? true : false;		// transparency
		pp = (pageXML.firstChild.attributes.prepage!=undefined) ? pageXML.firstChild.attributes.prepage : null; // pre page

		for (var thisNode = pageXML.firstChild.firstChild; thisNode != null; thisNode = thisNode.nextSibling) {
			pageOrder[i] = thisNode.attributes.src;
			pageCanTear[i] = (thisNode.attributes.canTear=="true") ? true : false;
			pageSpread[i] = (thisNode.attributes.isSpread=="true") ? true : false;
			pagePreLoad[i] = (thisNode.attributes.preLoad=="true") ? true : false;
			pageAfterTear[i] = (thisNode.attributes.afterTear!=undefined) ? thisNode.attributes.afterTear : null;
			i++;			
		}
		// move playhead forward
		play();
	} else {
		trace("Error loading XML");
	}
};

// load the XML into the flooring object
pageXML.load(_level0.xmlFile);
