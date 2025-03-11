const db = require("../connection");
const format = require("pg-format");
const { convertTimestampToDate, createLookupObject, swapKeys } = require("./utils.js");

const seed = ({ topicData, userData, articleData, commentData }) => {
  return db
    .query("DROP TABLE IF EXISTS comments;")
    .then(() => {
      return db.query("DROP TABLE IF EXISTS articles;");
    })
    .then(() => {
      return db.query("DROP TABLE IF EXISTS users;");
    })
    .then(() => {
      return db.query("DROP TABLE IF EXISTS topics;");
    })
    .then(() => {
      return db.query(`CREATE TABLE topics (
        slug VARCHAR(100) PRIMARY KEY,
        description VARCHAR(100) NOT NULL,
        img_url VARCHAR(1000)
        );`);
    })
    .then(() => {
      return db.query(`CREATE TABLE users (
        username VARCHAR(100) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        avatar_url VARCHAR(1000)
        );`);
    })
    .then(() => {
      return db.query(`CREATE TABLE articles (
        article_id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        topic VARCHAR(100) REFERENCES topics(slug) NOT NULL,
        author VARCHAR(100) REFERENCES users(username) NOT NULL,
        body TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        votes INT DEFAULT 0 NOT NULL,
        article_img_url VARCHAR(1000)
        );`);
    })
    .then(() => {
      return db.query(`CREATE TABLE comments (
        comment_id SERIAL PRIMARY KEY,
        article_id INT REFERENCES articles(article_id) NOT NULL,
        body TEXT,
        votes INT DEFAULT 0 NOT NULL,
        author VARCHAR(100) REFERENCES users(username) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`);
    })
    .then(() => {
      return insertTopics(topicData);
    })
    .then(() => {
      return insertUsers(userData);
    })
    .then(() => {
      return insertArticles(articleData);
    })
    .then((results) => {
      return insertComments(commentData, results.rows);
    });
};

function insertTopics(topicData) {
  const formattedTopics = topicData.map((topic) => {
    return [topic.slug, topic.description, topic.img_url];
  });
  const sql = format(
    `INSERT INTO topics (slug, description, img_url) VALUES %L;`,
    formattedTopics
  );
  return db.query(sql);
}

function insertUsers(userData) {
  const formattedUsers = userData.map((user) => {
    return [user.username, user.name, user.avatar_url];
  });
  const sql = format(
    `INSERT INTO users (username, name, avatar_url) VALUES %L;`,
    formattedUsers
  );
  return db.query(sql);
}

function insertArticles(articleData) {
  const timestampConvertedArticles = articleData.map((article) => {
    return convertTimestampToDate(article);
  });
  const formattedArticles = timestampConvertedArticles.map((article) => {
    return [
      article.title,
      article.topic,
      article.author,
      article.body,
      article.created_at,
      article.votes,
      article.article_img_url,
    ];
  });
  const sql = format(
    `INSERT INTO articles (title, topic, author, body, created_at, votes, article_img_url) VALUES %L RETURNING *;`,
    formattedArticles
  );
  return db.query(sql);
}

function insertComments(commentData, insertedArticles) {
  const timestampConvertedComments = commentData.map((comment) => {
    return convertTimestampToDate(comment);
  });
  const lookupObject = createLookupObject(insertedArticles, "title", "article_id")
  const commentsWithArticleIds = swapKeys(timestampConvertedComments, lookupObject, "article_title", "article_id");
  //console.log(commentsWithArticleIds);
  const formattedComments = commentsWithArticleIds.map((comment) => {
    return [
      comment.article_id,
      comment.author,
      comment.body,
      comment.created_at,
      comment.votes,
    ];
  });
  const sql = format(
    `INSERT INTO comments (article_id, author, body, created_at, votes) VALUES %L RETURNING *;`,
    formattedComments
  );
  return db.query(sql);
}

module.exports = seed;
