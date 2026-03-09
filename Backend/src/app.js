const express = require("express");
const cookieParser = require("cookie-parser");
const { logger } = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");
const AppError = require("./utils/AppError");

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
app.use("/api/auth",  require("./routes/authRoutes"));

app.use((req, res) => {
  throw new AppError(`Route ${req.originalUrl} not found`, 404);
});

app.use(errorHandler);

module.exports = app;