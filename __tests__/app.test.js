const endpointsJson = require("../endpoints.json");
const request = require("supertest");
const app = require("../app.js");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data/index.js");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
  test("404: Responds with an error for an invalid endpoint", () => {
    return request(app)
      .get("/aip")
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({});
      });
  });
});

describe("GET /api/topics", () => {
  test("200: Responds with an object containing all topics, each with a slug and a description", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(topics.length).not.toBe(0);
        topics.forEach((topic) => {
          expect(typeof topic.slug).toBe("string");
          expect(typeof topic.description).toBe("string");
        });
      });
  });
});

describe("GET /api/articles/article_id", () => {
  test("200: Responds with an object representing the article with the matching id", () => {
    return request(app)
      .get("/api/articles/3")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(typeof article.author).toBe("string");
        expect(typeof article.title).toBe("string");
        expect(article.article_id).toBe(3);
        expect(typeof article.body).toBe("string");
        expect(typeof article.topic).toBe("string");
        expect(typeof article.created_at).toBe("string");
        expect(typeof article.votes).toBe("number");
        expect(typeof article.article_img_url).toBe("string");
      });
  });
  test("404: Responds with an error if there is no article with the given id", () => {
    return request(app)
      .get("/api/articles/99999999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toEqual("Article not found");
      });
  });
  test("400: Responds with an error if the given id is invalid", () => {
    return request(app)
      .get("/api/articles/invalid_id")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual("Bad request");
      });
  });
});

describe("GET /api/articles", () => {
  test("200: Responds with an array containing all articles, sorted by date of creation, including their comment counts but not including their bodies", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(13);
        expect(articles).toBeSortedBy("created_at", { descending: true });
        articles.forEach((article) => {
          expect(typeof article.author).toBe("string");
          expect(typeof article.title).toBe("string");
          expect(typeof article.article_id).toBe("number");
          expect(article.body).toBe(undefined);
          expect(typeof article.topic).toBe("string");
          expect(typeof article.created_at).toBe("string");
          expect(typeof article.votes).toBe("number");
          expect(typeof article.article_img_url).toBe("string");
          expect(typeof article.comment_count).toBe("string");
        });
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200: Responds with an array of comments ordered by date created for the article with the corresponding id", () => {
    return request(app)
      .get("/api/articles/3/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments.length).not.toBe(0);
        expect(comments).toBeSortedBy("created_at", { descending: true });
        comments.forEach((comment) => {
          expect(typeof comment.comment_id).toBe("number");
          expect(typeof comment.votes).toBe("number");
          expect(typeof comment.created_at).toBe("string");
          expect(typeof comment.author).toBe("string");
          expect(typeof comment.body).toBe("string");
          expect(typeof comment.article_id).toBe("number");
        });
      });
  });
  test("404: Responds with an error if there is no article with the given id", () => {
    return request(app)
      .get("/api/articles/99999999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toEqual("Resource not found");
      });
  });
  test("400: Responds with an error if the given id is invalid", () => {
    return request(app)
      .get("/api/articles/invalid_id/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual("Bad request");
      });
  });
  test("200: Responds with an empty array if the article exists, but has no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toEqual([]);
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("201: Responds with the created comment object", () => {
    return request(app)
      .post("/api/articles/2/comments")
      .send({
        username: "icellusedkars",
        body: "git pull origin master",
      })
      .expect(201)
      .then(({ body: { comment } }) => {
        expect(comment.article_id).toBe(2);
        expect(comment.author).toBe("icellusedkars");
        expect(comment.body).toBe("git pull origin master");
        expect(comment.votes).toBe(0);
        expect(typeof comment.created_at).toBe("string");
      });
  });
  test("404: Responds with an error when there is no article with the given id", () => {
    return request(app)
      .post("/api/articles/99999999/comments")
      .send({
        username: "icellusedkars",
        body: "git pull origin master",
      })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toEqual("Resource not found");
      });
  });
  test("400: Responds with an error when the given id is invalid", () => {
    return request(app)
      .post("/api/articles/invalid_id/comments")
      .send({
        username: "icellusedkars",
        body: "git pull origin master",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual("Bad request");
      });
  });
  test("400: Responds with an error when the given object contains invalid keys", () => {
    return request(app)
      .post("/api/articles/2/comments")
      .send({
        username: [4, "icellusedkars"],
        cat: ["git pull origin master", false],
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual("Bad request");
      });
  });
  test("400: Responds with an error when the given username does not correspond to an existing author", () => {
    return request(app)
      .post("/api/articles/2/comments")
      .send({
        username: "not a user",
        body: "git pull origin master",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual("Bad request");
      });
  });
});
