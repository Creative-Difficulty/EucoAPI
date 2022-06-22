import dotenv from "dotenv";
import log4js from "log4js";

const logger = log4js.getLogger();
dotenv.config();
/** 
@async
@function checkENV
@return {Promise<Array<string>>} Values from the .env file in format `[process.env.PORT, process.env.LOGLEVEL, process.env.URI]`
@version 0.0.2
@author Creative-Difficulty
*/
export default async function checkENV() {
    return new Promise((resolve, reject) => {
        if(/\s/.test(process.env.URI)) {
            logger.warn("The environment variable URI contains a whitespace, defaulting to none");
            process.env.URI = ""
        }
        
        if(/\s/.test(process.env.LOGLEVEL) && process.env.LOGLEVEL === "" && process.env.LOGLEVEL !== "WARN" && process.env.LOGLEVEL !== "ALL" && process.env.LOGLEVEL !== "INFO" && process.env.LOGLEVEL !== "ERROR") {
            logger.level = "INFO";
            logger.warn("The environment variable LOGLEVEL isnt set or isnt properly set, defaulting to INFO");
        } else {
            logger.level = process.env.LOGLEVEL;
        }
        
        if(process.env.PORT === ""|| /\s/.test(process.env.PORT)) {
            logger.warn("The environment variable PORT isnt set or isnt properly set, defaulting to 8082")
            process.env.PORT = 8082
        }
        resolve([process.env.PORT, process.env.LOGLEVEL, process.env.URI])
    })
}
