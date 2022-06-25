import * as fs from "fs/promises";

import checkENV from "./lib/checkENV.js";
import checkUsersCorruption from "./lib/checkUsersCorruption.js";
import crypto from 'crypto';
import express from "express";
import fetch from "node-fetch";
import getSystemData from "./lib/getSystemData.js";
import initLogger from "./lib/initLogger.js";
import ip from "ip";
import log4js from 'log4js';
import rateLimit from 'express-rate-limit'
import si from "systeminformation";
import slowDown from "express-slow-down"

var app = express();


await checkUsersCorruption();

const ENVvalues = await checkENV();
process.env.PORT = ENVvalues[0]
process.env.LOGLEVEL = ENVvalues[1]
process.env.URI = ENVvalues[2]

const logger = log4js.getLogger();
const LoggerConfig = await initLogger();
log4js.configure(LoggerConfig)

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
                //logger.debug(result[i][name].ip);
                if(result[i]["has-access"] === true) {
                    allowedIPs.push(result[i][name].ip);
                }
            }
        }
    }
})


//logger.debug(allowedIPs)

const speedLimiter = slowDown({
    windowMs: 1 * 60 * 1000, // 1 minute
    delayAfter: 100, // allow 100 requests per minute, then...
    delayMs: 500, // add delay to every request after 100 requests in 1 minute
    //skip: ""
});

const rateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {"Error" : "Too many requests"},
    //skip: ""
});

app.use(speedLimiter);
app.use(rateLimit);

app.use(express.json())
await si.networkStats()
var ReqCounter = 0;


app.get("/auth", async function (req, res) {
    const token = crypto.randomBytes(48).toString('hex');
    fs.readFile("users.json", "utf-8", async (err, data) => {
        if (err) throw err;

        if(!data.includes("[") || !data.includes("]") || data === "" || data === null || data === undefined) throw new Error("Something went wrong");
        var parsedData = JSON.parse(data);

        const newUser = {
            "has-access": false,
            "ip": req.ip,
            "token": token
        }

        parsedData.push(newUser);
        await fs.writeFile("users.json", JSON.stringify(parsedData), (data, err) => {if (err) throw err;});
    });
    
    res.send({
        "token": token
    })
})

app.get("/" + process.env.URI, async (req, res) => {
    
    logger.debug("REQUEST:")

    var requestIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || ''.split(',')[0].trim() || req.socket.localAddress || req.ip
    var localIP = ip.address()

    if(req.socket.localAddress === requestIP || localIP === requestIP) {
        logger.debug(`  IP: this PCs IP (${localIP})`)
        logger.debug("  LOCATION: Not accessible, the client is in the same network as the server")
    } else {
        logger.debug(`IP: ${readableRequestIP}`)
        var ipLocation
        var requestURL = "http://ip-api.com/json/" + readableRequestIP
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

    const data = await getSystemData(ReqCounter);

    try {
        res.send(Buffer.from(JSON.stringify(data)).toString("base64"))
        logger.debug("Request made, content served successfully")
        logger.debug("content served successfully")
        if(logger.isDebugEnabled()) {
            console.log("")
        }
    } catch(err) {
        logger.error("An error occurred while responding to an API request: ", err)
    }
    ReqCounter++;
})

app.listen(process.env.PORT, function () {
   logger.info("API operating at http://localhost:" + process.env.PORT + "/" + process.env.URI)
})
