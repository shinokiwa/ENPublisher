module.exports = function (flow, app) {
	var FlowClass = function () {
	};
	FlowClass.prototype.steps = ['Controller', 'Model', 'View'];
	FlowClass.prototype.step = doStep;
	FlowClass.prototype.flow = doFlow;
	FlowClass.prototype.use  = getComponent;
	FlowClass.prototype.app = app;
	for (var i in flow) {
		FlowClass.prototype[i] = flow[i];
	}
	return FlowClass;
};

var doStep = function (name, callback) {
	var self = this;
	return function () {
		if (self[name]) {
			var listeners=0, count = 0;
			var args = Array.prototype.slice.apply(arguments);
			args.push(function () {
				count++;
				if (count == listeners) {
					callback && 'call' in callback && callback();
				}
			});
			if ('call' in self[name]) {
				listeners = 1;
				self[name].apply(self, args);
			} else {
				var methods = new Array();
				for (var i in self[name]) {
					methods.push(self[name][i]);
				}
				listeners = methods.length;
				methods.forEach(function (m) {
					m.apply(self, args);
				});
			}
		} else {
			callback && 'call' in callback && callback();
		}
	};
};

var doFlow = function (callback) {
	var self = this;
	return function () {
		var count=0;
		var args = arguments;
		var next = function () {
			var name = self.steps[count];
			count++;
			if (name) {
				var step = self.step(name, next);
				step.apply(step, args);
			} else {
				callback && 'call' in callback && callback();
			}
		};
		next();
	};
};

var getComponent = function (name) {
	if (this.app && this.app.components && name in this.app.components) {
		if (typeof this.app.components[name] == 'function') {
			return this.app.components[name]();
		} else {
			return this.app.components[name];
		}
	}
};