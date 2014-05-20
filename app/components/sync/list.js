var List = module.exports = function () {
	this._list = {};
};

List.prototype.add = function (key, body) {
	if (key) {
		this._list[key] = body;
	}
};
List.prototype.remove = function (key) {
	if (key) {
		delete(this._list[key]);
	}
};
List.prototype.get = function () {
	for (var i in this._list) {
		return {
			key: i,
			body: this._list[i]
		};
	}
};
List.prototype.all = function () {
	var all = new Array();
	for (var i in this._list) {
		all.push({
			key: i,
			body: this._list[i]
		});
	}
	return all;
};
List.prototype.count = function () {
	var count = 0;
	for (var i in this._list) {
		i && count++;
	}
	return count;
};