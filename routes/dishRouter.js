const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const Dishes = require("./../models/dishes");

// We're declarin the dishRouter as the express Router
const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

// We're putting '/' he but we will mount the '/dishes' router from index.js
dishRouter
  .route("/")

  .get((req, res, next) => {
    Dishes.find({})
      .then(
        (dishes) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dishes);
        },
        (err) => console.log(err)
      )
      .catch((error) => console.log(error));
  })

  .post((req, res, next) => {
    Dishes.create(req.body)
      .then(
        (dish) => {
          console.log("Dish created ", dish);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        (err) => console.log(err)
      )
      .catch((error) => console.log(error));
  })

  .put((req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /dishes");
  })

  .delete((req, res, next) => {
    Dishes.deleteMany({})
      .then(
        (resp) => {
          console.log("Dish created ", dish);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(resp);
        },
        (err) => console.log(err)
      )
      .catch((error) => console.log(error));
  });

dishRouter
  .route("/:dishId")
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        (err) => console.log(err)
      )
      .catch((error) => console.log(error));
  })
  .post((req, res, next) => {
    res.end("POST operation not supported on /dishes/" + req.params.dishId);
  })
  .put((req, res, next) => {
    Dishes.findByIdAndUpdate(
      req.params.dishId,
      {
        $set: req.body,
      },
      { new: true }
    )
      .then(
        (dish) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        (err) => console.log(err)
      )
      .catch((error) => console.log(error));
  })
  .delete((req, res, next) => {
    Dishes.findByIdAndRemove(req.params.dishId)
      .then(
        (response) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        },
        (err) => console.log(err)
      )
      .catch((error) => console.log(error));
  });

dishRouter
  .route("/:dishId/comments")
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish != null) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(dish.comments);
          } else {
            err = new Error("Dish not found with id: " + req.params.dishId);
            err.status = 404;
            return next(error);
          }
        },
        (err) => console.log(err)
      )
      .catch((error) => console.log(error));
  })
  .post((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          // Check if dish exists, then add the comment and save it.
          if (dish != null) {
            dish.comments.push(req.body);
            dish.save().then(() => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(dish.comments);
            });
          } else {
            err = new Error("Dish not found with id: " + req.params.dishId);
            err.status = 404;
            return next(error);
          }
        },
        (err) => console.log(err)
      )
      .catch((error) => console.log(error));
  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end(
      "PUT operation not supported on /dishes/" +
        req.params.dishId +
        "/comments"
    );
  })
  .delete((req, res, next) => {
    Dishes.findById(req.params.dishId).then((dish) => {
      if (dish != null) {
        dish.comments.forEach((comment) => {
          dish.comments.id(comment._id).remove();
        });
        dish.save().then(() => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish.comments);
        });
      } else {
        err = new Error("Dish not found with id: " + req.params.dishId);
        err.status = 404;
        return next(error);
      }
    });

    Dishes.findByIdAndRemove(req.params.dishId)
      .then(
        (response) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        },
        (err) => console.log(err)
      )
      .catch((error) => console.log(error));
  });

dishRouter
  .route("/:dishId/comments/:commentId")
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          // Chcck
          if (dish != null && dish.comments.id(req.params.commentId) != null) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            // Here we're accessing a sub document from a document, that's comment within dish
            res.json(dish.comments.id(req.params.commentId));
          } else if (dish == null) {
            err = new Error("Dish not found with id: " + req.params.dishId);
            err.status = 404;
            return next(error);
          } else {
            err = new Error("Comment: " + req.params.commendId + " not found!");
            err.status = 404;
            return next(error);
          }
        },
        (err) => console.log(err)
      )
      .catch((error) => console.log(error));
  })
  .post((req, res, next) => {
    res.end(
      "POST operation not supported on /dishes/" +
        req.params.dishId +
        "/comments/" +
        req.params.commentId
    );
  })
  .put((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
          if (req.body.rating) {
            dish.comments.id(req.params.commentId).rating = req.body.rating;
          }
          if (req.body.comment) {
            dish.comments.id(req.params.commentId).comment = req.body.comment;
          }
          dish.save().then(() => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(dish.comments);
          });
        } else if (dish == null) {
          err = new Error("Dish not found with id: " + req.params.dishId);
          err.status = 404;
          return next(error);
        } else {
          err = new Error("Comment: " + req.params.commendId + " not found!");
          err.status = 404;
          return next(error);
        }
      })
      .catch((error) => console.log(error));
  })
  .delete((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
          dish.comments.id(req.params.commentId).remove();
          dish.save().then(() => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(dish.comments);
          });
        } else if (dish == null) {
          err = new Error("Dish not found with id: " + req.params.dishId);
          err.status = 404;
          return next(error);
        } else {
          err = new Error("Comment: " + req.params.commendId + " not found!");
          err.status = 404;
          return next(error);
        }
      })
      .catch((error) => console.log(error));
  });

module.exports = dishRouter;
