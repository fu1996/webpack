let { SyncHook, HookMap } = require("tapable");

// https://blog.csdn.net/qq_17175013/article/details/119547711

const map = new HookMap(() => new SyncHook(["name"]));

// map是用来批量创建钩子的 key是字符串 值是一个钩子hook，就是上面第二行new HookMap()的参数执行的结果。
map.for("key1").tap("plugin1", name => console.log(1, name));
map.for("key1").tap("plugin2", name => console.log(2, name));
map.get("key1").call("yh");

map.for("key2").tap("plugin3", age => console.log(3, age));
map.for("key2").tap("plugin3", age => console.log(4, age));
map.get("key2").call(18);
