import * as process2 from "child_process";

import {dist, fib} from "cpu-benchmark";

import crypto from 'crypto';
import dotenv from 'dotenv';
import express from "express";
import fetch from "node-fetch";
import find from 'local-devices';
import fs from 'fs';
import ip from "ip";
import isPi from "detect-rpi";
import log4js from 'log4js';
import osu from "node-os-utils";
import path from 'path';
import si from "systeminformation";

var app = express();
dotenv.config()

const __dirname = path.resolve();
const logger = log4js.getLogger();

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
    if(/\s/.test(process.env.PATH_AFTER_URL)) {
        console.log("The environment variable PATH_AFTER_URL contains a whitespace, defaulting to none");
        process.env.PATH_AFTER_URL = ""
    }
    
    if(process.env.MODE === "" || /\s/.test(process.env.MODE) || process.env.MODE !== "normal" || process.env.MODE !== "production" || process.env.MODE !== "debug") {
        console.log("The environment variable MODE isnt set or isnt properly set, defaulting to normal");
        logger.level = "info";
    } else {
        logger.level = process.env.MODE;
    }
    
    if(process.env.PORT === ""|| /\s/.test(process.env.PORT)) {
        console.log("The environment variable PORT isnt set or isnt properly set, defaulting to 8082")
        process.env.PORT = 8082
    }
}

checkENV();
initLogger();


var Processorusage;
var DevicesInNetwork;

console.log("Welcome to EucoAPIv0.1")


app.use(express.json())
await si.networkStats()
var ReqCounter = 0;

fs.readFile("users.json", "utf-8", (err, data) => {if(!data.includes("[") || !data.includes("]") || data === "" || data === null || data === undefined) {fs.writeFile("users.json", "[]", (data, err) => {if (err) throw err;})};})

app.get("/auth", function (req, res) {
    const token = crypto.randomBytes(48).toString('hex');
    fs.readFile("users.json", "utf-8", (err, data) => {
        if (err) throw err;

        if(!data.includes("[") || !data.includes("]") || data === "" || data === null || data === undefined) throw new Error("Something went wrong");
        var parsedData = JSON.parse(data);
        var IP = req.ip;
        if(req.ip === undefined || req.ip === null) {
            throw new Error("Request IP cannot be resolved, to avoid a possbile DDoS attack, this request will not be handeled");
        } else if(req.ip === "::1" || req.ip === "127.0.0.1") {
            IP = "localhost"
        }

        const newUser = {
            "has-access": false,
            "request-ip": IP,
            "token": token
        }

        parsedData.push(newUser);
        fs.writeFile("users.json", JSON.stringify(parsedData), (data, err) => {if (err) throw err;});
    });
    
    res.send({
        "token": token
    })
})

app.get("/" + process.env.PATH_AFTER_URL, function (req, res) {
    if(process.env.MODE === "debug") {
        console.log("REQUEST:")

        var requestIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || ''.split(',')[0].trim() || req.socket.localAddress || req.ip
        if (requestIP.substr(0, 7) == "::ffff:") {
            requestIP = requestIP.substr(7)
        }



        var localIP = ip.address()

        if(req.socket.localAddress === requestIP) {
            console.log(`IP: this PCs IP (${localIP})`)
            console.log("LOCATION: Not accessible, the client is in the same network as the server")
        } else {
            console.log(`IP: ${requestIP}`)
            var ipLocation
            var requestURL = "http://ip-api.com/json/" + requestIP
            fetch(requestURL).then(jsonData => jsonData.json()).then(jsonData => {
                ipLocation = jsonData
                console.log(ipLocation)
            })
            if(ipLocation === null) {
                console.log("LOCATION: not accessible or in local network")
            } else {
                console.log("LOCATION:" + ipLocation)
            }
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
                console.log("Request made, content served successfully")
                console.log("content served successfully")
                if(process.env.MODE === "debug") {
                    console.log("")
                }
            } catch(err) {
            console.log("An error occurred while responding to an API request: ", err)
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
                console.log("Request made, content served successfully")
                console.log("content served successfully")
                if(process.env.MODE === "debug") {
                    console.log("")
                }
            } catch(err) {
                console.log("An error occurred while responding to an API request: ", err)
            }
        });
    }
    ReqCounter++;
})

app.listen(process.env.PORT, function () {
   console.log("API operating at http://localhost:" + process.env.PORT + "/" + process.env.PATH_AFTER_URL)
})
