const util = require("util");
util.deprecate(
	() => {},
	"A 'callback' argument needs to be provided to the 'webpack(options, callback)' function when the 'watch' option is set. There is no way to handle the 'watch' option without a callback.",
	"DEP_WEBPACK_WATCH_WITHOUT_CALLBACK"
)();
