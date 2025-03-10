const db = require("../db/connection.js");
const { checkExists } = require("../db/seeds/utils.js");

exports.fetchAllArticles = () => {
  return db
    .query(
      `SELECT 
        articles.author,
        articles.title,
        articles.article_id,
        articles.topic,
        articles.created_at,
        articles.votes,
        articles.article_img_url,
        COUNT(comments.comment_id) AS comment_count
    FROM
        articles LEFT OUTER JOIN comments ON articles.article_id = comments.article_id
    GROUP BY
        articles.article_id
    ORDER BY
        articles.created_at DESC;`
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.fetchArticleById = (article_id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      } else {
        return rows[0];
      }
    });
};

exports.fetchCommentsByArticleId = (article_id) => {
  return checkExists("articles", "article_id", article_id).then(() => {
    return db
      .query(
        `SELECT
            comment_id,
            votes,
            created_at,
            author,
            body,
            article_id
        FROM
            comments
        WHERE
            article_id = $1
        ORDER BY
            created_at DESC`,
        [article_id]
      )
      .then(({ rows }) => {
        return rows;
      });
  });
};
