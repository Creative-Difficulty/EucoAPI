import * as fs from "fs/promises";

import { exit } from "process";
import initLogger from "./initLogger.js";
import inquirer from "inquirer";
import isJsonString from "./isJSONString.js";
import log4js from "log4js";

const logger = log4js.getLogger();
const LoggerConfig = await initLogger();
log4js.configure(LoggerConfig)

/** 
@async
@function checkUsersCorruption
@version 0.0.2
@description checks `users.json` for JSON corruption
@author Creative-Difficulty
*/
export default async function checkUsersCorruption() {
    const UsersData = await fs.readFile("users.json", "utf-8");
    const UsersFileIsOK = await isJsonString(UsersData);
    if (!UsersFileIsOK) {
        const answer = await inquirer.prompt([{
            choices: ["Yes", "No"],
            type: "list",
            name: "clearUsersFile",
            message: "Error reading users file, File is empty or corrupted. Do you want to clear its contents?",
        }])
        
        if (answer.clearUsersFile === "Yes") {
            await fs.writeFile("users.json", "[]")
            logger.info("cleared contents of users.json successfully, relaunch EucoAPI to continue");
            exit(0);
        } else {
            logger.warn("Relaunch EucoAPI when you have fixed users.json!");
            exit(1);
        }
    }
}