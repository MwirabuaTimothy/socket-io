var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require("redis")
var pub = redis.createClient();
var middleware = require('socketio-wildcard')();

// var redisio = require('socket.io-redis');
// io.adapter(redisio({ host: 'localhost', port: 6379 }));

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
  socket.on('*', function(packet){
  	// demo.emit(packet.data[0], packet.data[1]);
    pub.publish('demo', JSON.stringify(packet))
  });
});

// pressdesk namespace /pressdesk
var pressdesk = io.of('/pressdesk');
pressdesk.use(middleware);
pressdesk.on('connection', function(socket){
  socket.on('*', function(packet){
  	// pressdesk.emit(packet.data[0], packet.data[1]);
  	pub.publish('pressdesk', JSON.stringify(packet.data[1]))
  });
});

// bittrex namespace /bittrex
var bittrex = io.of('/bittrex');
bittrex.use(middleware);
bittrex.on('connection', function(socket){
  socket.on('*', function(packet){
  	// bittrex.emit(packet.data[0], packet.data[1]);
  	pub.publish('bittrex', JSON.stringify(packet.data[1]))
  });
});


/*
 * Redis subs
 */

// Listen to local Redis broadcasts
var sub = redis.createClient();

sub.on('error', function (error) {
    console.log('ERROR ' + error)
})

sub.on('subscribe', function (channel, count) {
    console.log('SUBSCRIBE', channel, count)
})

// // Handle messages from channels we're subscribed to
sub.on('message', function (channel, payload) {
    
    data = JSON.parse(payload).data
    
    console.log('INCOMING MESSAGE', channel,  data)

    // Send the data through to the right channel and right client
    switch(channel){
    	case 'demo':
    		io.of('/'+channel).emit(data[0], data[1])
    		break;
    	case 'pressdesk':
    		io.of('/'+data.channel).emit(data.user_id, data.notification)
    		break;
    	case 'bittrex':
    		io.of('/'+data.channel).emit('snapshot', data.snapshot)
    		break;
    	default:
    		console.log('Channel "'+ channel +'" not found!')
    }
    
})

sub.subscribe("demo");
sub.subscribe("pressdesk");
sub.subscribe("bittrex");

http.listen(6005, function(){
  console.log('listening on *:6005');
});
