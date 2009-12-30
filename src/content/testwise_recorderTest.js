
/**
Unit tests
*/
load("UnitTestUtils.js");
load("log.js");
load("WTRStep.js");
load("testwise_recorder.js");

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


var oStep = new WTRStep("verifyText", {text: "sample text", description: "Verify that text is contained in the page"});
var oStep2 = new WTRStep("clickLink", {id: "myLink", description: "Click my beautifull link"});
var oNotStep = new WTRStep("not", {wtrChildren: oStep});
var	oNotStep2 = new WTRStep("not", {wtrChildren: [oStep, oStep]});
var oGroup1 = new WTRStep("group", {description: "do something", wtrChildren: [oStep, oStep2]});


