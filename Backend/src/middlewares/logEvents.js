const { format } = require('date-fns');
const { v4: uuid } = require('uuid');

const fsPromises = require('fs').promises;
const path = require('path');

const logsDir = path.join(__dirname, '..', 'logs');

const logEvents = async (message, logName) => {
    const dateTime = format(new Date(), 'yyyy-MM-dd\tHH:mm:ss');
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

    try {
        await fsPromises.mkdir(logsDir, { recursive: true });
        await fsPromises.appendFile(path.join(logsDir, logName), logItem);
    } catch (err) {
        console.error('Log write failed:', err);
    }
};

const logger = (req, res, next) => {
    const origin = req.headers.origin || 'unknown-origin';
    const requestUrl = req.originalUrl || req.url;

    logEvents(`${req.method}\t${origin}\t${requestUrl}`, 'reqLog.txt');
    console.log(`${req.method} ${requestUrl}`);

    next();
};

module.exports = { logger, logEvents };
