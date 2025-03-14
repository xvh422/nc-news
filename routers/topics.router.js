const topicsRouter = require("express").Router();
const {
  getAllTopics,
  postNewTopic,
} = require("../controllers/topics.controllers");

topicsRouter.route("/").get(getAllTopics).post(postNewTopic);

module.exports = topicsRouter;
