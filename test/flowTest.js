var assert = require ('assert');
var flow = require ('../lib/flow.js');
require ('should');

describe('flow', function() {
    it('construct', function() {
        var newFlow = new flow(1);
        assert.equal(newFlow instanceof flow, true);
        assert.equal(newFlow.flowID, 1);
    });
});
