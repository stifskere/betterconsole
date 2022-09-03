require('../index.cjs')({logRoute: "./Logs/log.log", keepLogs: false, dateFormat: "h:mm:ss"});

console.normalLog("custom log:")
console.customLog({color: ["yellow", "bgWhite"], text: "Custom log", stack: true}, "Hello World!");

console.normalLog("log");
console.log("Hello World!");

console.normalLog("trace");
console.trace("Hello World!");

console.normalLog("debug");
console.debug("Hello World!");

console.normalLog("info");
console.info("Hello World!");

console.normalLog("traced error");
console.error(true, "Hello World!");

console.normalLog("non traced error");
console.error(false, "Hello World!");

console.normalLog("warn");
console.warn("Hello World!");

console.normalLog("normal log");
console.normalLog("Hello World!");