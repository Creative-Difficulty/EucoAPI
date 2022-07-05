import checkENV from "./checkENV.js";
import { exit } from "process";
import fs from "fs"
import path from "path";

const __dirname = path.resolve();

/** 
@async
@function initLogger
@returns {LoggerConfig} Configuration of the logger
@version 0.0.3
@author Creative-Difficulty
*/

var calledCounter = 0;
export default async function initLogger() {
    if(calledCounter === 0) {
        await checkENV();
    }
    
    var currentDate = new Date();
    var LogName = currentDate.getDate() + "." + (parseInt(currentDate.getMonth()) + 1) + "." + currentDate.getFullYear() + "@" + currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
    fs.open(path.join(__dirname, "logs", LogName + ".log"), () => {
        console.log("opened log file successfully")
    })
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