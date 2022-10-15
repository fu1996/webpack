const memoize = fn => {
	let cache = false;
	let result = undefined;
	return () => {
		if (cache) {
			return result;
		} else {
			result = fn();
			cache = true;
			// 允许清理 fn 和所有依赖资源的内存
			fn = undefined;
			return result;
		}
	};
};

module.exports = memoize;
