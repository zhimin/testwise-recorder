

// Inspired from the WebDeveloper Toolbar
// Adds the style sheet at the given location with the given id
function StylesheetUtis_addStyleSheet(_document, _location)
{
	if (!_document.wtr_loadedStyleSheets)
		_document.wtr_loadedStyleSheets = new Object();

	// don't load stylesheet again if already loaded in this document	
	if (!_document.wtr_loadedStyleSheets[_location])
	{
	    var linkElement = _document.createElement("link");
	
	    linkElement.setAttribute("href", _location);
	    linkElement.setAttribute("id", "toto");
	    linkElement.setAttribute("media", "all");
	    linkElement.setAttribute("rel", "stylesheet");
	    linkElement.setAttribute("type", "text/css");
	
	    // If there is a head element
	    var headElementList = _document.getElementsByTagName("head");
	    if (headElementList.length > 0)
	    {
	        headElementList[0].appendChild(linkElement);
	    }
	    else
	    {
	        _document.documentElement.appendChild(linkElement);
	    }
	    
	    _document.wtr_loadedStyleSheets[_location] = true;
	}
}
