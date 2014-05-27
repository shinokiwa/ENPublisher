var lib = require('./testlib.js');
var chai = lib.chai;
var expect = chai.expect;
var Flow = lib.require('app/FlowClass.js');
var App = lib.require('app.js');

describe('app/FlowClass', function() {
	it('オブジェクトとAppインスンタンスからフロークラスを生成する。', function() {
		var app = new App();
		var flow = Flow({}, app);
		expect(flow).to.a('function');
		expect(flow.prototype.app).to.eql(app);
	});
	describe('#FlowClass', function() {
		it('フロークラスのインスタンスは、createに引き渡したフィールド、メソッドを持つ。', function() {
			var obj = {
				Step : 'abc',
				Controller : function() {
				},
				Model : function() {
				},
				View : function() {
				}
			};
			var FlowClass = Flow(obj);
			var flow = new FlowClass();
			expect(flow).to.have.property('Controller').that.is.a('function');
			expect(flow).to.have.property('Model').that.is.a('function');
			expect(flow).to.have.property('View').that.is.a('function');
			expect(flow).to.have.property('Step').that.is.eql('abc');
		});
		it('生成したフロークラスは、他のフロークラスの属性は持たない。', function() {
			var obj1 = {
				Step : 'abc',
				Controller : function() {
				},
				Model : function() {
				},
				View : function() {
				}
			};
			var obj2 = {
				input: function () {},
				output: function () {}
			};

			var FlowClass1 = Flow(obj1);
			var FlowClass2 = Flow(obj2);

			var flow1 = new FlowClass1();
			var flow2 = new FlowClass2();

			expect(flow1).to.have.property('Controller').that.is.a('function');
			expect(flow1).to.have.property('Model').that.is.a('function');
			expect(flow1).to.have.property('View').that.is.a('function');
			expect(flow1).to.have.property('Step').that.is.eql('abc');
			expect(flow1).to.not.have.property('input');
			expect(flow1).to.not.have.property('output');

			expect(flow2).to.not.have.property('Controller');
			expect(flow2).to.not.have.property('Model');
			expect(flow2).to.not.have.property('View');
			expect(flow2).to.have.property('input').that.is.a('function');
			expect(flow2).to.have.property('output').that.is.a('function');
		});
		describe('#step(name, callback)', function() {
			it('指定したメソッドをステップとして実行する関数を返す。実行後はコールバックを実行する。', function(done) {
				var check = false;
				var obj = {
					Controller : function(next) {
						check = true;
						next();
					}
				};
				var FlowClass = Flow(obj);
				var flow = new FlowClass();
				var step = flow.step('Controller', function() {
					expect(check).to.eql(true);
					done();
				});
				expect(step).to.be.a('function');
				step();
			});
			it('コールバックを渡さない場合はそのまま完了する。', function() {
				var check = false;
				var obj = {
					Controller : function() {
						check = true;
					}
				};
				var FlowClass = Flow(obj);
				var flow = new FlowClass();
				flow.step('Controller')();
				expect(check).to.eql(true);
			});
			it('指定メソッドには次の処理に進むためのコールバック関数が渡される。', function() {
				var check = false;
				var obj = {
					Controller : function(next) {
						check = true;
						next();
					}
				};
				var FlowClass = Flow(obj);
				var flow = new FlowClass();
				flow.step('Controller')();
				expect(check).to.eql(true);
			});
			it('戻り値への引数が実際に実行されるメソッドへの引数になる。コールバック関数は末尾に付与される。', function() {
				var check = false;
				var obj = {
					Controller : function(arg1, arg2, next) {
						expect(arg1).to.eql('test1');
						expect(arg2).to.eql('test2');
						check = true;
						next();
					}
				};
				var FlowClass = Flow(obj);
				var flow = new FlowClass();
				flow.step('Controller')('test1', 'test2');
				expect(check).to.eql(true);
			});
			it('実行されるメソッド内ではthisでフローインスタンスの参照ができる。', function() {
				var obj = {
					check : false,
					Controller : function() {
						this.check = true;
					}
				};
				var FlowClass = Flow(obj);
				var flow = new FlowClass();
				flow.step('Controller')();
				expect(flow.check).to.eql(true);
			});
			it('実行メソッドは配列で複数指定できる。全ての関数がコールバックを実行した時点で完了となる。', function() {
				var obj = {
					Controller : [ function(next) {
						this.check1 = true;
						next();
					}, function(next) {
						this.check2 = true;
						next();
					}, function(next) {
						this.check3 = true;
						next();
					} ]
				};
				var FlowClass = Flow(obj);
				var flow = new FlowClass();
				flow.step('Controller')();
				expect(flow.check1).to.eql(true);
				expect(flow.check2).to.eql(true);
				expect(flow.check3).to.eql(true);
			});
			it('オブジェクトでも同様に複数指定できる。', function() {
				var obj = {
					Controller : {
						'test1' : function(next) {
							this.check1 = true;
							next();
						},
						'test2' : function(next) {
							this.check2 = true;
							next();
						},
						'test3' : function(next) {
							this.check3 = true;
							next();
						}
					}
				};
				var FlowClass = Flow(obj);
				var flow = new FlowClass();
				flow.step('Controller')();
				expect(flow.check1).to.eql(true);
				expect(flow.check2).to.eql(true);
				expect(flow.check3).to.eql(true);
			});
			it('ステップ内で非同期処理を行っても、全てのメソッドの完了を待ってからコールバックを実行する。', function(done) {
				var obj = {
					Controller : [ function(next) {
						var self = this;
						process.nextTick(function() {
							self.check1 = true;
							next();
						});
					}, function(next) {
						var self = this;
						setTimeout(function() {
							self.check2 = true;
							next();
						}, 0);
					}, function(next) {
						this.check3 = true;
						next();
					} ]
				};
				var FlowClass = Flow(obj);
				var flow = new FlowClass();
				flow.step('Controller', function() {
					expect(flow.check1).to.eql(true);
					expect(flow.check2).to.eql(true);
					expect(flow.check3).to.eql(true);
					done();
				})();
			});
			it('ステップが存在しなければ何もしない。', function(done) {
				var FlowClass = Flow({});
				var flow = new FlowClass();
				flow.step('Controller', function() {
					done();
				})();
			});
		});
		describe('#flow(callback)', function() {
			it('steps属性の値順にstepを実行する関数を返す。全て終了したらコールバックを実行する。', function(done) {
				var obj = {
					steps : [ 'test1', 'test2', 'test3' ],
					'test1' : function(next) {
						this.check1 = true;
						next();
					},
					'test2' : function(next) {
						this.check2 = true;
						next();
					},
					'test3' : function(next) {
						this.check3 = true;
						next();
					}
				};
				var FlowClass = Flow(obj);
				var flow = new FlowClass();
				flow.flow(function() {
					expect(flow.check1).to.eql(true);
					expect(flow.check2).to.eql(true);
					expect(flow.check3).to.eql(true);
					done();
				})();
			});
			it('コールバックを渡さない場合はそのまま完了する。', function() {
				var obj = {
					steps : [ 'test1', 'test2', 'test3' ],
					'test1' : function(next) {
						next();
					},
					'test2' : function(next) {
						next();
					},
					'test3' : function(next) {
						next();
					}
				};
				var FlowClass = Flow(obj);
				var flow = new FlowClass();
				flow.flow()();
			});
			it('戻り値への引数がステップメソッドへの引数になる。', function(done) {
				var obj = {
					steps : [ 'test1', 'test2', 'test3' ],
					'test1' : function(arg1, arg2, next) {
						expect(arg1).to.eql('arg1');
						expect(arg2).to.eql('arg2');
						this.check1 = true;
						next();
					},
					'test2' : function(arg1, arg2, next) {
						expect(arg1).to.eql('arg1');
						expect(arg2).to.eql('arg2');
						this.check2 = true;
						next();
					},
					'test3' : function(arg1, arg2, next) {
						expect(arg1).to.eql('arg1');
						expect(arg2).to.eql('arg2');
						this.check3 = true;
						next();
					}
				};
				var FlowClass = Flow(obj);
				var flow = new FlowClass();
				flow.flow(function() {
					expect(flow.check1).to.eql(true);
					expect(flow.check2).to.eql(true);
					expect(flow.check3).to.eql(true);
					done();
				})('arg1', 'arg2');
			});
			it('stepsの指定がない場合、Controller,Model,Viewの順で実行される。', function(done) {
				var obj = {
					Controller : function(next) {
						this.c = true;
						next();
					},
					Model : function(next) {
						expect(this.c).to.eql(true);
						this.m = true;
						next();
					},
					View : function(next) {
						expect(this.m).to.eql(true);
						this.v = true;
						next();
					}
				};
				var FlowClass = Flow(obj);
				var flow = new FlowClass();
				flow.flow(function() {
					expect(flow.v).to.eql(true);
					done();
				})();
			});
			it('ステップ内で非同期処理を行っても、各ステップの完了を待って次の処理を行う。', function(done) {
				var obj = {
					Controller : function(next) {
						var self = this;
						process.nextTick(function () {
							self.c = true;
							next();
							
						})
					},
					Model : function(next) {
						expect(this.c).to.eql(true);
						var self = this;
						setTimeout(function () {
							self.m = true;
							next();
						},0);
					},
					View : function(next) {
						expect(this.m).to.eql(true);
						this.v = true;
						next();
					}
				};
				var FlowClass = Flow(obj);
				var flow = new FlowClass();
				flow.flow(function() {
					expect(flow.v).to.eql(true);
					done();
				})();
			});
		});
		describe('#use(name)', function() {
			it('appにセットされたコンポーネントを取得する。', function () {
				var app = new App();
				var com = 'Test!';
				app.set('Database', com);
				var FlowClass = Flow({}, app);
				var flow = new FlowClass();
				var component = flow.use('Database');
				expect(component).to.eql('Test!');
			});
			it('セットされたコンポーネントが実行形式の場合、実行した戻り値を取得する。', function () {
				var app = new App();
				var com = function () {
					return 'Test!';
				};
				app.set('Database', com);
				var FlowClass = Flow({}, app);
				var flow = new FlowClass();
				var component = flow.use('Database');
				expect(component).to.eql('Test!');
			});
			it('このメソッドはステップ内のメソッドからも使用できる。', function (done) {
				var app = new App();
				var com = function () {
					return 'Test!';
				};
				app.set('Database', com);
				var check = false;
				var FlowClass = Flow({
					Controller: function (next) {
						var component = flow.use('Database');
						expect(component).to.eql('Test!');
						check = true;
						next();
					}
				}, app);
				var flow = new FlowClass();
				flow.flow(function (){
					expect(check).to.eql(true);
					done();
				})();
			});
		});
	});
});