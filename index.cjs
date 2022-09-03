const {green, magenta, white, cyan, red, yellow} = require('chalk');
const colors = require('chalk');
const moment = require('moment');
const util = require('util');
const fs = require('node:fs');

let logR = null;
let dateFormat = null;
let exit = 1;

function textModify (type, color, data) {
    let str = "";
    if (Array.isArray(data)) {
        for (const nData of data) {
            if ((/^[[{]/g.test(nData) || Array.isArray(nData))) str += JSON.stringify(nData, (key, value) => typeof value === "number" ? BigInt(value) : value, Array.isArray(nData) ? null : 2) + '\n';
            else if(typeof nData === "number") str += (BigInt(nData) + '\n');
            else str += nData + '\n';
        }
        str = str.substring(0, str.length-1);
    }
    else str = data;
    const copyColor = color;
    if(Array.isArray(color)){
        color = colors[copyColor[0]];
        for(const col of copyColor) color = color[col];
    }
    let conversion = color(`[${moment().format(dateFormat)}] ${(type) ? `[${type}] `: ""}- `) + `${str.replaceAll('\n', `\n${color(`[${moment().format(dateFormat)}] ${(type) ? `[${type}] `: ""}- `)}`)}\n`;
    if(conversion.endsWith(`\n${color(`[${moment().format(dateFormat)}] ${(type) ? `[${type}] `: ""}- `)}`)) conversion = conversion.substring(0, conversion.length - `\n${color(`[${moment().format(dateFormat)}] ${(type) ? `[${type}] `: ""}- `)}`.length);
    process.stdout.write(conversion);
    writeLog(conversion);
}

function writeLog(tTt) {
    if(logR) fs.writeFileSync(logR, (fs.readFileSync(logR) + tTt).replace(/\x1b\[[0-9;]*m/g, ""));
}

function generateStack(data, title){
    data = ((title !== undefined && title !== "" ? ` ${title}: ` : ' ') + (typeof data === "number" ? BigInt(data) : data)).replace(/\n/gm, title !== undefined && title !== "" ? `\n ${title}: ` : ' ');
    const stackArray = (new Error()).stack.split("\n");
    for(let i = 0; i <= 2; i++) stackArray.shift();
    return data + "\n" + stackArray.join("\n").replace(/\G {4}/g, "");
}

/**
 * log package startup and configuration.
 * @param {Object} options - Options for what it's going to print and log in to the console.
 **/
module.exports = options => {
    logR = options.logRoute;
    dateFormat = options.dateFormat ?? "h:mm:ss";

    if(logR){
        let lr = logR.split(/[\\/]/gmi);if (lr[0] === '.') lr.pop(); lr = lr.join("/");
        fs.mkdirSync(lr, {recursive: true});
        fs.writeFileSync(logR, (fs.existsSync(logR) && options.keepLogs ? fs.readFileSync(logR) : "") + `---- [${moment().format(dateFormat)}] Run triggered ----\n`)
    }

    for(const event of ["exit", "SIGINT", "SIGUSR1", "SIGUSR2", "uncaughtException", "SIGTERM"]){
        process.on(event, (code) => {
            if(exit++ === 1) writeLog(`---- [${moment().format(dateFormat)}] Exit triggered with code ${code}, event: ${event} ----\n`);
            process.exit(0);
        })
    }

    console = {
        /**
         * logs something in the console adding the log tag.
         * @param {any} data - What it is going to print in the console.
         **/
        log(...data){
            textModify("log", green, data);
        },
        /**
         * logs something in the console adding the trace tag.
         * @param {any} data - What it is going to print in the console before the trace
         **/
        trace(...data){
            if(Array.isArray(data)) data = data.join("\n");
            data = generateStack(data, "Traceback");
            textModify("trace", magenta, data);
        },
        /**
         * logs something in the console adding the debug tag, used for debugging your code and marking it as it.
         * @param {any} data - What it is going to print in the console
         **/
        debug(...data){
            textModify("debug", white, data);
        },
        /**
         * logs something in the console adding the info tag.
         * @param {any} data - What it is going to print in the console
         **/
        info(...data){
            textModify("info", cyan, data);
        },
        /**
         * logs something in the console adding the error tag, useful for logging custom errors.
         * @param {boolean || any} showStack - Define if it is going to show the stack trace (optional)
         * @param {any} data - What it is going to print in the console
         **/
        error(showStack, ...data){
            if(showStack !== false){
                if(typeof showStack !== 'boolean') data.unshift(showStack);
                if(Array.isArray(data)) data = data.join("\n");
                data = generateStack(data, "Error")
            }
            textModify("error", red, data);
        },
        /**
         * logs something in the console adding the warning tag.
         * @param {any} data - What it is going to print in the console
         **/
        warn(...data){
            textModify("warn", yellow, data);
        },
        /**
         * logs something in the console without any custom tag this library can offer.
         * @param {any} data - What it is going to print in the console
         **/
        normalLog(...data){
            for(const i of data){
                process.stdout.write(util.format(i) + '\n');
                writeLog(`${i}\n`);
            }
        },
        /**
         * logs something in the console adding the info tag.
         * @param {Object} conf - Configuration with 3 params, text: the name tag, color: the color of the tag (read chalk documentation), stack: define if it will generate stack trace
         * @param {any} data - What it is going to print in the console
         **/
        customLog(conf, ...data){
            if(typeof conf !== "object"){
                data.unshift(conf);
                conf = {};
            }
            data = data.join("\n");
            try{
                textModify(conf.text ? conf.text : null, Array.isArray(conf.color) ? conf.color : colors[conf.color ?? "white"], conf.stack ? generateStack(data, conf.text) : data);
            }catch(err){
                console.normalLog(err);
                process.stdout.write('[invalid config] - ' + util.format(data) + '\n');
            }
        }
    }
}