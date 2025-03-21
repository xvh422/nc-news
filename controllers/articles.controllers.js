const {
  fetchAllArticles,
  fetchArticleById,
  updateArticle,
  createNewArticle,
  removeArticle,
} = require("../models/articles.models.js");

exports.getAllArticles = (req, res, next) => {
  const { sort_by, order, topic, limit, p } = req.query;
  fetchAllArticles(sort_by, order, topic, limit, p)
    .then(({ articles, total_count }) => {
      res.status(200).send({ articles, total_count });
    })
    .catch(next);
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  fetchArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.patchArticle = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  updateArticle(article_id, inc_votes)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.postNewArticle = (req, res, next) => {
  const { author, title, body, topic, article_img_url } = req.body;
  createNewArticle(author, title, body, topic, article_img_url)
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch(next);
};

exports.deleteArticle = (req, res, next) => {
  const { article_id } = req.params;
  removeArticle(article_id)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};
