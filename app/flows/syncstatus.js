var common = require ('./common.js');

module.exports.controller = common.controller.requireAuth;
module.exports.model = function (input, output, next) {
	common.model.requireAuth(input, output, function () {
		var sync = input.components.sync();
		output.status = sync.status.string;
		output.queue = sync.queuedNotes;
		output.message = sync.message;
		output.error = sync.error;
		next();
	});
};
module.exports.view = common.view.requireAuth('setting/sync');