import dotenv from "dotenv";
import log4js from "log4js";

const logger = log4js.getLogger();
dotenv.config();
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
    
    if(/\s/.test(process.env.LOGLEVEL) || process.env.LOGLEVEL === "" || process.env.LOGLEVEL !== "WARN" && process.env.LOGLEVEL !== "DEBUG" && process.env.LOGLEVEL !== "INFO" && process.env.LOGLEVEL !== "ERROR") {
        process.env.LOGLEVEL = "INFO";
        logger.warn("The environment variable LOGLEVEL isnt set or isnt properly set, defaulting to INFO");
    } else {
        process.env.LOGLEVEL = process.env.LOGLEVEL;
    }
    
    if(process.env.PORT === ""|| /\s/.test(process.env.PORT)) {
        logger.warn("The environment variable PORT isnt set or isnt properly set, defaulting to 8082")
        process.env.PORT = 8082
    }
}
