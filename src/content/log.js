
const ApplicationName = "TestWiseRecorder";

function Log(category)
{
	// DEBUG
	var LOG_THRESHOLD = "DEBUG";
	// RELEASE
	//var LOG_THRESHOLD = "WARN";

	var log = this;
	var self = this;
	this.category = category;

	function LogLevel(level, name)
	{
		this.level = level;
		this.name = name;
		var self = this;
		log[name.toLowerCase()] = function(msg) { log.log(self, msg) };
	}

	this.DEBUG = new LogLevel(1, "DEBUG");
	this.INFO = new LogLevel(2, "INFO");
	this.WARN = new LogLevel(3, "WARN");
	this.ERROR = new LogLevel(4, "ERROR");

	this.log = function(level, msg)
	{
		var threshold = this[LOG_THRESHOLD];
		if (level.level >= threshold.level)
		{
			this.append(level, msg);
		}
	}

    // configure appender: none, debuglogger add-on or console
    if (window.wtr_logAppender)
    	this.append = window.wtr_logAppender;
    else
    {
		try
		{
		    var logMngr = Components.classes["@mozmonkey.com/debuglogger/manager;1"]
		                .getService(Components.interfaces.nsIDebugLoggerManager);
		    var logger = logMngr.registerLogger(category);
		    this.append = function(level, msg) {
				logger.log(level.level, msg);
		    }
		}
		catch (e) { /* simply ignore it */	}

		if (!this.append) // try to configure Console
		{
			try
			{
			    var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
			    if (consoleService != null)
			    {
			        this.logger = function(level, msg)
			        {
			            consoleService.logStringMessage(category + " [" + level.name + "] " + this.category + ": " + msg);
			        };
			    }
			}
			catch (e) { /* simply ignore it */	}
		}

		if (!this.append)
			this.append = function(level, msg) {}; // default function does nothing

    	window.wtr_logAppender = this.append;
	}

    /**
	Reports an exception
	*/
	this.logError = function(e)
	{
		throw this.dumpObject(e);
	}

	/**
	Dumps all properties of the object to a string
	Ex:
	dumpOject({toto: 12, foo: "blabla"})
	gives:
	toto: 12
	foo: blabla
	*/
	this.dumpObject = function(_o)
	{
		var str = "";
		for (var i in _o)
		{
			str += i + ": " + _o[i] + "\n";
		}
		if (str == "")
			str = "Could not find any property in " + _o;
		return str;
	}
}