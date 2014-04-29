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
	mongoose.once('Post.Save', function (input, output) {
		input.next (output.err);
	});
	var input = {
			next: next,
			self: this
	};
	var output = {
			err: null
	};
	mongoose.emit('Post.Save', input, output);
};

Post.find = function (conditions, fields, options, callback) {
	mongoose.once('Post.Find', function (input, output) {
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
	mongoose.emit('Post.Find', input, output);
};

Post.findOne = function (conditions, fields, options, callback) {
	mongoose.once('Post.FindOne', function (input, output) {
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
	mongoose.emit('Post.FindOne', input, output);
};

Post.findOneAndUpdate = function (conditions, update, options, callback) {
	mongoose.once('Post.FindOneAndUpdate', function (input, output) {
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
	mongoose.emit('Post.FindOneAndUpdate', input, output);
};

Post.remove = function (conditions, callback) {
	mongoose.once('Post.Remove', function (input, output) {
		input.callback(output.err);
	});
	var input = {
			conditions: conditions,
			callback: callback
	};
	var output = {
			err: null
	};
	mongoose.emit('Post.Remove', input, output);
};


var models = {
	Post: Post
};
