var App = require('../../app/app.js');

describe('Class App', function() {
	describe('#constructor', function() {
		it('EventEmitterを継承したクラスである。', function() {
			var EventEmitter = require('events').EventEmitter;
			var app = new App();
			app.should.be.instanceOf(EventEmitter);
		});
	});
	describe('#flow(name)', function() {
		it('フロー処理の実行関数を取得する。', function() {
			var app = new App();
			app.flow('Index').should.be.a.Function;
		});
		it('フローを実行すると、Controller.[フロー名]、Model.[フロー名]、View.[フロー名]のステップイベントが実行される。', function(done) {
			var app = new App();
			var check1 = false;
			var check2 = false;
			app.on('Controller.Index', function(flow) {
				check1 = true;
				flow.next();
			});
			app.on('Model.Index', function(flow) {
				check2 = true;
				flow.next();
			});
			app.on('View.Index', function(flow) {
				check1.should.be.ok;
				check2.should.be.ok;
				done();
			});
			app.flow('Index')();
		});
		it('Controller>Model>Viewの順でステップイベントが実行される。', function(done) {
			var app = new App();
			var check1 = false;
			var check2 = false;
			app.on('Controller.Index', function(flow) {
				check1 = true;
				flow.next();
			});
			app.on('Model.Index', function(flow) {
				check1.should.be.ok;
				check2 = true;
				flow.next();
			});
			app.on('View.Index', function(flow) {
				check2.should.be.ok;
				flow.next();
				done();
			});
			app.flow('Index')();
		});
		it('各ステップイベントには、フロー制御オブジェクトと実行時の引数が渡される。', function(done) {
			var app = new App();
			var check1 = false;
			var check2 = false;
			app.on('Controller.Index', function(flow, str) {
				arguments.should.length(2);
				flow.should.be.instanceOf(App.FlowController);
				str.should.eql('TestValue!');
				check1 = true;
				flow.next();
			});
			app.on('Model.Index', function(flow, str) {
				arguments.should.length(2);
				flow.should.be.instanceOf(App.FlowController);
				str.should.eql('TestValue!');
				check2 = true;
				flow.next();
			});
			app.on('View.Index', function(flow, str) {
				arguments.should.length(2);
				flow.should.be.instanceOf(App.FlowController);
				str.should.eql('TestValue!');
				check1.should.be.ok;
				check2.should.be.ok;
				flow.next();
				done();
			});
			app.flow('Index')('TestValue!');
		});
		it('引数は継続して使用されるので、オブジェクトを引数にするとステップ間で値の受け渡しができる。', function(done) {
			var app = new App();
			var check1 = false;
			var check2 = false;
			app.on('Controller.Index', function(flow, str) {
				str.should.have.property('str', 'TestValue!');
				str.str = 'Test2!';
				check1 = true;
				flow.next();
			});
			app.on('Model.Index', function(flow, str) {
				str.should.have.property('str', 'Test2!');
				str.should.not.have.property('str2');
				str.str2 = '2!';
				check2 = true;
				flow.next();
			});
			app.on('View.Index', function(flow, str) {
				str.should.have.property('str', 'Test2!');
				str.should.have.property('str2', '2!');
				check1.should.be.ok;
				check2.should.be.ok;
				flow.next();
				done();
			});
			app.flow('Index')({
				str : 'TestValue!'
			});
		});
		it('ステップイベントに何もバインドされていない場合、そのステップが省略される。', function(done) {
			var app = new App();
			app.on('View.Index', function(flow) {
				done();
			});
			app.flow('Index')();
		});
	});
	describe('#add(name, object)', function() {
		it('オブジェクトを渡すことでフローを生成する。戻り値はフロー実行関数になる。', function() {
			var app = new App();
			app.add('Index', {}).should.be.a.Function;
		});
		it('オブジェクトのController、Model、Viewがそれぞれのステップイベントにバインドされる。', function(done) {
			var check1 = false;
			var check2 = false;
			var obj = {
				Controller : function(flow, str) {
					str.should.eql('Test!');
					check1 = true;
					flow.next();
				},
				Model : function(flow, str) {
					str.should.eql('Test!');
					check2 = true;
					flow.next();
				},
				View : function(flow, str) {
					str.should.eql('Test!');
					check1.should.be.ok;
					check2.should.be.ok;
					flow.next();
					done();
				}
			};
			var app = new App();
			app.add('Index', obj)('Test!');
		});
		it('controller、model、viewに実行関数の配列を代入しておくと、複数の実行関数がバインドされる。', function(done) {
			var check1 = false;
			var check2 = false;
			var obj = {
				Controller : [ function(flow, str) {
					str.should.eql('Test!');
					check1 = true;
					flow.next();
				}, function(flow, str) {
					str.should.eql('Test!');
					check2 = true;
					flow.next();
				} ],
				View : function(flow, str) {
					str.should.eql('Test!');
					check1.should.be.ok;
					check2.should.be.ok;
					flow.next();
					done();
				}
			};
			var app = new App();
			app.add('Index', obj)('Test!');
		});
		it('複数バインドはオブジェクトでも可能。', function(done) {
			var check1 = false;
			var check2 = false;
			var obj = {
				Model : {
					start : function(flow, str) {
						str.should.eql('Test!');
						check1 = true;
						flow.next();
					},
					next : function(flow, str) {
						str.should.eql('Test!');
						check2 = true;
						flow.next();
					}
				},
				View : function(flow, str) {
					str.should.eql('Test!');
					check1.should.be.ok;
					check2.should.be.ok;
					flow.next();
					done();
				}
			};
			var app = new App();
			app.add('Index', obj)('Test!');
		});
	});
	describe('#process()', function() {
		it('Processフローを実行する。flow("StartProcess")()のショートコード。', function(done) {
			var app = new App();
			app.on('View.StartProcess', function(flow) {
				flow.next();
				done();
			});
			app.process();
		});
	});
	describe('#set(name, component)', function() {
		it('コンポーネントを指定した名称で保持する。', function() {
			var app = new App();
			app.set('Database', function() {
				return 'Test!';
			});
		});
		describe('##Atention', function() {
			it('内部的には_componentsに保持するが、ルール上直接のアクセスは控えること。', function() {
				var app = new App();
				var com = function() {
					return 'Test!';
				};
				app.set('Database', com);
				app._components.should.have.property('Database', com);
			});
		});
	});
	describe('#FlowController', function() {
		describe('##constructor(app, flowName)', function() {
			it('フロー制御オブジェクトを生成する。', function() {
				App.FlowController.should.be.a.Function;
				var flowController = new App.FlowController(new App(), 'Index');
				flowController.should.be.an.instanceOf(App.FlowController);
			});
		});
		describe('##name', function() {
			it('name属性は実行中のフロー名が入る。', function(done) {
				var app = new App();
				app.on('Controller.Index', function(flow) {
					flow.name.should.eql('Index');
					flow.next();
					done();
				});
				app.flow('Index')();
			});
		});
		describe('##step', function() {
			it('step属性は実行中のステップコードが入る。0:Controller 1:Model 2:Viewとなる。', function(done) {
				var app = new App();
				var check1 = false;
				var check2 = false;
				var obj = {
					Controller : function(flow) {
						flow.step.should.eql(0);
						check1 = true;
						flow.next();
					},
					Model : function(flow) {
						flow.step.should.eql(1);
						check2 = true;
						flow.next();
					},
					View : function(flow) {
						flow.step.should.eql(2);
						check1.should.be.ok;
						check2.should.be.ok;
						flow.next();
						done();
					}
				};
				app.add('Index', obj)();
			});
		});
		describe('##listeners', function() {
			it('listeners属性は各ステップのリスナ数が入る。配列はコードの通り。', function(done) {
				var app = new App();
				var check = 0;
				var controller = function(flow) {
					flow.listeners[0].should.eql(3);
					check++;
					flow.next();
				};
				var model = function(flow) {
					flow.listeners[1].should.eql(2);
					check++;
					flow.next();
				};
				var view = function(flow) {
					flow.listeners[2].should.eql(1);
					check.should.eql(5);
					flow.next();
					done();
				};
				var obj = {
					Controller : [ controller, controller, controller ],
					Model : [ model, model ],
					View : view
				};
				app.add('Index', obj)();
			});
		});
		describe('##locals', function() {
			it('locals属性は空のオブジェクトが入る。フロー中でのみ使用する変数の共有が可能。', function(done) {
				var app = new App();
				app.on('Controller.Index', function(flow) {
					flow.should.have.property('locals');
					flow.next();
					done();
				});
				app.flow('Index')();
			});
		});
		describe('##_step()', function() {
			it('現在のステップを実行する。App.flowの実処理部分。', function() {
				// App.flowで担保できているためテストなし。
			});
		});
		describe('##next()', function() {
			it('次のステップを開始する。', function(done) {
				var app = new App();
				var check1 = false;
				var check2 = false;
				var obj = {
					Controller : function(flow) {
						check1 = true;
						flow.next();
					},
					Model : function(flow) {
						check2 = true;
						flow.next();
					},
					View : function(flow) {
						flow.step.should.eql(2);
						check1.should.be.ok;
						check2.should.be.ok;
						done();
						flow.next();
					}
				};
				app.add('Index', obj)();
			});
			it('全てのバインド関数から呼び出されるまで、次のステップは開始されない。', function(done) {
				var check1 = false;
				var check2 = false;
				var obj = {
					Controller : [ function(flow) {
						check1 = true;
						flow.next();
					}, function(flow) {
						check2 = true;
						flow.next();
					} ],
					View : function(flow) {
						check1.should.be.ok;
						check2.should.be.ok;
						done();
					}
				};
				var app = new App();
				app.add('Index', obj)();
			});
			it('ステップイベント内で非同期処理を実行しても、全処理内でこのメソッドが呼ばれるまで次のステップは開始されない。', function(done) {
				var check1 = false;
				var check2 = false;
				var obj = {
					Controller : [ function(flow) {
						setTimeout(function() {
							check1 = true;
							flow.next();
						}, 5);
					}, function(flow) {
						process.nextTick(function() {
							check2 = true;
							flow.next();
						});
					} ],
					View : function(flow) {
						check1.should.be.ok;
						check2.should.be.ok;
						done();
					}
				};
				var app = new App();
				app.add('Index', obj)();
			});
			describe('###Attention', function() {
				it('バインド関数内で呼び出されなかった場合、フローはそこで終了してしまうため注意が必要。', function(done) {
					var check1 = false;
					var check2 = true;
					var obj = {
						Controller : function(flow) {
							check1 = true;
						},
						View : function(flow) {
							check2 = false;
						}
					};
					var app = new App();
					app.add('Index', obj)();
					setTimeout(function() {
						check1.should.be.ok;
						check2.should.be.ok;
						done();
					}, 50);
				});
			});
		});
		describe('##after(callback)', function() {
			it('現在のステップが完了した後に呼び出すコールバック関数を追加する。', function(done) {
				var app = new App();
				var check = 0;
				var after = function(flow) {
					check++;
					flow.next();
				};
				var obj = {
					Controller : function(flow) {
						check.should.eql(0);
						check++;
						flow.after(after);
						flow.next();
					},
					Model : function(flow) {
						check.should.eql(2);
						check++;
						flow.after(after);
						flow.next();
					},
					View : function(flow) {
						check.should.eql(4);
						check++;
						flow.after(function(flow) {
							check.should.eql(5);
							done();
						});
						flow.next();
					}
				};
				app.add('Index', obj)();
			});
			it('引数はステップイベント同様に、フロー制御オブジェクトと実行時に与えられた引数となる。', function(done) {
				var app = new App();
				var obj = {
					View : function(flow, i, s) {
						i.should.eql(0);
						s.should.eql('str');
						flow.after(function(flow, i, s) {
							flow.should.be.instanceOf(App.FlowController);
							i.should.eql(0);
							s.should.eql('str');
							done();
						});
						flow.next();
					}
				};
				app.add('Index', obj)(0, 'str');
			});
			it('コールバック関数もステップ同様、全て完了するまで次のステップに移行しない。', function(done) {
				var app = new App();
				var check = 0;
				var obj = {
					Model : function(flow) {
						flow.after(function(flow) {
							setTimeout(function() {
								check++;
								flow.next();
							}, 0);
						});
						flow.after(function(flow) {
							process.nextTick(function() {
								check++;
								flow.next();
							});
						});
						flow.next();
					},
					View : function(flow) {
						check.should.eql(2);
						flow.next();
						done();
					}
				};
				app.add('Index', obj)();
			});
		});
		describe('##redirect(flow)', function() {
			it('現在のステップでフローを終了し、別のフローを開始する。', function(done) {
				var app = new App();
				var check = 0;
				var obj = {
					Model : function(flow) {
						check++;
						flow.redirect('Index2');
					}
				};
				var obj2 = {
					View : function(flow) {
						check.should.eql(1);
						flow.next();
						done();
					}
				};
				app.add('Index2', obj2);
				app.add('Index', obj)();
			});
			it('このメソッド実行後にnext()を実行しても、次のステップには移行しない。afterのコールバックも実行されない。', function(done) {
				var app = new App();
				var check = 0;
				var obj = {
					Model : function(flow) {
						check++;
						flow.redirect('Index2');
						flow.after(function(flow) {
							check++;
							flow.next();
						});
						flow.next();
					},
					View : function(flow) {
						check++;
						flow.next();
					}
				};
				var obj2 = {
					View : function(flow) {
						setTimeout(function() {
							check.should.eql(1);
							flow.next();
							done();
						}, 10);
					}
				};
				app.add('Index2', obj2);
				app.add('Index', obj)();
			});
			it('引数は全て引き継がれる。ただし、フロー制御オブジェクトは新しいフローのものになる。', function(done) {
				var app = new App();
				var check = 0;
				var obj = {
					Model : function(flow) {
						check++;
						flow.redirect('Index2');
					}
				};
				var obj2 = {
					View : function(flow, i, s) {
						check.should.eql(1);
						i.should.eql(0);
						s.should.eql('abc');
						flow.name.should.eql('Index2');
						flow.next();
						done();
					}
				};
				app.add('Index2', obj2);
				app.add('Index', obj)(0, 'abc');
			});
			describe('###Attention', function() {
				it('この関数を使用しても、現在実行中のステップにバインドされた関数は全て実行される。', function(done) {
					var app = new App();
					var check = 0;
					var obj = {
						Model : [ function(flow) {
							check++;
							flow.redirect('Index2');
						}, function(flow) {
							check++;
							flow.next();
						} ]
					};
					var obj2 = {
						View : function(flow) {
							setTimeout(function() {
								check.should.eql(2);
								flow.next();
								done();
							}, 5);
						}
					};
					app.add('Index2', obj2);
					app.add('Index', obj)();
				});
				it('ただしその際、ステップ中で非同期処理を行っても完了待ちされない。', function(done) {
					var app = new App();
					var check = 0;
					var obj = {
						Model : [ function(flow) {
							check++;
							flow.redirect('Index2');
						}, function(flow) {
							setTimeout(function() {
								check++;
								flow.next();
							}, 20);
						} ]
					};
					var obj2 = {
						View : function(flow) {
							setTimeout(function() {
								check.should.eql(1);
								flow.next();
								done();
							}, 1);
						}
					};
					app.add('Index2', obj2);
					app.add('Index', obj)();
				});
			});
		});
		describe('##async(flow)', function() {
			it('別のフローを並列で実行するための実行関数を取得する。', function(done) {
				var app = new App();
				var obj = {
					Model : function(flow) {
						flow.async('Index2').should.be.a.Function;
						flow.next();
						done();
					}
				};
				app.add('Index', obj)();
			});
			it('現在のフローはそのまま継続される。', function(done) {
				var app = new App();
				var check = 0;
				var obj = {
					Model : function(flow) {
						check++;
						flow.async('Index2')();
						flow.after(function(flow) {
							check++;
							flow.next();
						});
						flow.next();
					},
					View : function(flow) {
						check++;
						flow.next();
					}
				};
				var obj2 = {
					View : function(flow) {
						setTimeout(function() {
							check.should.eql(3);
							flow.next();
							done();
						}, 10);
					}
				};
				app.add('Index2', obj2);
				app.add('Index', obj)();
			});
		});
		describe('##use(name)', function() {
			it('app.setで保持したコンポーネントをステップ内で使用する。', function(done) {
				var app = new App();
				app.set('Database', function() {

				});
				var obj = {
					Model : function(flow) {
						flow.use('Database');
						flow.next();
						done();
					}
				};
				app.add('Index', obj)();
			});
			it('app.setで保持した関数が実行され、その戻り値がuseの戻り値になる。', function(done) {
				var app = new App();
				app.set('Database', function() {
					return 'abc';
				});
				var obj = {
					Model : function(flow) {
						flow.use('Database').should.eql('abc');
						flow.next();
						done();
					}
				};
				app.add('Index', obj)();
			});
			it('use実行時に保持関数に与えられる引数は、フロー実行時のものと同様になる。', function(done) {
				var app = new App();
				app.set('Database', function(i, s) {
					i.should.eql(2);
					s.should.eql('Test!');
					return 'test';
				});
				var obj = {
					Model : function(flow) {
						flow.use('Database').should.eql('test');
						flow.next();
						done();
					}
				};
				app.add('Index', obj)(2, 'Test!');
			});
			it('存在しないコンポーネントを指定した場合はundefinedとなる。', function(done) {
				var app = new App();
				var obj = {
					Model : function(flow) {
						(typeof flow.use('Database')).should.eql('undefined');
						flow.next();
						done();
					}
				};
				app.add('Index', obj)();
			});
		});
	});
});