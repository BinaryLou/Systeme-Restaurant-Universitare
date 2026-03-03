const express = require('express');
const { logger } = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());
app.use(logger);

// Health route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API running'
  });
});

app.get('/test-error', (req, res) => {
  throw new Error('Test error');
});

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

app.use(errorHandler);

module.exports = app;