import express from 'express'
import path from "path"
import osu from 'node-os-utils'
import * as process2 from "child_process"
import si from "systeminformation"
import fs from "fs"
import os from "os"
import geoip from 'geoip-lite'
import ip from "ip"

var diskInfo
var Processorusage
var freeMemory
var osVersion
var username;
var cpu = osu.cpu
var drive = osu.drive
var mem = osu.mem
var app = express();

var configJSON = {port:5050, path_after_url:1, mode:"normal"}




console.log(`
______                    ___ _____ _____ 
|  ____|                 /   |  __ |_   _|
| |__  _   _  ___ ___   / __ | |__) | |  
|  __|| | | |/ __/ _   / /  || ___/ | |  
| |___| |_| | (_| (_) / ____ | |  __| |_
|________,_|______/_ / /____ |__||______|
`)




fs.readFile("./config.json", (err, file) => {
    if(file.length === 0) {
        var today = new Date();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        console.log("[INFO/" + time + "]" + "No config found, creating a new one...");
        fs.writeFile("./config.json", JSON.stringify(configJSON), err => {if (err) ERROR(`an error ocurred while trying to write the config file: ${err}`)});
    }
    
    if(err) {
        ERROR(`an error ocurred while trying to read the config file: ${err}`)
    }
})


var today = new Date();
var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
console.log("[" + time + "/INFO]" + "reading config...");


var scannedJSONconfig = fs.readFileSync("config.json", "utf8")

try {
    scannedJSONconfig = JSON.parse(scannedJSONconfig)
} catch {
    ERROR("corrupt config, creating a new one")
    fs.writeFile("./config.json", JSON.stringify(configJSON), err => {if (err) console.log("Error writing config file:", err);});
}

var path_after_url = scannedJSONconfig["path_after_url"]
var mode = scannedJSONconfig["mode"]

function INFO(message) {
    if(mode === "normal" || mode === "debug") {
        var today = new Date();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        console.log(`[${time}/INFO] ${message}`);
    }
}

function DEBUG(message) {
    if(mode === "debug") {
        var today = new Date();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        console.warn(`[${time}/DEBUG] ${message}`);
    }
}

function ERROR(message) {
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    console.error(`[${time}/ERROR] ${message}`);
}

function getIP(IP) {
    var requestLocation
    const isIPformat = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/gi;
    if(isIPformat.test(IP)) {
        geoip.lookup(requestIP).then(result => {requestLocation = result})
    }
    return requestLocation;
}

app.get("/" + path_after_url, function (req, res) {
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

app.listen(process.env.PORT || scannedJSONconfig["port"], function () {
   INFO("API operating at http://localhost:" + process.env.PORT || scannedJSONconfig["port"] + "/" + path_after_url)
})