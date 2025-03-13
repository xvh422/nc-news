const endpointsJson = require("../endpoints.json");
const request = require("supertest");
const app = require("../app.js");
const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data/index.js");
const db = require("../db/connection.js");

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

describe("GET /api/articles/:article_id", () => {
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
  test("200: The article object contains a comment count", () => {
    return request(app)
      .get("/api/articles/3")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(typeof article.comment_count).toBe("string");
      });
  });
  test("200: Comment count will be 0 for an article with no comments", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article.comment_count).toBe("0");
      });
  });
});

describe("GET /api/articles", () => {
  describe("No Queries", () => {
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
    test("200: When no queries are given, responds with an array containing all articles sorted by date of creation in descending order", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("created_at", { descending: true });
        });
    });
  });
  describe("Sort_by & Order Queries", () => {
    test("200: When queries are given, responds with an array containing all articles sorted by the specified category in the specified order", () => {
      return request(app)
        .get("/api/articles?sort_by=votes&order=asc")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("votes", { ascending: true });
        });
    });
    test("400: Responds with an error when sort_by is given an invalid value", () => {
      return request(app)
        .get("/api/articles?sort_by=6")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    test("400: Responds with an error when order is given an invalid value", () => {
      return request(app)
        .get("/api/articles?order=false")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
  });
  describe("Topic Query", () => {
    test("200: When a topic query is given, responds with an array containing only the articles on the specified topic", () => {
      return request(app)
        .get("/api/articles?topic=mitch")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(12);
          articles.forEach((article) => {
            expect(article.topic).toBe("mitch");
          });
        });
    });
    test("200: Responds with an empty array if the specified topic exists but has no matching articles", () => {
      return request(app)
        .get("/api/articles?topic=paper")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(0);
        });
    });
    test("404: Responds with an error when given a topic that does not exist", () => {
      return request(app)
        .get("/api/articles?topic=harry_potter")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Resource not found");
        });
    });
  });
  describe("Pagination", () => {
    test("200: When a limit query is given, responds with an array containing the number of articles specified by the limit", () => {
      return request(app)
        .get("/api/articles?limit=5")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(5);
        });
    });
    test("200: When limit and page queries are given, responds with an array containing the number of articles specified by the limit in the range specified by the page", () => {
      return request(app)
        .get("/api/articles?sort_by=article_id&order=asc&limit=5&p=2")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(5);
          for (let i = 0; i <= 4; i++) {
            expect(articles[i].article_id).toBe(i + 6);
          }
        });
    });
    test("200: Also returns the total count of articles", () => {
      return request(app)
        .get("/api/articles?sort_by=article_id&order=asc&limit=5&p=2")
        .expect(200)
        .then(({ body: { total_count } }) => {
          expect(total_count).toBe("13");
        });
    });
    test("200: Total count only considers articles accepted by the queries", () => {
      return request(app)
        .get(
          "/api/articles?sort_by=article_id&order=asc&topic=mitch&limit=5&p=2"
        )
        .expect(200)
        .then(({ body: { total_count } }) => {
          expect(total_count).toBe("12");
        });
    });
    test("400: Responds with an error if limit query is invalid", () => {
      return request(app)
        .get("/api/articles?limit=five")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    test("400: Responds with an error if page query is invalid", () => {
      return request(app)
        .get("/api/articles?limit=5&p=two")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    test("200: All pages after the last page containing content will be empty arrays", () => {
      return request(app)
        .get(
          "/api/articles?sort_by=article_id&order=asc&topic=mitch&limit=5&p=200"
        )
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toEqual([]);
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
        expect(typeof comment.comment_id).toBe("number");
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
        cat: [4, "icellusedkars"],
        body: ["git pull origin master", false],
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual("Bad request");
      });
  });
  test("404: Responds with an error when the given username does not correspond to an existing author", () => {
    return request(app)
      .post("/api/articles/2/comments")
      .send({
        username: "not a user",
        body: "git pull origin master",
      })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toEqual("Resource not found");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("200: Returns the article with the votes property incremented by the required amount", () => {
    return request(app)
      .patch("/api/articles/3")
      .send({
        inc_votes: 1,
      })
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article.votes).toBe(1);
        expect(article.article_id).toBe(3);
        expect(typeof article.author).toBe("string");
        expect(typeof article.title).toBe("string");
        expect(typeof article.body).toBe("string");
        expect(typeof article.topic).toBe("string");
        expect(typeof article.created_at).toBe("string");
        expect(typeof article.article_img_url).toBe("string");
      });
  });
  test("404: Returns an error if there is no article with the given id", () => {
    return request(app)
      .patch("/api/articles/9999999")
      .send({
        inc_votes: 1,
      })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });
  test("400: Returns an error if the given id is invalid", () => {
    return request(app)
      .patch("/api/articles/not_an_id")
      .send({
        inc_votes: 1,
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("400: Returns an error if the given object contains invalid data types", () => {
    return request(app)
      .patch("/api/articles/3")
      .send({
        inc_votes: "Pringles",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("400: Returns an error if the given object contains an invalid key", () => {
    return request(app)
      .patch("/api/articles/3")
      .send({
        incvote: 1,
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("204: Responds with no content if deletion is successful", () => {
    return request(app)
      .delete("/api/comments/3")
      .expect(204)
      .then((response) => {
        expect(response.body).toEqual({});
      });
  });
  test("404: Responds with an error if there is no comment with the given id", () => {
    return request(app)
      .delete("/api/comments/9999999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Comment not found");
      });
  });
  test("400: Responds with an error if the given id is invalid", () => {
    return request(app)
      .delete("/api/comments/not_an_id")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("GET /api/users", () => {
  test("200: Responds with an array of all users with the required properties", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        expect(users.length).not.toBe(0);
        users.forEach((user) => {
          expect(typeof user.username).toBe("string");
          expect(typeof user.name).toBe("string");
          expect(typeof user.avatar_url).toBe("string");
        });
      });
  });
});

describe("GET /api/users/:username", () => {
  test("200: Responds with a user object with the matching username", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then(({ body: { user } }) => {
        expect(user.username).toBe("butter_bridge");
        expect(user.name).toBe("jonny");
        expect(user.avatar_url).toBe(
          "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg"
        );
      });
  });
  test("404: Responds with an error if there is no user with the given username", () => {
    return request(app)
      .get("/api/users/happyamy2016")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("User not found");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("200: Responds with a comment object with the specified id and the votes property incremented by the specified amount", () => {
    return request(app)
      .patch("/api/comments/3")
      .send({
        inc_votes: 1,
      })
      .expect(200)
      .then(({ body: { comment } }) => {
        expect(comment.comment_id).toBe(3);
        expect(comment.votes).toBe(101);
      });
  });
  test("404: Responds with an error when there is no comment with the specified id", () => {
    return request(app)
      .patch("/api/comments/999999")
      .send({
        inc_votes: 1,
      })
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Comment not found");
      });
  });
  test("400: Responds with an error when the specified id is invalid", () => {
    return request(app)
      .patch("/api/comments/not_an_id")
      .send({
        inc_votes: 1,
      })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
  test("400: Responds with an error when the sent object contains invalid syntax", () => {
    return request(app)
      .patch("/api/comments/3")
      .send({
        inc_votes: "yes",
      })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
  test("400: Responds with an error when the sent object does not contain the inc_votes property", () => {
    return request(app)
      .patch("/api/comments/3")
      .send({
        votes: 1,
      })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
});

describe("POST /api/articles", () => {
  test("201: Returns the newly created article object including a comment count", () => {
    return request(app)
      .post("/api/articles")
      .send({
        title: "Student SUES Mitch!",
        topic: "mitch",
        author: "rogersop",
        body: "We all love Mitch and his wonderful, unique typing style. However, the volume of his typing has ALLEGEDLY burst another students eardrums, and they are now suing for damages",
        article_img_url:
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      })
      .expect(201)
      .then(({ body: { article } }) => {
        expect(typeof article.article_id).toBe("number");
        expect(article.votes).toBe(0);
        expect(typeof article.title).toBe("string");
        expect(typeof article.topic).toBe("string");
        expect(typeof article.author).toBe("string");
        expect(typeof article.body).toBe("string");
        expect(typeof article.article_img_url).toBe("string");
        expect(article.comment_count).toBe("0");
      });
  });
  test("400: Returns an error if the given object contains invalid keys", () => {
    return request(app)
      .post("/api/articles")
      .send({
        invalid_key: "Student SUES Mitch!",
        topic: "mitch",
        author: "rogersop",
        E: "We all love Mitch and his wonderful, unique typing style. However, the volume of his typing has ALLEGEDLY burst another students eardrums, and they are now suing for damages",
        1: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
  test("404: Returns an error if the given object contains an author that does not exist", () => {
    return request(app)
      .post("/api/articles")
      .send({
        title: "Student SUES Mitch!",
        topic: "mitch",
        author: "not an author",
        body: "We all love Mitch and his wonderful, unique typing style. However, the volume of his typing has ALLEGEDLY burst another students eardrums, and they are now suing for damages",
        article_img_url:
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      })
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Resource not found");
      });
  });
  test("404: Returns an error if the given object contains a topic that does not exist", () => {
    return request(app)
      .post("/api/articles")
      .send({
        title: "Student SUES Mitch!",
        topic: "not a topic",
        author: "rogersop",
        body: "We all love Mitch and his wonderful, unique typing style. However, the volume of his typing has ALLEGEDLY burst another students eardrums, and they are now suing for damages",
        article_img_url:
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      })
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Resource not found");
      });
  });
});
