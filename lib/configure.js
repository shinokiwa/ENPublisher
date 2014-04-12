var fs = require('fs');

var configure = module.exports = {
	isLoaded: false,
	path: '',
	values : {}
};

module.exports.load = function (filePath, next){
	delete(require.cache[configure.path]);
	configure.path = filePath;
	reload (next);
};

var reload = module.exports.reload = function (next) {
	if (configure.path) {
		delete(require.cache[configure.path]);
		fs.exists (configure.path, function (exists) {
			if (exists) {
				configure.values = require (configure.path);
				configure.isLoaded = true;
			} else {
				configure.values = {};
				configure.isLoaded = false;
			}
			next();
		});
	}
};

module.exports.save = function () {
	
};