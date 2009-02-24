
var wtr_myThis = {}

/*
When a function is registered as handler, it has no reference to the object on which
it was originally declared.
One possibility to face this problem is to add a reference to the original object on the
function, allowing the object to be retrieved from the function.

This method adds the provided object as the property "myThis" on all its properties
of type "function".
*/
wtr_myThis.registerAsMyThis = function(_o)
{
	for (var i in _o)
	{
		if (typeof _o[i] == "function")
			_o[i].myThis = _o;
	}
}