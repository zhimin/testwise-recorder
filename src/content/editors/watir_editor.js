/**
 Creates a DOM node to represent the step as WebDriver code
 @param _document the document to which the node will be added
 @param _oStep the step to represent
 @return the DOM node to insert in the document
 */
function createDOMNode_WatirRepresentation(_oStep, _document, bVisible)
{
  var oStepNode = _document.createElement("div");
  if (!bVisible)
  {
    oStepNode.setAttribute("class", "alternativeStep")
  }

  var conversion = conversions[_oStep.wtrStep]
  if (conversion)
  {
    var txt = conversion(_oStep);
    if (txt.indexOf("assertEquals") == 0)
    {
      txt = txt.substr("assertEquals".length)
      WTR_DomUtils.appendNodeToNode(oStepNode, "span", {"class": "junit"}, "assertEquals");
    }
    var oNode = WTR_DomUtils.appendNodeToNode(oStepNode, "span", {}, "");
    txt = txt.replace(/"([^\"]*)"/g, '"<span class="text">$1</span>"')
    oNode.innerHTML = txt
  }
  else
    WTR_DomUtils.appendNodeToNode(oStepNode, "span", {"class": "comment"}, "# can't yet handle " + _oStep.wtrStep);

  return oStepNode;
}

// this registers the editor as listener too
setCreateDOMNode_XXXRepresentation(createDOMNode_WatirRepresentation)

var conversions = {}
conversions["invoke"] = function(oStep)
{
  return 'browser = Watir::Browser.start  "' + oStep.url + '"' 
}

conversions["verifyTitle"] = function(oStep)
{
  // TODO if firefox, browser.title
  return 'browser.document.title.should == "' + oStep.text + '"'
}

conversions["verifyText"] = function(oStep)
{
  return 'browser.text.include?("' + oStep.text + '").should == true'
}

conversions["clickLink"] = function(oStep)
{
  var by = ""
  if (oStep.htmlId)
    by = 'browser.link(:id, "' + oStep.htmlId + '").click'
  else if (oStep.name)
    by = 'brower.link(:name, "' + oStep.name + '").click'
  else if (oStep.label)
    by = 'browser.link(:text, "' + oStep.label + '").click'
  return by;
}

conversions["clickButton"] = function(oStep)
{
  //TODO: image button => ie.button(:src, /doit/).click
  var by = ""
  if (oStep.htmlId)
    by = 'browser.button(:id, "' + oStep.htmlId + '").click'
  else if (oStep.name)
    by = 'browser.button(:name, "' + oStep.name + '").click'
  else if (oStep.label)
    by = 'browser.button(:value,"' + oStep.label + '").click'
  else if (oStep.src) 
    by = 'browser.button(:src,"' + oStep.src+ '").click'
  return by;
}

function identifyInputField(oStep)
{
  var by = ""
  if (oStep.htmlId)
    by = '(:id, "' + oStep.htmlId + '")'
  else if (oStep.forLabel)
    by = '(:text, "' + oStep.forLabel + '")'
  else if (oStep.name)
    by = '(:name, "' + oStep.name + '")'
  else if (oStep.value)
    by = '(:value, "' + oStep.value + '")'
  else if (oStep.xpath)
    by = 'xpath("' + oStep.xpath + '")'
  return by
}

conversions["setInputField"] = function(oStep)
{
  var tagName = "text_field";
  if (oStep.tagName == "TEXTAREA") {
    tagName = "area";
  }

  return 'browser.' + tagName + identifyInputField(oStep) + '.set("' + oStep.value + '")'
}

conversions["setFileField"] = function(oStep)
{
  oStep.value = oStep.fileName
  if (oStep.name) {
    return 'browser.file_field(:name, "' + oStep.fileName + '").set("' + oStep.fileName + '")'
  } else if (oStep.htmlId) {
    return 'browser.file_field(:id, "' +  oStep.htmlId + '").set("' + oStep.fileName + '")'
  } else {
    return conversions["setInputField"](oStep)
  }
}

conversions["setRadioButton"] = function(oStep)
{
  if (oStep.htmlId)
    by = 'browser.radio(:id, "' + oStep.htmlId + '").set'
  else if (oStep.name)
    by = 'browser.radio(:name, "' + oStep.name + '", "' + oStep.value + '").click'
  return by
}

conversions["setCheckbox"] = function(oStep)
{
  if (oStep.checked == "true") {
    return 'browser.checkbox' + identifyInputField(oStep) + '.set'
  } else {
    return 'browser.checkbox' + identifyInputField(oStep) + '.clear'
  }
}

conversions["setSelectField"] = function(oStep)
{
  return 'browser.select_list' + identifyInputField(oStep) + '.set("' + oStep.text + '")'
}


conversions["verifyInputField"] = function(oStep)
{
  var tagName = "browser.text_field";
  if (oStep.tagName == "TEXTAREA") {
    tagName = "browser.area";
  }

  if (oStep.htmlId) {
    return tagName + '(:id, "' + oStep.htmlId + '").value.should == "' + oStep.value + '"'
  } else if (oStep.name) {
    return tagName + '(:name, "' + oStep.name + '").value.should == "' + oStep.value + '"'
  } else {
    return tagName + '(:id, "specify_id_here").value.should == "' + oStep.value + '"'
  }
}

conversions["verifySelectField"] = function(oStep)
{
  var tagName = "select_list";
  return tagName + '(:id, "' + oStep.htmlId + '").value.should == "' + oStep.value + '"';
}
