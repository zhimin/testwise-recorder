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

/**
Contains utilities for DOM node manipulation
*/

const WTR_DomUtils = {};


/**
Creates a text node and appends it to the children of the provided node
@param _oNode the DOM node to which a text node should be appended
@param _strText the text for the text node
*/
WTR_DomUtils.appendTextToNode = function(_oNode, _strText)
{
	_oNode.appendChild(_oNode.ownerDocument.createTextNode(_strText));
}

/**
Creates a new element node and appends it to the children of the provided node
@param _oNode the node to which a not should be appended
@param _strNodeName the name of the node to create
@param _mapAttributes (optional) the attributes to set on the node to create
@param _strText (optional) the text content for the node to create
@return the newly created node
*/
WTR_DomUtils.appendNodeToNode = function(_oNode, _strNodeName, _mapAttributes, _strText)
{
	var oNode = _oNode.ownerDocument.createElement(_strNodeName);
	for (var i in _mapAttributes)
	{
		oNode.setAttribute(i, _mapAttributes[i]);
	}
	if (_strText)
		this.appendTextToNode(oNode, _strText);
	_oNode.appendChild(oNode);
	return oNode;
}
