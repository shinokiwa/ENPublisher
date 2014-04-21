var App = require('../lib/app.js');
require('should');

describe('App', function() {
	describe('#flow()', function() {
		it('C->M->Vの順で、フローにバインドされた全てのイベントリスナを順に実行する。',
				function(done) {
					var app = new App();
					var events = new Array();
					var check = function (ev) {
						app.on(ev, function (i,o,next) {
							events.push(ev);
							next && next();
						});
					};
					check('Before.Controller');
					check('Controller.Index');
					check('After.Controller');
					check('Before.Model');
					check('Model.Index');
					check('After.Model');
					check('Before.View');
					check('View.Index');
					check('After.View');
					app.once('After.View', function(i,o,next) {
						process.nextTick(function() {
							events[0].should.equal('Before.Controller');
							events[1].should.equal('Controller.Index');
							events[2].should.equal('After.Controller');
							events[3].should.equal('Before.Model');
							events[4].should.equal('Model.Index');
							events[5].should.equal('After.Model');
							events[6].should.equal('Before.View');
							events[7].should.equal('View.Index');
							events[8].should.equal('After.View');
							next&&next();
							done();
						});
					});
					app.flow('Index')({}, {});
				});
		it('コントローライベントにはflowの第一引数とInputオブジェクトが渡される。');
		it('モデルイベントにはInputオブジェクトとOutputオブジェクトが渡される。');
		it('ビューイベントには実行時の第二引数とOutputオブジェクトが渡される。');
		it('同名のパラメータはイベント間で引き継がれるので、受け渡しができる。', function(done) {
			var app = new App();
			app.on('Controller.Index', function(request, params, next) {
				params.ControllerValue = 'test';
				next();
			});
			app.on('Model.Index', function(reqParams, resParams, next) {
				reqParams.ControllerValue.should.equal('test');
				resParams.ModelValue = reqParams.ControllerValue;
				next();
			});
			app.on('View.Index', function(response, params) {
				params.ModelValue.should.equal('test');
				done();
			});
			app.flow('Index')({}, {});
		});
		it('引数nextを使うことで、イベント内で非同期処理を実行できる。',
				function(done) {
					var app = new App();
					app.on('Controller.Index', function(request, params, next) {
						process.nextTick(function() {
							params.cTickValue = 'cTick!';
							next();
						});
					});
					app.on('Controller.Index', function(request, params, next) {
						var fs = require('fs');
						fs.exists(__dirname + '/indexTest.js',
								function(exists) {
									params.cFSValue = 'cFS!';
									next();
								});
					});
					app.on('Model.Index', function(reqParams, resParams, next) {
						reqParams.cTickValue.should.equal('cTick!');
						reqParams.cFSValue.should.equal('cFS!');
						process.nextTick(function() {
							resParams.mTickValue = 'mTick!';
							next();
						});
					});
					app.on('Model.Index', function(reqParams, resParams, next) {
						var fs = require('fs');
						fs.exists(__dirname + '/indexTest.js',
								function(exists) {
									resParams.mFSValue = 'mFS!';
									next();
								});
					});
					app.on('View.Index', function(response, params) {
						params.mTickValue.should.equal('mTick!');
						params.mFSValue.should.equal('mFS!');
						done();
					});
					app.flow('Index')({}, {});
				});
	});
	describe('#addFlow()', function() {
		it('フローにリスナを一括登録する。', function (done) {
			var app = new App();
			var count = 0;
			var listener = function (inc) {
				return function (i, o, next) {
					count+=inc;
					next();
				};
			};
			app.addFlow('Index', listener(1), listener(2), listener(4));
			app.on('After.View', function (i,o,next) {
				count.should.equal(7);
				next();
				done();
			});
			app.flow('Index')({}, {});
		});
		it('戻り値はflow(フロー名)の戻り値となるので、そのまま実行可能。', function (done) {
			var app = new App();
			app.addFlow('Index', function (i,o,next) {
				done();
				next();
			})({},{});
		});
		it('第一引数はフロー名になる。', function (done) {
			var app = new App();
			app.addFlow('TestFlow', function (i,o,next) {
				done();
				next();
			});
			app.flow('TestFlow')({},{});
		});
		it('第二引数は省略可能。', function (done) {
			var app = new App();
			app.on('View.Index', function (i,o,next) {
				done();
				next();
			});
			app.addFlow('Index')({},{});
		});
		it('第二引数はコントローラのリスナを指定。', function (done) {
			var app = new App();
			app.addFlow('TestFlow', function () {
				done();
			});
			app.emit('Controller.TestFlow');
		});
		it('第三引数は省略可能。', function (done) {
			var app = new App();
			var n = function (i, o, next) {
				next();
			};
			app.on('After.View', function (i,o,next) {
				done();
				next();
			});
			app.addFlow('Index', n)({},{});
		});
		it('第三引数はモデルのリスナを指定。', function (done) {
			var app = new App();
			app.addFlow('TestFlow',null, function () {
				done();
			});
			app.emit('Model.TestFlow');
		});
		it('第四引数は省略可能。', function (done) {
			var app = new App();
			var n = function (i, o, next) {
				next();
			};
			app.on('After.View', function (i,o,next) {
				done();
				next();
			});
			app.addFlow('Index', n, n)({},{});
		});
		it('第四引数はビューのリスナを指定。', function (done) {
			var app = new App();
			app.addFlow('TestFlow',null,null, function () {
				done();
			});
			app.emit('View.TestFlow');
		});
	});
});