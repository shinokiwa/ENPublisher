module.exports.View = function (flow) {
	flow.after (function (flow) {
		flow.redirect('LoadConfig');
	});
	flow.next();
};