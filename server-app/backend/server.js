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
static.use(express.static('../frontend'));

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

var userSchema = mongoose.Schema({
  'username': String,
  'token': String,
  'salt': String,
  'accessLevel': Number
});

var User = mongoose.model('User', userSchema);

var ticketSchema = mongoose.Schema({
  username: String,
  ticket: String,
  expires: Date
});

var Ticket = mongoose.model('Ticket', ticketSchema);

// Backend Request Handlers

app.get('/', function (req, res) {
  res.send('<h1>This is a request handler for the root of the backend application!</h1>');
});

function randomString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

app.post('/auth/register', function (req, res) {
  console.log('Request to register new user received.');
  var user = {
    username: req.body.user.username,
    token: '',
    salt: randomString(20),
    accessLevel: parseInt(req.body.user.accessLevel)
  };

  User.findOne({username: user.username}, function (err, record) {
    if (record) {
      res.status(409).send({msg: 'User already exists.'});
    }
    else {
      user.token = crypto.createHmac('sha256', 'dcsense-server')
                   .update(user.username + req.body.user.password + user.salt)
                   .digest('hex');

      var mUser = new User(user);
      mUser.save(function (err) {
        if (err) {
          res.status(500).send({msg: 'The server could not process your request.'});
        }
        else {
          console.log('User ' + user.username + ' successfully registered.');
          res.end();
        }
      });
    }

  });
});

app.post('/auth/login', function (req, res) {
  console.log('Request to login user ' + req.body.user.username);
  var user = {
    username: req.body.user.username,
    password: req.body.user.password,
    salt: ''
  };

  User.findOne({username: user.username}, function (err, record) {
    if (err) {
      res.sendStatus(500);
    }
    if (!record) {
      res.status(401).send({msg: 'User does not exist.'});
    }
    else {
      var newToken = crypto.createHmac('sha256', 'dcsense-server')
        .update(record.username + user.password + record.salt)
        .digest('hex');
      var oldToken = record.token;
      if (newToken != oldToken) {
        res.status(401).send({msg: 'Incorrect password.'});
      }
      else {
        // Log the user in
        console.log('User ' + user.username + ' logged in.');
        var ticket = {
          username: user.username,
          ticket: randomString(25),
          expires: new Date((new Date()).getTime() + (7 * 86400000))
        };
        Ticket.remove({username: user.username}, function (err) {
          var mTicket = new Ticket(ticket);
          mTicket.save();
          res.send({ticket: ticket});
        });
      }
    }
  });
});

app.post('/auth/logout', function (req, res) {
  var ticket = req.body.ticket;
  Ticket.findOne({username: ticket.username, ticket: ticket.ticket}, function(err, record) {
    if (err) {
      res.sendStatus(500);
    }
    if (!record) {
      res.status(401).send({msg: 'Unauthorized.'});
    }
    else {
      var today = new Date();
      var expires = new Date(record.expires);
      var cookieDate = new Date(ticket.expires);

      if (expires.getTime() > today.getTime()
          && expires.getTime() == cookieDate.getTime()) {
        console.log('User ' + ticket.username + ' logged out.');
        Ticket.remove({username: ticket.username}, function (err) {
          if (err)
            res.sendStatus(500);
          else {
            res.send({msg: 'Successfully logged out.'});
          }
        });
      }
      else {
        res.status(401).send({msg: 'Unauthorized'});
      }
    }
  });
});

var accessLevels = {
  public: 1,
  user: 2,
  admin: 3
};

function checkSessionStatus (req, res, callback) {
  var ticket = req.body.ticket;
  var accessLevel = req.body.accessLevel;
  Ticket.findOne({username: ticket.username, ticket: ticket.ticket}, function(err, record) {
    if (err) {
      res.sendStatus(500);
      callback(false);
    }
    if (!record) {
      res.status(401).send({msg: 'You are not logged in.', loggedIn: false});
      callback(false);
    }
    else {
      var today = new Date();
      var expires = new Date(record.expires);
      var cookieDate = new Date(req.body.ticket.expires);

      if (expires.getTime() > today.getTime()
          && expires.getTime() == cookieDate.getTime()) {

        User.findOne({username: ticket.username}, function (err, user) {
          if (err) {
            res.sendStatus(500);
            callback(false);
          }
          else {
            if (user.accessLevel >= accessLevel) {
              console.log('User ' + ticket.username + ' is authorized.');
              callback(true);
            }
            else {
              console.log('User ' + ticket.username + ' is logged in, but not authorized to make current request.');
              res.status(401).send({msg: 'You aren\'t authorized to make this request.', loggedIn: true});
              callback(false);
            }
          }
        });
      }
    }
  });
}

app.post('/auth/sessionstatus', function (req, res) {
  function endRequest (responseNotSent) {
    if (responseNotSent) { // User is authorized
      res.send({msg: 'You are logged in.'});
    }
  }
  checkSessionStatus(req, res, endRequest);
});

app.post('/sensors/submitreadings', function (req, res) {
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

app.get('/sensors/list/controllers', function (req, res) {
  Reading.distinct('controller', function (err, controllers) {
    res.send(controllers);
  });
});

app.get('/sensors/list/dates/:controller/limit/:limit', function (req, res) {
  var limit = parseInt(req.params.limit);
  Reading.aggregate([
    {$match: {'controller': parseInt(req.params.controller)}},
    {$group: {_id: '$time'}}, // equivalent of distinct('time')
    {$sort: {'_id': -1}}, // sort by newest reading first
    {$limit: limit},
    ],
    function (err, dateObjs) {
      var dates = [];
      dateObjs.forEach(function (current, index) {
        dates.push(current['_id']);
      });
      res.send(dates);
    }
  );
});

app.get('/sensors/list/dates/:controller/all', function (req, res) {
  Reading.aggregate([
    {$match: {'controller': parseInt(req.params.controller)}},
    {$group: {_id: '$time'}}, // equivalent of distinct('time')
    {$sort: {'_id': -1}}, // sort by newest reading first
    ],
    function (err, dateObjs) {
      if (!err) {
        var dates = [];
        dateObjs.forEach(function (current, index) {
          dates.push(current['_id']);
        });
        res.send(dates);
      }
      else {
        console.log('Error.');
      }
    }
  );
});

app.get('/sensors/readings/:controller/:time', function (req, res) {
  Reading.find({
    'controller': req.params.controller,
    'time': req.params.time},
    function (err, readings) {
      res.send(readings);
    })
});

static.listen(80);
console.log('Server running at http://localhost:80');
