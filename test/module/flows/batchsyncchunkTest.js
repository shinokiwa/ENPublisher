var flow = require('../../../app/flows/batchsyncchunk.js');
var Input = require ('../../stub/input.js');
var input, sync,evernote,output;
var clear = function () {
	input = new Input();
	sync = input.components.sync();
	evernote = input.components.evernote();
	output = {};
};

describe('flows.batchsyncchunk', function() {
	describe('#model(input,output,next)', function(done) {
		it('SyncコンポーネントのUSNとEvernoteのUSNを比較して、Evernote側が大きい時に差分を同期する。');
	});
});