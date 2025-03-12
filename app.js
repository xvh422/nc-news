const express = require("express");
const app = express();
const apiRouter = require("./routers/api.router.js");
const {
  handleCustomErrors,
  handleSqlErrors,
  handleServerErrors,
} = require("./controllers/errors.controllers.js");

app.use(express.json());

app.use("/api", apiRouter);

app.use(handleCustomErrors);

app.use(handleSqlErrors);

app.use(handleServerErrors);

module.exports = app;
