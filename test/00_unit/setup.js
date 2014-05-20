/**
 * Setup unit test author shinokiwa@gmail.com
 */
require ('./data/evernote.js');

var testRequire = function (mod) {
	if (process.env.TEST_COV) {
		return require(__dirname+'/../../app-cov/'+mod);
	} else {
		return require(__dirname+'/../../app/'+mod);
	}
};

var ENPublisher = testRequire('index.js');
var App = testRequire('app.js');

var Request = function() {
	this.params = {};
	this.query = {};
	this.body = {};
	this.session = {};
};
var Response = function() {
	this.locals = {};
};

module.exports = function(callback) {
	var suite = {};
	suite.app = ENPublisher.create(__dirname + '/unittest.configure.json');
	suite.flow = new App.FlowController(suite.app);
	suite.request = new Request();
	suite.response = new Response();
	suite.require = testRequire;
	if (callback) {
		suite.app.once('View.LoadConfig', function (flow) {
			callback();
			flow.next();
		});
		suite.app.flow('LoadConfig')();
	}
	return suite;
};
