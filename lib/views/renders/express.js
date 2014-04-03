module.exports.template = function(template) {
	return function (response, params) {
		response.render(template, params);
	};
};
