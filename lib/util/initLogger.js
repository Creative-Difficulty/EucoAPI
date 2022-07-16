import {LogName} from "./checkENV.js";
import path from "path";

/** 
@async
@function initLogger
@returns {LoggerConfig} Configuration of the logger
@version 0.0.4
@author Creative-Difficulty
*/

const __dirname = path.resolve();
export default async function initLogger() {
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