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
  patchArticle,
} = require("./controllers/articles.controllers.js");
const {
  getCommentsByArticleId,
  postNewComment,
} = require("./controllers/comments.controllers.js");

app.use(express.json());

app.get("/api", (req, res) => {
  res.status(200).send({ endpoints });
});

app.get("/api/topics", getAllTopics);

app.get("/api/articles", getAllArticles);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", postNewComment);

app.patch("/api/articles/:article_id", patchArticle);

app.use(handleCustomErrors);

app.use(handleSqlErrors);

app.use(handleServerErrors);

module.exports = app;
