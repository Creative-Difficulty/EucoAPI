import * as fs from "fs/promises";
import * as process2 from "child_process";

import {dist, fib} from "cpu-benchmark";

import { exit } from "process";
import find from 'local-devices';
import initLogger from "./util/initLogger.js";
import isJSONString from "./util/isJSONString.js";
import isPi from "detect-rpi";
import log4js from "log4js";
import osu from "node-os-utils";
import path from "path";
import si from "systeminformation";

const __dirname = path.resolve()
// const logger = log4js.getLogger();
// const LoggerConfig = await initLogger();
// log4js.configure(LoggerConfig)

function getRaspiOnlyData(data) {
    if(isPi()) {
        
        var cpuVoltage = process2.exec("vcgencmd measure_volts", function (err,stdout,stderr) {stdout.split("="); stdout[1].replace("V", "")})
        var cpuTemp = process2.exec("vcgencmd measure_temp", function (err,stdout,stderr) {stdout.split("="); stdout[1].split("'"); stdout[0]})
        data.RaspiOnlyData.cpuTemp = cpuTemp
        data.RaspiOnlyData.cpuVoltage = cpuVoltage
        //console.log(data);
    }
    return data;
}

/** 
@async
@function getFirstCallOnlyData
@param {data}
@returns {data} data with special JSON thats only served at the first request of a client
@version 0.0.1
@author Creative-Difficulty
*/
async function getFirstCallOnlyData(data) {
    await si.fsStats();
    const firstCallOnlyData = await si.get({
        system: "*",
        uuid: "*",
        bios: "*",
        baseboard: "*",
        chassis: "*",

        cpu: "*",
        cpuFlags: "*",
        cpuCache: "*",

        memLayout: "*",

        battery: "*",

        graphics: "*",

        osInfo: "*",
        shell: "*",
        versions: "*",
        users: "*",

        diskLayout: "*",

        fsOpenFiles: "*",
        fsStats: "*",
        audio: "*",
        networkInterfaceDefault: "*",
        networkInterfaces: "*",
        networkGatewayDefault: "*",
        wifiInterfaces: "*"
    });
    //console.dir(data, { depth: null });
    data = { ...data, ...firstCallOnlyData };
    return data;
}

/** 
@async
@function getSystemData
@param {reqCounter}
@returns {data, ReqCounter} data with JSON thats served to the client and the incremented `ReqCounter` variable
@version 0.0.1
@description Returns JSON data to be served to the client and invokes `getFirstCallOnlyData()` and `getRaspiOnlyData()`.
@author Creative-Difficulty
*/
export default async function getSystemData(ReqCounter) {
    const msTakenforTest = fib(30)
    
    var SIdata = await si.get({
        
        audio: "*",
        
        cpuCurrentSpeed: "*",
        cpuTemperature: "*",
        
        mem: "*", //in bytes
        
        battery: "isCharging, designedCapacity, maxCapacity, currentCapacity, capacityUnit, percent",
        
        FullLoad: "*", //highest CPU % since boot
        
        processes: "all, running, sleeping, unknown, blocked",
        
        //processLoad("process_name, process_name2"): "*", See: https://systeminformation.io/processes.html
        services: "*",
        
        //diskLayout: "*",
        fsOpenFiles: "*",
        fsStats: "*", //See: https://systeminformation.io/filesystem.html
        
        usb: "*",
        printer: "*",
        
        //networkInterfaces: "*",
        //networkInterfaceDefault: "*",
        //networkGatewayDefault: "*",  //router ip: 10.0.0.138
        networkStats: "*", //si.networkStats(iface) iface= interface to scan
        //networkConnections: "*",
        inetLatency: "google.com", //inetLatency("google.com")
        
        wifiNetworks: "*",
        wifiConnections: "*",
        
        bluetoothDevices: "*",
        
        dockerInfo: "containers, containersRunning, containersPaused, containersStopped, images, memoryLimit, operatingSystem, memTotal, experimentalBuild, serverVersion",
        dockerContainers: "*",
        // dockerImages: "*",
        //dockerContainerStats: "*",
        
        vboxInfo: "*"
    })

    // if(isJSONString(data)) {
    //     logger.debug("Basic System data obtained successfully")
    // } else {
    //     logger.error("Basic System is corrupt: " + data)
    //     exit(1)
    // }
    
    var CPUusage = await osu.cpu.usage()
    var DevicesInNetwork = await find();
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var data = {
        "success": true,
        "time": time,
        "cpu_usage": CPUusage,
        "devices_in_network": DevicesInNetwork,
        "performance_test": msTakenforTest,
        SIdata
        
    }
    if(ReqCounter === 0) {
        data = await getFirstCallOnlyData(data)
    }
    //console.dir(data, { depth: null });
    data = await getRaspiOnlyData(data);
    
    return data;
    //     try {
    //         res.send(Buffer.from(JSON.stringify(data)).toString("base64"))
    //         logger.info("Request made, content served successfully")
    //         logger.info("content served successfully")
    //         if(process.env.LOGLEVEL === "debug") {
    //             console.log("")
    //         }
    //     } catch(err) {
    //         logger.error("An error occurred while responding to an API request: ", err)
    //     }
}

//const data = await getSystemData(1);
//await fs.writeFile(path.join(__dirname, "test.json"), JSON.stringify(data));
//console.dir(data, { depth: null });//(JSON.parse(JSON.stringify(data, null, 2)));
