const express = require("express");
const cors = require("cors");

const app = express();

// Here we can mention the domains which are whitelisted.
const whitelist = ["http://localhost:3000", "https://localhost:3443"];

// We configure our Cors options inside there
var corsOptionsDelegate = (req, callback) => {
  var corsOptions;
  /*    The 'Origin' header contains the URL of the domain 
        from which request has been originated */
  if (whitelist.indexOf(req.header("Origin")) !== -1) {
    // When origin is true, "Access-Control-Allow-Origin" will be sent with the URL by cors module
    corsOptions = { origin: true };
  } else{
    //   ACAO wont be sent back
    corsOptions = { origin: false };
  }
};

// When all CORS is (*)
exports.cors = cors();
// Use this when you want only whitelisted sites to be allowed
exports.corsWithOptions = cors(corsOptionsDelegate);