/**
 * ENPublisher flow controller
 * 
 * @author shinokiwa@gmail.com
 */
var Flow = require ('./app/FlowClass.js');

var App = module.exports = function(configure) {
	this.components = new Object();
	this.flows = new Object();
	this._configure = configure;
	this.readyState = 0;
};

App.prototype.add = function(name, object) {
	this.flows[name] = Flow(object, this);
	return this.flows[name];
};

App.prototype.flow = function(name, callback) {
	if (this.flows[name]) {
		var flow = new this.flows[name]();
		return flow.flow(callback);
	} else {
		return function () {
			callback&&'call' in callback && callback();
		};
	}
};

App.prototype.set = function(name, component, args) {
	this.components[name] = component;
};

App.prototype.configure = function (listener) {
	if (!this.flows.Configure) {
		var self = this;
		this.add('Configure', {
			steps: ['Load', 'Configure', 'Ready'],
			Load: function (configure, next) {
				self.readyState = 0;
				next();
			},
			Configure: [],
			Ready: function (configure, next) {
				self.readyState = 1;
				next();
			},
		});
	}
	this.flows.Configure.prototype.Configure.push(listener);
};

App.prototype.ready = function (listener) {
	if (!this.flows.Ready) {
		this.add('Ready', {
			steps: ['Ready'],
			Ready: []
		});
	}
	this.flows.Ready.prototype.Ready.push(listener);
	if (this.readyState == 1) {
		listener(function () {});
	}
};

App.prototype.process = function () {
	var ready = this.flow('Ready');
	if ('Configure' in this.flows) {
		var configure = this.flow('Configure', ready);
		delete (require.cache[this._configure]);
		configure(require (this._configure));
	} else {
		this.readyState = 1;
		ready();
	}
};