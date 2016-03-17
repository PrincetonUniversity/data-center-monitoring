var http = require('http');
var https = require('https');
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var crypto = require('crypto');
var async = require('async');
var fs = require('fs');
var app = express();

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.post('/', function (req, res) {
  console.log('data received');
  console.log(req.body);
  res.end();
});

app.listen(3000);
console.log('Server running at http://localhost:3000');
