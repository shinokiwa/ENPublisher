module.exports.view = {
		template: function(template) {
			return function(response, params) {
				response.render('index', params);
			};
		},
		redirect: function (status, url) {
			return function (response,params) {
				response.redirect(status, url);
			};
		},
		error: function(errCode) {
			return function(response, params) {
				response.status(errCode);
				response.render('error'+errCode.toString(), params);
			};
		}
};