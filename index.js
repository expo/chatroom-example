var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var msgList = ['Hello! Welcome to the chatroom.', 'Messages will appear below :)'];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    io.emit('chat message', msg);
    msgList.push(msg);
    if (msgList.length > 20) {
      msgList.splice(0, 1);
    }
    //io.emit('message list', msgList);
  });
  /*socket.on('list sent', function(list){
    console.log('i got something!');
    msgList = list;

  });*/
  io.emit('message list', msgList);
  console.log('a user connected');
});

/*setInterval(() => {
  io.emit('ping', { data: 23 });
}, 1000);*/
//(new Date())/1
http.listen(3000, function(){
  console.log('listening on *:3000');
});
