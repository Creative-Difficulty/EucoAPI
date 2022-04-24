
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

import chalk from 'chalk';

import os from "os"
import ip from "ip"
import fetch from "node-fetch"
import cpuBenchmark from "cpu-benchmark";

var diskInfo
var Processorusage
var freeMemory
var osVersion
var username;


console.log("Welcome to EucoAPIv0.1")


function INFO(message) {
    if(process.env.MODE === "normal" || process.env.MODE === "debug") {
        var today = new Date();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        console.log("[" + time + "/INFO] " + message);
    }
}

function WARN(message) {
    if(process.env.MODE === "normal" || process.env.MODE === "debug") {
        var today = new Date();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        console.warn(chalk.bgYellow("[" + time + "/WARN] " + message));
    }
}

function DEBUG(message) {
    if(process.env.MODE === "debug") {
        var today = new Date();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        console.log(chalk.blue("[" + time + "/DEBUG] " + message));
    }
}

function ERROR(message) {
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    console.error(chalk.red("[" + time + "/ERROR] " + message));
}

if(/\s/.test(process.env.PATH_AFTER_URL)) {
    WARN("The environment variable PATH_AFTER_URL contains a whitespace, defaulting to none")
    process.env.PATH_AFTER_URL = ""
}

if(process.env.MODE === ""|| /\s/.test(process.env.MODE)) {
    WARN("The environment variable MODE isnt set or isnt properly set, defaulting to normal")
    process.env.MODE = "normal"
}

if(process.env.PORT === ""|| /\s/.test(process.env.PORT)) {
    WARN("The environment variable PORT isnt set or isnt properly set, defaulting to 8082")
    process.env.PORT = 8082
}


var ReqCounter = 0;


app.get("/" + process.env.PATH_AFTER_URL, function (req, res) {
    ReqCounter++;
    var msTakenforTest = fib(41)
    if(process.env.MODE === "debug") {
        DEBUG("REQUEST:")
        
        var requestIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || ''.split(',')[0].trim() || req.socket.localAddress || req.ip
        if (requestIP.substr(0, 7) == "::ffff:") {
            requestIP = requestIP.substr(7)
        }
        
        
        
        var localIP = ip.address()
        
        if(req.socket.localAddress === requestIP) {
            DEBUG(`IP: this PCs IP (${localIP})`)
            DEBUG("LOCATION: Not accessible, the client is in the same network as the server")
        } else {
            DEBUG(`IP: ${requestIP}`)
            var ipLocation
            var requestURL = "http://ip-api.com/json/" + requestIP
            fetch(requestURL).then(jsonData => jsonData.json()).then(jsonData => {
                ipLocation = jsonData
                console.log(ipLocation)
            })
            if(ipLocation === null) {
                DEBUG("LOCATION: not accessible or in local network")
            } else {
                DEBUG(`LOCATION: ${ipLocation}`)
            }
        }
    }
    
    
    process2.exec('whoami',function (err,stdout,stderr) { username = stdout.replace(/[\n\t\r]/g,"")})
    si.osInfo().then(osStats => {osVersion = osStats})
    mem.info().then(freemem => {freeMemory = freemem})
    drive.info().then(driveinfo => {diskInfo = driveinfo})
    cpu.usage().then(usage => {Processorusage = usage})
    var cpuCoresInfo = os.cpus()
    var cpuCoresInfo = cpuCoresInfo[1]
    
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    
    var data = {
        "success" : true,
        "time" : time,
        "cpu_usage" : Processorusage,
        "cpu_core_count" : cpu.count(),
        "logged_in_user" : username,
        "RAM" : freeMemory,
        "cpu_type" : cpuCoresInfo,
        "storage_info" : diskInfo,
        "os_version" : osVersion,
        "performance_test": msTakenforTest
    }
    
    if(ReqCounter > 2) {
        var data = {
            "time" : time,
            "cpu_usage" : Processorusage,
            "RAM" : freeMemory,
            "storage_info" : diskInfo,
            "performance_test": msTakenforTest
        }
    }
    
    try {
        res.send(data)
        INFO("Request made, content served successfully")
        DEBUG("content served successfully")
        if(process.env.MODE === "debug") {
            console.log("")
        }
    } catch(err) {
       ERROR("An error occurred while responding to an API request: ", err)
    }
})

app.listen(process.env.PORT, function () {
    
   INFO("API operating at http://localhost:" + process.env.PORT + "/" + process.env.PATH_AFTER_URL)
})
  