var flows = require ('./flow.js');
var express = require ('./views/renders/express.js');

var Index = function (params, response) {
    express.template('index', params, response);
};

var bindViews = {};
bindViews[flows.id.Index] = Index;


module.exports = function (flowId, params, response) {
    bindViews[flowId](params, response);
};