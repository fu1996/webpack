const path = require("path");

/** @typedef {import("webpack").Configuration} WebpackConfig */

/**
 * @type {WebpackConfig}
 */
const config = {
	entry: "./src/index.js",
	output: {
		filename: "main.js",
		path: path.resolve(__dirname, "dist")
	}
};

module.exports = config;
