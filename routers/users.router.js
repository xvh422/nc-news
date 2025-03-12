const usersRouter = require("express").Router();
const { getAllUsers } = require("../controllers/users.controllers");

usersRouter.route("/").get(getAllUsers);

module.exports = usersRouter;
