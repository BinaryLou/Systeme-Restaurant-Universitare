const express = require('express');
const { logger } = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');
const healthRoutes = require("./routes/health");

const app = express();

app.use(express.json());
app.use(logger);

// Health route
app.use("/health", healthRoutes);

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