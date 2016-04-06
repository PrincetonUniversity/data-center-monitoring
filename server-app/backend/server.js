/* BACKEND SERVER FOR DCSENSE WEB APP
 *
 * Handles reception and storage of sensor data and provides backend API for
 * DCsense frontend web app.
 */

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
  'controller' : String,
  'bus' : Number,
  'sensor_addr' : Number,
  'time' : Date,
  'temp' : Number
});

var Reading = mongoose.model('Reading', readingSchema);
var ResearchReading = mongoose.model('ResearchReading', readingSchema);

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

var facilityCabinetSchema = mongoose.Schema(
  {
    bus: [Number], // 5-element arrays for the 5 sensors on each cabinet door
    addr: [Number]
  }
);

var facilitySchema = mongoose.Schema({
  name: String,
  controllers: [{
    id: String,
    name: String,
    width: Number,
    layout: [ // Array of cabinets (should contain 'width' elements)
      facilityCabinetSchema
    ]
  }],
  owners: [String]
});

var Facility = mongoose.model('facility', facilitySchema);

var readingCounterSchema = mongoose.Schema({
  controller: String,
  counter: Number
});

var ReadingCounter = mongoose.model('ReadingCounter', readingCounterSchema);

// Backend Request Handlers & Helper Functions

// Used for generating salts for new users
function randomString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

// Registers a new user account
app.post('/auth/register', function (req, res) {
  var ticket = req.body.ticket;
  var accessLevel = accessLevels.admin;
  function ifAuthorized () {
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
  }
  checkSessionStatus(res, ticket, accessLevel, ifAuthorized);
});


