const articlesRouter = require("express").Router();
const {
  getAllArticles,
  getArticleById,
  patchArticle,
  postNewArticle,
} = require("../controllers/articles.controllers.js");
const {
  getCommentsByArticleId,
  postNewComment,
} = require("../controllers/comments.controllers.js");

articlesRouter.route("/").get(getAllArticles).post(postNewArticle);

articlesRouter.route("/:article_id").get(getArticleById).patch(patchArticle);

articlesRouter
  .route("/:article_id/comments")
  .get(getCommentsByArticleId)
  .post(postNewComment);

module.exports = articlesRouter;
