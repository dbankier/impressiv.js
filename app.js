
/**
 * Module dependencies.
*/

var express = require('express')
, routes = require('./routes')
, io = require('socket.io');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});


// This is only meant to be a simple app, running on your local server, with
// one presenation running at one time. So we'll keep that in memory.
var current = {
  presi: null,
  audience: 0
}

// Routes
// Simple Basic Authentication Middleware(http://node-js.ru/3-writing-express-middleware)
function basic_auth (req, res, next) {
  if (req.headers.authorization && req.headers.authorization.search('Basic ') === 0) {
    // fetch login and password
    if (new Buffer(req.headers.authorization.split(' ')[1], 'base64').toString() == 'admin:secret') {
      next();
      return;
    }
  }
  console.log('Unable to authenticate user');
  console.log(req.headers.authorization);
  res.header('WWW-Authenticate', 'Basic realm="Admin Area"');
  if (req.headers.authorization) {
    setTimeout(function () {
      res.send('Authentication required', 401);
    }, 5000);
  } else {
    res.send('Authentication required', 401);
  }
}

// Presentation exists middleware 
function presi_exists(req,res,next) {
  require("path").exists(__dirname + "/views/" + req.params.presi + ".jade", function(exists) {
    if (exists) {
      next();
      return;
    } else  {
      res.send("Presentation Not Found", 404);
    }
  });
}

//Ad-hoc sessioning
function randomString(length) {
  var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  var randomstring = '';
  for (var i=0; i<length; i++) {  
    var rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum,rnum+1);
  }
  return randomstring;
}
// Presenter
app.get("/host/:presi", basic_auth, presi_exists, function (req,res){ 
  current = {
    presi: req.params.presi,
    audience: 0,
    session: randomString(12),
    current_slide: 0
  }
  routes.presi(req,res,"host", current.presi,current.session);
});
// Audience
app.get("/live/:presi", presi_exists, function (req,res) {
  // Only allow joinin live presentation if started
  if (current.presi != req.params.presi) {
    res.send("Live presentation no found!", 404);
  } else {
    routes.presi(req,res,"live", req.params.presi,null);
  }
});

// Regular express.js
app.get("/view/:presi", presi_exists, function (req, res) {
    routes.presi(req,res,"standard", req.params.presi,null);
});


app.get('/', routes.index);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

// Sockets
var sio=io.listen(app);
sio.sockets.on("connection", function(socket) {
  socket.on('join', function(e) {
    if (e.presi == current.presi) {
      socket.join(e.presi);
      if (e.session == current.session) {
        socket.set('host', true, function() {console.log("HOST IS HERE");});
      } else {
        current.audience = current.audience + 1;
        socket.set('host', false, function() {console.log("GUEST ARRIVED: " + current.audience);});
        socket.emit("slide", {slide:current.current_slide});
      }
    } else {
      socket.emit("disconnect");
    }
  });
  socket.on('slide', function (e) {
    socket.get("host", function (err, host) {
      if (host) {
        current.current_slide = e.slide;
        sio.sockets.in(current.presi).emit("slide", e);
      } else {
        socket.emit("disconnect");
      }
    });
  });
  socket.on("disconnect", function (e) {
    socket.get("host", function(err,host) {
      if (host) {
        sio.sockets.in(current.prezi).emit('disconnect');
        current.presi = null;
      } else {
        current.audience = current.audience - 1;
        console.log("GUEST LEFT: " + current.audience);
      }
    });
  });
});




