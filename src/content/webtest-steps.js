/*******************************************************************************
 * Copyright (c) 2006 Marc Guillemot.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *    Marc Guillemot - initial version
 *******************************************************************************/

// webtest specials

var wtr_Misc = new WTR_base();
wtr_Misc.myThis = wtr_Misc;

wtr_Misc.log = new Log("rwebunit-steps");
var itest_recorded_enabled = true;


/**
 Called when the selected browser tab is changed
 **/
wtr_Misc.tabSelect = function(_oEvent)
{
  var myThis = arguments.callee.myThis;
  try
  {
    if (!myThis._getRecorderWindow)
      return;

    var oNode = _oEvent.originalTarget.parentNode.parentNode;

		// there is surely a better way to get the document in the selected tab, but getBrowser() doesn't work (not defined)
    if (oNode && oNode.mTabBox)
    {
      const selectedTab = oNode.mTabBox.selectedIndex;
      const currentDocument = oNode.browsers[selectedTab].contentDocument;

		  	//
      myThis._getRecorderWindow().document.getElementById("enableRecording").checked = (currentDocument.oWTR_window != null);
    }
  }
  catch (e)
  {
    myThis.log.logError(e);
  }
}


/**
 Starts/stop recording
 @param _bEnabled (boolean): indicates if recording must be stopped or started
 */
wtr_Misc.toggleRecordingEnabled = function(_bEnabled)
{
  var myThis = arguments.callee.myThis;
  try
  {
    const currentWindow = myThis._getCurrentWindow();
    currentWindow.recordingEnabled = _bEnabled;
    if (_bEnabled)
    {
      if (!currentWindow.document.oWTR_window)
        wtr_Misc.initialize(currentWindow.document);
      else
        ; // nothing, it already works, as long as we don't
      itest_recorded_enabled = true;
      document.getElementById("status_label").hidden = false;
    }
    else
    {
      // TODO: stop record
      // remove listeners or flag as not recording
      itest_recorded_enabled = false;
      document.getElementById("status_label").hidden = true;
    }
  }
  catch (e)
  {
    myThis.log.logError(e);
  }
}

wtr_Misc.windowLoadHandler = function(_oEvent)
{
  var myThis = arguments.callee.myThis;
  myThis.log.debug("wtr_Misc.windowLoadHandler: " + _oEvent);
  myThis.initialize(_oEvent.originalTarget);
}

wtr_Misc.initialize = function(_oDocument)
{
  var myThis = arguments.callee.myThis;
  try
  {
    //alert("wtr_Misc.initialize: " + document);
    // var oDoc = document.getElementById("content").contentDocument;
    //		var oDoc = _oEvent.originalTarget
    var oDoc = _oDocument;
		//alert("wtr_initialize: " + oDoc);

    // set the recorder on the WebtestRecorder window
    myThis.log.debug("Setting oWTR_window on " + oDoc);
    myThis.log.debug("title " + oDoc.title);
    oDoc.oWTR_window = this;
		// set the recorder on the parent window (if any)
    if (self.parent)
      self.parent.document.oWTR_window = this;

    oDoc.addEventListener("click", myThis.HandlerClick, false);
    oDoc.addEventListener("change", myThis.handlerChange, false);
  }
  catch (e)
  {
    myThis.log.logError(e);
  }
}

/**
 Handles the load of a document.
 Not responsible for registring handlers, only to record the related step if needed
 */
wtr_Misc.handleDocumentLoad = function (_event)
{
  var myThis = arguments.callee.myThis;
  try
  {
    myThis.log.debug("wtr_Misc.handleDocumentLoad begin");
    if (!myThis._getWebtestRecorder())
    {
      myThis.log.debug("No WTR, returning");
      return;
    }

    if (top.document.getElementById("content").contentDocument == _event.originalTarget)
    {
      var oDoc = _event.originalTarget;
      if (!oDoc.referrer && oDoc.location != null)
      {
        var oStep = new WTRStep("invoke", {url: oDoc.location.href})
		//	myThis._getWebtestRecorder().addStep(oStep);
      }
      else
        myThis.log.debug("Not loaded by invoke: " + oDoc.location);
    }
    else
    {
      myThis.log.debug("Original target != contentdocument");
    }
  }
  catch (e)
  {
    myThis.log.logError(e);
  }
}

