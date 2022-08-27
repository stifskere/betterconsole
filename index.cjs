module.exports = () => {
    const {green, magenta, white, cyan, red, yellow} = require('colors');
    const colors = require('colors');
    const moment = require('moment');
    const util = require('util');

    function textModify (type, color, data) {
        if(typeof data == "object") data = JSON.stringify(data, null, 2);
        if(Array.isArray(data)) data = data.join('\n');
        let conversion = color(`[${moment().format('h:mm:ss')}] ${(type) ? `[${type}] `: ""}- `) + `${data.replaceAll('\n', `\n${color(`[${moment().format('h:mm:ss')}] ${(type) ? `[${type}] `: ""}- `)}`)}\n`;
        if(conversion.endsWith(`\n${color(`[${moment().format('h:mm:ss')}] ${(type) ? `[${type}] `: ""}- `)}`)){
            conversion = conversion.substring(0, conversion.length - `\n${color(`[${moment().format('h:mm:ss')}] ${(type) ? `[${type}] `: ""}- `)}`.length);
        }
        if(typeof data === "string") process.stdout.write(conversion);
        else process.stdout.write(`${util.format(data)}\n`);
    }

    console = {
        log(...data){
            textModify("log", green, data);
        },
        trace(...data){
            data = data.join("\n");
            const stackArray = (new Error("traceback")).stack.split("\n");
            stackArray.shift();
            data += "\n" + stackArray.join("\n").replace(/\G {4}/g, "");
            textModify("trace", magenta, data);
        },
        debug(...data){
            textModify("debug", white, data);
        },
        info(...data){
            textModify("info", cyan, data);
        },
        error(...data){
            data = data.join("\n");
            data = (new Error(data)).stack;
            textModify("error", red, data);
        },
        warn(...data){
            textModify("warn", yellow, data);
        },
        normalLog(...data){
            process.stdout.write(util.format(data) + '\n');
        },
        customLog(conf, ...data){
            if(typeof conf !== "object"){
                data.unshift(conf);
                conf = {};
            }
            data = data.join("\n");
            try{
                textModify(conf.text ? conf.text : null, colors[conf.color ? conf.color : "white"], data);
            }catch{
                process.stdout.write('[invalid config] - ' + util.format(data) + '\n');
            }
        }
    }
}