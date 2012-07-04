var impressiv = function(presi) {
  var socket = io.connect("http://localhost");
  socket.on('connect', function(data) {
    socket.emit("join", {presi: presi});
  });
  socket.on('slide', function(data) {
    impress().goto(data.slide);
  });
  socket.on('disconnect', function(data) {
    alert("Live presentation has ended.");
    io.disconnect();
  });
  // Unbind controls. Would be nice if controls were optional in impress.js
  // Comments in doc seems like it is coming.
  $(document).unbind('touchstart');
  $(document).unbind('click');
  $(document).unbind('keydown');
  $(document).unbind('keyup');
}