var WTR_ButtonLocator = {};

WTR_ButtonLocator.locate = function(_oTarget)
{
  var stepsVariations = []
  if (_oTarget.tagName == 'INPUT')
  {
    if (_oTarget.type.toLowerCase() == "image" && _oTarget.src)
    {
      stepsVariations.push(new WTRStep("clickButton", {src: _oTarget.src}))
    }
    else
    {
      stepsVariations.push(new WTRStep("clickButton", {label: _oTarget.value}))
    }
    if (_oTarget.value)
      stepsVariations.push(new WTRStep("clickButton", {name: _oTarget.name, label: _oTarget.value}))
  }
  else // <button ...>
  {
    stepsVariations.push(new WTRStep("clickButton", {label: wtr_Misc.trim(_oTarget.textContent)}))
  }

  if (_oTarget.id)
  {
    stepsVariations.push(new WTRStep("clickButton", {htmlId: _oTarget.id}))
  }
  if (_oTarget.name)
  {
    stepsVariations.push(new WTRStep("clickButton", {name: _oTarget.name}))
  }
  return stepsVariations
}

wtr_Misc.trim = function(_str)
{
  return _str.replace(/^\s*([^ ].*[^ ])\s*/g, "$1")
}


/**
 Event handler for clicks
 */
wtr_Misc.HandlerClick = function(_oEvent)
{
  var myThis = arguments.callee.myThis;
  try
  {
    if (!myThis._getWebtestRecorder)
      return;

    var str = "Event catched:\n"
        + "Event: " + _oEvent + "\n"
        + "target: " + _oEvent.target;
    myThis.log.debug(str);

    var oTarget = _oEvent.target;
    var strType = oTarget.type ? oTarget.type.toLowerCase() : null;
    if (oTarget.tagName == "A")
    {
      myThis._handleLinkClick(oTarget);
    }
    else if ((oTarget.tagName == "INPUT"
        && (strType == "image" || strType == "submit"
        || strType == "button" || strType == "reset"))
        || oTarget.tagName == "BUTTON")
    {
      myThis._getWebtestRecorder().addStep(WTR_ButtonLocator.locate(oTarget), oTarget);
    }
    else
    {
      myThis.log.debug("Nothing to do with this event (target: " + _oEvent.target + "), looking at parent nodes...");

			// loop through parent to find if one of them could catch the event
      while (oTarget != null)
      {
        if (oTarget.tagName == "A")
        {
          myThis._handleLinkClick(oTarget);
        }
        oTarget = oTarget.parentNode;
      }
      myThis.log.info("Nothing to do with this event (target: " + _oEvent.target + "), ignoring it.");
    }
  }
  catch (e)
  {
    myThis.log.logError(e);
  }
}

/**
 Handles the click on a link
 */
wtr_Misc._handleLinkClick = function(_oLink)
{
  var myThis = arguments.callee.myThis;
  if (itest_recorded_enabled) {
    myThis.log.info("Handling event as a click link");
    var oStepVariations = []
    if (_oLink.id)
    {
      var oStep = new WTRStep("clickLink")
      oStep.htmlId = _oLink.id;
      oStep.description = "Click link: " + _oLink.text;
      oStepVariations.push(oStep)
    }

    var oStep = new WTRStep("clickLink")
    oStep.label = myThis.trim(_oLink.textContent);
    oStepVariations.push(oStep)

    myThis._getWebtestRecorder().addStep(oStepVariations, _oLink);
  }
}

/**
 Handler registered for the change event
 */
wtr_Misc.handlerChange = function(_event)
{
  var myThis = arguments.callee.myThis;
  if (itest_recorded_enabled) {
    var oField = _event.target;
    myThis._handleFieldChange(oField);
  }
}

/**
 Gets the <label for="..">...</label> tag for the given id
 @return null if none is found
 */
