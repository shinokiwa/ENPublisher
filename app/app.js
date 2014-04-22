/**
 * ENPublisher flow controller
 * 
 * @author shinokiwa@gmail.com
 */
var EventEmitter = require('events').EventEmitter;
var util = require("util");
var Input = require('./input.js');
var Output = require('./output.js');

var app = module.exports = function() {
	EventEmitter.call(this);
};

util.inherits(app, EventEmitter);

app.prototype.express = null;

app.prototype.flow = function(flow) {
	var self = this;
	return function(request, response) {
		var input = new Input (request);
		var output = new Output ();
		transaction(self, [ [ 'Before.Controller', request, input ],
				[ 'Controller.' + flow, request, input ],
				[ 'After.Controller', request, input ],
				[ 'Before.Model', input, output ],
				[ 'Model.' + flow, input, output ],
				[ 'After.Model', input, output ],
				[ 'Before.View', response, output ],
				[ 'View.' + flow, response, output ],
				[ 'After.View', response, output ]], 0);
	};
};

app.prototype.addFlow = function (flow, controller, model, view) {
	if (controller) {
		this.on('Controller.'+flow, controller);
	}
	if (model) {
		this.on('Model.'+flow, model);
	}
	if (view) {
		this.on('View.'+flow, view);
	}
	return this.flow(flow);
};

var transaction = function(app, params, i) {
	if (i >= params.length) {
		return;
	}
	var next = function() {
		transaction(app, params, i + 1);
	};
	var listeners = EventEmitter.listenerCount(app, params[i][0]);
	if (listeners > 0) {
		var count = 0;
		params[i].push(function() {
			if (++count >= listeners) {
				process.nextTick(next);
			}
		});
		app.emit.apply(app, params[i]);
	} else {
		next();
	}
};