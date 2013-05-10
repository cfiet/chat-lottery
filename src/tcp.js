var net = require("net")
  , events = require("events")
  , util = require("util")
  , server;

function SocketPeer(socket) {
  var self = this;

  socket.on("data", function (text) {
    if(text instanceof Object && text) {
      text = text.toString("utf8");
    }
    self.emit("message", text);
  });

  socket.on("end", function () {
    self.emit("disconnected");
  });

  self.socket = socket;
}

util.inherits(SocketPeer, events.EventEmitter);

SocketPeer.prototype.send = function (text) {
  if(typeof(text) === "string") {
    text = new Buffer(text, "utf8");
  }
  if(text[text.length-1] !== "\n") {
    text += "\n";
  }
  this.socket.write(text);
};

SocketPeer.prototype.close = function () {
  this.socket.end()
};


function socketHandlerFactory (connectionHandler) {
  return function socketHandler (socket) {
    var peer = new SocketPeer(socket);
    connectionHandler(peer);
  };
}

function start (handler) {
  var port = 10110;
  console.log("Starting server on port " + port);
  server = net.createServer(socketHandlerFactory(handler));
  server.listen(port);
  server.ref();
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
