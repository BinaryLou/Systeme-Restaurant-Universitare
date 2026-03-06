const express = require('express');
const { logger } = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');
const healthRoutes = require("./routes/health");
const protectedRoutes = require("./routes/protected");
const verifyJwt = require('./middlewares/verifyJWT');
const adminRoutes = require("./routes/admin");

const app = express();

app.use(express.json());
app.use(logger);

// test routes 
app.use("/protected", protectedRoutes);
app.use("/health", healthRoutes);
app.use("/admin", adminRoutes);

app.get('/test-error', (req, res) => {
  throw new Error('Test error');
});

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});
app.use(verifyJwt)

app.use(errorHandler);

module.exports = app;