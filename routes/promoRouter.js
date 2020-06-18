const express = require("express");
const bodyParser = require("body-parser");
const authenticate = require("../authenticate");

const promoRouter = express.Router();
promoRouter.use(bodyParser.json());

const mongoose = require("mongoose");
const Promotions = require("../models/promotions");

promoRouter
  .route("/")
  .get((req, res, next) => {
    Promotions.find({})
      .then(
        (promotion) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(promotion);
        },
        (err) => console.log(err)
      )
      .catch((error) => console.log(error));
  })

  .post(authenticate.verifyUser, (req, res, next) => {
    Promotions.create(req.body)
      .then(
        (promotion) => {
          console.log("Promotion is inserted into records.");
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(promotion);
        },
        (err) => console.log(err)
      )
      .catch((err) => console.log(err));
  })

  .put((req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /promotions");
  })

  .delete(authenticate.verifyUser, (req, res, next) => {
    Promotions.deleteMany({}).then((resp) => {
      console.log(
        "Deleted the documents from Promotions collection"
      ).res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(resp);
    });
  });

promoRouter
  .route("/:promoId")
  .get((req, res, next) => {
    Promotions.findById(req.params.promoId)
      .then(
        (promotion) => {
          if (promotion != null) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(promotion);
          } else {
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            res.end("Promotion not found with id: " + req.params.promoId);
          }
        },
        (err) => console.log(err)
      )
      .catch((error) => console.log(error));
  })
  .post((req, res, next) => {
    res.end(
      "POST operation not supported on /promotions/" + req.params.promoId
    );
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    Promotions.findById(req.params.promotionId)
      .then(
        (promotion) => {
          if (promotion != null) {
            if (req.body.price) {
              promotion.price = req.body.price;
            }
            if (req.body.description) {
              promotion.description = req.body.description;
            }
            if (req.body.featured != null) {
              promotion.featured = req.body.featured;
            }
            Promotions.save(promotion).then((promotion) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(promotion);
            });
          } else {
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            res.end("Promotion not found with id: " + req.params.promotionId);
          }
        },
        (err) => console.log(err)
      )
      .catch((error) => console.log(error));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Promotions.findByIdAndRemove(req.params.promoId)
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

module.exports = promoRouter;
