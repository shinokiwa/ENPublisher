/**
 * ENPublisher flow controller
 * 
 * @author shinokiwa@gmail.com
 */
var EventEmitter = require('events').EventEmitter;
var util = require("util");

var app = module.exports = function() {
	EventEmitter.call(this);
};

util.inherits(app, EventEmitter);

app.prototype.process = function() {
	transaction(this, [ [ 'Initialize' ], [ 'Process' ] ], 0);
};

app.prototype.flow = function(flow) {
	var self = this;
	return function(request, response) {
		var input = {};
		var output = {};
		transaction(self, [
		                   [ 'Before.Controller', request, input ],
		                   [ 'Controller.' + flow, request, input ],
		                   [ 'After.Controller', request, input ],
		                   [ 'Before.Model', input, output ],
		                   [ 'Model.' + flow, input, output ],
		                   [ 'After.Model', input, output ],
		                   [ 'Before.View', response, output ],
		                   [ 'View.' + flow, response, output ],
		                   [ 'After.View', response, output ]
		                   ], 0);
	};
};

app.prototype.addFlow = function(flow, listeners) {
	listeners.controller && this.on('Controller.' + flow, listeners.controller);
	listeners.model && this.on('Model.' + flow, listeners.model);
	listeners.view && this.on('View.' + flow, listeners.view);
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