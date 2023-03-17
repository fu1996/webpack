const path = require("path");
const webpack = require("../../lib");
/** @typedef {import("webpack").Configuration} WebpackConfig */

/**
 * @type {WebpackConfig}
 */
const config = {
	mode: "none",
	entry: path.join(__dirname, "./src/index.js"),
	output: {
		filename: "main.js",
		clean: true,
		path: path.resolve(__dirname, "dist")
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.WEBPACK': JSON.stringify('hi webpack')
		})
	]
};
console.log("config", config);

module.exports = config;
