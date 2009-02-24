
/**
Unit tests for myThis.js
*/
load("UnitTestUtils.js");
load("myThis.js");


function test_registerAsMyThis()
{
	var o =
		{
			foo: function() {},
			fii: 123,
			bla: "wer",
			foo2: function(_a, _b) { return _a + _b; }
		};
		
	wtr_myThis.registerAsMyThis(o);
	assertEquals(o, o.foo.myThis);
	assertEquals(o, o.foo2.myThis);
	assertUndefined(o.bla.myThis);
}


runTests();