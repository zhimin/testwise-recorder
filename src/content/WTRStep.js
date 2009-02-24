
/**
 webtest specials
Contains object definition
*/

function WTRStep(_stepName, _attributes)
{
	this.wtrStep = _stepName;
	for (var i in _attributes)
	{
		this[i] = _attributes[i];
	}
	this.getPropertyNames = function()
	{
		var tabPropNames = new Array();
		for (var strPropName in this)
		{
      if (strPropName.indexOf("wtr") != 0
				&& (typeof this[strPropName] == "string"))
			{
				tabPropNames.push(strPropName);
			}
		}
		return tabPropNames
	}

	this.getSortedPropertyNames = function()
	{
		var tabPropNames = this.getPropertyNames()
		tabPropNames.sort();
		return tabPropNames;
	}

	this.clone = function()
	{
		var name = this.wtrStep
		var props = {}
		var tabPropNames = this.getPropertyNames()
		for (var i=0; i<tabPropNames.length; ++i)
		{
			var propName = tabPropNames[i]
			props[propName] = this[propName]
		}
		return new WTRStep(name, props)
	}

	this.cloneAndAdd = function(properties)
	{
		var clone = this.clone()
		for (var i in properties)
		{
			clone[i] = properties[i]
		}
		return clone;
	}
}
