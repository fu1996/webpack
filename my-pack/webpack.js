"use strict";
const util = require("util");
const Compiler = require("./Compiler");
const NodeEnvironmentPlugin = require("../lib/node/NodeEnvironmentPlugin");
const { getNormalizedWebpackOptions } = require("../lib/config/normalization");
const { applyWebpackOptionsBaseDefaults } = require("../lib/config/defaults");

const createCompiler = rawOptions => {
	const options = getNormalizedWebpackOptions(rawOptions);
	applyWebpackOptionsBaseDefaults(options);
	const compiler = new Compiler(options.context, options);
	new NodeEnvironmentPlugin({
		infrastructureLogging: options.infrastructureLogging
	}).apply(compiler);
	if (Array.isArray(options.plugins)) {
		for (const plugin of options.plugins) {
			if (typeof plugin === "function") {
				plugin.call(compiler, compiler);
			} else {
				plugin.apply(compiler);
			}
		}
	}
};

const webpack = (options, callback) => {
	console.log("webpack starting");
	const create = () => {
		let compiler;
		let watch = false;
		let watchOptions;
		compiler = createCompiler(options);
		watch = options.watch;
		watchOptions = options.watchOptions || {};
		return { compiler, watch, watchOptions };
	};
	if (callback) {
		console.log("calling callback");
	} else {
		const { compiler, watch } = create();
		if (watch) {
			util.deprecate(
				() => {},
				"A 'callback' argument needs to be provided to the 'webpack(options, callback)' function when the 'watch' option is set. There is no way to handle the 'watch' option without a callback.",
				"DEP_WEBPACK_WATCH_WITHOUT_CALLBACK"
			)();
		}
		return compiler;
	}
};

module.exports = webpack;
