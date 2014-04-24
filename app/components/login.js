module.exports = function (ID, Password) {
	return function () {
		return {
			ID: ID,
			Password: Password
		};
	};
};