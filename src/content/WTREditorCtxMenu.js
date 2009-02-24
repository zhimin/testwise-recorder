var WTREditorCtxMenu = {}

/**
Delete all the recorded node in the displayed editor
*/
WTREditorCtxMenu.deleteAll = function(_oMenuItem)
{
	var element = document.popupNode;
	var body = element.ownerDocument.body
	while (body.lastChild)
	{
		body.removeChild(body.lastChild)
	}
}

/**
Copies all steps to the clipboard
*/
WTREditorCtxMenu.copyToClipboard = function()
{
	const gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"]
		.getService(Components.interfaces.nsIClipboardHelper);
	var element = document.popupNode;
	var editorWindow = element.ownerDocument.defaultView
	gClipboardHelper.copyString(editorWindow.getAsText());
}



WTREditorCtxMenu.onPopupShowing = function(_oMenu)
{
	var element = document.popupNode;
	var fnGetAlternatives = element.ownerDocument.defaultView.getAlternative
	var nbAlternativeFound = 0;
	var bHideNoAlternativeFound = true;
	if (fnGetAlternatives)
	{
		var alternatives = fnGetAlternatives(element)
		nbAlternativeFound = alternatives.length
		for (var i=0; i<nbAlternativeFound; ++i)
		{
			var oMenuItem = document.getElementById('alternative' + i)
			oMenuItem.label = "Replace with: " + alternatives[i].label
			oMenuItem.wtrStepNode = alternatives[i].node
			oMenuItem.hidden = false
		}
		bHideNoAlternativeFound = (nbAlternativeFound != 0);
	}

	for (var i=nbAlternativeFound; i<5; ++i)
	{
		var oMenuItem = document.getElementById('alternative' + i)
		oMenuItem.hidden = true
	}
	document.getElementById('editorCtxMenu_noAlternative').hidden = bHideNoAlternativeFound
}

WTREditorCtxMenu.showAlternative = function(_oMenuItem)
{
	var oStepNode = _oMenuItem.wtrStepNode
	oStepNode.ownerDocument.defaultView.activeAlternative(oStepNode)
}