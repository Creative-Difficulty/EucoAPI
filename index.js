import * as fs from "fs/promises";
import * as process2 from "child_process";

import {dist, fib} from "cpu-benchmark";

import crypto from 'crypto';
import dotenv from 'dotenv';
import { exit } from "process";
import express from "express";
import fetch from "node-fetch";
import find from 'local-devices';
import inquirer from "inquirer";
import ip from "ip";
import isPi from "detect-rpi";
import log4js from 'log4js';
import osu from "node-os-utils";
import path from 'path';
import rateLimit from 'express-rate-limit'
import si from "systeminformation";
import slowDown from "express-slow-down"

var app = express();
dotenv.config()


const __dirname = path.resolve();
const logger = log4js.getLogger();

await checkUsersCorruption();
checkENV();
initLogger();

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function initLogger() {
    var currentDate = new Date();
    var LogName = currentDate.getDate() + "." +  (parseInt(currentDate.getMonth()) + 1) + "." + currentDate.getFullYear() + "@" + currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
    log4js.configure({
        appenders: {
            fileAppender: { type: 'file', filename: path.join(__dirname, "logs",  LogName + ".log")},
            console: { type: 'console' }
        },
        categories: {
            default: { appenders: ['fileAppender', 'console'], level: 'error' }
        }
    });
}

function checkENV() {
    if(/\s/.test(process.env.URI)) {
        logger.warn("The environment variable URI contains a whitespace, defaulting to none");
        process.env.URI = ""
    }
    
    if(process.env.LOGLEVEL === "" || process.env.LOGLEVEL !== "info" || process.env.LOGLEVEL !== "production" || process.env.LOGLEVEL !== "debug" || process.env.LOGLEVEL !== " info" || process.env.LOGLEVEL !== "info ") {
        logger.level = "info";
        logger.warn("The environment variable LOGLEVEL isnt set or isnt properly set, defaulting to info");
    } else {
        logger.level = process.env.LOGLEVEL;
    }
    
    if(process.env.PORT === ""|| /\s/.test(process.env.PORT)) {
        logger.warn("The environment variable PORT isnt set or isnt properly set, defaulting to 8082")
        process.env.PORT = 8082
    }
}

async function checkUsersCorruption() {
    const UsersData = await fs.readFile("users.json", "utf-8")
    if (!isJsonString(UsersData)) {
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




var Processorusage;
var DevicesInNetwork;

logger.info("Welcome to EucoAPIv0.1")


let allowedIPs = [];
fs.readFile("users.json", "utf-8", (err, result) => {
    try {
        result = JSON.parse(result); 
    } catch(e) {
        //checkUsersCorruption();
    } finally {
        for (let i = 0; i < result.length; i++) {
            for (var name in result[i]) {
                logger.debug(result[i][name].ip);
                if(result[i]["has-access"] === true) {
                    allowedIPs.push(result[i][name].ip);
                }
            }
        }
    }
})


logger.debug(allowedIPs)

const speedLimiter = slowDown({
    windowMs: 1 * 60 * 1000, // 1 minute
    delayAfter: 100, // allow 100 requests per minute, then...
    delayMs: 500, // add delay to every request after 100 requests in 1 minute
    //skip: ""
});

const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {"Error" : "Too many requests"},
    //skip: ""
});

app.use(speedLimiter)
app.use(apiLimiter)

app.use(express.json())
await si.networkStats()
var ReqCounter = 0;


app.get("/auth", function (req, res) {
    const token = crypto.randomBytes(48).toString('hex');
    fs.readFile("users.json", "utf-8", (err, data) => {
        if (err) throw err;

        if(!data.includes("[") || !data.includes("]") || data === "" || data === null || data === undefined) throw new Error("Something went wrong");
        var parsedData = JSON.parse(data);

        const newUser = {
            "has-access": false,
            "ip": req.ip,
            "token": token
        }

        parsedData.push(newUser);
        fs.writeFile("users.json", JSON.stringify(parsedData), (data, err) => {if (err) throw err;});
    });
    
    res.send({
        "token": token
    })
})

