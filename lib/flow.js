var flowProto = {
    flowID: null
};

module.exports = function (flowID) {
    this.flowID = flowID;
};
module.exports.prototype = flowProto;
module.exports.id = {
    Index: 1,
    MovedPermanently: 301,
    Found: 302,
    NotFound: 404,
    ServerError: 500,
    Setup: 999
}