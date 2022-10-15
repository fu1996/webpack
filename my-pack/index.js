const memoize = require("./util/memoize");

const lazyFunction = factory => {
	const fac = memoize(factory);
	const f = /** @type {any} */ (
		(...args) => {
			return fac()(...args);
		}
	);
	return /** @type {T} */ (f);
};

const mergeExports = (obj, exports) => {
	const descriptors = Object.getOwnPropertyDescriptors(exports);
	for (const name of Object.keys(descriptors)) {
		const descriptor = descriptors[name];
		if (descriptor.get) {
			const fn = descriptor.get;
			Object.defineProperty(obj, name, {
				configurable: false,
				enumerable: true,
				get: memoize(fn)
			});
		} else if (typeof descriptor.value === "object") {
			Object.defineProperty(obj, name, {
				configurable: false,
				enumerable: true,
				writable: false,
				value: mergeExports({}, descriptor.value)
			});
		} else {
			throw new Error(
				"Exposed values must be either a getter or an nested object"
			);
		}
	}
	return /** @type {A & B} */ (Object.freeze(obj));
};

const fn = lazyFunction(() => require("./webpack"));

module.exports = mergeExports(fn, {
	get webpack() {
		return require("./webpack");
	}
});
