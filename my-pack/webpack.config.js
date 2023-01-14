const path = require("path");

/** @typedef {import("webpack").Configuration} WebpackConfig */

// const AssetsGraphPlugin = require("./plugins/AssetsGraphPlugin");
// const ChangeChunkPlugin = require("./plugins/ChangeChunkPlugin");
// const WatchGraphPlugin = require("./plugins/WatchGraphPlugin");

const HelloCompilationPlugin = require("./plugins/HelloCompilationPlugin");
const { FileListPlugin } = require("./plugins/FileListPlugin");
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
		// new HelloCompilationPluginn()
		// new FileListPlugin()
		// new AssetsGraphPlugin()
		// new ChangeChunkPlugin(),
		// new WatchGraphPlugin()
	]
};
module.exports = config;
