const moment = require("moment");
const fs = require("fs");
const chalk = require("chalk");
const util = require("util");

let logR;
let dateFormat;
let exit = 1;

function textModify(type, color, data) {
    const modifiedData = [];
    if (typeof data === "object")
        for (const nData of data)
            if (typeof nData === "number")
                modifiedData.push(BigInt(nData));
            else
                modifiedData.push(nData);
     else
        modifiedData.push(data);

    let format = `[${moment().format(dateFormat)}] ${type ? `[${type}] ` : ""}- `;
    Array.isArray(color) ? color.map(c => format = chalk[c](format)) : format = chalk[color](format);
    const conversion = `${format}${modifiedData.join("\n").replace(/\n/gm, `\n${format}`)}\n`;
    process.stdout.write(conversion);
    writeLog(conversion);
}

function writeLog(tTt) {
    if (logR)
        fs.writeFileSync(logR, (fs.readFileSync(logR) + tTt).replace(/\033\[.*?m/gm, ''));
}

function generateStack(data, title) {
    const modifiedData =
        (typeof data === "number" ? BigInt(data) : data).toString();
    const stackArray = new Error().stack.split("\n");
    for (let i = 0; i < 3; i++) stackArray.shift();
    const stackTrace = stackArray.join("\n").replace(/\G {4}/g, "");
    return `${title}: ${modifiedData}\n${stackTrace}`;
}

for (const event of ["exit", "SIGINT", "SIGUSR1", "SIGUSR2", "uncaughtException", "SIGTERM"]) {
    process.on(event, (code) => {
        if (exit++ === 1)
            writeLog(`---- [${moment().format(dateFormat)}] Exit triggered with code ${code}, event: ${event} ----\n`);
        process.exit(0);
    });
}

/**
 * log package startup and configuration.
 * @param {{logRoute: string || null, keepLogs: boolean || null, dateFormat: string || null, ignoreLimits: boolean || null}} options - Options for what it's going to print and log in to the console.
 **/
module.exports = options => {
    options ??= {logRoute: null, keepLogs: false, dateFormat: null};
    logR = options.logRoute;
    dateFormat = options.dateFormat ?? "h:mm:ss";
    console = {
        /**
         * @override
         * logs something in the console adding the log tag.
         * @param {any} args - What it is going to print in the console.
         **/
        log: (...args) => textModify("log", "green", args),
        /**
         * logs something in the console adding the trace tag and tracing the log.
         * @param {any} args - What it is going to print in the console before the trace.
         * @override
         **/
        trace: (...args) => textModify("trace", "magenta", generateStack(args, "Traceback")),
        /**
         * logs something in the console adding the error tag, useful for logging custom errors.
         * @param {boolean || any} enableTrace - Define if it is going to show the stack trace (optional)
         * @param {any} args - What it is going to print in the console
         * @override
         **/
        error: (enableTrace, ...args) => textModify("error", "red", (enableTrace === true ? generateStack(args, "Error") : [enableTrace, ...args].splice(0, args.length + 1).join("\n"))),
        /**
         * logs something in the console adding the warning tag.
         * @param {any} args - What it is going to print in the console
         * @override
         **/
        warn: (...args) => textModify("warning", "yellow", args),
        /**
         * logs something in the console adding the info tag.
         * @param {any} args - What it is going to print in the console
         * @override
         **/
        info: (...args) => textModify("info", "cyan", args),
        /**
         * logs something in the console adding the debug tag, used for debugging your code and marking it as it.
         * @param {any} args - What it is going to print in the console
         * @override
         **/
        debug: (...args) => textModify("debug", "white", args),
        /**
         * logs something in the console adding the info tag.
         * @param {{color: string || null, text: string || null, stack: boolean || null}} conf - Configuration with 3 params
         * @param {any} args - What it is going to print in the console
         **/
        customLog: (conf, ...args) => {
            if (typeof conf !== "object") {
                args.unshift(conf);
                conf = {};
            }
            args = args.join("\n");
            try {
                textModify(conf.text ? conf.text : null, Array.isArray(conf.color) ? conf.color : colors[conf.color ?? "white"], conf.stack ? generateStack(args, conf.text) : args);
            } catch (err) {
                console.normalLog(err);
                process.stdout.write('[invalid config] - ' + util.format(args) + '\n');
            }
        },
        /**
         * logs something in the console without any custom tag this library can offer.
         * @param {any} data - What it is going to print in the console
         **/
        normalLog: (...data) => {
            for (const i of data) {
                process.stdout.write(util.format(i) + '\n');
                writeLog(`${i}\n`);
            }
        },
    };

    if (logR) {
        let lr = logR.split(/[\\/]/gmi);
        if (lr[0] === '.') lr.pop();
        lr = lr.join("/");
        if (!fs.existsSync(lr)) fs.mkdirSync(lr, {recursive: true});
        if (options.keepLogs && fs.existsSync(logR)) fs.renameSync(logR, logR.substring(0, logR.lastIndexOf('.')) + "-" + new Date().toString().replace(/[ :]/g, "").substring(0, 20) + logR.substring(logR.lastIndexOf('.')));
        fs.writeFileSync(logR, `---- [${moment().format(dateFormat)}] Run triggered ----\n`);
        const logFilesRead = fs.readdirSync(logR.substring(0, logR.lastIndexOf('/')));
        if (logFilesRead.length > 10 && !options.ignoreLimits) {
            console.warn("Log limit of 10 files reached, deleting the oldest log file - if you want to ignore this warning set ignoreLimits param to true");
            let fileStats = logFilesRead.map(file => {
                return fs.statSync(`./${lr}/${file}`).isFile() ? {
                    path: `./${lr}/${file}`,
                    stat: fs.statSync(`./${lr}/${file}`)
                } : null
            });
            fileStats = fileStats.filter(file => file).sort((a, b) => a.stat.mtime - b.stat.mtime);
            fs.unlinkSync(fileStats[0].path);
        }
    }
    return true;
};