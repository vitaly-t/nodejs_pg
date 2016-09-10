'use strict';

var express = require('express');
var router = express.Router();
var path = require('path');
var pg = require('pg');
var connectionString = require('../config.js')

var pgpLib = require('pg-promise');
var monitor = require('pg-monitor');
 
// pg-promise initialization options:
var options = {
    capTX: true, // capitalize transaction commands;
    extend: function () {
        // our 'notes' repository extension:
        this.notes = repNotes(this);
    }
};
 
monitor.attach(options); // attaching to all events;
monitor.setTheme('matrix'); // changing default theme;
 
var pgp = pgpLib(options); // initializing pg-promise;
 
// instantiating the database:
var db = pgp(connectionString);
console.log('FATTO')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views', 'index.html'));
});

router.post('/api/v1/todos', function(req, res) {

  var results = [];

  // Grab data from http request
  var dataReceived = {text: req.body.text, complete: false};

  db.notes.add(dataReceived.text, dataReceived.complete)
  .then(results => {
      console.log("RESULTS:", results);
      return res.json(results);
  });

});

router.get('/api/v1/todos/count', function(req, res, next) {
  var results = [];

  db.notes.count()
  .then(results => {
      console.log("RESULTS:", results);
      return res.json(results);
  });

});

router.post('/api/v1/todos/find', function(req, res, next) {
  var results = [];

  // Grab data from http request
  var dataReceived = {idNotes: req.body.idNotes};

  db.notes.findById(dataReceived.idNotes)
  .then(results => {
      console.log("RESULTS:", results);
      return res.json(results);
  });
});


// Note repository
function repNotes(obj) {
  return {
      
    add: function (text, complete) {
      return obj.one("INSERT INTO items(text, complete) VALUES($1, $2) RETURNING id", [text, complete], i=>i.id);
    },
   	// Get number of notes
    count: function () {
      return obj.one("SELECT count(*) FROM items", [], i=>+i.count);
    },
    // Find notes by id
    findById: function (idNotes) {
      return obj.map("SELECT text from items WHERE id = $1", idNotes, i=>i.text);
    }
      
  }
}

module.exports = router;
