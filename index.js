var ENPublisher = require('./app/index.js');
var path = require('path');
var app = ENPublisher.create (path.join(__dirname ,'/configure.json'));

app.process();