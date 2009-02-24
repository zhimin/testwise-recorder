
const ApplicationName = "iTestRecorder";

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
				var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
				if (consoleService != null)
				{
					consoleService.logStringMessage(ApplicationName + " [" + level.name + "] " + this.category + ": " + msg);
			}
		}
	}
}

