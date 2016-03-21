var http = require('http');
var https = require('https');
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var crypto = require('crypto');
var compression = require('compression');
var async = require('async');
var fs = require('fs');
var static = express();
var app = express();

// Configure POST body parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Enable gzip
app.use(compression());
static.use(compression());

// Direct everything except /api to the frontend application
static.use(/^(?!\/api$).*/, express.static('../frontend'));

// Mount app at /api
static.use('/api', app);

// MongoDB Setup
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/dcsense');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log('mongoose: Connected to database \'dcsense\'');
});

// Schemas

var readingSchema = mongoose.Schema({
  'controller' : Number,
  'bus' : Number,
  'sensor_addr' : Number,
  'time' : Date,
  'temp' : Number
});

var Reading = mongoose.model('Reading', readingSchema);


// Backend Request Handlers

app.get('/', function (req, res) {
  res.send('<h1>This is a request handler for the root of the backend application!</h1>');
});

app.post('/', function (req, res) {
  console.log('data received');
  var readings = req.body;
  console.log(readings.length + ' readings received');
  readings.forEach(function (current, index) {
    currentReading = current;
    currentReading['time'] = new Date(current['time']*1000);
    var reading = new Reading(currentReading);
    reading.save();
  });
  res.end();
});

static.listen(80);
console.log('Server running at http://localhost:3000');
