const db = require("../db/connection.js");
const { checkExists } = require("../db/seeds/utils.js");

exports.fetchCommentsByArticleId = (article_id) => {
  const promises = [];
  promises.push(checkExists("articles", "article_id", article_id));
  promises.unshift(
    db.query(
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
  );
  return Promise.all(promises).then(([{ rows }]) => {
    return rows;
  });
};

exports.createNewComment = (username, body, article_id) => {
  const promises = [];
  promises.push(checkExists("articles", "article_id", article_id));
  promises.unshift(
    db.query(
      `INSERT INTO comments (author, body, article_id) VALUES ($1, $2, $3) RETURNING *`,
      [username, body, article_id]
    )
  );
  return Promise.all(promises).then(([{ rows }]) => {
    return rows[0];
  });
};

exports.removeComment = (comment_id) => {
  return db
    .query("DELETE FROM comments WHERE comment_id = $1 RETURNING *", [
      comment_id,
    ])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Comment not found" });
      }
    });
};