wtr_Misc._getAssociatedLabel = function(_oField)
{
  var strXPath = "//label[@for = '" + _oField.id + "']";
  var oDoc = _oField.ownerDocument;
  var res = oDoc.evaluate(strXPath, oDoc, null, XPathResult.ANY_TYPE, null);
  return res.iterateNext();
}

/**
 Really strange, oForm.elements["someName"] always return undefined
 and oForm.getElementByName doesn't exist
 */
wtr_Misc.getFieldByName = function(_oForm, _strName)
{
  if (_oForm == null)
  	return null;
  
  var result = [];
  for (var i = 0; i < _oForm.elements.length; ++i)
  {
    if (_strName == _oForm.elements[i].name)
      result.push(_oForm.elements[i])
  }

  if (result.length == 0)
    return null
  else if (result.length == 1)
    return result[0]
  else
    return result
}

wtr_Misc._handleFieldChange = function(_oField)
{
  try
  {
    //this.checkFrame(_oWin);
    var oField = _oField;
    var strForLabel = null;
    if (oField.id)
    {
      var oLabel = this._getAssociatedLabel(oField);
      if (oLabel && oLabel.childNodes.length == 1 && oLabel.firstChild.nodeType == Node.TEXT_NODE)
      {
        strForLabel = oLabel.innerHTML;
      }
    }

    var oBaseStep = null;
    switch (_oField.type)
        {
    case "checkbox":
      oBaseStep = new WTRStep("setCheckbox", {htmlId: oField.id, tagName: oField.tagName});      
      oBaseStep.checked = oField.checked ? "true" : "false";
      oBaseStep.value = oField.value;
      if (!strForLabel && this.getFieldByName(oField.form, oField.name) != oField)
        oBaseStep.value = oField.value
      break;
    case "password":
      oBaseStep = new WTRStep("setInputField", {htmlId: oField.id, tagName: oField.tagName});
      oBaseStep.value = oField.value;
      oBaseStep.description = "Set password field " + oField.name + ": " + oField.value;
      break;
    case "radio":
      oBaseStep = new WTRStep("setRadioButton", {htmlId: oField.id, tagName: oField.tagName});
      oBaseStep.value = oField.value;
      oBaseStep.description = "Check radio button " + oField.name + ": " + oField.value;
      break;
    case "text":
    case "textarea":
      oBaseStep = new WTRStep("setInputField", {htmlId: oField.id, tagName: oField.tagName});
      oBaseStep.value = oField.value;
      break;
    case "select-one":
    case "select-multiple":
      oBaseStep = new WTRStep("setSelectField", {htmlId: oField.id, tagName: oField.tagName});
      var oOption = oField.options[oField.selectedIndex]
      oBaseStep.text = oOption.text;
      break;
    case "file":
      oBaseStep = new WTRStep("setFileField");
      oBaseStep.fileName = oField.value;
      oBaseStep.description = "Set upload file " + oField.name;
      break;
    default:
      if (oField.tagName == "LABEL")
      {
        this._handleFieldChange(oField.ownerDocument.getElementById(oField.htmlFor));
        return;
      }
      else
        oBaseStep = {wtrError:"Unhandled input: " + oField.tagName + "(type: " + oField.type + ")"};
    }

    var possibleSteps = []
		// default one
    possibleSteps.push(oBaseStep.cloneAndAdd({name: oField.name}))

    if (oField.id)
    {
      possibleSteps.push(oBaseStep.cloneAndAdd({htmlId: oField.id}))
      if (strForLabel)
      {
        var oStep = oBaseStep.clone()
        oStep.forLabel = strForLabel;
        delete oStep.description; // if forLabel has been used as it says enough
        possibleSteps.push(oStep)
      }
    }

    this._getWebtestRecorder().addStep(possibleSteps, oField);
  }
  catch (e)
  {
    this.log.logError(e);
    throw e;
  }
}

wtr_Misc.testRun = function(_str)
{
  try
  {
    eval(_str);
  }
  catch(e)
  {
    this.log.logError(e);
  }
}

// register wtr_Misc as property on all its function to allow them to retrieve it when detached
wtr_myThis.registerAsMyThis(wtr_Misc);