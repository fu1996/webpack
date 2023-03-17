let { AsyncSeriesBailHook } = require("tapable");

const hook1 = new AsyncSeriesBailHook(["request", "resolveContext"], "hook1");
const hook2 = new AsyncSeriesBailHook(["request", "resolveContext"], "hook2");

const hook1Tap1 = hook1.tapAsync(
	"hook1Tap1",
	(request, resolveContext, callback) => {
		console.log("hook1Tap1", request, resolveContext);
		return callback();
	}
);

const hook1Tap2 = hook1.tapAsync(
	"hook1Tap2",
	(request, resolveContext, callback) => {
		console.log("hook1Tap2", request, resolveContext);
		return callback();
	}
);

const hook2Tap1 = hook2.tapAsync(
	"hook2Tap1",
	(request, resolveContext, callback) => {
		console.log("hook2Tap1", request, resolveContext);
		return callback();
	}
);

const hook2Tap2 = hook2.tapAsync(
	"hook2Tap2",
	(request, resolveContext, callback) => {
		console.log("hook2Tap2", request, resolveContext);
		return callback("err");
	}
);

hook1.callAsync("111", "222", () => {
	console.log("hook1 callback");
	hook2.callAsync("333", "455", err => {
		console.log("hook2 callback", err);
	});
});
