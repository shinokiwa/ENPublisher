var view = require ('../lib/view.js');
require ('should');

describe('View', function () {
    var request, response;

    beforeEach(function () {
        // 簡単に、フェイクのreqとresを用意
        request = {};
        response = {
            redirect: function () { },
            render : function () { }
        };
    });
    describe('index', function() {
        it('template', function(done) {
            response.render = function (template, params) {
                template.should.equal('index');
                params.value.should.eql('Test!');
                done();
            };
            view(1,{value: "Test!"}, response);
        });
    });
});