const path = require("path");

/** @typedef {import("webpack").Configuration} WebpackConfig */

const AssetsGraphPlugin = require("./plugins/AssetsGraphPlugin");
const ChangeChunkPlugin = require("./plugins/ChangeChunkPlugin");
const WatchGraphPlugin = require("./plugins/WatchGraphPlugin");

/**
 * @type {WebpackConfig}
 */
const config = {
	entry: path.join(__dirname, "./src/index.js"),
	output: {
		filename: "main.js",
		clean: true,
		path: path.resolve(__dirname, "dist")
	},
	plugins: [
		new AssetsGraphPlugin()
		// new ChangeChunkPlugin(),
		// new WatchGraphPlugin()
	]
};
console.log("config", config);

module.exports = config;
