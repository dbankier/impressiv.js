impressiv.init = function(presi) {
  var socket = io.connect("http://localhost");
  socket.on('connect', function(data) {
    socket.emit("join", {presi: presi});
  });
  socket.on('slide', function(data) {
    impressiv.select(impressiv.steps[data.slide]);
  });
  socket.on('disconnect', function(data) {
    alert("Live presentation has ended.");
    io.disconnect();
  });
}