app.get("/" + process.env.URI, function (req, res) {
    
    logger.debug("REQUEST:")

    var requestIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || ''.split(',')[0].trim() || req.socket.localAddress || req.ip
    if (requestIP.substr(0, 7) == "::ffff:") {
        requestIP = requestIP.substr(7)
    }



    var localIP = ip.address()

    if(req.socket.localAddress === requestIP) {
        logger.debug(`IP: this PCs IP (${localIP})`)
        logger.debug("LOCATION: Not accessible, the client is in the same network as the server")
    } else {
        logger.debug(`IP: ${requestIP}`)
        var ipLocation
        var requestURL = "http://ip-api.com/json/" + requestIP
        fetch(requestURL).then(jsonData => jsonData.json()).then(jsonData => {
            ipLocation = jsonData
            logger.debug(ipLocation)
        })
        if(ipLocation === null) {
            logger.debug("LOCATION: not accessible or in local network")
        } else {
            logger.debug("LOCATION:" + ipLocation)
        }
    }
    
    
    req.header("Authentication", "Basic")
    if(ReqCounter === 0) {
        var msTakenforTest = fib(30)

        var piTemp
        var piVoltage;

        if(isPi()) {
            process2.exec("vcgencmd measure_temp", function (err,stdout,stderr) {stdout.split("="); var stdout1 = stdout[1].split("'"); piTemp = stdout1[0]})
            process2.exec("vcgencmd measure_volts", function (err,stdout,stderr) {stdout.split("="); piVoltage = stdout[1].replace("V", "")})
        }


        si.get({
            osInfo: "*",
            system: "*",
            shell: "*",
            bios: "*",

            audio: "*",

            baseboard: "*",
            chassis: "*",

            cpu: "*",
            //cpuFlags: "*",
            cpuCache: "*", //in bytes
            cpuCurrentSpeed: "*",
            cpuTemperature: "*",

            mem: "*", //in bytes
            memLayout: "*", //in bytes

            battery: "*",

            graphics: "*",
            versions: "*",
            users: "*",
            FullLoad: "*", //highest CPU % since boot

            processes: "all, running, sleeping, unknown, blocked",
            
            //processLoad("process_name, process_name2"): "*", See: https://systeminformation.io/processes.html
            services: "*",

            //diskLayout: "*",
            fsOpenFiles: "*",
            fsStats: "*", //See: https://systeminformation.io/filesystem.html
            fsSize: "*",

            usb: "*",
            printer: "*",

            //networkInterfaces: "*",
            networkInterfaceDefault: "*",
            networkGatewayDefault: "*",  //router ip: 10.0.0.138
            networkStats: "*", //si.networkStats(iface) iface= interface to scan
            //networkConnections: "*",
            //inetLatency: "*", inetLatency(google.com)

            wifiNetworks: "*",
            wifiInterfaces: "*",
            wifiConnections: "*",

            bluetoothDevices: "*",

            dockerInfo: "containers, containersRunning, containersPaused, containersStopped, images, memoryLimit, operatingSystem, memTotal, experimentalBuild, serverVersion",
            dockerContainers: "*",
            // dockerImages: "*",
            //dockerContainerStats: "*",

            vboxInfo: "*",
        }).then(SIdata => {
            osu.cpu.usage().then(data => {Processorusage = data})
            find().then(data => {DevicesInNetwork = data; console.log(DevicesInNetwork)})
            var today = new Date();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        
            var data = {
                "s" : true,
                "tsys": time,
                "cu": Processorusage,
                "pt": msTakenforTest,
                "dism": DevicesInNetwork,
                SIdata,
                
            }
        
            if(isPi()) {
                data = {
                    "s" : true,
                    "t": time,
                    "cu": Processorusage,
                    "pt": msTakenforTest,
                    "d": DevicesInNetwork,
                    "r": {
                        "ip": isPi(),
                        "t": piTemp,
                        "cv": piVoltage
                    },
                    SIdata
                }
            }
        
        
            try {
                res.send(Buffer.from(JSON.stringify(data)).toString("base64"))
                logger.info("Request made, content served successfully")
                logger.info("content served successfully")
                if(process.env.LOGLEVEL === "debug") {
                    console.log("")
                }
            } catch(err) {
                logger.error("An error occurred while responding to an API request: ", err)
            }
        });
    } else {
        var msTakenforTest = fib(30)

        var piTemp
        var piVoltage;

        if(isPi()) {
            process2.exec("vcgencmd measure_temp", function (err,stdout,stderr) {stdout.split("="); var stdout1 = stdout[1].split("'"); piTemp = stdout1[0]})
            process2.exec("vcgencmd measure_volts", function (err,stdout,stderr) {stdout.split("="); piVoltage = stdout[1].replace("V", "")})
        }


        si.get({
            cpu: "*",
            //cpuFlags: "*",
            cpuCurrentSpeed: "*",
            cpuTemperature: "*",

            mem: "*", //in bytes
            memLayout: "*", //in bytes

            battery: "*",

            FullLoad: "*", //highest CPU % since boot

            processes: "all, running, sleeping, unknown, blocked",
            
            //processLoad("process_name, process_name2"): "*", See: https://systeminformation.io/processes.html
            services: "*",

            //diskLayout: "*",
            fsOpenFiles: "*",
            fsStats: "*", //See: https://systeminformation.io/filesystem.html
            fsSize: "*",

            usb: "*",
            
            networkStats: "*", //si.networkStats(iface) iface= interface to scan
            //networkConnections: "*",
            //inetLatency: "*", inetLatency(google.com)


            wifiConnections: "*",

            bluetoothDevices: "*",

            dockerInfo: "containers, containersRunning, containersPaused, containersStopped, images, memoryLimit, operatingSystem, memTotal, experimentalBuild, serverVersion",
            dockerContainers: "*",
            // dockerImages: "*",
            //dockerContainerStats: "*",

            vboxInfo: "*",
        }).then(SIdata => {
            find().then(data => {DevicesInNetwork = data;})
            osu.cpu.usage().then(usage => {Processorusage = usage})
            var today = new Date();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            var data;
        
            data = {
                "s" : true,
                "t": time,
                "cu": Processorusage,
                "pt": msTakenforTest,
                "d": DevicesInNetwork,
                SIdata
            }
        
            if(isPi()) {
                data = {
                    "success" : true,
                    "time" : time,
                    "cpu_usage": Processorusage,
                    "performance_test": msTakenforTest,
                    "Raspi": {
                        "is_pi": isPi(),
                        "cpu_temp": piTemp,
                        "cpu_voltage": piVoltage
                    },
                    SIdata
                }
            }
        
        
            try {
                res.send(Buffer.from(JSON.stringify(data)).toString("base64"))
                logger.debug("Request made, content served successfully")
                logger.debug("content served successfully")
                if(process.env.LOGLEVEL === "debug") {
                    console.log("")
                }
            } catch(err) {
                logger.error("An error occurred while responding to an API request: ", err)
            }
        });
    }
    ReqCounter++;
})

app.listen(process.env.PORT, function () {
   logger.info("API operating at http://localhost:" + process.env.PORT + "/" + process.env.URI)
})
