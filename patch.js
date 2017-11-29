var io = require('socket.io-client');
// piggyback using the event-emitter bundled with socket.io client
window.patch = require('socketio-wildcard')(io.Manager);
