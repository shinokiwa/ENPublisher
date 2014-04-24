module.exports = function (request) {
	return function () {
		return request.session;
	};
};