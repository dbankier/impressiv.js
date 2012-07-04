var impressiv = function(presi,session) {
  var socket = io.connect("http://localhost");
  socket.on('connect', function(data) {
    socket.emit("join", {presi: presi, session:session});
  });
  socket.on('disconnect', function(data) {
    alert("Live presentation has ended.");
  });

  document.addEventListener("impress:stepgoto", function(event) {
    socket.emit("slide", {slide:event.target.id});
  });
}

