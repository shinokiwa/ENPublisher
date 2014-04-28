var Evernote = require('./evernoteComponent.js');
var Sync = require('./syncComponent.js');
var Post = require('./postComponent.js');

var stub = module.exports = function () {
	this.components = new Com();
};

var Com = function () {
	this._sync = new Sync();
	this._evernote = new Evernote();
	this._post = new Post();
};

Com.prototype.sync = function() {
	return this._sync;
};
Com.prototype.evernote = function() {
	return this._evernote;
};
Com.prototype.post = function () {
	return this._post;
};