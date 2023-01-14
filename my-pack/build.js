const webpack = require("./libs");
const config = require("./webpack.config");

console.log("webpack.version", webpack.version);

webpack(config, err => {
	console.log("webpack callback");
});
