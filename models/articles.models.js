const db = require("../db/connection.js");
const { checkExists } = require("../db/seeds/utils.js");

exports.fetchAllArticles = (sort_by = "created_at", order = "desc", topic) => {
  const promises = [];
  const queryValues = [];
  const allowedCategories = [
    "article_id",
    "title",
    "topic",
    "author",
    "body",
    "created_at",
    "votes",
    "article_img_url",
  ];
  const allowedOrders = ["asc", "desc"];
  if (!allowedCategories.includes(sort_by) || !allowedOrders.includes(order)) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }
  let sqlString = `SELECT 
        articles.author,
        articles.title,
        articles.article_id,
        articles.topic,
        articles.created_at,
        articles.votes,
        articles.article_img_url,
        COUNT(comments.comment_id) AS comment_count
    FROM
        articles LEFT OUTER JOIN comments ON articles.article_id = comments.article_id`;
  if (topic) {
    promises.push(checkExists("topics", "slug", topic));
    sqlString += ` WHERE topic = $1`;
    queryValues.push(topic);
  }
  sqlString += ` GROUP BY articles.article_id`;
  sqlString += ` ORDER BY ${sort_by} ${order}`;
  promises.unshift(db.query(sqlString, queryValues));
  return Promise.all(promises).then(([{ rows }]) => {
    return rows;
  });
};

exports.fetchArticleById = (article_id) => {
  return db
    .query(
      `SELECT 
        articles.author,
        articles.title,
        articles.article_id,
        articles.body,
        articles.topic,
        articles.created_at,
        articles.votes,
        articles.article_img_url,
        COUNT(comments.comment_id) AS comment_count
      FROM
        articles LEFT OUTER JOIN comments ON articles.article_id = comments.article_id
      WHERE
        articles.article_id = $1
      GROUP BY
        articles.article_id`,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      } else {
        return rows[0];
      }
    });
};

exports.updateArticle = (article_id, inc_votes) => {
  return db
    .query(
      "UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *",
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      } else {
        return rows[0];
      }
    });
};
