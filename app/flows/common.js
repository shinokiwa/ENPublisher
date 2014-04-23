module.exports.controller = {
		requireAuth: function (request, input, next) {
			if ('login' in request.session) {
				input.login = (request.session.login == true);
			} else {
				input.login = false;
			}
			next&&next();
		}
};

module.exports.model = {
		requireAuth: function (input, output, next) {
			output.login = input.login;
			next&&next();
		}
};

module.exports.view = {
		template: function(template) {
			return function(response, params) {
				response.render(template, params);
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
		},
		requireAuth: function (template) {
			return function (response, output, next) {
				if (output.login) {
					response.render(template, output);
				} else {
					response.redirect(302, '/setting/login/');
				}
				next&&next();			
			};
		}
};