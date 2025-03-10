const db = require("../db/connection.js");
const { checkExists } = require("../db/seeds/utils.js");

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

exports.createNewComment = (username, body, article_id) => {
  return checkExists("articles", "article_id", article_id).then(() => {
    return db
      .query(
        `INSERT INTO comments (author, body, article_id) VALUES ($1, $2, $3) RETURNING *`,
        [username, body, article_id]
      )
      .then(({ rows }) => {
        return rows[0];
      });
  });
};
