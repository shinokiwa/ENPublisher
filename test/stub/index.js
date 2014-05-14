var Evernote = require('./evernoteComponent.js');
var Sync = require('../../app/components/sync.js');
var Post = require('./postComponent.js');
var Database = require('./mongooseComponent.js');
var Express = require ('./expressComponent.js');
var EventEmitter = require('events').EventEmitter;
var util = require("util");

var stub = module.exports = function () {
	var object = {};
	object.app = new App ();
	object.request = new Request ();
	object.response = new Response ();
	object.flow = new Flow(object.app, [object.request, object.response]);
	return object;
};

var App = function () {
	EventEmitter.call(this);
};
util.inherits(App, EventEmitter);
App.prototype.flow = function (flow) {
	var self = this;
	return function () {
		self.emit(flow);
	};
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

var Flow = function (app, args) {
	this.locals = {};
	this._components = {
		Database: Database,
		Express: Express,
		Sync: Sync(app),
		Evernote: Evernote()
	};
	this._args = args;
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