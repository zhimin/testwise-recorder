
var WTR_Sidebar = new WTR_base();

WTR_Sidebar.log = new Log("sidebar.js");

/**
Configured in the sidebar xul to be called at load of the window
*/
WTR_Sidebar.onLoad = function(_oEvent)
{
	try
	{
		this._setMenuChecked(true);
		
		// make debug controls visible if configured
		var tabIds = WTR_Preferences.getStrings("debug.show");
		for (var i=0; i<tabIds.length; ++i)
		{
			var oElement = document.getElementById(tabIds[i]);
			if (oElement == null)
				this.log.error("No element found with id: " + tabIds[i]);
			else
				oElement.hidden = false;
		}

		parent.wtrWindow = window;

		var tabbrowser = top.document.getElementById("content");
		this.log.debug("appcontent: " + content);
		this.log.debug("tabbrowser.contentWindow: " + tabbrowser.contentWindow)
		if (tabbrowser) 
		{
			var oWindow = tabbrowser.contentWindow;
			if (!oWindow.recorderLoaded) 
			{
				oWindow.recorderLoaded = true;
				oWindow.addEventListener("DOMContentLoaded", 
					function() { reloadRecorder(window.getBrowser().contentWindow) },
											false);
				
				tabbrowser.addEventListener("load", wtr_Misc.windowLoadHandler, true);
				tabbrowser.addEventListener("load", wtr_Misc.handleDocumentLoad, true);
//				tabbrowser.addEventListener("beforeunload", function() { notifyUnloadToRecorder(window.document) }, false);
				wtr_Misc.initialize(tabbrowser.contentDocument);
			}

			var tabBox = tabbrowser.mTabBox;
            tabBox.addEventListener("select", wtr_Misc.tabSelect, true);
		}
		


		if (self.content.document)
		{
			var oStep = new WTRStep("invoke", {
				url: self.content.document.location.toString()/*,
				description: "Get the page: " + self.content.document.title*/
				});
			this._getWebtestRecorder().addStep(oStep);
		}
		
	}
	catch (e)
	{
		this.log.logError(e);
	}
}

/**
Configured in the sidebar xul to be called at unload of the window
*/
WTR_Sidebar.onUnload = function(_oEvent)
{
	this._setMenuChecked(false);
}

/**
Checks/unchecks the menu item for the sidebar
*/
WTR_Sidebar._setMenuChecked = function(_bChecked)
{
	top.document.getElementById("wtr_ToolMenuItem").checked = _bChecked;
}