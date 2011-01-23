
var window = { addEventListener: function() {} };

/**
Unit tests utilities
*/

function assertEquals(_oExpected, _oReal)
{
	if (_oExpected != _oReal)
	{
		var strExpected = String(_oExpected);
		var strReal = String(_oReal);
		var iFirstDiff = 0;
		for (iFirstDiff=0; iFirstDiff<strExpected.length; ++iFirstDiff)
		{
			if (strExpected.charAt(iFirstDiff) != strReal.charAt(iFirstDiff))
				break;
		}
		throw "assertEquals failed: expected: \n>" + _oExpected + "<\n, but got: \n>" + _oReal
			+ "<\nFirst diff at position " + iFirstDiff
			+ ": " + strExpected.charAt(iFirstDiff) + " <> " + strReal.charAt(iFirstDiff);
	}
	print("Assertion passed");
}

function assertUndefined(_oReal)
{
	if (undefined != _oReal)
	{
		throw "assertUndefined failed: found: " + _oReal;
	}
	print("Assertion passed");
}

function runTest(_testFunction)
{
	try
	{
		_testFunction();
	}
	catch (e)
	{
		print(e.message + " [" + e.lineNumber + "]");
		print(e.caller);
		for (var i in e)
		{
			print(i + ": " + e[i]);
		}
		throw e;
	}
}

function runTests()
{
	for (var i in this)
	{
		if (typeof this[i] == "function" && i.indexOf("test") == 0)
		{
			print(i);
			runTest(this[i])
		}
	}
}
