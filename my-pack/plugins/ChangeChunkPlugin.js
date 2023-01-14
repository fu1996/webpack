class ChangeChunkPlugin {
	constructor() {
		this.chunkVersions = {};
	}
	apply(compiler) {
		compiler.hooks.emit.tapAsync(
			"ChangeChunkPlugin",
			(compilation, callback) => {
				var changedChunks = compilation.chunks.filter(chunk => {
					var oldVersion = this.chunkVersions[chunk.name];
					this.chunkVersions[chunk.name] = chunk.hash;
					return chunk.hash !== oldVersion;
				});
				callback();
			}
		);
	}
}

module.exports = ChangeChunkPlugin;
