var redis = require("redis");
var sub = redis.createClient(), pub = redis.createClient();
var msg_count = 0;

sub.on("message", function (channel, message) {
    console.log("sub channel " + channel + ": " + message);
});

sub.on("subscribe", function (channel, count) {
    console.log('subscribed to', channel, count)
    pub.publish(channel, "I am sending a message.");
});

sub.subscribe("fox");