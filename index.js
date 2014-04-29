var ENPublisher = require('./app/index.js');
var app = ENPublisher.create (__dirname + '/configure.json');

app.process();