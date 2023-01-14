class WatchGraphPlugin {
	constructor() {
		this.startTime = Date.now();
		this.prevTimestamps = new Map();
	}
	apply(compiler) {
		compiler.hooks.emit.tapAsync(
			"WatchGraphPlugin",
			(compilation, callback) => {
				const changedFiles = Array.from(
					compilation.fileTimestamps.keys()
				).filter(watchfile => {
					return (
						(this.prevTimestamps.get(watchfile) || this.startTime) <
						(compilation.fileTimestamps.get(watchfile) || Infinity)
					);
				});

				this.prevTimestamps = compilation.fileTimestamps;
				callback();
			}
		);
	}
}

module.exports = WatchGraphPlugin;
