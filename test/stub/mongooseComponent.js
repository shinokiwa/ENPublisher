var EventEmitter = require ('events').EventEmitter;
var mongoose = module.exports = new EventEmitter();

mongoose.model = function (name) {
	if (name in models) {
		return models[name];
	} else {
		return;
	}
};

module.exports = function () {
	return mongoose;
};

var Post = function (data) {
	for (i in data) {
		this[i] = data[i];
	}
};

Post.prototype.save = function (next) {
	mongoose.once('Post.prototype.save', function (input, output) {
		input.next (output.err);
	});
	var input = {
			next: next,
			self: this
	};
	var output = {
			err: null
	};
	mongoose.emit('Post.prototype.save', input, output);
};

Post.find = function (conditions, fields, options, callback) {
	mongoose.once('Post.find', function (input, output) {
		if (typeof input.fields == 'function') input.fields(output.err, output.data);
		else if (typeof input.options == 'function') input.options (output.err, output.data);
		else if (typeof input.callback == 'function') input.callback (output.err, output.data);
	});
	var input = {
			conditions: conditions,
			fields: fields,
			options: options,
			callback: callback
	};
	var output = {
			err: null,
			data: null,
	};
	mongoose.emit('Post.find', input, output);
};

Post.findOne = function (conditions, fields, options, callback) {
	mongoose.once('Post.findOne', function (input, output) {
		if (typeof input.fields == 'function') input.fields(output.err, output.data);
		else if (typeof input.options == 'function') input.options (output.err, output.data);
		else if (typeof input.callback == 'function') input.callback (output.err, output.data);
	});
	var input = {
			conditions: conditions,
			fields: fields,
			options: options,
			callback: callback
	};
	var output = {
			err: null,
			data: null,
	};
	mongoose.emit('Post.findOne', input, output);
};

Post.findOneAndUpdate = function (conditions, update, options, callback) {
	mongoose.once('Post.findOneAndUpdate', function (input, output) {
		input.callback(output.err);
	});
	var input = {
			conditions: conditions,
			update: update,
			options: options,
			callback: callback
	};
	var output = {
			err: null
	};
	mongoose.emit('Post.findOneAndUpdate', input, output);
};

Post.remove = function (conditions, callback) {
	mongoose.once('Post.remove', function (input, output) {
		input.callback(output.err);
	});
	var input = {
			conditions: conditions,
			callback: callback
	};
	var output = {
			err: null
	};
	mongoose.emit('Post.remove', input, output);
};

Post.count = function (conditions, fields, options, callback) {
	mongoose.once('Post.count', function (input, output) {
		if (typeof input.fields == 'function') input.fields(output.err, output.data);
		else if (typeof input.options == 'function') input.options (output.err, output.data);
		else if (typeof input.callback == 'function') input.callback (output.err, output.data);
	});
	var input = {
			conditions: conditions,
			fields: fields,
			options: options,
			callback: callback
	};
	var output = {
			err: null,
			data: null,
	};
	mongoose.emit('Post.count', input, output);
};

Post.prototype.toObject = function () {
	return this;
};

var models = {
	Post: Post
};
