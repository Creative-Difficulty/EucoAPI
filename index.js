import express from "express"
import osu from "node-os-utils"
import * as process2 from "child_process"
import si from "systeminformation"
import chalk from 'chalk';

import dotenv from 'dotenv'
dotenv.config()

import os from "os"
import ip from "ip"
import fetch from "node-fetch"

var cpu = osu.cpu
var drive = osu.drive
var mem = osu.mem
var diskInfo
var Processorusage
var freeMemory
var osVersion
var username;



var app = express();



console.log("Welcome to EucoAPIv0.1")




var mode = process.env.MODE


function INFO(message) {
    if(mode === "normal" || mode === "debug") {
        var today = new Date();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        console.log(chalk.green("[" + time + "/INFO] " + message));
    }
}

function WARN(message) {
    if(mode === "normal" || mode === "debug") {
        var today = new Date();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        console.warn(chalk.yellow("[" + time + "/WARN] " + message));
    }
}

function DEBUG(message) {
    if(mode === "debug") {
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

const start = Date.now();
for(let i = 0; i<1000; i++) {
    i++;
}
const finish = Date.now();
app.get("/", function (req, res) {
    var timeTakenForTest = finish - start;
    if(mode === "debug") {
        
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

    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

    var data = {
        "success" : true,
        "time" : time,
        "cpu_usage" : Processorusage,
        "cpu_core_count" : cpu.count(),
        "logged_in_user" : username,
        "RAM" : freeMemory,
        "cpu_type" : os.cpus(),
        "storage_info" : diskInfo,
        "os_version" : osVersion,
        "performance_test": timeTakenForTest
    }
    
    try {
        res.send(data)
        INFO("Request made, content served successfully")
        DEBUG("content served successfully")
        if(mode === "debug") {
            console.log("")
        }
    } catch(err) {
       ERROR("An error occurred while responding to an API request: ", err)
    }
})

app.listen(port, function () {
   INFO("API operating at http://localhost:" + process.env.PORT)
})