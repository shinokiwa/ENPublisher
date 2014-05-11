var Evernote = require('./evernoteComponent.js');
var Sync = require('./syncComponent.js');
var Post = require('./postComponent.js');
var Database = require('./mongooseComponent.js');
var Express = require ('./expressComponent.js');

var stub = module.exports = function () {
	var object = {};
	object.request = new Request ();
	object.response = new Response ();
	object.flow = new Flow(object.request, object.response);
	return object;
};

var Request = function () {
	this.params={};
	this.query = {};
	this.body = {};
	this.session = {};
};
var Response = function () {
	this.locals={};
};

Response.prototype.render = function () {
};

var Flow = function () {
	this.locals = {};
	this._components = {
		Database: Database,
		Express: Express,
		Sync: Sync()
	};
	this._args = Array.prototype.slice.apply(arguments);
};

Flow.prototype.next = function () {
};
Flow.prototype.action = function () {
};
Flow.prototype.redirect = function () {
};

Flow.prototype.use = function (name) {
	if (name in this._components) {
		return this._components[name].apply(this._components[name], this._args);
	}
};

Flow.prototype.setArgs = function () {
	this._args = Array.prototype.slice.apply(arguments);
};