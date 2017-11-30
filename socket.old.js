var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var middleware = require('socketio-wildcard')();

app.use(express.static('public'))
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// global namespace /
io.use(middleware);
io.on('connection', function(socket){
  socket.on('*', function(msg){
  	console.log(msg)
  });
})

// demo namespace /demo
demo = io.of('/demo');
demo.use(middleware);
demo.on('connection', function(socket){
  var ip = socket.request.connection.remoteAddress;
  console.log(ip + ' user connected');
  socket.on('*', function(packet){
    console.log('wildcard: ', packet);
  	demo.emit(packet.data[0], packet.data[1]);
  });
  socket.on('disconnect', function(){
    console.log(ip + ' user disconnected');
  });
});

// pressdesk namespace /pressdesk
var pressdesk = io.of('/pressdesk');
pressdesk.use(middleware);
pressdesk.on('connection', function(socket){
  var ip = socket.request.connection.remoteAddress;
  console.log(ip + ' user connected');
  socket.on('*', function(packet){
    console.log('wildcard: ', packet);
  	pressdesk.emit(packet.data[0], packet.data[1]);
  });
  socket.on('disconnect', function(){
    console.log(ip + ' user disconnected');
  });
});

// bittrex namespace /bittrex
var bittrex = io.of('/bittrex');
bittrex.use(middleware);
bittrex.on('connection', function(socket){
  var ip = socket.request.connection.remoteAddress;
  console.log(ip + ' user connected');
  socket.on('*', function(packet){
    console.log('wildcard: ', packet);
  	bittrex.emit(packet.data[0], packet.data[1]);
  });
  socket.on('disconnect', function(){
    console.log(ip + ' user disconnected');
  });
});


http.listen(6005, function(){
  console.log('listening on *:6005');
});
