import dotenv from "dotenv";
import log4js from "log4js";

dotenv.config();


var currentDate = new Date();
export const LogName = process.platform === "win32" ? currentDate.getDate() + "." + (parseInt(currentDate.getMonth()) + 1) + "." + currentDate.getFullYear() + "_" + currentDate.getHours() + currentDate.getMinutes() + currentDate.getSeconds() : currentDate.getDate() + "." + (parseInt(currentDate.getMonth()) + 1) + "." + currentDate.getFullYear() + "@" + currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();

log4js.configure({
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
        default: { appenders: ['fileAppender', 'console'], level: "INFO" }
    }
});

const logger = log4js.getLogger("temp");

/** 
@async
@function checkENV
@return {Promise<Array<string>>} Removed in v0.0.3. Now sets ENV vars on its own when called
@version 0.0.3
@author Creative-Difficulty
*/
export default async function checkENV() {
    if(/\s/.test(process.env.URI)) {
        logger.warn("The environment variable URI contains a whitespace, defaulting to none");
        process.env.URI = ""
    }
    
    if(/\s/.test(process.env.LOGLEVEL) || process.env.LOGLEVEL === "" || process.env.LOGLEVEL.toLowerCase() !== "warn" && process.env.LOGLEVEL.toLowerCase() !== "info" && process.env.LOGLEVEL.toLowerCase() !== "debug" && process.env.LOGLEVEL.toLowerCase() !== "error") {
        process.env.LOGLEVEL = "INFO";
        logger.warn("The environment variable LOGLEVEL isnt set or isnt properly set, defaulting to INFO");
    }
    
    if(process.env.PORT === "" || /\s/.test(process.env.PORT) || process.env.PORT === NaN || process.env.PORT === undefined || process.env.PORT === null || process.env.PORT < 0 || process.env.PORT > 65535) {
        logger.warn("The environment variable PORT isnt set or isnt properly set, defaulting to 8082")
        process.env.PORT = 8082
    }
    log4js.shutdown();
}
