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

app.prototype.express = null;

app.prototype.flow = function(flow) {
	var self = this;
	return function(request, response) {
		var params = {
			request : request,
			inParams : {},
			response : response,
			outParams : {}
		};
		transaction(self, [ [ 'Before.Controller', params.request, params.inParams ],
				[ 'Controller.' + flow, params.request, params.inParams ],
				[ 'After.Controller', params.request, params.inParams ],
				[ 'Before.Model', params.inParams, params.outParams ],
				[ 'Model.' + flow, params.inParams, params.outParams ],
				[ 'After.Model', params.inParams, params.outParams ],
				[ 'Before.View', params.response, params.outParams ],
				[ 'View.' + flow, params.response, params.outParams ],
				[ 'After.View', params.response, params.outParams ]], 0);
	};
};

var transaction = function(app, params, i) {
	var next = null;
	if (params.length > i + 1) {
		next = function() {
			transaction(app, params, i + 1);
		};
	}
	var listeners = EventEmitter.listenerCount(app, params[i][0]);
	if (listeners > 0) {
		if (next) {
			var count = 0;
			params[i].push(function() {
				if (++count >= listeners) {
					process.nextTick(next);
				}
			});
		}
		app.emit.apply(app, params[i]);
	} else if (next) {
		next();
	}
};