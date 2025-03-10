const express = require("express");
const app = express();
const endpoints = require("./endpoints.json");
const {handleServerErrors} = require('./controllers/errors.controllers.js');
const { getAllTopics } = require("./controllers/topics.controllers.js");

app.get("/api", (req, res) => {
  res.status(200).send({ endpoints });
});

app.get("/api/topics", getAllTopics);

app.use(handleServerErrors);

module.exports = app;
