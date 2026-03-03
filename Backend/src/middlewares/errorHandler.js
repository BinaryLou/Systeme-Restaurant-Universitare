const { logEvents } = require('./logEvents');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    status: err.status || 'error',
    message: err.isOperational ? err.message : 'Internal Server Error'
  });
};

module.exports = errorHandler;