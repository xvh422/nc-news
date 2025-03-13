const db = require("../db/connection.js");
const { checkExists } = require("../db/seeds/utils.js");

exports.fetchCommentsByArticleId = (article_id, limit = 10, p) => {
  const promises = [];
  const queryValues = [article_id, limit];
  let sqlString = `SELECT
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
              created_at DESC
            LIMIT $2`;
  promises.push(checkExists("articles", "article_id", article_id));
  if (p) {
    const offset = (p - 1) * limit;
    sqlString += ` OFFSET $3`;
    queryValues.push(offset);
  }
  promises.unshift(db.query(sqlString, queryValues));
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

exports.updateComment = (inc_votes, comment_id) => {
  return db
    .query(
      "UPDATE comments SET votes = votes + $1 WHERE comment_id = $2 RETURNING *",
      [inc_votes, comment_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Comment not found" });
      } else {
        return rows[0];
      }
    });
};
