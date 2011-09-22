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
    txt = txt.replace(/(:\w+)\s*,/, '<span class=\'symbol\'>$1</span>,');
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
  return 'IE ie = new IE("' + oStep.url + '")' 
}

conversions["verifyTitle"] = function(oStep)
{
  // TODO if firefox, ie.title
  return 'ie.document.title.should == "' + oStep.text + '"'
}

conversions["verifyText"] = function(oStep)
{
  return 'Assert.IsTrue(ie.ContainsText("' + oStep.text + '"));'
}

conversions["clickLink"] = function(oStep)
{
  var by = ""
  if (oStep.htmlId)
    by = 'ie.Link(Find.ById("' + oStep.htmlId + '")).Click();'
  else if (oStep.name)
    by = 'ie.Link(Find.ByName("' + oStep.name + '")).Click();'
  else if (oStep.label)
    by = 'ie.Link(Find.ByText("' + oStep.label + '")).Click();'
  return by;
}

conversions["clickButton"] = function(oStep)
{
  //TODO: image button => ie.button(:src, /doit/).click
  var by = ""
  if (oStep.htmlId)
    by = "ie.Button(Find.ById(\"" + oStep.htmlId + "\")).Click();"
  else if (oStep.name)
    by = "ie.Button(Find.ByName(\"" + oStep.name  + "\")).Click();"
  else if (oStep.label)
    by = "ie.Button(Find.ByValue(\"" + oStep.label + "\")).Click();"
  else if (oStep.src) 
    by = 'ie.button(:src,"' + oStep.src+ '").click'
  return by;
}

function identifyInputField(oStep)
{
  var by = ""
  if (oStep.htmlId)
    by = 'Find.ById("' + oStep.htmlId + '")'
  else if (oStep.forLabel)
    by = 'Find.ByText("' + oStep.forLabel + '")'
  else if (oStep.name)
    by = 'Find.ByName("' + oStep.name + '")'
  else if (oStep.value)
    by = 'Find.ByValue("' + oStep.value + '")'
  else if (oStep.xpath)
    by = 'xpath("' + oStep.xpath + '")'
  return by
}

conversions["setInputField"] = function(oStep)
{
  var tagName = "TextField";
  if (oStep.tagName == "TEXTAREA") {
    tagName = "Area";
  }

  return 'ie.' + tagName + '('+identifyInputField(oStep) + ')'+ '.TypeText("' + oStep.value + '");'
}

conversions["setFileField"] = function(oStep)
{
  oStep.value = oStep.fileName
  if (oStep.name) {
    return 'ie.file_field(:name, "' + oStep.fileName + '").set("' + oStep.fileName + '")'
  } else if (oStep.htmlId) {
    return 'ie.file_field(:id, "' +  oStep.htmlId + '").set("' + oStep.fileName + '")'
  } else {
    return conversions["setInputField"](oStep)
  }
}

conversions["setRadioButton"] = function(oStep)
{
  if (oStep.htmlId)
    by = 'ie.RadioButton("' + oStep.htmlId + '").Set();'
  else if (oStep.name)
    by = 'ie.RadioButton(Find.ByName("' + oStep.name + '")).Set("' + oStep.value + '");'
  return by
}

conversions["setCheckbox"] = function(oStep)
{
  if (oStep.checked == "true") {
    return 'ie.CheckBox(' + identifyInputField(oStep) + ').Set();'
  } else {
    return 'ie.CheckBox(' + identifyInputField(oStep) + ').Clear();'
  }
}

conversions["setSelectField"] = function(oStep)
{
  return 'ie.select_list' + identifyInputField(oStep) + '.set("' + oStep.text + '")'
}


conversions["verifyInputField"] = function(oStep)
{
  var tagName = "ie.text_field";
  if (oStep.tagName == "TEXTAREA") {
    tagName = "ie.area";
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
