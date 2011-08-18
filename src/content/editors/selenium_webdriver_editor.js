/**
 Creates a DOM node to represent the step as WebDriver code
 @param _document the document to which the node will be added
 @param _oStep the step to represent
 @return the DOM node to insert in the document
 */
function createDOMNode_SeleniumWebdriverRepresentation(_oStep, _document, bVisible)
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
setCreateDOMNode_XXXRepresentation(createDOMNode_SeleniumWebdriverRepresentation)

var conversions = {}
conversions["invoke"] = function(oStep)
{
  return 'browser = Selenium::WebDriver.for :firefox # or :ie or :chrome\nbrowser.navigate.to "' + oStep.url + '"' 
}

conversions["verifyTitle"] = function(oStep)
{
  // TODO if firefox, browser.title
  return 'browser.title.should == "' + oStep.text + '"'
}

conversions["verifyText"] = function(oStep)
{
  return 'browser.text.include?("' + oStep.text + '").should == true'
}

conversions["clickLink"] = function(oStep)
{
  var by = ""
  if (oStep.htmlId)
    by = 'browser.find_element(:id, "' + oStep.htmlId + '").click'
  else if (oStep.name)
    by = 'brower.find_element(:name, "' + oStep.name + '").click'
  else if (oStep.label)
    by = 'browser.find_element(:link_text, "' + oStep.label + '").click'
  return by;
}

conversions["clickButton"] = function(oStep)
{
  //TODO: image button => ie.button(:src, /doit/).click
  var by = ""
  if (oStep.htmlId)
    by = 'browser.find_element(:id, "' + oStep.htmlId + '").click'
  else if (oStep.name)
    by = 'browser.find_element(:name, "' + oStep.name + '").click'
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
    by = 'find_element(:id, "' + oStep.htmlId + '")'
  else if (oStep.forLabel)
    by = 'find_element(:text, "' + oStep.forLabel + '")'
  else if (oStep.name)
    by = 'find_element(:name, "' + oStep.name + '")'
/*
  else if (oStep.value)
    by = '(:value, "' + oStep.value + '")'
*/
  else if (oStep.xpath)
    by = 'find_element(:xpath, "' + oStep.xpath + '")'
  return by
}

conversions["setInputField"] = function(oStep)
{
  var tagName = "text_field";
  if (oStep.tagName == "TEXTAREA") {
    tagName = "area";
  }

  return 'browser.' + identifyInputField(oStep) + '.send_keys("' + oStep.value + '")'
}

conversions["setFileField"] = function(oStep)
{
  oStep.value = oStep.fileName
  if (oStep.name) {
    return 'browser.find_element(:name, "' + oStep.fileName + '").send_keys("' + oStep.fileName + '")'
  } else if (oStep.htmlId) {
    return 'browser.find_element(:id, "' +  oStep.htmlId + '").send_keys("' + oStep.fileName + '")'
  } else {
    return conversions["setInputField"](oStep)
  }
}

conversions["setRadioButton"] = function(oStep)
{
  if (oStep.htmlId)
    by = 'browser.find_element(:id, "' + oStep.htmlId + '").click'
  else if (oStep.name)
    by =  "browser.find_elements(:name => \"" + "tripType" + ").each { |elem|\n" + 
    "elem.click && break if elem.attribute(\"value\") == \"" + oStep.value + "\" && elem.attribute(\"type\") == \"radio\"\n" +  
    "}"
  return by
}

conversions["setCheckbox"] = function(oStep)
{
  if (oStep.checked == "true") {
    return 'browser.' + identifyInputField(oStep) + '.click'
  } else {
    return 'browser.' + identifyInputField(oStep) + '.clear'
  }
}

conversions["setSelectField"] = function(oStep)
{
  return 'select_elem = browser.' + identifyInputField(oStep) + '\n' + 
   "options = select_elem.find_elements(:tag_name, \"option\")\n" + 
   "options.each { |opt| opt.click if opt.text == \"" + oStep.text + "\"}"
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
