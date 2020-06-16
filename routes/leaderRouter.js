const express = require("express");
const bodyParser = require("body-parser");
const { response } = require("express");

const leaderRouter = express.Router();
leaderRouter.use(bodyParser.json());

leaderRouter
  .route("/")
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    next();
  })
  .get((req, res, next) => {
    res.end("You will get all the leaders from this API");
  })
  .post((req, res, next) => {
    res.end("New leader with leader ID: " + req.body.id + " will be added");
  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /leaders");
  })
  .delete((req, res, next) => {
    res.end("All the leaders will be deleted..");
  });

leaderRouter
  .route("/:leaderId")
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    next();
  })
  .get((req, res, next) => {
    res.end(
      "Will send the leaders to you for leaderId: " + req.params.leaderId
    );
  })
  .post((req, res, next) => {
    res.end("POST operation not supported on /leaders/" + req.params.leaderId);
  })
  .put((req, res, next) => {
    res.write("Updating the leader with leaderId: " + req.params.leaderId);
    res.end(
      "Will update the leader: " + req.body.name + ":" + req.body.description
    );
  })
  .delete((req, res, next) => {
    res.end("Will delete the leader with id: " + req.params.leaderId);
  });

  module.exports = leaderRouter;