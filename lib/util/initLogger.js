import checkENV from "./checkENV.js";
import { exit } from "process";
import * as fs2 from "fs/promises";
import path from "path";

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
    var LogName = currentDate.getDate() + "." + (parseInt(currentDate.getMonth()) + 1) + "." + currentDate.getFullYear() + "@" + currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds() + ".log";
    if(process.platform == "win32") {
        LogName = currentDate.getDate() + "." + (parseInt(currentDate.getMonth()) + 1) + "." + currentDate.getFullYear() + "_" + currentDate.getHours() + currentDate.getMinutes() + currentDate.getSeconds() + ".log";
    }
    await fs2.writeFile(path.join(__dirname, "logs", LogName), " ");
    calledCounter++;

    return {
        appenders: {
            fileAppender: { type: 'file', filename: path.join(__dirname, "logs", LogName + ".log") },
            console: { type: 'console' }
        },
        categories: {
            default: { appenders: ['fileAppender', 'console'], level: process.env.LOGLEVEL }
        }
    };
}