impressiv.init = function(presi,session) {
  var socket = io.connect("http://localhost");
  socket.on('connect', function(data) {
    socket.emit("join", {presi: presi, session:session});
  });
  socket.on('disconnect', function(data) {
    alert("Live presentation has ended.");
    io.disconnect();
  });

  impressiv.send = function(data) {
    var step = impressiv.steps.indexOf(data);
    socket.emit("slide", {slide:step});
  };
}

