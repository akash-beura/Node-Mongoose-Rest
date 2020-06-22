// This file is to enable routes for uploading files

const express = require("express");
const bodyParser = require("body-parser");
const authenticate = require("../authenticate");
const multer = require("multer");
const cors = require("./cors");

//Multer setup start
var storage = multer.diskStorage({
  // here we setup the destination where the file will be stored
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  // here we setup the name of the file which should match the original name..
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

// File filter will allow us to choose which type of files are going to be uploaded.
const imageFileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|PNG)$/)) {
    return cb(new Error("You're allowed to upload only image files"), false);
  } else {
    return cb(null, true);
  }
};

// we're now setting up the multer module for usage.
const upload = multer({ storage: storage, fileFilter: imageFileFilter });
//Multer setup end

const uploadRouter = express.Router();
uploadRouter.use(bodyParser.json());

uploadRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(
    cors.cors,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.statusCode = 403;
      res.end("GET method not supported on /imageUpload");
    }
  )

  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.statusCode = 403;
      res.end("PUT method not supported on /imageUpload");
    }
  )

  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.statusCode = 403;
      res.end("DELETE method not supported on /imageUpload");
    }
  )
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    upload.single("imageFile"), // we make use of multer here, it will allow to only upload a single file here/
    (req, res) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(req.file);
    }
  );

module.exports = uploadRouter;
