var tcpServer = require("./tcp")
  , webSocketServer = require("./socketio")
  , handle = firstHandle;

function copyData (from, to) {
  from.on("message", function (text) {
    to.send(text);
  });
}

function connectionHandler (c) {
  return handle(c);
}

function notifyPartner (to) {
  to.send("Found a conversation partner for you");
}

function converse(from, to) {
  notifyPartner(from);
  from.setMaxListeners(0);
  copyData(from, to);
  to.on("disconnected", function () {
    from.send("Your conversation partned disconnected");
    from.removeAllListeners();
    to.removeAllListeners();
    handle(from);
  });
}

function talk (user1, user2) {
  converse(user1, user2);
  if(user2 !== user1) {
    converse(user2, user1);
  }
}

function firstHandle (user1) {
  function secondHandle(user2) {
    user1.removeAllListeners("disconnected");
    talk(user1, user2);
    handle = firstHandle;
  }
  handle = secondHandle;
  user1.send("Waiting for conversation partner to connect");
  user1.once("disconnected", function() {
    handle = firstHandle;
  });
}

tcpServer.start(connectionHandler);
webSocketServer.start(connectionHandler);
