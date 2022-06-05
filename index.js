//@TODO header authentication for req-counter
import express from "express"
var app = express();

import {fib, dist} from "cpu-benchmark";

import osu from "node-os-utils";
var cpu = osu.cpu
var drive = osu.drive
var mem = osu.mem

import * as process2 from "child_process"
import si from "systeminformation"

import dotenv from 'dotenv'
dotenv.config()

import os from "os"
import ip from "ip"
import fetch from "node-fetch"

import isPi from "detect-rpi"

var diskInfo
var Processorusage
var freeMemory
var osVersion
var username;


console.log("Welcome to EucoAPIv0.1")

if(/\s/.test(process.env.PATH_AFTER_URL)) {
    console.log("The environment variable PATH_AFTER_URL contains a whitespace, defaulting to none")
    process.env.PATH_AFTER_URL = ""
}

if(process.env.MODE === ""|| /\s/.test(process.env.MODE)) {
    console.log("The environment variable MODE isnt set or isnt properly set, defaulting to normal")
    process.env.MODE = "normal"
}

if(process.env.PORT === ""|| /\s/.test(process.env.PORT)) {
    console.log("The environment variable PORT isnt set or isnt properly set, defaulting to 8082")
    process.env.PORT = 8082
}

await si.networkStats()

var ReqCounter = 0;

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
    if(req.header("EucoAPIAuth") !== "IamRobot") {
        res.status(401).send({
            "success": false,
            "Error": "Unauthorized",
            "ErrorCode": "401",
            "ErrorMessage": "Invalid Headers" 
        }); 
        return;
    }   

    
    if(ReqCounter === 1) {

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
            cpu.usage().then(usage => {Processorusage = usage})
            var today = new Date();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            var data;
        
            data = {
                "success" : true,
                "time": time,
                "cpu_usage": Processorusage,
                "performance_test": msTakenforTest,
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
                res.send(data)
                console.log("Request made, content served successfully")
                console.log("content served successfully")
                if(process.env.MODE === "debug") {
                    console.log("")
                }
            } catch(err) {
            console.log("An error occurred while responding to an API request: ", err)
            }
        });
    } else res.send("wip")
    ReqCounter++;
})

app.listen(process.env.PORT, function () {

   console.log("API operating at http://localhost:" + process.env.PORT + "/" + process.env.PATH_AFTER_URL)
})

await fetch("http://localhost:" + process.env.PORT + "/" + process.env.PATH_AFTER_URL, {
    headers: {
        "EucoAPIAuth": "IamRobot"
    }
}).then(function (response) {console.log(response)})