const express = require("express");
const bodyParser = require("body-parser");

const promoRouter = express.Router();
promoRouter.use(bodyParser.json());

promoRouter
  .route("/")
  // Putting the common response modification here for any response.
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    next();
  })
  .get((req, res, next) => {
    res.end("Will send all the promos to you..");
  })

  .post((req, res, next) => {
    res.end(
      "Will add the promotion: " + req.body.name + ":" + req.body.description
    );
  })

  .put((req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /promotions");
  })

  .delete((req, res, next) => {
    res.end("Will delete all the promotions");
  });

promoRouter
  .route("/:promoId")
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    next();
  })
  .get((req, res, next) => {
    res.end("Will send the promo to you for promoId: " + req.params.promoId);
  })
  .post((req, res, next) => {
    res.end("POST operation not supported on /promotions/" + req.params.promoId);
  })
  .put((req, res, next) => {
    res.write("Updating the promotion with promoId: " + req.params.promoId);
    res.end(
      "Will update the promotion: " + req.body.name + ":" + req.body.description
    );
  })
  .delete((req, res, next) => {
    res.end("Will delete the promotion with id: " + req.params.promoId);
  });

module.exports = promoRouter;
