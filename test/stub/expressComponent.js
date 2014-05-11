module.exports = function (request, response) {
	response.locals.site = {
		title: 'Test Title',
		loginId: 'TestId',
		loginPassword: 'TestPassword'
	};
	return {};
};