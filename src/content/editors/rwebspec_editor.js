/*******************************************************************************
 * Copyright (c) 2007-2008 Marc Guillemot.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *    Marc Guillemot - initial version
 *******************************************************************************/

/**
 Creates a DOM node to represent the step as WebDriver code
 @param _document the document to which the node will be added
 @param _oStep the step to represent
 @return the DOM node to insert in the document
 */
function createDOMNode_RwebSpecRepresentation(_oStep, _document, bVisible)
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
setCreateDOMNode_XXXRepresentation(createDOMNode_RwebSpecRepresentation)

var conversions = {}
conversions["invoke"] = function(oStep)
{
  return 'goto_page("' + oStep.url + '")'
}

conversions["verifyTitle"] = function(oStep)
{
  return 'assert_title("' + oStep.text + '")'
}

conversions["verifyText"] = function(oStep)
{
  return 'assert_text_present("' + oStep.text + '")'
}

conversions["clickLink"] = function(oStep)
{
  var by = ""
  if (oStep.htmlId)
    by = 'click_link_with_id("' + oStep.htmlId + '")'
  else if (oStep.label)
    by = 'click_link("' + oStep.label + '")'

  return by;
}

conversions["clickButton"] = function(oStep)
{
  var by = ""
  if (oStep.htmlId)
    by = 'click_button_with_id("' + oStep.htmlId + '")'
  else if (oStep.label)
    by = 'click_button("' + oStep.label + '")'
  else if (oStep.name)
  	by = 'click_button_with_name("' + oStep.name + '")'
  else if (oStep.src)
  	by = 'click_button_with_image("' + oStep.src+ '")'
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


conversions["setFileField"] = function(oStep)
{
  oStep.value = oStep.fileName
  if (oStep.name) {
    return 'select_file_for_upload("' + oStep.name + '", "' + oStep.fileName + '")'    
  } else {
    return conversions["setInputField"](oStep)
  }
}

conversions["setRadioButton"] = function(oStep)
{
  return 'click_radio_option("' + oStep.name + '", "' + oStep.value + '")'
}

conversions["setCheckbox"] = function(oStep)
{
  var checkbox_cmd = (oStep.checked == "true") ? "check_checkbox" : "uncheck_checkbox";
  if (oStep.name) {
    if (oStep.value) {
      return checkbox_cmd + '("' + oStep.name + '", "' + oStep.value + '")';
    } else {
      return checkbox_cmd + '("' + oStep.name + '")';
    }
  } else if (oStep.htmlId) {
    return (oStep.checked == "true") ? 'checkbox(:id,"' + oStep.htmlId +  '").set' : 'checkbox(:id,"' + oStep.htmlId +  '").clear'
  } else {
    return "checkbox operation not supported"
  }
}

conversions["setSelectField"] = function(oStep)
{
  if (oStep.name) {
    return 'select_option("' + oStep.name + '", "' + oStep.text + '")'
  } else if (oStep.htmlId) {
    return 'select_list' + '(:id, "' + oStep.htmlId + '").set("' + oStep.text + '")'
  } else {
    return 'select_option("specify_name_here", "' + oStep.text + '")'
  }

}

conversions["setInputField"] = function(oStep)
{
  var tagName = "text_field";
  if (oStep.tagName == "TEXTAREA") {
    tagName = "area";
  }

  if (oStep.name) {
    return 'enter_text("' + oStep.name + '", "' + oStep.value + '")'
  } else if (oStep.htmlId) {
    // TODO, what happen textArea
    return tagName + '(:id, "' + oStep.htmlId + '").set("' + oStep.value + '")'
  } else {
    return tagName + '(:id, "specify_id_here").set("' + oStep.value + '")'
  }
}

conversions["verifyInputField"] = function(oStep)
{
  var tagName = "text_field";
  if (oStep.tagName == "TEXTAREA") {
    tagName = "area";
  }

  if (oStep.htmlId) {
    return tagName + '(:id, "' + oStep.htmlId + '").value.should == "' + oStep.value + '"'
  } else if (oStep.name) {
    return tagName + '(:name, "' + oStep.name + '").value.should == "' + oStep.value + '"'
  } else {
    return tagName + '(:id, "specify_id_here").value.should == "' + oStep.value + '"'
  }
}

conversions["verifySelectField"] = function (oStep) 
{  
  return 'assert_select_value("' +  oStep.htmlId + '", "' + oStep.value + '")'
}


