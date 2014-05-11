var EventEmitter = require('events').EventEmitter;
var mongoose = new EventEmitter();

module.exports = function () {
	return mongoose;
};

mongoose.model = function(name) {
	if (name in models) {
		return models[name];
	} else {
		return;
	}
};

var Post = function(data) {
	for (i in data) {
		this[i] = data[i];
	}
};

Post.prototype.save = function(next) {
	mongoose.once('Post.prototype.save', function(input, output) {
		input.next(output.err);
	});
	var input = {
		next : next,
		self : this
	};
	var output = {
		err : null
	};
	mongoose.emit('Post.prototype.save', input, output);
};

Post.find = function(conditions, fields, options, callback) {
	mongoose.once('Post.find', function(input, output) {
		if (typeof input.fields == 'function')
			input.fields(output.err, output.data);
		else if (typeof input.options == 'function')
			input.options(output.err, output.data);
		else if (typeof input.callback == 'function')
			input.callback(output.err, output.data);
	});
	var input = {
		conditions : conditions,
		fields : fields,
		options : options,
		callback : callback
	};
	var output = {
		err : null,
		data : null,
	};
	mongoose.emit('Post.find', input, output);
};

Post.findOne = function(conditions, fields, options, callback) {
	mongoose.once('Post.findOne', function(input, output) {
		if (typeof input.fields == 'function')
			input.fields(output.err, output.data);
		else if (typeof input.options == 'function')
			input.options(output.err, output.data);
		else if (typeof input.callback == 'function')
			input.callback(output.err, output.data);
	});
	var input = {
		conditions : conditions,
		fields : fields,
		options : options,
		callback : callback
	};
	var output = {
		err : null,
		data : null,
	};
	mongoose.emit('Post.findOne', input, output);
};

Post.findOneAndUpdate = function(conditions, update, options, callback) {
	mongoose.once('Post.findOneAndUpdate', function(input, output) {
		input.callback(output.err);
	});
	var input = {
		conditions : conditions,
		update : update,
		options : options,
		callback : callback
	};
	var output = {
		err : null
	};
	mongoose.emit('Post.findOneAndUpdate', input, output);
};

Post.remove = function(conditions, callback) {
	mongoose.once('Post.remove', function(input, output) {
		input.callback(output.err);
	});
	var input = {
		conditions : conditions,
		callback : callback
	};
	var output = {
		err : null
	};
	mongoose.emit('Post.remove', input, output);
};

Post.count = function(conditions, fields, options, callback) {
	mongoose.once('Post.count', function(input, output) {
		if (typeof input.fields == 'function')
			input.fields(output.err, output.data);
		else if (typeof input.options == 'function')
			input.options(output.err, output.data);
		else if (typeof input.callback == 'function')
			input.callback(output.err, output.data);
	});
	var input = {
		conditions : conditions,
		fields : fields,
		options : options,
		callback : callback
	};
	var output = {
		err : null,
		data : null,
	};
	mongoose.emit('Post.count', input, output);
};

Post.published = function() {
	return new Query({
		published : true
	});
};

Post.prototype.toObject = function() {
	return this;
};

var models = {
	Post : Post
};

var Query = function(conditions) {
	this._conditions = conditions;
};

Query.prototype.select = function(fields) {
	this._fields = fields;
	return this;
};

Query.prototype.setOptions = function(options) {
	this._options = options;
	return this;
};

Query.prototype.where = function (where) {
	for (var i in where) {
		this._conditions[i] = where[i];
	}
	return this;
};

Query.prototype.count = function(criteria, callback) {
	mongoose.once('Post.count', function(input, output) {
		input.callback(output.err, output.data);
	});
	var input = {
		criteria : criteria,
		conditions : this._conditions,
	};
	if (typeof criteria == 'function') {
		input.callback = criteria;
	} else if (typeof callback == 'function') {
		input.callback = callback;
	}
	var output = {
		err : null,
		data : null,
	};
	mongoose.emit('Post.count', input, output);
};
Query.prototype.findOne = function() {
	mongoose.once('Post.findOne', function(input, output) {
		input.callback(output.err, output.data);
	});
	var input = {
		conditions : this._conditions,
		fields : this._fields,
		options : this._options,
	};
	if (arguments.length == 1) {
		input.callback = arguments[0];
	} else {
		input.callback = arguments[1];
	}
	var output = {
		err : null,
		data : null,
	};
	mongoose.emit('Post.findOne', input, output);
};

Query.prototype.exec = function(callback) {
	mongoose.once('Post.find', function(input, output) {
		input.callback(output.err, output.data);
	});
	var input = {
		conditions : this._conditions,
		fields : this._fields,
		options : this._options,
		callback : callback
	};
	var output = {
		err : null,
		data : null,
	};
	mongoose.emit('Post.find', input, output);
};