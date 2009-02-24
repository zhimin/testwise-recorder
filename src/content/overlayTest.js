
/**
Unit tests
*/
load("UnitTestUtils.js");
load("myThis.js");
load("WTR_base.js");
load("overlay.js");



function test_parseBaseUrl()
{
	var rep = WTR_Overlay._parseBaseUrl("http://my.server.org")
	assertEquals("http", rep.scheme)
	assertEquals("my.server.org", rep.host)
	assertEquals("http://my.server.org", rep.urlWithoutPath)
	
	rep = WTR_Overlay._parseBaseUrl("https://my.server.org:1234/some/path")
	assertEquals("https", rep.scheme)
	assertEquals("my.server.org", rep.host)
	assertEquals("https://my.server.org:1234", rep.urlWithoutPath)
}

function test_parseQueryParameters()
{
	var rep = WTR_Overlay._parseQueryParameters(null)
	assertEquals("object", typeof rep)
	
	rep = WTR_Overlay._parseQueryParameters("")
	assertEquals("object", typeof rep)

	rep = WTR_Overlay._parseQueryParameters("?param1=abc&param3=def")
	assertEquals("object", typeof rep)
	assertEquals("abc", rep.param1)
	assertEquals("def", rep.param3)
}

runTests();