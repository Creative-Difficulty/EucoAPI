import checkHeaders from "./lib/connection/checkHeaders.js";
import checkUsersCorruption from "./lib/util/checkUsersCorruption.js";
import crypto from 'crypto';
import express from "express";
import fetch from "node-fetch";
import getSystemData from "./lib/getSystemData.js";
import initLogger from "./lib/util/initLogger.js";
import ip from "ip";
import { isIPv4 } from "net";
import log4js from 'log4js';
import rateLimit from 'express-rate-limit'
import si from "systeminformation";
import slowDown from "express-slow-down"
import fs from "fs";
import { exit } from "process";
import isJsonString from "./lib/util/isJSONString.js";

var app = express();


await checkUsersCorruption();

const logger = log4js.getLogger("default");
const LoggerConfig = await initLogger();
log4js.configure(LoggerConfig)

logger.info("Welcome to EucoAPIv0.1")

const speedLimiter = slowDown({
    windowMs: 1 * 60 * 1000, // 1 minute
    delayAfter: 100, // allow 100 requests per minute, then...
    delayMs: 500, // add delay to every request after 100 requests in 1 minute
    //skip: ""
});

const rateLimiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 15 minutes
	max: 3000, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {"Error" : "Too many requests"},
    //skip: ""
});

app.use(speedLimiter);
app.use(rateLimiter);

app.use(express.json())
await si.networkStats()
var ReqCounter = 0;


app.get("/auth", async function (req, res) {
    const token = crypto.randomBytes(48).toString('hex');
    const data = await fs2.readFile("users.json", "utf-8")

    if(!isJsonString(data)) await checkUsersCorruption();
    var parsedData = JSON.parse(data);

    const newUser = {
        "has-access": false,
        "ip": req.ip,
        "token": token
    }

    parsedData.push(newUser);
    try {
        await fs.promises.writeFile("users.json", JSON.stringify(parsedData));
    } catch(e) {
        logger.error(e);
        exit(1)
    }
    
    res.send({
        "token": token
    })
})

var data;
var start, stop;
async function getSystemDataBeforeRequest() {
    logger.debug("Getting System data...");
    start = new Date();
    data = await getSystemData(ReqCounter);
    stop = new Date();
    logger.debug(`Time Taken to get System data: ${(stop - start)/1000}s`);
}

await getSystemDataBeforeRequest();
setInterval(await getSystemDataBeforeRequest, 15000);

//console.dir(data, {depth: null});
app.get("/" + process.env.URI, async function (req, res) {
    
    const isAuthorized = await checkHeaders(req.headers);
    if(isAuthorized === false) {
        res.status(401).send({
            "success": false,
            "Error": "Unauthorized",
            "Instructions": "vist /auth, then set has-access of your token in the users.json file to true. Now provide your token as \"authentication\" header at this endpoint!",
            "ErrorCode": 401
        })
        return;
    }
    
    logger.debug("NEW REQUEST:")

    var requestIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || ''.split(',')[0].trim() || req.socket.localAddress || req.ip
    var localIP = ip.address()

    if(req.socket.localAddress === requestIP || localIP === requestIP) {
        logger.debug(`  IP: this PCs IP (${localIP})`)
        logger.debug("  LOCATION: Not accessible, the client is in the same network as the server")
    } else {
        if(isIPv4(requestIP)) {
            if (requestIP.substr(0, 7) == "::ffff:") {
                requestIP = requestIP.substr(7)
            }
        }
        
        logger.debug(`IP: ${ requestIP}`)
        var requestURL = "http://ip-api.com/json/" + requestIP
        var ipLocation = await fetch(requestURL).then(data => data.json())
        //JSON.parse(ipLocation);
        console.log(ipLocation)
        if(ipLocation === null) {
            logger.debug("LOCATION: not accessible or in local network")
        } else {
            logger.debug("LOCATION:")
            logger.debug("  COUNTRY: " + ipLocation.country)
            logger.debug("  CITY: " + ipLocation.city)
            logger.debug("  TIMEZONE: " + ipLocation.timezone)
            logger.debug("  INTERNET SERVICE PROVIDER: " + ipLocation.isp)
            logger.debug("  LATITUDE: " + ipLocation.lat)
            logger.debug("  LONGITUDE: " + ipLocation.lon)
        }
    }
    
    try {
        start = new Date();
        var base64Data = Buffer.from(JSON.stringify(data)).toString("base64");
        stop = new Date();
        logger.debug(`Time Taken to covert JSON to Base64: ${(stop - start)/1000}s`);
        start = new Date();
        res.send(base64Data);
        stop = new Date();
        logger.debug(`Time Taken to serve JSON to client: ${(stop - start)/1000}s`)
        
        if(logger.isDebugEnabled()) {
            logger.debug("\t")
        }
    } catch(err) {
        logger.error("An error occurred while responding to an API request: ", err)
    }
    ReqCounter++;
})

app.listen(process.env.PORT, function () {
   logger.info("API operating at http://localhost:" + process.env.PORT + "/" + process.env.URI)
})
