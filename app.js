const express = require("express");
const app = express();
const endpoints = require("./endpoints.json");
const {
  handleCustomErrors,
  handleSqlErrors,
  handleServerErrors,
} = require("./controllers/errors.controllers.js");
const { getAllTopics } = require("./controllers/topics.controllers.js");
const {
  getAllArticles,
  getArticleById,
} = require("./controllers/articles.controllers.js");

app.get("/api", (req, res) => {
  res.status(200).send({ endpoints });
});

app.get("/api/topics", getAllTopics);

app.get("/api/articles", getAllArticles);

app.get("/api/articles/:article_id", getArticleById);

app.use(handleCustomErrors);

app.use(handleSqlErrors);

app.use(handleServerErrors);

module.exports = app;
