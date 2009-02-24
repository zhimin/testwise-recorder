/*******************************************************************************
 * Copyright (c) 2007 Marc Guillemot.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *    Marc Guillemot - initial version
 *******************************************************************************/
function init()
{
	document.designMode = "on"
	document.body.removeChild(document.body.firstChild)
}

window.addEventListener("load", init, false);
var createDOMNode_XXXRepresentation; // needs to be set by extension
var nbNodes = 0;

function addWebTestStep(_possibleSteps)
{
	var oStepVariationsContainer = document.createElement("div");
	oStepVariationsContainer.setAttribute("wt-type", "container")
	if (_possibleSteps.push) // an array
	{
		for (var i=0; i<_possibleSteps.length; ++i)
		{
			addSingleStep(oStepVariationsContainer, _possibleSteps[i], i==0)
		}
	}
	else
		addSingleStep(oStepVariationsContainer, _possibleSteps, true)

	document.body.appendChild(oStepVariationsContainer);
}

function setCreateDOMNode_XXXRepresentation(_fn)
{
	createDOMNode_XXXRepresentation = _fn
	parent.wtr_WebtestRecorder.registerListener(addWebTestStep);
}

/**
Gets the content of the window as formated text
*/
function getAsText()
{
	var str = ""
	for (var i=0; i<document.body.childNodes.length; ++i)
	{
		var o = document.body.childNodes[i];
		if (o.visibleStepNode)
			str += o.visibleStepNode.textContent + "\n"
	}
	return str
}

function getAlternative(_oNode)
{
	var oContainer = getContainer(_oNode)
	if (oContainer == null)
		return []

	var alternatives = []
	for (var i=0; i<oContainer.childNodes.length; ++i)
	{
		var oChild = oContainer.childNodes[i]
		if (oContainer.visibleStepNode != oChild)
			alternatives.push({label: oChild.textContent, node: oChild})
	}
	return alternatives
}

/**
@param _oStepNode the step node that should become visible
*/
function activeAlternative(_oStepNode)
{
	var oContainer = getContainer(_oStepNode)
	oContainer.visibleStepNode.setAttribute("class", "alternativeStep")
	oContainer.visibleStepNode = _oStepNode
	_oStepNode.removeAttribute("class")
}

function addSingleStep(_oContainer, _oStep, bVisible)
{
	var oNode = createDOMNode_XXXRepresentation(_oStep, document, bVisible);
	oNode.setAttribute("wt-type", "step")
	oNode.id = "step" + (++nbNodes)
	_oContainer.appendChild(oNode);
	if (bVisible)
		_oContainer.visibleStepNode = oNode
}

function getContainer(_oNode)
{
	return getParentNodeWithType(_oNode, "container")
}

function getTargetedStep(_oNode)
{
	return getParentNodeWithType(_oNode, "step")
}

function getParentNodeWithType(_oNode, _strType)
{
	if (!_oNode || !_oNode.getAttribute)
		return null
	else if (_oNode.getAttribute("wt-type") == _strType)
		return _oNode
	else
		return getParentNodeWithType(_oNode.parentNode, _strType)
}
