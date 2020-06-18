const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const Dishes = require("./../models/dishes");

const authenticate = require("../authenticate");

// We're declarin the dishRouter as the express Router
const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

// We're putting '/' he but we will mount the '/dishes' router from index.js
dishRouter
  .route("/")

  .get((req, res, next) => {
    Dishes.find({})
      .populate("comments.author")
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

  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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

  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /dishes");
  })

  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
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
    }
  );

dishRouter
  .route("/:dishId")
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate("comments.author")
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
  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.end("POST operation not supported on /dishes/" + req.params.dishId);
  })
  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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
  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
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
    }
  );

dishRouter
  .route("/:dishId/comments")
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate("comments.author")
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
  .post(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          // Check if dish exists, then add the comment and save it.
          if (dish != null) {
            req.body.author = req.user._id;
            dish.comments.push(req.body);
            dish.save().then(() => {
              Dishes.findById(dish._id)
                .populate("comments.author")
                .then((dish) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(dish.comments);
                });
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
  .put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      "PUT operation not supported on /dishes/" +
        req.params.dishId +
        "/comments"
    );
  })
  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
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
    }
  );

dishRouter
  .route("/:dishId/comments/:commentId")
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate("comments.author")
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
  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.end(
      "POST operation not supported on /dishes/" +
        req.params.dishId +
        "/comments/" +
        req.params.commentId
    );
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    console.log("inside put");
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        var commentPos = dish.comments.findIndex((comment) =>
          comment._id.equals(req.params.commentId)
        );
        if (dish != null && commentPos != -1) {
          if (!req.user._id.equals(dish.comments[commentPos].author)) {
            err = new Error(
              " You're not authorized to update this this with id: " +
                req.params.dishId
            );
            err.status = 403;
            return next(err);
          }
          if (req.body.rating) {
            dish.comments[commentPos].rating = req.body.rating;
          }
          if (req.body.comment) {
            dish.comments[commentPos].comment = req.body.comment;
          }
          dish.save().then((dish) => {
            Dishes.findById(dish._id)
              .populate("comments.author")
              .then((dish) => {});
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
  .delete(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        if (dish != null) {
          var commentPos = dish.comments.findIndex((comment) =>
            comment._id.equals(req.params.commentId)
          );

          console.log("USER ID FROM TOKEN===", req.user._id);
          console.log("AUTHOR ID===", dish.comments[commentPos].author);
          console.log(req.user._id.equals(dish.comments[commentPos].author));

          if (!req.user._id.equals(dish.comments[commentPos].author)) {
            err = new Error(
              " You're not authorized to delete this this with id: " +
                req.params.dishId
            );
            err.status = 403;
            return next(err);
          }
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
