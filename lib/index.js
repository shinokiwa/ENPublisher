/**
 * ENPublisher main module
 * 
 * @author shinokiwa@gmail.com
 */
var EventEmitter = require('events').EventEmitter;
var util = require("util");

var app = module.exports =function () {
	EventEmitter.call(this);

	this.on('Flow', function(i,o, next) {
		next();
	});

	this.on('Controller', function(i,o, next) {
		next();
	});

	this.on('Model', function(i,o, next) {
		next();
	});

	this.on('View', function(i,o, next) {
		next();
	});
};

util.inherits(app, EventEmitter);

app.prototype.init = function() {
	var controller = require('lib/controller.js');
	controller(this);

	var model = require('lib/model.js');
	model(this);

	var view = require('lib/view.js');
	view(this);
	return this;
};

app.prototype.flow = function(flow) {
	var self = this;
	return function(request, response) {
		var params = {
			request : request,
			inParams : {},
			response : response,
			outParams : {}
		};
		emit(self, 'Flow', flow, params, doController(self, flow, params));
	};
};

var doController = function(app, flow, params) {
	return function () {
		emit(app, 'Controller', flow, params, function () {
			var flowName = 'Controller.' + flow;
			app.once(flowName, function (i, o, next){
				next();
			});
			emit(app, flowName, params.request, params.inParams, doModel(app, flow, params));
		});
	};
};

var doModel = function(app, flow, params) {
	return function () {
		emit(app, 'Model', flow, params, function () {
			var flowName = 'Model.' + flow;
			app.once(flowName, function (i, o, done){
				done();
			});
			emit(app, flowName, params.inParams, params.outParams, doView(app, flow, params));
		});
	};
};

var doView = function(app, flow, params) {
	return function () {
		emit(app, 'View', flow, params, function () {
			var flowName = 'View.' + flow;
			app.emit(flowName, params.response, params.outParams);
		});
	};
};

var emit = function (app, flow, p1, p2, next) {
	var count = 0;
	var listeners = EventEmitter.listenerCount(app, flow);
	app.emit(flow, p1, p2, function () {
		if (++count >= listeners) {
			process.nextTick(next);
		}
	});
};


