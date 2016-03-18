var http = require('http');
var https = require('https');
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var crypto = require('crypto');
var async = require('async');
var fs = require('fs');
var app = express();

// Configure POST body parsing
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

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

// Request Handlers

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

app.listen(3000);
console.log('Server running at http://localhost:3000');
