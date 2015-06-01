// Thanks to https://github.com/0dp/generator-wp-bones for this nuts
// and bolts of this

'use strict';

// dependancies
var RSVP = require('rsvp');
var simpleGit = require('simple-git')();
var tmp = require('temporary');

// Rhapsody git repo url
var rhapsody = 'git://github.com/seafarer/rhapsody.git';

// Configure RSVP promise to yell when something goes wrong
// --------------------------------------------------------
RSVP.on('error', function (event) {
  console.log(event.message);
  console.log(event.stack);
});


var cloneRhapsody = function () {
  var promise = new RSVP.Promise(function (resolve, reject) {
    // Let's create a temporary directory
    var dir = new tmp.Dir();
    // then we clone into our new tempory directory
    simpleGit.clone(rhapsody, dir.path, function (err) {
      if (err) {
        // something wrong? tell RSVP
        return reject(err);
      }
      // good! everthing is okey, we can go on :D
      return resolve(dir.path);
    });
  });
  return promise;
};

// export our module outside :)
module.exports = cloneRhapsody;
