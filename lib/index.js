/**
 * ENPublisher main module
 * 
 * @author shinokiwa@gmail.com
 */
var EventEmitter = require('events').EventEmitter;
var util = require("util");

var app = module.exports =function () {
	EventEmitter.call(this);

	this.on('Flow', function(params) {
		var self = this;
		process.nextTick(function() {
			self.emit('Controller', params);
		});
	});

	this.on('Controller', function(params) {
		var self = this;
		process.nextTick(function() {
			var flow = 'Controller.' + params.flow;
			self.once(flow, function() {
				process.nextTick(function() {
					self.emit('Model', params);
				});
			});
			self.emit(flow, params.request, params.requestParams);
		});
	});

	this.on('Model', function(params) {
		var self = this;
		process.nextTick (function () {
			var flow = 'Model.' + params.flow;
			self.once(flow, function() {
				process.nextTick(function() {
					self.emit('View', params);
				});
			});
			self.emit(flow, params.requestParams, params.responseParams);
		});
	});

	this.on('View', function(params) {
		var self = this;
		process.nextTick (function () {
			var flow = 'View.' + params.flow;
			self.emit(flow, params.response, params.responesParams);
		});
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
			flow : flow,
			request : request,
			requestParams : {},
			response : response,
			responseParams : {}
		};
		self.emit('Flow', params);
	};
};
