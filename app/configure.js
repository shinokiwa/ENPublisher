var fs = require('fs');

var Configure = module.exports = function(filePath) {
	this.filePath = filePath;
	this.reload();
};

Configure.prototype.filePath = null;
Configure.prototype.values = {};

Configure.prototype.reload = function() {
	delete (require.cache[this.filePath]);
	if (fs.existsSync(this.filePath)) {
		this.values = require (this.filePath);
	} else {
		this.values = {};
	}
};

module.exports.save = function() {

};

Configure.prototype.get = function (key) {
	if (key in this.values) {
		return this.values[key];
	} else {
		return;
	}
	
}