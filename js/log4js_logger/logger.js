import log4js from 'log4js';
import path from 'path';

const __dirname = path.resolve();
var currentDate = new Date();
var LogName = currentDate.getDate() + "." +  (parseInt(currentDate.getMonth()) + 1)
+ "." + currentDate.getFullYear() + "@"  
+ currentDate.getHours() + ":"  
+ currentDate.getMinutes() + ":" + currentDate.getSeconds();

log4js.configure({
    appenders: {
        fileAppender: { type: 'file', filename: path.join(__dirname, "logs",  LogName + ".log")},
        console: { type: 'console' }
    },
    categories: {
        default: { appenders: ['fileAppender', 'console'], level: 'error' }
    }
});
// Create the logger
const logger = log4js.getLogger();
logger.level = 'info';

// Log a message
logger.info('Hello, log4js!');