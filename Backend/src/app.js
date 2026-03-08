const express = require("express");
const cookieParser = require("cookie-parser");
const { logger } = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");


const app = express();

app.set("json spaces", 2);

app.use(express.json());
app.use(cookieParser());
app.use(logger);

//Test Routes
app.use("/health", require("./routes/health"));
app.use("/protected", require("./routes/protected"));
app.use("/admin", require("./routes/admin"));

//Real Routes
app.use("/api/auth", require("./routes/authRoutes"));

app.get("/test-error", (req, res) => {
  throw new Error("Test error");
});

app.use((req, res) => {
  const err = new Error(`Route ${req.originalUrl} not found`);
  err.statusCode = 404;
  throw err;
});

app.use(errorHandler);

module.exports = app;