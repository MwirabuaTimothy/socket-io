var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require("redis")
var pub = redis.createClient();

app.use(express.static('public'))
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// global namespace /
io.on('connection', function(socket){
  socket.on('key', function(msg){
    console.log('global', msg)
  });
})

// demo namespace /demo
demo = io.of('/demo');
demo.on('connection', function(socket){
  socket.on('chat', function(packet){
    console.log('packet: ', packet);
    // demo.emit('chat', packet);
    pub.publish('demo', packet)
  });
});


// Listen to local Redis broadcasts
var sub = redis.createClient();
sub.on('error', function (error) {
    console.log('ERROR ' + error)
})

// Handle messages from channels we're subscribed to
sub.on('message', function (channel, payload) {

    console.log("INCOMING MESSAGE", channel, payload);
    
    // Send the data through to the client in the right channel
    // demo.emit('chat', payload)
    io.of('/'+channel).emit('chat', payload)
    // io.sockets.in(channel).emit('chat', payload) // doesnt work
})

sub.on('subscribe', function (channel, count) {
    console.log('SUBSCRIBE', channel, count)
})

sub.subscribe("demo");

http.listen(6005, function(){
  console.log('listening on *:6005');
});
