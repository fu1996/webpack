/**
 * 根据配置创建compiler 对象
 * @param {WebpackOptions} rawOptions
 * @returns {Compiler}
 */
const { getNormalizedWebpackOptions } = require("./config/normalization");
const { printConfig } = require("./log");
const {
	applyWebpackOptionsBaseDefaults
} = require("../../lib/config/defaults");
const Compiler = require("./Compiler");

function createCompiler(rawOptions) {
	const options = getNormalizedWebpackOptions(rawOptions);
	printConfig("2.2.增加webapck 中的默认值");
	applyWebpackOptionsBaseDefaults(options);
	const compiler = new Compiler(options.context, options);

	return undefined;
}

/**
 *
 * @param {WebpackOptions} options webpack配置
 * @param {Callback<Stats>} callback 回调函数
 * @returns {Compiler} 编译器对象
 */
const webpack = (options, callback) => {
	printConfig("1.接受webpack.config.js 的参数");

	function create() {
		let compiler;
		let watch = false;
		let watchOptions;
		compiler = createCompiler(options);
		watchOptions = options.watchOptions;
		return {
			compiler,
			watch,
			watchOptions
		};
	}

	if (callback) {
		try {
			const { compiler, watch, watchOptions } = create();
		} catch (e) {
			process.nextTick(() => callback(e));
		}
	}
};

webpack.version = "1.0.0";
module.exports = webpack;
