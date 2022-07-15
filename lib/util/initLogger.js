import checkENV from "./checkENV.js";
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
    
    var LogName = process.platform === "win32" ? currentDate.getDate() + "." + (parseInt(currentDate.getMonth()) + 1) + "." + currentDate.getFullYear() + "_" + currentDate.getHours() + currentDate.getMinutes() + currentDate.getSeconds() : currentDate.getDate() + "." + (parseInt(currentDate.getMonth()) + 1) + "." + currentDate.getFullYear() + "@" + currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
    calledCounter++;

    return {
        appenders: {
            fileAppender: { type: 'file', filename: path.join(__dirname, "logs", LogName + ".log"), level: process.env.LOGLEVEL.toLowerCase()},
            console: { 
                type: 'console',
                layout: {
                    type: "pattern",
                    pattern: "%[[%d] [%-5p] [%f{3}:%l:%o] %c - %]%m"
                }
            }
        },
        categories: {
            default: { appenders: ['fileAppender', 'console'], level: process.env.LOGLEVEL.toLowerCase() }
        }
    };
}