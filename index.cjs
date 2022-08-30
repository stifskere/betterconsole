module.exports = () => {
    const {green, magenta, white, cyan, red, yellow} = require('chalk');
    const colors = require('chalk');
    const moment = require('moment');
    const util = require('util');

    function textModify (type, color, data) {
        let str = "";
        for (const nData of data) if (/^[[{]/g.test(nData) || Array.isArray(nData)) str += JSON.stringify(nData, null, Array.isArray(nData) ? null : 2) + '\n';
        else str += nData + '\n';
        str = str.substring(0, str.length-1);
        let conversion = color(`[${moment().format('h:mm:ss')}] ${(type) ? `[${type}] `: ""}- `) + `${str.replaceAll('\n', `\n${color(`[${moment().format('h:mm:ss')}] ${(type) ? `[${type}] `: ""}- `)}`)}\n`;
        if(conversion.endsWith(`\n${color(`[${moment().format('h:mm:ss')}] ${(type) ? `[${type}] `: ""}- `)}`)) conversion = conversion.substring(0, conversion.length - `\n${color(`[${moment().format('h:mm:ss')}] ${(type) ? `[${type}] `: ""}- `)}`.length);
        process.stdout.write(conversion);
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
            const stackArray = (new Error("traceback")).stack.split("\n");
            stackArray.shift();
            data += "\n" + stackArray.join("\n").replace(/\G {4}/g, "");
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
                data = (new Error(data.replace(/[(\n)]/g, "\nError: "))).stack;
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
            process.stdout.write(util.format(data) + '\n');
        },
        /**
         * logs something in the console adding the info tag.
         * @param {Object} conf - Configuration with 2 params, text: the name tag, color: the color of the tag (read colors.js documentation)
         * @param {any} data - What it is going to print in the console
         **/
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