const express = require('express');
const app = express();
const { logger } = require('./middlewares/logEvents');
const errorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/AppError');

app.use(logger);
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'success', message: 'API is running' });
});

app.all(/.*/, (req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;
