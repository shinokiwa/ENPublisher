var Output = module.exports = function (request) {
	this.session = function () {
		return request.session;
	};
};
