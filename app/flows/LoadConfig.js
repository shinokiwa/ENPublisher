module.exports = function (configurePath) {
	return {
		Controller: function (flow) {
			var fs = require ('fs');
			
			delete (require.cache[configurePath]);
			if (fs.existsSync(configurePath)) {
				flow.locals.configure = require (configurePath);
			} else {
				flow.locals.configure = {};
			}
			flow.next();
		},
		Model: function (flow, obj) {
			flow.next();
		}
	};
};
