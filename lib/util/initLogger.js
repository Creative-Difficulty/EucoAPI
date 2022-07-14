import checkENV from "./checkENV.js";
import path from "path";
import fs from "fs";

/** 
@async
@function initLogger
@returns {LoggerConfig} Configuration of the logger
@version 0.0.4
@author Creative-Difficulty
*/

var calledCounter = 0;
export default async function initLogger() {
    const __dirname = path.resolve();
    if(calledCounter === 0) {
        await checkENV();
    }
    
    var currentDate = new Date();
    var LogName = currentDate.getDate() + "." + (parseInt(currentDate.getMonth()) + 1) + "." + currentDate.getFullYear() + "@" + currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
    if(process.platform === "win32") {
        LogName = currentDate.getDate() + "." + (parseInt(currentDate.getMonth()) + 1) + "." + currentDate.getFullYear() + "_" + currentDate.getHours() + currentDate.getMinutes() + currentDate.getSeconds();
    }
    calledCounter++;

    return {
        appenders: {
            fileAppender: { type: 'file', filename: path.join(__dirname, "logs", LogName + ".log"), level: process.env.LOGLEVEL.toLowerCase()},
            console: { type: 'console' }
        },
        categories: {
            default: { appenders: ['fileAppender', 'console'], level: process.env.LOGLEVEL.toLowerCase() }
        }
    };
}