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
    var oNode = WTR_DomUtils.appendNodeToNode(oStepNode, "span", {}, "");
    txt = txt.replace(/(:\w+)\s*,/, '<span class=\'symbol\'>$1</span>,');
    txt = txt.replace(/(:firefox)\s/, '<span class=\'symbol\'>$1</span> ');
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
  return 'driver = Selenium::WebDriver.for :firefox # or :ie or :chrome;' 
}

conversions["navigate"] = function(oStep)
{
  return 'driver.navigate.to "' + oStep.url + '"' 
}

conversions["verifyTitle"] = function(oStep)
{
  return 'expect(driver.title).to eq("' + oStep.text + '")'
}

conversions["verifyText"] = function(oStep)
{
  return 'expect(driver.find_element(:tag_name, "body").text).to include("' + oStep.text + '")'
}

conversions["clickLink"] = function(oStep)
{
  var by = ""
  if (oStep.htmlId)
    by = 'driver.find_element(:id, "' + oStep.htmlId + '").click'
  else if (oStep.name)
    by = 'brower.find_element(:name, "' + oStep.name + '").click'
  else if (oStep.label)
    by = 'driver.find_element(:link_text, "' + oStep.label + '").click'
  return by;
}

conversions["clickButton"] = function(oStep)
{
  //TODO: image button => ie.button(:src, /doit/).click
  var by = ""
  if (oStep.htmlId)
    by = 'driver.find_element(:id, "' + oStep.htmlId + '").click'
  else if (oStep.name)
    by = 'driver.find_element(:name, "' + oStep.name + '").click'
  else if (oStep.label)
    by = 'driver.find_element(:xpath,"' + "//input[@value='" + oStep.label + "']\").click"
  else if (oStep.src) 
    by = 'driver.button(:src,"' + oStep.src+ '").click'
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
  return 'driver.' + identifyInputField(oStep) + '.send_keys("' + oStep.value + '")'
}

conversions["setFileField"] = function(oStep)
{
  oStep.value = oStep.fileName
  if (oStep.name) {
    return 'driver.find_element(:name, "' + oStep.fileName + '").send_keys("' + oStep.fileName + '")'
  } else if (oStep.htmlId) {
    return 'driver.find_element(:id, "' +  oStep.htmlId + '").send_keys("' + oStep.fileName + '")'
  } else {
    return conversions["setInputField"](oStep)
  }
}

conversions["setRadioButton"] = function(oStep)
{
  if (oStep.htmlId) {
    by = 'driver.find_element(:id, "' + oStep.htmlId + '").click'
  } else if (oStep.name) {
    by =  "driver.find_element(:xpath, \"//input[@type='radio' and @name='" +  oStep.name + "' and @value='" + oStep.value + "']\").click"
  }
  return by
}

conversions["setCheckbox"] = function(oStep)
{
  if (oStep.checked == "true") {
    return 'driver.' + identifyInputField(oStep) + '.click'
  } else {
    return 'driver.' + identifyInputField(oStep) + '.click if driver.' + identifyInputField(oStep) + ".selected?"
  }
}

conversions["setSelectField"] = function(oStep)
{
  // return 'select_elem = browser.' + identifyInputField(oStep) + ';' + 
  //  "options = select_elem.find_elements(:tag_name, \"option\"); " + 
  //  "options.each { |opt| opt.click if opt.text == \"" + oStep.text + "\"}"
  return "Selenium::WebDriver::Support::Select.new(driver." + identifyInputField(oStep) + ").select_by(:text, \"" + oStep.text + "\")"
}

conversions["verifyInputField"] = function(oStep)
{
  var tagName = "expect(driver.find_element";
  if (oStep.htmlId) {
    return tagName + '(:id, "' + oStep.htmlId + '").attribute("value")).to eq("' + oStep.value + '")'
  } else if (oStep.name) {
    return tagName + '(:name, "' + oStep.name + '").attribute("value")).to eq("' + oStep.value + '")'
  } else {
    return tagName + '(:id, "specify_id_here").attribute("value")).to eq("' + oStep.value + '")'
  }
}

conversions["verifySelectField"] = function(oStep)
{
  if (oStep.htmlId) {
  	return 'expect(Selenium::WebDriver::Support::Select.new(driver.find_element(:id, "' + oStep.htmlId + '")).first_selected_option.text).to eq("' + oStep.value + '")';
  } else if (oStep.name) {
  	return 'expect(Selenium::WebDriver::Support::Select.new(driver.find_element(:name, "' + oStep.name + '")).first_selected_option.text).to eq("' + oStep.value + '")';	
	} else {
  	return 'expect(Selenium::WebDriver::Support::Select.new(driver.find_element(:id, "specify_id_here")).first_selected_option.text).to eq("' + oStep.value + '")';			
	}

}
