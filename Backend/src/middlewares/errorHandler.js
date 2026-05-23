const { logEvents } = require('./logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const requestUrl = req.originalUrl || req.url;

  const safeMessage =
    statusCode === 500
      ? 'Internal Server Error'
      : err.message || 'Error';

  const logMessage = [
    `status=${statusCode}`,
    `${err.name || 'Error'}: ${err.message}`,
    `method=${req.method}`,
    `url=${requestUrl}`
  ].join('\t');

  // Log dans fichier erreurs
  logEvents(logMessage, 'errLog.txt');

  console.error(err.stack);

  if (res.headersSent) {
    return next(err);
  }

  const response = {
    status: 'error',
    message: safeMessage
  };

  if (err.data) {
    response.data = err.data;
  }

  return res.status(statusCode).json(response);
};

module.exports = errorHandler;