/**
 * ENPublisher flow controller
 * 
 * @author shinokiwa@gmail.com
 */
var EventEmitter = require('events').EventEmitter;
var util = require("util");

var App = module.exports = function() {
	EventEmitter.call(this);
	this._components = new Object();
};

util.inherits(App, EventEmitter);

App._stepNames = [ 'Controller', 'Model', 'View' ];

App.prototype.flow = function(flowName) {
	var self = this;
	return function() {
		var flow = new FlowController(self, flowName, arguments);
		flow._step();
	};
};

App.prototype.add = function(flowName, listeners) {
	var self = this;
	App._stepNames.forEach(function(step) {
		if (step in listeners) {
			var stepName = step + '.' + flowName;
			if ('call' in listeners[step]) {
				self.on(stepName, listeners[step]);
			} else {
				for(var i in listeners[step]) {
					self.on(stepName, listeners[step][i]);
				};
			}
		}
	});
	return this.flow(flowName);
};

App.prototype.process = function() {
	this.flow('StartProcess')();
};

App.prototype.set = function(name, component, args) {
	this._components[name] = component;
};

var FlowController = App.FlowController = function(app, flowName, args) {
	var self = this;
	this.name = flowName;
	this.step = 0;
	this.args = [ null, this ];
	if (args) {
		this.args = this.args.concat(Array.prototype.slice.apply(args));
	}
	this.listeners = [];
	this.doneCount = [];
	App._stepNames.forEach(function(v, i) {
		self.listeners[i] = EventEmitter.listenerCount(app, v + '.' + flowName);
		self.doneCount[i] = 0;
	});
	this.locals = {};
	this._afterCallbacks = [];
	this._doCallbacks = false;
	this._app = app;
};
FlowController.prototype._step = function() {
	if (this.step < App._stepNames.length) {
		if (this.listeners[this.step]) {
			this.args[0] = App._stepNames[this.step] + '.' + this.name;
			this._app.emit.apply(this._app, this.args);
		} else {
			this.step++;
			this._step();
		}
	}
};
FlowController.prototype.next = function() {
	if (!this._doCallbacks) {
		this.doneCount[this.step]++;
	}
	if (this.doneCount[this.step] > this.listeners[this.step]) {
		// TODO: error
	} else if (this.doneCount[this.step] == this.listeners[this.step]) {
		if (this._afterCallbacks.length) {
			this._doCallbacks = true;
			var callback = this._afterCallbacks.shift();
			var args = this.args.slice(1);
			process.nextTick(function() {
				callback.apply(callback, args);
			});
		} else {
			this._doCallbacks = false;
			this.step++;
			this._step();
		}
	}
};
FlowController.prototype.after = function(callback) {
	if (typeof callback == 'function') {
		this._afterCallbacks.push(callback);
	}
};

FlowController.prototype.redirect = function(flowName) {
	this.next = function () {};
	var self = this;
	process.nextTick(function () {
		var flow = self._app.flow(flowName);
		flow.apply(self._app, self.args.slice(2));
	});
};

FlowController.prototype.async = function(flowName) {
	return this._app.flow(flowName);
};

FlowController.prototype.use = function(name) {
	if (name in this._app._components) {
		var com = this._app._components[name];
		return com.apply(com, this.args.slice(2));
	}
};
