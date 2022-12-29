const moment = require("moment");
const fs = require("fs");
const chalk = require("chalk");
let logR = null;
let dateFormat = null;
let exit = 1;
function textModify(type, color, data) {
  const modifiedData = [];
  if (typeof data === "object") {
    for (const nData of data) {
      if (typeof nData === "number") {
        modifiedData.push(BigInt(nData));
      } else {
        modifiedData.push(nData);
      }
    }
  } else {
    modifiedData.push(data);
  }

  const colorFunc = Array.isArray(color) ? chalk[color[0]] : chalk[color];
  const date = moment().format(dateFormat);
  const conversion = `${colorFunc(`[${date}] ${type ? `[${type}] ` : ""}- `)}${modifiedData.join("\n")}`;
  process.stdout.write(conversion);
  writeLog(conversion);
};

function writeLog(tTt) {
  if (logR) {
    fs.writeFileSync(logR, fs.readFileSync(logR) + tTt);
  }
};
function generateStack(data, title) {
  const modifiedData =
    (typeof data === "number" ? BigInt(data) : data).toString();
  const stackArray = new Error().stack.split("\n");
  stackArray.shift();
  stackArray.shift();
  stackArray.shift();
  const stackTrace = stackArray.join("\n").replace(/\G {4}/g, "");
  return `${title}: ${modifiedData}\n${stackTrace}`;
};
for (const event of ["exit", "SIGINT", "SIGUSR1", "SIGUSR2", "uncaughtException", "SIGTERM"]){
        process.on(event, (code) => {
            if(exit++ === 1) writeLog(`---- [${moment().format(dateFormat)}] Exit triggered with code ${code}, event: ${event} ----\n`);
            process.exit(0);
        })
    }
};
module.exports = (options) => {
  options ??= { logRoute: null, keepLogs: false, dateFormat: null };
  logR = options.logRoute;
  dateFormat = options.dateFormat ?? "h:mm:ss";
  console = {
    log: (...args) => textModify("log", "green", args),
    trace: (...args) => textModify("trace", "magenta", generateStack(args, "Traceback")),
    error: (...args) => textModify("error", "red", generateStack(args, "Error")),
    warning: (...args) => textModify("warning", "yellow", args),
    info: (...args) => textModify("info", "cyan", args),
    debug: (...args) => textModify("debug", "white", args),
    customLog: (conf, ...data) => {
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
            },
    normalLog: (...data) => {
            for(const i of data){
                process.stdout.write(util.format(i) + '\n');
                writeLog(`${i}\n`);
            }
        },
  };
  if(logR){
      let lr = logR.split(/[\\/]/gmi);if (lr[0] === '.') lr.pop(); lr = lr.join("/");
      if (!fs.existsSync(lr)) fs.mkdirSync(lr, {recursive: true});
      if (options.keepLogs && fs.existsSync(logR)) fs.renameSync(logR, logR.substring(0, logR.lastIndexOf('.')) + "-" + new Date().toString().replace(/[ :]/g, "").substring(0, 20) + logR.substring(logR.lastIndexOf('.')));
      fs.writeFileSync(logR, `---- [${moment().format(dateFormat)}] Run triggered ----\n`);
      const logFilesRead = fs.readdirSync(logR.substring(0, logR.lastIndexOf('/')));
      if(logFilesRead.length > 10 && !options.ignoreLimits){
          console.warn("Log limit of 10 files reached, deleting the oldest log file - if you want to ignore this warning set ignoreLimits param to true");
          let fileStats = logFilesRead.map(file => {return fs.statSync(`./${lr}/${file}`).isFile() ? {path: `./${lr}/${file}`, stat: fs.statSync(`./${lr}/${file}`)} : null});
          fileStats = fileStats.filter(file => file).sort((a, b) => a.stat.mtime - b.stat.mtime);
          fs.unlinkSync(fileStats[0].path);
      }
  }
  return true;
};

  
