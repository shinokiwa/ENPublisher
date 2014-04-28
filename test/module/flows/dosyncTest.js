var flow = require('../../../app/flows/dosync.js');

describe('flows.dosync', function() {
	describe('#model(input,output,next)', function () {
		it('ログイン時のみ、syncコンポーネントのdoSyncAllを呼び出す。', function (done) {
			var check = false;
			var input = {
					login: true,
					components: {
						sync: function (){
							return {
								doSyncAll: function () {
									check = true;
								}
							};
						}
					}
			};
			var output = {};
			flow.model (input, output, function () {});
				check.should.be.ok;
				done();
		});
	});
});