const commentsRouter = require("express").Router();
const {
  deleteComment,
  patchComment,
} = require("../controllers/comments.controllers.js");

commentsRouter.route("/:comment_id").patch(patchComment).delete(deleteComment);

module.exports = commentsRouter;
