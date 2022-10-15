const {
	SyncHook,
	SyncBailHook,
	AsyncParallelHook,
	AsyncSeriesHook
} = require("tapable");
const RequestShortener = require("../lib/RequestShortener");
const ResolverFactory = require("../lib/ResolverFactory");
const Cache = require("../lib/Cache");
const webpack = require("./");

class Compiler {
	constructor(context, options) {
		this.hooks = Object.freeze({
			/** @type {SyncHook<[]>} */
			initialize: new SyncHook([]),

			/** @type {SyncBailHook<[Compilation], boolean>} */
			shouldEmit: new SyncBailHook(["compilation"]),
			/** @type {AsyncSeriesHook<[Stats]>} */
			done: new AsyncSeriesHook(["stats"]),
			/** @type {SyncHook<[Stats]>} */
			afterDone: new SyncHook(["stats"]),
			/** @type {AsyncSeriesHook<[]>} */
			additionalPass: new AsyncSeriesHook([]),
			/** @type {AsyncSeriesHook<[Compiler]>} */
			beforeRun: new AsyncSeriesHook(["compiler"]),
			/** @type {AsyncSeriesHook<[Compiler]>} */
			run: new AsyncSeriesHook(["compiler"]),
			/** @type {AsyncSeriesHook<[Compilation]>} */
			emit: new AsyncSeriesHook(["compilation"]),
			/** @type {AsyncSeriesHook<[string, AssetEmittedInfo]>} */
			assetEmitted: new AsyncSeriesHook(["file", "info"]),
			/** @type {AsyncSeriesHook<[Compilation]>} */
			afterEmit: new AsyncSeriesHook(["compilation"]),

			/** @type {SyncHook<[Compilation, CompilationParams]>} */
			thisCompilation: new SyncHook(["compilation", "params"]),
			/** @type {SyncHook<[Compilation, CompilationParams]>} */
			compilation: new SyncHook(["compilation", "params"]),
			/** @type {SyncHook<[NormalModuleFactory]>} */
			normalModuleFactory: new SyncHook(["normalModuleFactory"]),
			/** @type {SyncHook<[ContextModuleFactory]>}  */
			contextModuleFactory: new SyncHook(["contextModuleFactory"]),

			/** @type {AsyncSeriesHook<[CompilationParams]>} */
			beforeCompile: new AsyncSeriesHook(["params"]),
			/** @type {SyncHook<[CompilationParams]>} */
			compile: new SyncHook(["params"]),
			/** @type {AsyncParallelHook<[Compilation]>} */
			make: new AsyncParallelHook(["compilation"]),
			/** @type {AsyncParallelHook<[Compilation]>} */
			finishMake: new AsyncSeriesHook(["compilation"]),
			/** @type {AsyncSeriesHook<[Compilation]>} */
			afterCompile: new AsyncSeriesHook(["compilation"]),

			/** @type {AsyncSeriesHook<[]>} */
			readRecords: new AsyncSeriesHook([]),
			/** @type {AsyncSeriesHook<[]>} */
			emitRecords: new AsyncSeriesHook([]),

			/** @type {AsyncSeriesHook<[Compiler]>} */
			watchRun: new AsyncSeriesHook(["compiler"]),
			/** @type {SyncHook<[Error]>} */
			failed: new SyncHook(["error"]),
			/** @type {SyncHook<[string | null, number]>} */
			invalid: new SyncHook(["filename", "changeTime"]),
			/** @type {SyncHook<[]>} */
			watchClose: new SyncHook([]),
			/** @type {AsyncSeriesHook<[]>} */
			shutdown: new AsyncSeriesHook([]),

			/** @type {SyncBailHook<[string, string, any[]], true>} */
			infrastructureLog: new SyncBailHook(["origin", "type", "args"]),

			// TODO the following hooks are weirdly located here
			// TODO move them for webpack 5
			/** @type {SyncHook<[]>} */
			environment: new SyncHook([]),
			/** @type {SyncHook<[]>} */
			afterEnvironment: new SyncHook([]),
			/** @type {SyncHook<[Compiler]>} */
			afterPlugins: new SyncHook(["compiler"]),
			/** @type {SyncHook<[Compiler]>} */
			afterResolvers: new SyncHook(["compiler"]),
			/** @type {SyncBailHook<[string, Entry], boolean>} */
			entryOption: new SyncBailHook(["context", "entry"])
		});

		this.webpack = webpack;

		/** @type {string=} */
		this.name = undefined;
		/** @type {Compilation=} */
		this.parentCompilation = undefined;
		/** @type {Compiler} */
		this.root = this;
		/** @type {string} */
		this.outputPath = "";
		/** @type {Watching} */
		this.watching = undefined;

		/** @type {OutputFileSystem} */
		this.outputFileSystem = null;
		/** @type {IntermediateFileSystem} */
		this.intermediateFileSystem = null;
		/** @type {InputFileSystem} */
		this.inputFileSystem = null;
		/** @type {WatchFileSystem} */
		this.watchFileSystem = null;

		/** @type {string|null} */
		this.recordsInputPath = null;
		/** @type {string|null} */
		this.recordsOutputPath = null;
		this.records = {};
		/** @type {Set<string | RegExp>} */
		this.managedPaths = new Set();
		/** @type {Set<string | RegExp>} */
		this.immutablePaths = new Set();

		/** @type {ReadonlySet<string>} */
		this.modifiedFiles = undefined;
		/** @type {ReadonlySet<string>} */
		this.removedFiles = undefined;
		/** @type {ReadonlyMap<string, FileSystemInfoEntry | "ignore" | null>} */
		this.fileTimestamps = undefined;
		/** @type {ReadonlyMap<string, FileSystemInfoEntry | "ignore" | null>} */
		this.contextTimestamps = undefined;
		/** @type {number} */
		this.fsStartTime = undefined;

		/** @type {ResolverFactory} */
		this.resolverFactory = new ResolverFactory();

		this.infrastructureLogger = undefined;

		this.options = options;

		this.context = context;

		this.requestShortener = new RequestShortener(context, this.root);

		this.cache = new Cache();

		/** @type {Map<Module, { buildInfo: object, references: WeakMap<Dependency, Module>, memCache: WeakTupleMap }> | undefined} */
		this.moduleMemCaches = undefined;

		this.compilerPath = "";

		/** @type {boolean} */
		this.running = false;

		/** @type {boolean} */
		this.idle = false;

		/** @type {boolean} */
		this.watchMode = false;

		this._backCompat = this.options.experiments.backCompat !== false;

		/** @type {Compilation} */
		this._lastCompilation = undefined;
		/** @type {NormalModuleFactory} */
		this._lastNormalModuleFactory = undefined;

		/** @private @type {WeakMap<Source, { sizeOnlySource: SizeOnlySource, writtenTo: Map<string, number> }>} */
		this._assetEmittingSourceCache = new WeakMap();
		/** @private @type {Map<string, number>} */
		this._assetEmittingWrittenFiles = new Map();
		/** @private @type {Set<string>} */
		this._assetEmittingPreviousFiles = new Set();
	}
	run(callback) {
		console.log("run ");
		if (this.running) {
			return callback(new Error("webpack is running"));
		}
		let logger;
		const finalCallback = (err, stats) => {
			if (logger) logger.time("beginIdle");
			this.idle = true;
			this.cache.beginIdle();
			this.idle = true;
			if (logger) logger.timeEnd("beginIdle");
			this.running = false;
			if (err) {
				this.hooks.failed.call(err);
			}
			if (callback !== undefined) callback(err, stats);
			this.hooks.afterDone.call(stats);
		};
		const run = () => {
			this.hooks.beforeRun.callAsync(this, err => {
				if (err) {
					return finalCallback(err);
				}
				this.hooks.run.callAsync(this, err => {
					if (err) {
						return finalCallback(err);
					}
				});
			});
		};
		if (this.idle) {
			console.log("idle");
		} else {
			run();
		}
	}
}

module.exports = Compiler;
