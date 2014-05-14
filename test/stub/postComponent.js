module.exports = function () {
	return new stub();
};

var stub = function () {
	this.metaData = [ {
		guid : 'test-db-guid-01',
		title : 'Test DB Title 01!'
	} ];
	
};

stub.prototype.preGetMetaAll = function (next) {
	next();
};

stub.prototype.getMetaAll = function (next) {
	var self = this;
	this.preGetMetaAll(function () {
		next(null, self.metaData);
	});
};

stub.prototype.preSave = function (data,next) {
	next();
};

stub.prototype.save = function (data, next) {
	this.preSave(data, function (err) {
		next(err);
	});
};

stub.prototype.preRemove = function (guid,next) {
	next();
};

stub.prototype.remove = function (guid, next) {
	this.preRemove(guid, function () {
		next(null);
	});
};
