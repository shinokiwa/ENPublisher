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
			return function(response, params, next) {
				response.render(template, params);
				next&&next();
			};
		},
		redirect: function (status, url) {
			return function (response,params, next) {
				response.redirect(status, url);
				next&&next();
			};
		},
		error: function(errCode) {
			return function(response, params, next) {
				response.status(errCode);
				response.render('error'+errCode.toString(), params);
				next&&next();
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