// Registers a new user account
app.post('/auth/register-nonadmin', function (req, res) {
  console.log('Request to register new user received.');
  var user = {
    username: req.body.user.username,
    token: '',
    salt: randomString(20),
    accessLevel: accessLevels.user
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

// Attempts to log in a user
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

// Authentication control levels
var accessLevels = {
  public: 1,
  user: 2,
  admin: 3
};

// Uses 'ticket' to check whether a user is logged in and authorized to make a
// request which requires the privileges of 'accessLevel'.
// If unauthorized, ends the request with an HTTP 401 and provides an error message.
// If authorized, does not end the request, but calls callback().
function checkSessionStatus (res, ticket, accessLevel, callback) {
  Ticket.findOne({username: ticket.username, ticket: ticket.ticket}, function(err, record) {
    if (err) {
      res.sendStatus(500);
    }
    else if (!record) {
      res.status(401).send({msg: 'You are not logged in.', loggedIn: false});
    }
    else {
      var today = new Date();
      var expires = new Date(record.expires);
      var cookieDate = new Date(ticket.expires);

      if (expires.getTime() > today.getTime()
          && expires.getTime() == cookieDate.getTime()) {

        User.findOne({username: ticket.username}, function (err, user) {
          if (err) {
            res.sendStatus(500);
          }
          else {
            if (user.accessLevel >= accessLevel) {
              console.log('User ' + ticket.username + ' is authorized.');
              callback();
            }
            else {
              console.log('User ' + ticket.username + ' is logged in, but not authorized to make current request.');
              res.status(401).send({msg: 'You aren\'t authorized to make this request.', loggedIn: true});
            }
          }
        });
      }
    }
  });
}

// Attempts to log a user out
app.post('/auth/logout', function (req, res) {
  var ticket = req.body.ticket;
  var accessLevel = accessLevels.user;
  function ifAuthorized () {
    console.log('User ' + ticket.username + ' logged out.');
    Ticket.remove({username: ticket.username}, function (err) {
      if (err)
        res.sendStatus(500);
      else {
        res.send({msg: 'Successfully logged out.'});
      }
    });
  }
  checkSessionStatus(res, ticket, accessLevel, ifAuthorized);
});

// Called before loading each page; checks whether the user is logged in and
// has access to pages at the provided 'accessLevel'.
app.post('/auth/sessionstatus', function (req, res) {
  var ticket = req.body.ticket;
  var accessLevel = req.body.accessLevel;
  function ifAuthorized () {
    res.send({msg: 'You are logged in.'});
  }
  checkSessionStatus(res, ticket, accessLevel, ifAuthorized);
});

/* Accepts temperature data from beaglebone controllers. Requests are expected
 * from each BeagleBone every 5 seconds. Each of these readings is stored in the
 * 'researchreadings' collection. Every 120 readings (per BeagleBone), or every
 * 10 minutes, a reading is also saved to the 'readings' collection, which is
 * the dataset queried by the web app. This separate collection is used to reduce
 * the number of records in the collection used by the frontend application, since
 * a database of readings taken every 5 minutes would quickly become too large
 * to query quickly. The 'readingcounters' collection is used to facilitate the
 * storage of one reading every 10 minutes for each BeagleBone separately. */
app.post('/sensors/submitreadings', function (req, res) {
  var readings = req.body;
  console.log(readings.length + ' readings received from ' + req.connection.remoteAddress);
  var controller = req.body[0].controller;

  // Check for a existing 'readingcounter' object
  ReadingCounter.findOne({controller: controller}, function (err, record) {
    if (err)
      res.sendStatus(500);
    else if (!record) {
      // This is the first time we've gotten data from this BeagleBone:
      // Create a ReadingCounter object, then save the readings
      var readingCounter = {controller: controller, counter: 0};
      mReadingCounter = new ReadingCounter(readingCounter);
      mReadingCounter.save();

      // Save the readings in the research collection
      readings.forEach(function (current, index) {
        currentReading = current;
        currentReading['time'] = new Date(current['time']*1000);
        var researchReading = new ResearchReading(currentReading);
        researchReading.save();
      });
      res.end();
    }
    else {
      // Update the ReadingCounter for this controller, then save the readings
      // to the appropriate collection
      var prevCounter = record.counter;
      var update;
      var saveToProd; // true if we'll also save the readings to the production collection
      if (prevCounter < 120) { // It's been less than 10 minutes, just increment the counter
        update = {$inc: {counter: 1}};
        saveToProd = false;
      }
      else {
        // 10 minutes has passed since our last production readings were saved for this BeagleBone
        // Reset the counter, and indicate that we need to save this set or readings
        // to the production collection
        update = {counter: 0};
        saveToProd = true;
      }

      // Perform the counter increment or reset
      ReadingCounter.update({controller: controller}, update, function (err) {
        // Save the readings to the research collection
        // Also save to production collection if necessary
        readings.forEach(function (current, index) {
          currentReading = current;
          currentReading['time'] = new Date(current['time']*1000);
          // Save to research collection
          var researchReading = new ResearchReading(currentReading);
          researchReading.save();
          if (saveToProd) { // Save to production collection too
            var reading = new Reading(currentReading);
            reading.save();
          }
        });
        res.end(); // BeagleBones expect no return data
      });
    }
  });
});

// Sends a list of all controllers for which readings exist in the database.
// Admins only.
app.post('/sensors/list/controllers', function (req, res) {
  var ticket = req.body.ticket;
  var accessLevel = accessLevels.admin;
  function ifAuthorized() {
    Reading.distinct('controller', function (err, controllers) {
      res.send(controllers);
    });
  }
  checkSessionStatus(res, ticket, accessLevel, ifAuthorized);
});


// Checks whether the user is an owner of the facility in which the provided
// 'controller' resides.
// If unauthorized, ends the request with an HTTP 401 and provides an error message.
// If authorized, does not end the request, but calls callback().
function checkControllerAccess(res, controller, user, callback) {
  Facility.findOne({owners: user, 'controllers.id': controller}, function (err, record) {
    if (err)
      res.sendStatus(500);
    else if (!record) {
      User.findOne({username: user, accessLevel: accessLevels.admin}, function (err, admin) {
        if (err)
          res.sendStatus(500);
        else if (!admin)
          res.status(401).send({msg: 'You aren\'t an owner of the facility where this controller lives.'});
        else
          callback();
      });
    }
    else
      callback();
  });
}

// Sends up to 'limit' of the most recent timestamps from readings gathered from
// the provided 'controller'.
app.post('/sensors/list/dates/:controller/limit/:limit', function (req, res) {
  var ticket = req.body.ticket;
  var accessLevel = accessLevels.user;
  function ifAuthorized() {
    var user = ticket.username;
    var controller = decodeURIComponent(req.params.controller);
    function ifOwner() {
      var limit = parseInt(req.params.limit);
      Reading.aggregate([
        {$match: {'controller': controller}},
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
    }
    checkControllerAccess(res, controller, user, ifOwner);
  }
  checkSessionStatus(res, ticket, accessLevel, ifAuthorized);
});

// Sends all timestamps from readings gathered from the provided 'controller'
// in reverse chronological order.
app.post('/sensors/list/dates/:controller/all', function (req, res) {
  var ticket = req.body.ticket;
  var accessLevel = accessLevels.user;
  function ifAuthorized() {
    var user = ticket.username;
    var controller = decodeURIComponent(req.params.controller);
    function ifOwner() {
      var limit = parseInt(req.params.limit);
      Reading.aggregate([
        {$match: {'controller': controller}},
        {$group: {_id: '$time'}}, // equivalent of distinct('time')
        {$sort: {'_id': -1}}, // sort by newest reading first
        ],
        function (err, dateObjs) {
          var dates = [];
          dateObjs.forEach(function (current, index) {
            dates.push(current['_id']);
          });
          res.send(dates);
        }
      );
    }
    checkControllerAccess(res, controller, user, ifOwner);
  }
  checkSessionStatus(res, ticket, accessLevel, ifAuthorized);
});

// Sends the sensor readings taken on a given 'controller' at a given 'time'.
app.post('/sensors/readings/:controller/:time', function (req, res) {
  var ticket = req.body.ticket;
  var accessLevel = accessLevels.user;
  function ifAuthorized() {
    var user = ticket.username;
    var controller = decodeURIComponent(req.params.controller);
    function ifOwner() {
      Reading.find({
        'controller': controller,
        'time': req.params.time},
        function (err, readings) {
          res.send(readings);
      });
    }
    checkControllerAccess(res, controller, user, ifOwner);
  }
  checkSessionStatus(res, ticket, accessLevel, ifAuthorized);
});

// Adds a new facility to the system.
// Admins only.
app.post('/facilities/add', function (req, res) {
  var ticket = req.body.ticket;
  var accessLevel = accessLevels.admin;
  function ifAuthorized() {
    var facilityDetails = req.body.facility;
    var facility = {
      name: facilityDetails.name,
      controllers: [],
      owners: []
    }
    Facility.findOne({name: facility.name}, function (err, record) {
      if (err)
        res.sendStatus(500);
      else if (record)
        res.status(409).send({msg: 'Facility already exists.'});
      else {
        var mFacility = new Facility(facility);
        mFacility.save();
        res.end();
      }
    });
  }
  checkSessionStatus(res, ticket, accessLevel, ifAuthorized);
});

// Deletes a facility from the system.
// Admins only.
app.post('/facilities/:facility/remove', function (req, res) {
  var ticket = req.body.ticket;
  var accessLevel = accessLevels.admin;
  function ifAuthorized() {
    var facility = decodeURIComponent(req.params.facility);
    Facility.remove({name: facility}, function (err, record) {
      if (err)
        res.sendStatus(500);
      else if (!record)
        res.status(409).send({msg: 'Facility doesn\'t exist.'});
      else {
        res.end();
      }
    });
  }
  checkSessionStatus(res, ticket, accessLevel, ifAuthorized);
});

// Deletes a user from the system.
// Admins only.
app.post('/auth/:user/remove', function (req, res) {
  var ticket = req.body.ticket;
  var accessLevel = accessLevels.admin;
  function ifAuthorized() {
    var user = decodeURIComponent(req.params.user);
    User.remove({username: user}, function (err, record) {
      if (err)
        res.sendStatus(500);
      else if (!record)
        res.status(409).send({msg: 'User doesn\'t exist.'});
      else {
        Facility.update({},
                        {$pull: {owners: user}},
                        {multi: true},
                        function (err) {
                          if (err)
                            res.sendStatus(500);
                          else
                            res.end();
                        });
      }
    });
  }
  checkSessionStatus(res, ticket, accessLevel, ifAuthorized);
});

// If admin: Sends a list of all facilities in the system.
// If user: Sends a list of all facilities of which the user is an owner.
app.post('/facilities/list', function (req, res) {
  var ticket = req.body.ticket;
  var accessLevel = accessLevels.user;
  function ifAuthorized() {
    var user = ticket.username;
    User.findOne({username: user, accessLevel: accessLevels.admin}, function (err, admin) {
      if (err)
        res.sendStatus(500);
      else if (!admin) { // user is not an admin, so only send facilities of which they are owner
        Facility.find({owners: user}, 'name', {sort: {name: 1}}, function (err, facilities) {
          if (err) {
            console.log('Internal Server Error');
            res.sendStatus(500);
          }
          else if (!facilities) {
            res.status(401).send({msg: 'You haven\'t been given access to any facilities yet. Please contact the site administrators for assistance.'});
          }
          else {
            res.send(facilities);
          }
        });
      }
      else { // User is admin, send all facilities
        Facility.find({}, 'name', {sort: {name: 1}}, function (err, facilities) {
          if (err || !facilities) {
            console.log('Internal Server Error');
            res.sendStatus(500);
          }
          else {
            res.send(facilities);
          }
        });
      }
    });
  }
  checkSessionStatus(res, ticket, accessLevel, ifAuthorized);
});

// Sends a list of all users in the system.
// Admins only.
app.post('/auth/list/users', function (req, res) {
  var ticket = req.body.ticket;
  var accessLevel = accessLevels.admin;
  function ifAuthorized() {
    User.find({}, 'username', {sort: {username: 1}}, function (err, users) {
      if (err || !users) {
        console.log('Internal Server Error');
        res.sendStatus(500);
      }
      else {
        res.send(users);
      }
    });
  }
  checkSessionStatus(res, ticket, accessLevel, ifAuthorized);
});

// Checks whether the user is an owner of the provided 'facility' (or an admin).
// If unauthorized, ends the request with an HTTP 401 and provides an error message.
// If authorized, does not end the request, but calls callback().
function checkFacilityAccess(res, user, facility, callback) {
  Facility.findOne({name: facility, owners: user}, function (err, record) {
    if (err)
      res.sendStatus(500);
    else if (!record) {
      User.findOne({username: user, accessLevel: accessLevels.admin}, function (err, admin) {
        if (err)
          res.sendStatus(500);
        else if (!admin)
          res.status(401).send({msg: 'You aren\'t an owner of the specified facility.'});
        else
          callback();
      });
    }
    else
      callback();
  });
}

// Sends a list of all owners of a given 'facility'.
// Admins only.
app.post('/facilities/:facility/list/owners', function (req, res) {
  var ticket = req.body.ticket;
  var accessLevel = accessLevels.admin;
  function ifAuthorized() {
    var facility = decodeURIComponent(req.params.facility);
    Facility.findOne({name: facility}, 'owners', function (err, record) {
      if (err)
        res.sendStatus(500);
      else if (!record) {
        res.sendStatus(400);
      }
      else {
        res.send(record.owners);
      }
    });
  }
  checkSessionStatus(res, ticket, accessLevel, ifAuthorized);
});

// Sends a list of all controllers in a given 'facility'.
app.post('/facilities/:facility/list/controllers', function (req, res) {
  var ticket = req.body.ticket;
  var accessLevel = accessLevels.user;
  function ifAuthorized() {
    var facility = decodeURIComponent(req.params.facility);
    var user = ticket.username;
    function ifOwner() {
      Facility.findOne({name: facility}, 'controllers', function (err, record) {
        if (err)
          res.sendStatus(500);
        else if (!record) {
          res.sendStatus(400);
        }
        else {
          res.send(record.controllers);
        }
      });
    }
    checkFacilityAccess(res, user, facility, ifOwner);
  }
  checkSessionStatus(res, ticket, accessLevel, ifAuthorized);
});

// Adds or removes a given 'user' from the list of owners of a facility.
// Admins only.
app.post('/facilities/:facility/owners/:addOrRemove/:user', function (req, res) {
  var ticket = req.body.ticket;
  var accessLevel = accessLevels.admin;
  function ifAuthorized() {
    var facility = decodeURIComponent(req.params.facility);
    var user = req.params.user;
    var update;
    if (req.params.addOrRemove == 'add') {
      update = {$addToSet: {owners: user}};
    }
    else if (req.params.addOrRemove == 'remove') {
      update = {$pull: {owners: user}};
    }
    else {
      res.status(400).send();
      return;
    }
    Facility.update({name: facility},
                    update,
                    function (err) {
                      if (err)
                        res.sendStatus(500);
                      else
                        res.end();
                    });
  }
  checkSessionStatus(res, ticket, accessLevel, ifAuthorized);
});

// Adds or removes a given 'controller' from the list of controllers in a facility.
// Admins only.
app.post('/facilities/:facility/controllers/addremove/:addOrRemove/:controller', function (req, res) {
  var ticket = req.body.ticket;
  var accessLevel = accessLevels.admin;
  function ifAuthorized() {
    var facility = decodeURIComponent(req.params.facility);
    var id = decodeURIComponent(req.params.controller);
    
    var update;
    if (req.params.addOrRemove == 'add') {
      // Build empty 5x5 layout map for unmapped server cabinet group
      var defaultWidth = 2;
      var numSensorsPerCabinet = 5;
      var layout = [];
      var bus = [];
      var addr = [];
      for (var i = 0; i < numSensorsPerCabinet; i++) {
        bus.push(0);
        addr.push(0);
      }
      var cabinet = {bus: bus, addr: addr};
      for (var j = 0; j < defaultWidth; j++) {
        layout.push(cabinet);
      }
      
      update = {$addToSet: {
        controllers: {
          id: id, 
          name: id, 
          width: defaultWidth,
          layout: layout
        }
      }};
    }
    else if (req.params.addOrRemove == 'remove') {
      update = {$pull: {controllers: {id: id}}};
    }
    else {
      res.status(400).send();
      return;
    }
    Facility.update({name: facility},
                    update,
                    function (err) {
                      if (err)
                        res.sendStatus(500);
                      else
                        res.end();
                    });
  }
  checkSessionStatus(res, ticket, accessLevel, ifAuthorized);
});


app.post('/facilities/:facility/controllers/update', function (req, res) {
  console.log(req.body.controller);
  var ticket = req.body.ticket;
  var accessLevel = accessLevels.user;
  function ifAuthorized() {
    var user = ticket.username;
    var controller = req.body.controller;
    function ifOwner() {
      var facility = decodeURIComponent(req.params.facility);
      Facility.findOne({'controllers.id': controller.id}, 'controllers', function (err, record) {
        if (err)
          res.sendStatus(500);
        else {
          var newRecord = controller;
          var update = {$set: {"controllers.$": newRecord}};
          Facility.update({name: facility, 'controllers.id': controller.id}, update, function (err, newController) {
            if (err)
              res.sendStatus(500);
            else {
              res.send({newController: newRecord});
            }
          });
        }
      });
    }
    checkControllerAccess(res, controller.id, user, ifOwner);
  }
  checkSessionStatus(res, ticket, accessLevel, ifAuthorized);
});


app.post('/facilities/:facility/controllers/layout/:controller/setwidth', function (req, res) {
  var ticket = req.body.ticket;
  var accessLevel = accessLevels.user;
  function ifAuthorized() {
    var user = ticket.username;
    var controller = decodeURIComponent(req.params.controller);
    function ifOwner() {
      var newWidth = req.body.newWidth;
      var facility = decodeURIComponent(req.params.facility);
      Facility.findOne({'controllers.id': controller}, 'controllers', function (err, record) {
        if (err)
          res.sendStatus(500);
        else {
          var newRecord;
          record.controllers.forEach(function (current, index) {
            if (current.id == controller) {
              newRecord = current;
            }
          });
          newRecord.width = newWidth;
          var update = {$set: {"controllers.$": newRecord}};
          Facility.update({name: facility, 'controllers.id': controller}, update, function (err) {
            if (err)
              res.sendStatus(500);
            else {
              res.send({newName: newName});
            }
          });
        }
      });
    }
    checkControllerAccess(res, controller, user, ifOwner);
  }
  checkSessionStatus(res, ticket, accessLevel, ifAuthorized);
});

// Sends mappings from dcsense sensor board DIP switch configuration
// (represented as a 6-bit binary string) to decimal sensor address as
// stored in the Readings collection.
// e.g.: mappings['001000'] returns the decimal I2C address of a sensor board
// with only DIP switch 3 set to ON and the other 5 switches set to OFF
// Note: Only the switch configurations shown below are valid configurations.
// If a board has been configured with a switch layout not listed, it is
// improperly configured and its address is undefined.
app.get('/sensors/addressmappings', function (req, res) {
  var mappings = {
    "000000": 55,
    "000001": 53,
    "000010": 113,
    "000011": 44,
    "000100": 118,
    "000101": 40,
    "000110": 112,
    "000111": 72,
    "001000": 54,
    "001010": 46,
    "001100": 42,
    "010000": 116,
    "010001": 45,
    "010100": 115,
    "010101": 74,
    "011000": 47,
    "011100": 78,
    "100000": 119,
    "100001": 41,
    "100010": 114,
    "100011": 73,
    "101000": 43,
    "101010": 77,
    "110000": 117,
    "110001": 75,
    "111000": 79
  };
  res.send(mappings);
});


// RUNTIME


// Start server on default HTTP port (you may need root privileges for this to work)
static.listen(80);
console.log('Server running at http://localhost:80');
