require('../index.cjs')({logRoute: "../Logs/logz.log", keepLogs: false,  dateFormat: "YY:MM:DD - HH:mm:ss"});

console.normalLog("custom log:");
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
console.error("Hello World!");

console.normalLog("warn");
console.warn("Hello World!");

console.normalLog("normal log");
console.normalLog("Hello World!");