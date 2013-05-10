var socketio = require("socket.io")
  , http = require("http")
  , events = require("events")
  , fs = require("fs")
  , util = require("util")
  , server;

function SocketIoPeer(socket) {
  var self = this;

  socket.on("message", function (text) {
    self.emit("message", text);
  });

  socket.on("disconnect", function () {
    self.emit("disconnected");
    self.removeAllListeners();
  });

  self.socket = socket;
}

util.inherits(SocketIoPeer, events.EventEmitter);

SocketIoPeer.prototype.send = function (text) {
  this.socket.emit("message", text);
}

function handleFactory(connectionHandler) {
  return function (socket) {
    var peer = new SocketIoPeer(socket);
    connectionHandler(peer);
  };
}

function start (connectionHandler) {
  var port = 10111;

  server = http.createServer(function (request, response) {
    response.writeHead(200, {
      "Content-type": "text/html"
    });
    response.end(
      fs.readFileSync(__dirname + "/../resources/index.html")
    );
  });

  server.listen(port, function () {
    console.log("HTTP server listening on port " + port);
  });

  socketio.listen(server).on("connection", handleFactory(connectionHandler));
}

function stop () {
  if(server) {
    server.close();
    server = null;
  }
}

process.on('exit', function () {
  stop();
});

module.exports = {
  start: start,
  stop: stop
};
