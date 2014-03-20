/**
 * main module
 * @author shinokiwa@gmail.com
 */
module.exports.start = function () {
    var http = require("http");
    http.createServer(function(request, response) {
      response.writeHead(200, {"Content-Type": "text/plain"});
      response.write("Hello World");
      response.end();
    }).listen(process.env.PORT);
};
