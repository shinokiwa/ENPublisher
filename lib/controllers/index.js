module.exports = function (req, prm, next) {
	prm.page = 0;
	next();
};
