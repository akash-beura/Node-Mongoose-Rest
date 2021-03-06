const express = require("express");
const bodyParser = require("body-parser");
const Leaders = require("../models/leaders");
const leaderRouter = express.Router();
const authenticate = require("../authenticate");
const cors = require("./cors");
leaderRouter.use(bodyParser.json());

leaderRouter
  .route("/")
  // setting up corst: START
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  // setting up corst: END
  .get(cors.cors, (req, res, next) => {
    Leaders.find({})
      .then(
        (leaders) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(leaders);
        },
        (err) => console.log(err)
      )
      .catch((error) => console.log(error));
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Leaders.create(req.body)
        .then(
          (leader) => {
            console.log("Leader is inserted into records.");
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(leader);
          },
          (err) => console.log(err)
        )
        .catch((err) => console.log(err));
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.statusCode = 403;
      res.end("PUT operation not supported on /leaders");
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Leaders.deleteMany({}).then((resp) => {
        console.log(
          "Deleted the documents from Leaders collection"
        ).res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(resp);
      });
    }
  );

leaderRouter
  .route("/:leaderId")
  // setting up corst: START
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  // setting up corst: END
  .get(cors.cors, (req, res, next) => {
    Leaders.findById(req.params.leaderId)
      .then(
        (leader) => {
          if (leader != null) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(leader);
          } else {
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            res.end("Leader not found with id: " + req.params.leaderId);
          }
        },
        (err) => console.log(err)
      )
      .catch((error) => console.log(error));
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.end(
        "POST operation not supported on /leaders/" + req.params.leaderId
      );
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Leaders.findById(req.params.leaderId)
        .then(
          (leader) => {
            if (leader != null) {
              if (req.body.designation) {
                leader.designation = req.body.designation;
              }
              if (req.body.abbr) {
                leader.abbr = req.body.abbr;
              }
              Leaders.save(leader).then((leader) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(leader);
              });
            } else {
              res.statusCode = 404;
              res.setHeader("Content-Type", "application/json");
              res.end("Leader not found with id: " + req.params.leaderId);
            }
          },
          (err) => console.log(err)
        )
        .catch((error) => console.log(error));
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Leaders.findByIdAndRemove(req.params.leaderId)
        .then(
          (response) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(response);
          },
          (err) => console.log(err)
        )
        .catch((error) => console.log(error));
    }
  );

module.exports = leaderRouter;
